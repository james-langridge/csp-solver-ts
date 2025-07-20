import { CSPBuilder } from "../data/csp-builder";
import { differentValues } from "../constraints/factories";

/**
 * Classic map coloring problems demonstrating graph coloring CSPs.
 * In map coloring, adjacent regions must have different colors.
 * This is equivalent to graph coloring where regions are nodes and
 * adjacencies are edges.
 */

/**
 * Creates the Australia map coloring problem - a classic CSP example.
 * Goal: Color each Australian state/territory so adjacent regions differ.
 * 
 * This problem has 7 regions and uses 3 colors, which is sufficient
 * (Australia's chromatic number is 3 due to the odd cycle SA-NSW-V-SA).
 * 
 * Adjacencies:
 * - WA: NT, SA
 * - NT: WA, SA, Q  
 * - SA: WA, NT, Q, NSW, V
 * - Q: NT, SA, NSW
 * - NSW: SA, Q, V
 * - V: SA, NSW
 * - T: (none - Tasmania is an island)
 * 
 * @returns CSP instance for Australia map coloring
 */
export function createAustraliaMapProblem() {
  return (
    new CSPBuilder()
      // All states can be colored red, green, or blue
      .addVariables(
        ["WA", "NT", "SA", "Q", "NSW", "V", "T"],
        ["red", "green", "blue"],
      )
      // Adjacent states must have different colors
      .addConstraint(differentValues("WA", "NT"))
      .addConstraint(differentValues("WA", "SA"))
      .addConstraint(differentValues("NT", "SA"))
      .addConstraint(differentValues("NT", "Q"))
      .addConstraint(differentValues("SA", "Q"))
      .addConstraint(differentValues("SA", "NSW"))
      .addConstraint(differentValues("SA", "V"))
      .addConstraint(differentValues("Q", "NSW"))
      .addConstraint(differentValues("NSW", "V"))
      // Note: Tasmania (T) has no adjacencies, so any color works
      .build()
  );
}

/**
 * Creates an unsolvable map coloring problem for testing.
 * 
 * This creates a complete graph K4 (4 nodes, all connected) but only
 * provides 2 colors. Since K4 has chromatic number 4, this is impossible
 * to solve - useful for testing the solver's ability to detect unsolvable
 * problems efficiently.
 * 
 * The solver should quickly determine no solution exists through
 * constraint propagation rather than exhaustive search.
 * 
 * @returns Unsolvable CSP instance
 */
export function createHardMapProblem() {
  return new CSPBuilder()
    .addVariables(["A", "B", "C", "D"], ["red", "blue"])
    .addPairwiseConstraints(
      ["A", "B", "C", "D"],
      differentValues, // Creates complete graph - needs 4 colors!
    )
    .build();
}
