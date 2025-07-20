import { CSP } from "../data/csp";
import { SolverState } from "./state";
import { selectUnassignedVariable, orderDomainValues } from "./heuristics";
import { ac3Inference } from "./inference";
import { Assignment } from "../data/types";

export function search(csp: CSP, state: SolverState): SolverState | null {
  // Base case: all variables assigned
  if (isComplete(csp, state.assignment)) {
    return state;
  }

  // Select next variable using MRV heuristic
  const variable = selectUnassignedVariable(csp, state);
  if (!variable) return null;

  // Get ordered values for this variable
  const values = orderDomainValues(csp, variable, state);

  // Try each value
  for (const value of values) {
    // Create new state with assignment
    const newState = state.assign(variable, value);

    // Check consistency
    if (!csp.isConsistent(newState.assignment)) {
      continue;
    }

    // Apply inference (AC-3)
    const inferredState = ac3Inference(csp, newState, variable);

    if (inferredState) {
      // Recursively search with inferred state
      const result = search(csp, inferredState);
      if (result) return result;
    }
  }

  return null; // No solution found
}

function isComplete(csp: CSP, assignment: Assignment): boolean {
  return assignment.size === csp.variables.length;
}
