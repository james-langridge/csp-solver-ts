import { Assignment, Value, Variable } from "../data/types";
import {
  AllDifferentConstraint,
  BinaryConstraint,
  Constraint,
  FunctionConstraint,
} from "./constraint";

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

export function allDifferent(variables: Variable[]): AllDifferentConstraint {
  return new AllDifferentConstraint(variables);
}

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

export function custom(
  predicate: (assignment: Assignment) => boolean,
  scope: Variable[] = [],
  description: string = "Custom constraint",
): Constraint {
  return new FunctionConstraint(predicate, scope, description);
}
