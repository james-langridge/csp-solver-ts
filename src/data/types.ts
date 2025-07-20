/**
 * Represents a variable in a CSP. Variables are the entities that need to be
 * assigned values. In a graph coloring problem, each node would be a variable.
 * In a scheduling problem, each time slot or task would be a variable.
 * 
 * We use strings for flexibility - they can represent anything from "X1", "Y2"
 * in a puzzle to "WA", "NT" in a map coloring problem.
 */
export type Variable = string;

/**
 * Represents a possible value that can be assigned to a variable. The specific
 * meaning depends on the problem domain. In graph coloring, values might be
 * colors like "red", "blue". In Sudoku, they'd be digits "1"-"9".
 * 
 * String representation allows maximum flexibility across different problem types.
 */
export type Value = string;

/**
 * An immutable mapping from variables to their assigned values. This represents
 * a (potentially partial) solution to a CSP. Complete assignments have values
 * for all variables; partial assignments arise during the search process.
 * 
 * Immutability is crucial for the backtracking algorithm - it allows us to
 * efficiently explore different branches without corrupting previous states.
 */
export type Assignment = ReadonlyMap<Variable, Value>;

/**
 * Result of attempting to solve a CSP. Uses a discriminated union to provide
 * type-safe handling of success and failure cases.
 * 
 * On success, contains the complete assignment satisfying all constraints.
 * On failure, provides a human-readable reason (typically "No solution exists").
 * Both cases include performance statistics for analysis.
 */
export type SolverResult =
  | { success: true; assignment: Assignment; stats: SolverStats }
  | { success: false; reason: string; stats: SolverStats };

/**
 * Performance metrics collected during CSP solving. Useful for algorithm
 * analysis, benchmarking, and identifying performance bottlenecks.
 */
export interface SolverStats {
  /**
   * Number of nodes (partial assignments) explored in the search tree.
   * Higher values indicate more difficult problems or less effective heuristics.
   */
  nodesExplored: number;
  
  /**
   * Wall-clock time in milliseconds from start to finish of the solving process.
   * Includes all computation: search, inference, and constraint checking.
   */
  timeMs: number;
  
  /**
   * Number of inference operations (domain reductions) applied during search.
   * Each inference may eliminate multiple values from domains, pruning the search space.
   */
  inferencesApplied: number;
}
