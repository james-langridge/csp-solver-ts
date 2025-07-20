import { CSP } from "../data/csp";
import { Variable, Value } from "../data/types";
import { SolverState } from "./state";

export function selectUnassignedVariable(
  csp: CSP,
  state: SolverState,
): Variable | null {
  let bestVariable: Variable | null = null;
  let minValues = Infinity;
  let maxConstraints = -1;

  for (const variable of csp.variables) {
    if (state.assignment.has(variable)) continue;

    const domain = state.domains.get(variable);
    if (!domain) continue;

    const domainSize = domain.size;
    const constraintCount = csp.getConstraintsInvolving(variable).length;

    // MRV: minimum remaining values
    // Tie-break with degree heuristic
    if (
      domainSize < minValues ||
      (domainSize === minValues && constraintCount > maxConstraints)
    ) {
      bestVariable = variable;
      minValues = domainSize;
      maxConstraints = constraintCount;
    }
  }

  return bestVariable;
}

export function orderDomainValues(
  csp: CSP,
  variable: Variable,
  state: SolverState,
): Value[] {
  const domain = state.domains.get(variable);
  if (!domain) return [];

  // For now, return natural order
  // Could implement LCV heuristic for better performance
  return domain.toArray();
}
