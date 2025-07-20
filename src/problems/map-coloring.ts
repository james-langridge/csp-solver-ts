import { CSPBuilder } from "../data/csp-builder";
import { differentValues } from "../constraints/factories";

/**
 * Create Australia map coloring problem using builder
 */
export function createAustraliaMapProblem() {
  return (
    new CSPBuilder()
      // Add all states with same domain
      .addVariables(
        ["WA", "NT", "SA", "Q", "NSW", "V", "T"],
        ["red", "green", "blue"],
      )
      // Add adjacency constraints
      .addConstraint(differentValues("WA", "NT"))
      .addConstraint(differentValues("WA", "SA"))
      .addConstraint(differentValues("NT", "SA"))
      .addConstraint(differentValues("NT", "Q"))
      .addConstraint(differentValues("SA", "Q"))
      .addConstraint(differentValues("SA", "NSW"))
      .addConstraint(differentValues("SA", "V"))
      .addConstraint(differentValues("Q", "NSW"))
      .addConstraint(differentValues("NSW", "V"))
      .build()
  );
}

/**
 * Create a harder map coloring with fewer colors
 */
export function createHardMapProblem() {
  return new CSPBuilder()
    .addVariables(["A", "B", "C", "D"], ["red", "blue"])
    .addPairwiseConstraints(
      ["A", "B", "C", "D"],
      differentValues, // All must be different - impossible with 2 colors!
    )
    .build();
}
