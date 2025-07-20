import { Domain } from "./domain";
import { Assignment, Variable } from "./types";
import { Constraint } from "../constraints/constraint";

/**
 * Immutable representation of a Constraint Satisfaction Problem. A CSP consists of:
 * - Variables: entities that need values assigned
 * - Domains: possible values for each variable  
 * - Constraints: restrictions on valid assignments
 * 
 * The goal is to find an assignment (mapping of variables to values) that
 * satisfies all constraints while respecting domain restrictions.
 * 
 * This class is deeply immutable - both the CSP itself and all its components
 * (domains, constraint lists) cannot be modified. This enables efficient
 * backtracking search where different branches can share unchanged portions
 * of the problem state.
 * 
 * @example
 * // Create a simple map coloring CSP
 * const csp = new CSPBuilder()
 *   .addVariables(['WA', 'NT', 'SA'], ['red', 'green', 'blue'])
 *   .addAllDifferent(['WA', 'NT', 'SA'])
 *   .build();
 */
export class CSP {
  public readonly variables: readonly Variable[];
  public readonly constraints: readonly Constraint[];
  private readonly domains: ReadonlyMap<Variable, Domain>;

  /**
   * Creates a new CSP instance. Validates that all variables have domains
   * and all constraint scopes reference known variables.
   * 
   * @param variables - List of all variables in the problem
   * @param domains - Mapping from each variable to its domain of possible values
   * @param constraints - List of constraints that assignments must satisfy
   * @throws Error if validation fails (missing domains, unknown variables in constraints)
   */
  constructor(
    variables: Variable[],
    domains: Map<Variable, Domain>,
    constraints: Constraint[],
  ) {
    // Validate that every variable has a domain
    for (const variable of variables) {
      if (!domains.has(variable)) {
        throw new Error(`Variable ${variable} has no domain`);
      }
    }

    // Validate that constraints only reference known variables
    for (const constraint of constraints) {
      const scope = constraint.getScope?.() || [];
      for (const variable of scope) {
        if (!variables.includes(variable)) {
          throw new Error(
            `Constraint references unknown variable: ${variable}`,
          );
        }
      }
    }

    // Deep freeze for immutability
    this.variables = Object.freeze([...variables]);
    this.constraints = Object.freeze([...constraints]);
    this.domains = new Map(domains);
    Object.freeze(this);
  }

  /**
   * Retrieves the current domain for a variable. The domain may have been
   * reduced from its initial state by inference algorithms.
   * 
   * @throws Error if variable is not part of this CSP
   */
  getDomain(variable: Variable): Domain {
    const domain = this.domains.get(variable);
    if (!domain) {
      throw new Error(`Unknown variable: ${variable}`);
    }
    return domain;
  }

  /**
   * Creates a new CSP with an updated domain for one variable. This is the
   * primary mechanism for domain reduction during search and inference.
   * 
   * @param variable - Variable whose domain to update
   * @param newDomain - New domain for the variable
   * @returns New CSP with updated domain, or null if domain becomes empty
   *          (indicates this branch of search has no solution)
   */
  withDomain(variable: Variable, newDomain: Domain): CSP | null {
    if (newDomain.size === 0) return null;

    const newDomains = new Map(this.domains);
    newDomains.set(variable, newDomain);

    return new CSP([...this.variables], newDomains, [...this.constraints]);
  }

  /**
   * Creates a new CSP with multiple domain updates. Used by inference
   * algorithms like AC-3 that may reduce many domains simultaneously.
   * 
   * Note: Unlike withDomain, this doesn't check for empty domains.
   * Callers must handle that case.
   */
  withDomains(newDomains: Map<Variable, Domain>): CSP {
    return new CSP([...this.variables], newDomains, [...this.constraints]);
  }

  /**
   * Finds all constraints that involve a specific variable. Essential for:
   * - Checking consistency when assigning a value
   * - Forward checking and arc consistency algorithms
   * - Identifying which constraints need re-evaluation after assignment
   */
  getConstraintsInvolving(variable: Variable): Constraint[] {
    return this.constraints.filter((c) => {
      const scope = c.getScope?.() || [];
      return scope.includes(variable);
    });
  }

  /**
   * Checks if an assignment satisfies all constraints. This is the core
   * test for solution validity. Note that partial assignments may be
   * consistent even if they don't constitute a complete solution.
   * 
   * @param assignment - Complete or partial variable assignment to check
   * @returns true if all constraints are satisfied by the assignment
   */
  isConsistent(assignment: Assignment): boolean {
    return this.constraints.every((c) => c.isSatisfied(assignment));
  }
}
