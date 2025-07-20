import { CSP } from "../data/csp";
import { Value, Variable } from "../data/types";
import { SolverState } from "./state";
import { BinaryConstraint } from "../constraints/constraint";
import { Domain } from "../data/domain";

/**
 * Implements the AC-3 (Arc Consistency 3) algorithm for constraint propagation.
 * AC-3 eliminates values from variable domains that cannot participate in any
 * consistent solution, dramatically reducing the search space.
 * 
 * The algorithm maintains a queue of arcs (directed constraint edges) to check.
 * For each arc Xi -> Xj, it removes values from Xi's domain that have no
 * supporting values in Xj's domain. If Xi's domain changes, all arcs to Xi
 * must be rechecked.
 * 
 * Time complexity: O(ed³) where e is number of constraints, d is domain size
 * 
 * @param csp - The constraint satisfaction problem
 * @param state - Current state with recent assignment
 * @param recentVariable - Variable that was just assigned (focus of propagation)
 * @returns New state with reduced domains, or null if inconsistency detected
 */
export function ac3Inference(
  csp: CSP,
  state: SolverState,
  recentVariable: Variable,
): SolverState | null {
  // Initialize queue with arcs pointing to the recently assigned variable
  const queue = initializeArcQueue(csp, recentVariable);
  const domains = new Map(state.domains);

  while (queue.length > 0) {
    const [xi, xj, constraint] = queue.shift()!;

    // Remove inconsistent values from xi's domain
    const revised = revise(domains, xi, xj, constraint);

    if (revised) {
      const xiDomain = domains.get(xi);

      if (!xiDomain || xiDomain.size === 0) {
        return null; // Domain wipeout - no solution possible
      }

      // Xi's domain changed, so we must recheck all arcs (xk, xi)
      // where xk is a neighbor of xi (except xj, which we just processed)
      for (const c of csp.constraints) {
        if (c instanceof BinaryConstraint && c.involves(xi)) {
          const other = c.getOther(xi);
          if (other && other !== xj) {
            queue.push([other, xi, c]);
          }
        }
      }
    }
  }

  return state.withInference(domains);
}

/**
 * Initializes the arc queue with all arcs pointing to the recently assigned
 * variable. These are the arcs that might become inconsistent due to the
 * new assignment.
 * 
 * @param csp - The CSP containing all constraints
 * @param recentVariable - Variable that was just assigned
 * @returns Queue of arcs to check, each represented as [from, to, constraint]
 */
function initializeArcQueue(
  csp: CSP,
  recentVariable: Variable,
): Array<[Variable, Variable, BinaryConstraint]> {
  const queue: Array<[Variable, Variable, BinaryConstraint]> = [];

  // Add all arcs (other -> recentVariable) to the queue
  for (const constraint of csp.constraints) {
    if (
      constraint instanceof BinaryConstraint &&
      constraint.involves(recentVariable)
    ) {
      const other = constraint.getOther(recentVariable);
      if (other) {
        queue.push([other, recentVariable, constraint]);
      }
    }
  }

  return queue;
}

/**
 * Revises the domain of xi by removing values that have no support in xj.
 * A value v in xi's domain has support if there exists at least one value
 * in xj's domain such that the constraint between xi=v and xj=that_value
 * is satisfied.
 * 
 * @param domains - Current variable domains (will be modified)
 * @param xi - Variable whose domain to revise
 * @param xj - Variable providing support
 * @param constraint - Binary constraint between xi and xj
 * @returns true if any values were removed from xi's domain
 */
function revise(
  domains: Map<Variable, Domain>,
  xi: Variable,
  xj: Variable,
  constraint: BinaryConstraint,
): boolean {
  const xiDomain = domains.get(xi);
  const xjDomain = domains.get(xj);

  if (!xiDomain || !xjDomain) return false;

  // Efficiently compute which values have support using constraint's method
  const { var1Supported, var2Supported } = constraint.getSupportedValues(
    constraint.var1 === xi ? xiDomain : xjDomain,
    constraint.var1 === xi ? xjDomain : xiDomain,
  );

  const supported = constraint.var1 === xi ? var1Supported : var2Supported;

  // Collect values from xi's domain that have no support in xj
  const toRemove = new Set<Value>();
  for (const value of xiDomain) {
    if (!supported.has(value)) {
      toRemove.add(value);
    }
  }

  if (toRemove.size > 0) {
    const newDomain = xiDomain.remove(toRemove);
    if (newDomain) {
      domains.set(xi, newDomain);
      return true;
    } else {
      // Domain would be empty - mark it for detection
      domains.set(xi, new Domain(["__EMPTY__"])); // Marker for empty domain
      return true;
    }
  }

  return false;
}
