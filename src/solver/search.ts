import { CSP } from "../data/csp";
import { SolverState } from "./state";
import { selectUnassignedVariable, orderDomainValues } from "./heuristics";
import { ac3Inference } from "./inference";
import { Assignment } from "../data/types";

/**
 * Core backtracking search algorithm with constraint propagation.
 * Implements the standard CSP search with several optimizations:
 * 
 * 1. Variable selection using MRV (fail-first principle)
 * 2. Value ordering to try most promising values first  
 * 3. Constraint propagation via AC-3 after each assignment
 * 4. Early failure detection through domain wipeout
 * 
 * The algorithm maintains arc consistency throughout search, significantly
 * reducing the search space by eliminating values that can't participate
 * in any solution.
 * 
 * @param csp - Problem definition with constraints
 * @param state - Current search state (assignment + domains)
 * @returns Complete satisfying assignment, or null if no solution exists
 */
export function search(csp: CSP, state: SolverState): SolverState | null {
  // Base case: all variables assigned successfully
  if (isComplete(csp, state.assignment)) {
    return state;
  }

  // Select next variable using MRV heuristic (choose variable with fewest legal values)
  const variable = selectUnassignedVariable(csp, state);
  if (!variable) return null;

  // Get domain values ordered by least-constraining value heuristic
  const values = orderDomainValues(csp, variable, state);

  // Try each value in the domain
  for (const value of values) {
    // Create new state with this variable-value assignment
    const newState = state.assign(variable, value);

    // Check if assignment violates any constraints
    if (!csp.isConsistent(newState.assignment)) {
      continue;
    }

    // Apply AC-3 inference to propagate constraints
    // This may eliminate values from other variables' domains
    const inferredState = ac3Inference(csp, newState, variable);

    if (inferredState) {
      // Inference succeeded (no domain wipeout)
      // Recursively search deeper with reduced domains
      const result = search(csp, inferredState);
      if (result) return result;
    }
    // If inference failed or recursive search failed, backtrack
  }

  return null; // All values tried, no solution in this branch
}

/**
 * Checks if all variables have been assigned values.
 * A complete assignment is a potential solution (still needs constraint checking).
 */
function isComplete(csp: CSP, assignment: Assignment): boolean {
  return assignment.size === csp.variables.length;
}
