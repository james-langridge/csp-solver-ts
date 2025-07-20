import { Value, Variable } from "./types";
import { Constraint } from "../constraints/constraint";
import { Domain } from "./domain";
import { allDifferent } from "../constraints/factories";
import { CSP } from "./csp";

export class CspBuilder {
  private variables = new Set<Variable>();
  private domains = new Map<Variable, Domain>();
  private constraints: Constraint[] = [];

  addVariable(variable: Variable, values: Value[]): this {
    if (this.variables.has(variable)) {
      throw new Error(`Variable ${variable} already exists`);
    }

    this.variables.add(variable);
    this.domains.set(variable, new Domain(values));
    return this;
  }

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

  addAllDifferent(variables: Variable[]): this {
    const unknown = variables.filter((v) => !this.variables.has(v));
    if (unknown.length > 0) {
      throw new Error(`Unknown variables: ${unknown.join(", ")}`);
    }

    return this.addConstraint(allDifferent(variables));
  }

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

  build(): CSP {
    if (this.variables.size === 0) {
      throw new Error("Cannot build CSp with no variables");
    }

    return new CSP(Array.from(this.variables), new Map(this.domains), [
      ...this.constraints,
    ]);
  }
}
