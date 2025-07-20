import { CSPBuilder } from "../data/csp-builder";
import { custom } from "../constraints/factories";
import { Value, Variable } from "../data/types";

/**
 * N-Queens problem: Place N queens on an N×N chessboard so no two queens
 * can attack each other. Queens attack along rows, columns, and diagonals.
 * 
 * This is a classic CSP benchmark that demonstrates:
 * - Complex constraints (no two queens on same row/column/diagonal)
 * - Scalability testing (complexity grows rapidly with N)
 * - Effectiveness of heuristics and constraint propagation
 * 
 * Modeling approach:
 * - Variables: One per row (row0, row1, ...)
 * - Values: Column positions (col0, col1, ...)
 * - This encoding automatically ensures no two queens in same row
 * - Constraints ensure no two queens in same column or diagonal
 */
/**
 * Creates an N-Queens problem instance for an N×N board.
 * 
 * @param n - Board size and number of queens to place
 * @returns CSP instance for N-Queens
 * 
 * @example
 * const queens8 = createNQueensProblem(8);
 * const result = solveCSP(queens8);
 * // result.assignment maps each row to its queen's column
 */
export function createNQueensProblem(n: number) {
  const builder = new CSPBuilder();

  // Create variables (one per row) and values (column positions)
  const rows: Variable[] = [];
  const cols: Value[] = [];

  for (let i = 0; i < n; i++) {
    rows.push(`row${i}`);
    cols.push(`col${i}`);
  }

  // Each row variable can place its queen in any column
  for (const row of rows) {
    builder.addVariable(row, cols);
  }

  // Add pairwise constraints between all queens
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const row1 = `row${i}`;
      const row2 = `row${j}`;
      const rowDiff = j - i;

      builder.addConstraint(
        custom(
          (assignment) => {
            const col1 = assignment.get(row1);
            const col2 = assignment.get(row2);

            // Constraint is satisfied if either queen is unplaced
            if (!col1 || !col2) return true;

            // Extract numeric column positions
            const c1 = parseInt(col1.replace("col", ""));
            const c2 = parseInt(col2.replace("col", ""));

            // Queens cannot be in same column
            if (c1 === c2) return false;

            // Queens cannot be on same diagonal
            // Diagonal attack occurs when column difference equals row difference
            if (Math.abs(c2 - c1) === rowDiff) return false;

            return true;
          },
          [row1, row2],
          `Queens at ${row1} and ${row2} cannot attack`,
        ),
      );
    }
  }

  return builder.build();
}
