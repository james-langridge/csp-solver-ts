import { CSP } from "../data/csp";
import { Value, Variable } from "../data/types";
import { SolverState } from "./state";
import { BinaryConstraint } from "../constraints/constraint";
import { Domain } from "../data/domain";

export function ac3Inference(
  csp: CSP,
  state: SolverState,
  recentVariable: Variable,
): SolverState | null {
  // Initialize queue with arcs to recent variable
  const queue = initializeArcQueue(csp, recentVariable);
  const domains = new Map(state.domains);

  while (queue.length > 0) {
    const [xi, xj, constraint] = queue.shift()!;

    const revised = revise(domains, xi, xj, constraint);

    if (revised) {
      const xiDomain = domains.get(xi);

      if (!xiDomain || xiDomain.size === 0) {
        return null; // Domain wipeout - inconsistent
      }

      // Add all arcs (xk, xi) to queue where xk ≠ xj
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

function initializeArcQueue(
  csp: CSP,
  recentVariable: Variable,
): Array<[Variable, Variable, BinaryConstraint]> {
  const queue: Array<[Variable, Variable, BinaryConstraint]> = [];

  // Add all arcs pointing to recent variable
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

function revise(
  domains: Map<Variable, Domain>,
  xi: Variable,
  xj: Variable,
  constraint: BinaryConstraint,
): boolean {
  const xiDomain = domains.get(xi);
  const xjDomain = domains.get(xj);

  if (!xiDomain || !xjDomain) return false;

  // Get supported values efficiently using constraint method
  const { var1Supported, var2Supported } = constraint.getSupportedValues(
    constraint.var1 === xi ? xiDomain : xjDomain,
    constraint.var1 === xi ? xjDomain : xiDomain,
  );

  const supported = constraint.var1 === xi ? var1Supported : var2Supported;

  // Remove unsupported values
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
      // Domain would be empty
      domains.set(xi, new Domain(["__EMPTY__"])); // Marker for empty domain
      return true;
    }
  }

  return false;
}
