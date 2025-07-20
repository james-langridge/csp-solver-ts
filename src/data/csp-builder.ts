import { Value, Variable } from "./types";
import { Constraint } from "../constraints/constraint";
import { Domain } from "./domain";
import { allDifferent } from "../constraints/factories";
import { CSP } from "./csp";

/**
 * Fluent builder for constructing CSP instances. Provides a convenient API
 * for incrementally defining variables, domains, and constraints.
 * 
 * The builder pattern ensures CSPs are constructed correctly:
 * - Variables must be defined before being used in constraints
 * - Duplicate variables are prevented
 * - All constraints reference valid variables
 * 
 * @example
 * const csp = new CSPBuilder()
 *   .addVariables(['A', 'B', 'C'], ['1', '2', '3'])
 *   .addAllDifferent(['A', 'B', 'C'])
 *   .addConstraint(constraints.equalTo('A', '1'))
 *   .build();
 */
export class CSPBuilder {
  private variables = new Set<Variable>();
  private domains = new Map<Variable, Domain>();
  private constraints: Constraint[] = [];

  /**
   * Adds a single variable with its domain to the CSP.
   * 
   * @param variable - Unique identifier for the variable
   * @param values - Possible values this variable can take
   * @returns this builder for method chaining
   * @throws Error if variable already exists
   */
  addVariable(variable: Variable, values: Value[]): this {
    if (this.variables.has(variable)) {
      throw new Error(`Variable ${variable} already exists`);
    }

    this.variables.add(variable);
    this.domains.set(variable, new Domain(values));
    return this;
  }

  /**
   * Adds multiple variables that share the same domain. Common pattern
   * for problems where many variables have identical possible values.
   * 
   * @param variables - List of unique variable identifiers
   * @param values - Shared domain for all variables
   * @returns this builder for method chaining
   * @throws Error if any variable already exists
   */
  addVariables(variables: Variable[], values: Value[]): this {
    const domain = new Domain(values);

    for (const variable of variables) {
      if (this.variables.has(variable)) {
        throw new Error(`Variable ${variable} already exists`);
      }
      this.variables.add(variable);
      this.domains.set(variable, domain);
    }
    return this;
  }

  /**
   * Adds a constraint to the CSP. Validates that all variables in the
   * constraint's scope have been defined.
   * 
   * @param constraint - Constraint to add (created via constraint factories)
   * @returns this builder for method chaining
   * @throws Error if constraint references undefined variables
   */
  addConstraint(constraint: Constraint): this {
    const scope = constraint.getScope?.() || [];
    const unknown = scope.filter((v) => !this.variables.has(v));

    if (unknown.length > 0) {
      throw new Error(
        `Constraint references unknown variables: ${unknown.join(", ")}`,
      );
    }

    this.constraints.push(constraint);
    return this;
  }

  /**
   * Convenience method for adding an all-different constraint.
   * Ensures all specified variables must have different values.
   * 
   * @param variables - Variables that must all have different values
   * @returns this builder for method chaining
   * @throws Error if any variable is undefined
   */
  addAllDifferent(variables: Variable[]): this {
    const unknown = variables.filter((v) => !this.variables.has(v));
    if (unknown.length > 0) {
      throw new Error(`Unknown variables: ${unknown.join(", ")}`);
    }

    return this.addConstraint(allDifferent(variables));
  }

  /**
   * Adds constraints between all pairs of variables in a list.
   * Useful for problems where every pair must satisfy the same relation.
   * 
   * @param variables - Variables to connect pairwise
   * @param constraintFactory - Function that creates a constraint for two variables
   * @returns this builder for method chaining
   * 
   * @example
   * // Make all pairs different (equivalent to allDifferent)
   * builder.addPairwiseConstraints(['A','B','C'], constraints.differentValues)
   */
  addPairwiseConstraints(
    variables: Variable[],
    constraintFactory: (v1: Variable, v2: Variable) => Constraint,
  ): this {
    for (let i = 0; i < variables.length; i++) {
      for (let j = i + 1; j < variables.length; j++) {
        this.addConstraint(constraintFactory(variables[i], variables[j]));
      }
    }
    return this;
  }

  /**
   * Constructs the final immutable CSP instance. Validates that at least
   * one variable has been defined.
   * 
   * @returns Immutable CSP ready for solving
   * @throws Error if no variables have been defined
   */
  build(): CSP {
    if (this.variables.size === 0) {
      throw new Error("Cannot build CSP with no variables");
    }

    return new CSP(Array.from(this.variables), new Map(this.domains), [
      ...this.constraints,
    ]);
  }
}
