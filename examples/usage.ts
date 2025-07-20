import { solveCSP, CSPBuilder, constraints, problems } from "../src";

async function example1() {
  console.log("Example 1: Using the builder");

  const csp = new CSPBuilder()
    .addVariables(["A", "B", "C"], ["1", "2", "3"])
    .addAllDifferent(["A", "B", "C"])
    .addConstraint(constraints.equalTo("A", "1"))
    .build();

  const result = solveCSP(csp);

  if (result.success) {
    console.log("Solution found:");
    for (const [variable, value] of result.assignment) {
      console.log(`  ${variable} = ${value}`);
    }
    console.log(
      `Stats: ${result.stats.nodesExplored} nodes, ${result.stats.timeMs.toFixed(2)}ms`,
    );
  }
}

async function example2() {
  console.log("\nExample 2: Map coloring");

  const australia = problems.createAustraliaMapProblem();
  const result = solveCSP(australia);

  if (result.success) {
    console.log("Australia colored with 3 colors!");
    console.log(`Explored ${result.stats.nodesExplored} nodes`);
    console.log(`Applied ${result.stats.inferencesApplied} inferences`);
  }
}

async function example3() {
  console.log("\nExample 3: N-Queens");

  const queens = problems.createNQueensProblem(8);
  const result = solveCSP(queens);

  if (result.success) {
    console.log("8-Queens solution found!");

    // Display as board
    const board: string[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill("."));

    for (const [row, col] of result.assignment) {
      const r = parseInt(row.replace("row", ""));
      const c = parseInt(col.replace("col", ""));
      board[r][c] = "Q";
    }

    console.log("\nBoard:");
    for (const row of board) {
      console.log(row.join(" "));
    }
  }
}

// Run examples
Promise.all([example1()]).catch(console.error);
