import { CSP } from "../data/csp";
import { Variable, Value } from "../data/types";
import { SolverState } from "./state";
import { logger } from "../utils/logger";

/**
 * Selects the next unassigned variable using the MRV (Minimum Remaining Values)
 * heuristic, also known as the "fail-first" principle.
 * 
 * MRV chooses the variable with the smallest domain, as it's most likely to
 * fail soon if it's going to fail. This prunes the search tree earlier,
 * avoiding exploration of fruitless branches.
 * 
 * Ties are broken using the degree heuristic: prefer variables involved in
 * more constraints with unassigned variables, as they have more impact.
 * 
 * @returns Variable with fewest legal values, or null if all assigned
 */
export function selectUnassignedVariable(
  csp: CSP,
  state: SolverState,
): Variable | null {
  let bestVariable: Variable | null = null;
  let minValues = Infinity;
  let maxConstraints = -1;

  for (const variable of csp.variables) {
    // Skip already assigned variables
    if (state.assignment.has(variable)) continue;

    const domain = state.domains.get(variable);
    if (!domain) continue;

    const domainSize = domain.size;
    const constraintCount = csp.getConstraintsInvolving(variable).length;

    logger.trace(`Variable ${variable}: domain size ${domainSize}, constraints ${constraintCount}`);

    // MRV: Choose variable with minimum remaining values in domain
    // Degree heuristic: Among ties, choose variable with most constraints
    if (
      domainSize < minValues ||
      (domainSize === minValues && constraintCount > maxConstraints)
    ) {
      bestVariable = variable;
      minValues = domainSize;
      maxConstraints = constraintCount;
    }
  }

  if (bestVariable) {
    logger.debug(`MRV selected ${bestVariable} (domain size: ${minValues}, constraints: ${maxConstraints})`);
  }

  return bestVariable;
}

/**
 * Orders domain values for a variable. Currently returns natural order,
 * but could be enhanced with the LCV (Least Constraining Value) heuristic.
 * 
 * LCV would order values by how many choices they leave for neighboring
 * variables - preferring values that rule out the fewest options for others.
 * This increases the chance of finding a solution without backtracking.
 * 
 * @param csp - The CSP (needed for LCV implementation)
 * @param variable - Variable whose values to order
 * @param state - Current state (for domain information)
 * @returns Ordered array of values to try
 */
export function orderDomainValues(
  csp: CSP,
  variable: Variable,
  state: SolverState,
): Value[] {
  const domain = state.domains.get(variable);
  if (!domain) return [];

  // TODO: Implement LCV heuristic for better performance
  // Would count how many values remain valid for neighbors after assignment
  return domain.toArray();
}
