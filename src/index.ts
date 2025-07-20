/**
 * CSP Solver - A Constraint Satisfaction Problem solver for TypeScript.
 * 
 * This implementation provides tools for defining and solving CSPs using
 * backtracking search with constraint propagation.
 * 
 * ## Key Components:
 * 
 * - **Solver**: Backtracking search with AC-3 inference
 * - **Data Structures**: CSP, Domain, Variable, and Assignment types
 * - **Constraints**: Unary, binary, and all-different constraint implementations
 * - **Builder API**: CSPBuilder for constructing problem instances
 * - **Example Problems**: Map coloring and N-Queens implementations
 * 
 * ## Basic Usage:
 * ```typescript
 * import { CSPBuilder, constraints, solveCSP } from 'csp-solver-ts';
 * 
 * const csp = new CSPBuilder()
 *   .addVariables(['X', 'Y', 'Z'], ['1', '2', '3'])
 *   .addAllDifferent(['X', 'Y', 'Z'])
 *   .build();
 * 
 * const result = solveCSP(csp);
 * ```
 * 
 * @packageDocumentation
 */

// Core solver
export { solveCSP } from "./solver";

// Data types
export {
  Variable,
  Value,
  Assignment,
  SolverResult,
  SolverStats,
} from "./data/types";
export { Domain } from "./data/domain";
export { CSP } from "./data/csp";
export { CSPBuilder } from "./data/csp-builder";

// Constraints
export { Constraint } from "./constraints/constraint";
export * as constraints from "./constraints/factories";

// Example problems
export * as problems from "./problems";
