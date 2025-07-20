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
