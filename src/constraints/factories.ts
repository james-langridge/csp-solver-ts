/**
 * Factory functions for creating common constraint types. These functions
 * provide a convenient API for constraint creation while ensuring proper
 * initialization and error handling.
 * 
 * Using factories instead of direct constructor calls provides:
 * - Cleaner syntax (no 'new' keyword needed)
 * - Type inference for complex constraints
 * - Consistent naming conventions
 * - Easy extension for new constraint types
 */

import { Assignment, Value, Variable } from "../data/types";
import {
  AllDifferentConstraint,
  BinaryConstraint,
  Constraint,
  FunctionConstraint,
} from "./constraint";

/**
 * Creates a not-equal constraint between two variables.
 * The most common binary constraint in CSPs.
 * 
 * @param var1 - First variable
 * @param var2 - Second variable
 * @returns Constraint ensuring var1 and var2 have different values
 * 
 * @example
 * // Adjacent regions must have different colors
 * csp.addConstraint(differentValues('WA', 'NT'));
 */
export function differentValues(
  var1: Variable,
  var2: Variable,
): BinaryConstraint {
  return new BinaryConstraint(
    var1,
    var2,
    (v1, v2) => v1 !== v2,
    `${var1} != ${var2}`,
  );
}

/**
 * Creates a global constraint ensuring all variables have different values.
 * More efficient than multiple pairwise not-equal constraints.
 * 
 * @param variables - Variables that must all have different values
 * @returns AllDifferent constraint
 * @throws Error if fewer than 2 variables provided
 * 
 * @example
 * // Sudoku row constraint
 * csp.addConstraint(allDifferent(['r1c1', 'r1c2', 'r1c3', ...]));
 */
export function allDifferent(variables: Variable[]): AllDifferentConstraint {
  return new AllDifferentConstraint(variables);
}

/**
 * Creates a unary constraint that forces a variable to have a specific value.
 * Useful for pre-assigning known values or adding clues (e.g., Sudoku givens).
 * 
 * @param variable - Variable to constrain
 * @param value - Required value for the variable
 * @returns Constraint ensuring variable equals value
 * 
 * @example
 * // Pre-assign a known value
 * csp.addConstraint(equalTo('start_time', '9:00'));
 */
export function equalTo(variable: Variable, value: Value): Constraint {
  return new FunctionConstraint(
    (assignment) => {
      const assigned = assignment.get(variable);
      return !assigned || assigned === value;
    },
    [variable],
    `${variable} = ${value}`,
  );
}

/**
 * Creates a custom constraint with arbitrary logic. Use for constraints
 * that don't fit standard patterns.
 * 
 * @param predicate - Function that returns true if constraint is satisfied
 * @param scope - Variables involved in this constraint (for optimization)
 * @param description - Human-readable description for debugging
 * @returns Custom constraint
 * 
 * @example
 * // X + Y = Z constraint
 * csp.addConstraint(custom(
 *   (assignment) => {
 *     const x = assignment.get('X');
 *     const y = assignment.get('Y');
 *     const z = assignment.get('Z');
 *     if (!x || !y || !z) return true; // Could still be satisfied
 *     return parseInt(x) + parseInt(y) === parseInt(z);
 *   },
 *   ['X', 'Y', 'Z'],
 *   'X + Y = Z'
 * ));
 */
export function custom(
  predicate: (assignment: Assignment) => boolean,
  scope: Variable[] = [],
  description: string = "Custom constraint",
): Constraint {
  return new FunctionConstraint(predicate, scope, description);
}
