import { Assignment, Value, Variable } from "../data/types";
import { Domain } from "../data/domain";

export interface Constraint {
  isSatisfied(assignment: Assignment): boolean;

  getScope?(): Variable[];
  describe?(): string;
}

export class FunctionConstraint implements Constraint {
  constructor(
    private readonly predicate: (assignment: Assignment) => boolean,
    private readonly scope: Variable[] = [],
    private readonly description: string = "Custom constraint",
  ) {}

  isSatisfied(assignment: Assignment): boolean {
    return this.predicate(assignment);
  }

  getScope(): Variable[] {
    return this.scope;
  }

  describe(): string {
    return this.description;
  }
}

export class BinaryConstraint implements Constraint {
  constructor(
    public readonly var1: Variable,
    public readonly var2: Variable,
    private readonly predicate: (val1: Value, val2: Value) => boolean,
    private readonly description: string = "",
  ) {}

  isSatisfied(assignment: Assignment): boolean {
    const val1 = assignment.get(this.var1);
    const val2 = assignment.get(this.var2);

    if (!val1 || !val2) return true;

    return this.predicate(val1, val2);
  }

  getScope(): Variable[] {
    return [this.var1, this.var2];
  }

  involves(variable: Variable): boolean {
    return this.var1 === variable || this.var2 === variable;
  }

  getOther(variable: Variable): Variable | null {
    if (this.var1 === variable) return this.var2;
    if (this.var2 === variable) return this.var1;
    return null;
  }

  describe(): string {
    return (
      this.description ||
      `${this.var1} and ${this.var2} must satisfy constraint`
    );
  }

  getSupportedValues(
    var1Values: Domain,
    var2Values: Domain,
  ): {
    var1Supported: Set<Value>;
    var2Supported: Set<Value>;
  } {
    const var1Supported = new Set<Value>();
    const var2Supported = new Set<Value>();

    for (const v1 of var1Values) {
      for (const v2 of var2Values) {
        if (this.predicate(v1, v2)) {
          var1Supported.add(v1);
          var2Supported.add(v2);
        }
      }
    }

    return { var1Supported, var2Supported };
  }
}

export class AllDifferentConstraint implements Constraint {
  constructor(
    private readonly variables: Variable[],
    private readonly description: string = "",
  ) {
    if (variables.length < 2) {
      throw new Error("AllDifferent requires at least 2 variables");
    }
  }

  isSatisfied(assignment: Assignment): boolean {
    const assignedValues = new Set<Value>();

    for (const variable of this.variables) {
      const value = assignment.get(variable);
      if (value) {
        if (assignedValues.has(value)) {
          return false;
        }
        assignedValues.add(value);
      }
    }

    return true;
  }

  getScope(): Variable[] {
    return [...this.variables];
  }

  describe(): string {
    return (
      this.description ||
      `Variables ${this.variables.join(", ")} must all be different`
    );
  }
}
