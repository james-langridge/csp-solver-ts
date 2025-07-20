import { CSPBuilder } from "../data/csp-builder";
import { custom } from "../constraints/factories";
import { Value, Variable } from "../data/types";

/**
 * Create N-Queens problem
 */
export function createNQueensProblem(n: number) {
  const builder = new CSPBuilder();

  // Variables are rows, values are column positions
  const rows: Variable[] = [];
  const cols: Value[] = [];

  for (let i = 0; i < n; i++) {
    rows.push(`row${i}`);
    cols.push(`col${i}`);
  }

  // Add variables with column domains
  for (const row of rows) {
    builder.addVariable(row, cols);
  }

  // Add constraints for each pair of queens
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

            if (!col1 || !col2) return true;

            // Extract column numbers
            const c1 = parseInt(col1.replace("col", ""));
            const c2 = parseInt(col2.replace("col", ""));

            // Not same column
            if (c1 === c2) return false;

            // Not on diagonal
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
