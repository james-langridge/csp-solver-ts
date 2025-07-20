import { CSP } from "../data/csp";
import { SolverResult, Variable } from "../data/types";
import { SolverState } from "./state";
import { search } from "./search";
import { Domain } from "../data/domain";

/**
 * Solves a Constraint Satisfaction Problem using backtracking search with
 * intelligent heuristics and constraint propagation.
 * 
 * The solver combines several techniques for efficiency:
 * - MRV (Minimum Remaining Values) heuristic for variable selection
 * - Degree heuristic for tie-breaking
 * - AC-3 (Arc Consistency) for constraint propagation
 * - Immutable state for efficient backtracking
 * 
 * @param csp - The CSP to solve
 * @returns Solution if one exists, or failure with explanation
 * 
 * @example
 * const result = solveCSP(csp);
 * if (result.success) {
 *   console.log('Solution:', result.assignment);
 *   console.log('Nodes explored:', result.stats.nodesExplored);
 * }
 */
export function solveCSP(csp: CSP): SolverResult {
  const startTime = performance.now();

  // Initialize solver state with original domains
  const initialDomains = new Map<Variable, Domain>();
  for (const variable of csp.variables) {
    initialDomains.set(variable, csp.getDomain(variable));
  }

  const initialState = new SolverState(new Map(), initialDomains, {
    nodesExplored: 0,
    inferencesApplied: 0,
  });

  // Run backtracking search with inference
  const finalState = search(csp, initialState);

  const endTime = performance.now();

  if (finalState) {
    return {
      success: true,
      assignment: finalState.assignment,
      stats: {
        ...finalState.stats,
        timeMs: endTime - startTime,
      },
    };
  } else {
    // Search space exhausted without finding solution
    return {
      success: false,
      reason: "No solution exists that satisfies all constraints",
      stats: {
        nodesExplored: initialState.stats.nodesExplored,
        inferencesApplied: initialState.stats.inferencesApplied,
        timeMs: endTime - startTime,
      },
    };
  }
}
