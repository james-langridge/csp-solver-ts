import { Assignment, Value, Variable } from "../data/types";
import { Domain } from "../data/domain";

/**
 * Core abstraction for constraints in a CSP. A constraint restricts which
 * combinations of values can be assigned to variables.
 * 
 * Constraints are the heart of CSPs - they encode the problem's requirements.
 * The solver's job is to find assignments that satisfy all constraints.
 * 
 * This interface supports both simple constraints (like X != Y) and complex
 * global constraints (like all-different over many variables).
 */
export interface Constraint {
  /**
   * Tests whether this constraint is satisfied by the given assignment.
   * For partial assignments, returns true if the constraint could still
   * be satisfied (i.e., no conflict with assigned values).
   * 
   * @param assignment - Current variable assignments (may be partial)
   * @returns true if constraint is satisfied or could be satisfied
   */
  isSatisfied(assignment: Assignment): boolean;

  /**
   * Returns the variables involved in this constraint. Used by inference
   * algorithms to know which constraints to check when a variable changes.
   */
  getScope?(): Variable[];
  
  /**
   * Human-readable description of this constraint for debugging.
   */
  describe?(): string;
}

/**
 * General-purpose constraint defined by a predicate function. Provides maximum
 * flexibility for expressing complex constraints that don't fit standard patterns.
 * 
 * Note: For performance, prefer specialized constraint types (BinaryConstraint,
 * AllDifferentConstraint) when applicable, as they can be optimized by inference.
 */
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

/**
 * Constraint between exactly two variables. Binary constraints are special
 * because they can be efficiently processed by arc consistency algorithms.
 * 
 * Most constraints in typical CSPs are binary (e.g., adjacent regions must
 * have different colors, X must be less than Y).
 */
export class BinaryConstraint implements Constraint {
  constructor(
    public readonly var1: Variable,
    public readonly var2: Variable,
    private readonly predicate: (val1: Value, val2: Value) => boolean,
    private readonly description: string = "",
  ) {}

  /**
   * Binary constraints are satisfied if both variables are unassigned
   * (could still be satisfied) or if assigned values satisfy the predicate.
   */
  isSatisfied(assignment: Assignment): boolean {
    const val1 = assignment.get(this.var1);
    const val2 = assignment.get(this.var2);

    // If either variable is unassigned, constraint could still be satisfied
    if (!val1 || !val2) return true;

    return this.predicate(val1, val2);
  }

  getScope(): Variable[] {
    return [this.var1, this.var2];
  }

  /**
   * Checks if this constraint involves a specific variable.
   * Used for finding relevant constraints during search.
   */
  involves(variable: Variable): boolean {
    return this.var1 === variable || this.var2 === variable;
  }

  /**
   * Given one variable in the constraint, returns the other.
   * Essential for arc consistency: when var1's domain changes,
   * we need to check consistency with var2.
   */
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

  /**
   * Computes which values from each domain have support (i.e., can satisfy
   * the constraint with at least one value from the other domain).
   * 
   * This is the core operation for AC-3: values without support are inconsistent
   * and can be removed from domains.
   * 
   * @returns Sets of values that have support from the other variable's domain
   */
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

/**
 * Global constraint ensuring all variables have different values.
 * More efficient than creating O(n²) binary not-equal constraints.
 * 
 * Common in puzzles (Sudoku rows/columns), scheduling (no resource conflicts),
 * and graph coloring (adjacent regions need different colors).
 */
export class AllDifferentConstraint implements Constraint {
  constructor(
    private readonly variables: Variable[],
    private readonly description: string = "",
  ) {
    if (variables.length < 2) {
      throw new Error("AllDifferent requires at least 2 variables");
    }
  }

  /**
   * Satisfied if no two assigned variables have the same value.
   * Unassigned variables don't violate the constraint.
   */
  isSatisfied(assignment: Assignment): boolean {
    const assignedValues = new Set<Value>();

    for (const variable of this.variables) {
      const value = assignment.get(variable);
      if (value) {
        if (assignedValues.has(value)) {
          return false;  // Duplicate value found
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
