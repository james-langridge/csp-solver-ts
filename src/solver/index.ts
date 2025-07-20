import { CSP } from "../data/csp";
import { SolverResult, Variable } from "../data/types";
import { SolverState } from "./state";
import { search } from "./search";
import { Domain } from "../data/domain";
import { logger } from "../utils/logger";

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

  logger.info(`Starting CSP solver`, {
    variables: csp.variables.length,
    constraints: csp.constraints.length,
  });

  // Initialize solver state with original domains
  const initialDomains = new Map<Variable, Domain>();
  for (const variable of csp.variables) {
    const domain = csp.getDomain(variable);
    initialDomains.set(variable, domain);
    logger.debug(`Variable ${variable} has domain size ${domain.size}`);
  }

  const initialState = new SolverState(new Map(), initialDomains, {
    nodesExplored: 0,
    inferencesApplied: 0,
  });

  logger.info(`Beginning search`);

  // Run backtracking search with inference
  const finalState = search(csp, initialState);

  const endTime = performance.now();

  if (finalState) {
    logger.info(`Solution found!`, {
      timeMs: endTime - startTime,
      nodesExplored: finalState.stats.nodesExplored,
      inferencesApplied: finalState.stats.inferencesApplied,
    });
    
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
    logger.info(`No solution exists`, {
      timeMs: endTime - startTime,
      nodesExplored: initialState.stats.nodesExplored,
      inferencesApplied: initialState.stats.inferencesApplied,
    });
    
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
