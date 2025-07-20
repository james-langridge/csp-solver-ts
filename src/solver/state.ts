import { Assignment, Value, Variable } from "../data/types";
import { Domain } from "../data/domain";

/**
 * Immutable representation of the solver's state during search.
 * Combines the current partial assignment with reduced domains from inference.
 * 
 * Immutability is crucial for backtracking - when we backtrack, we simply
 * discard the current state and continue with a previous state, without
 * needing to undo changes.
 * 
 * The state also tracks statistics for performance analysis and debugging.
 */
export class SolverState {
  constructor(
    /**
     * Current partial assignment of variables to values.
     * Complete when all variables are assigned.
     */
    public readonly assignment: Assignment,
    
    /**
     * Current domains for all variables, potentially reduced by inference.
     * When a variable is assigned, its domain is reduced to a single value.
     */
    public readonly domains: ReadonlyMap<Variable, Domain>,
    
    /**
     * Statistics collected during search for performance analysis.
     */
    public readonly stats: {
      nodesExplored: number;
      inferencesApplied: number;
    },
  ) {}

  /**
   * Creates a new state with an additional variable-value assignment.
   * The variable's domain is reduced to just the assigned value.
   * 
   * @param variable - Variable to assign
   * @param value - Value to assign to the variable
   * @returns New state with the assignment (original state unchanged)
   */
  assign(variable: Variable, value: Value): SolverState {
    const newAssignment = new Map([...this.assignment, [variable, value]]);
    const newDomains = new Map(this.domains);
    // Reduce domain to single value after assignment
    newDomains.set(variable, new Domain([value]));

    return new SolverState(newAssignment, newDomains, {
      nodesExplored: this.stats.nodesExplored + 1,
      inferencesApplied: this.stats.inferencesApplied,
    });
  }

  /**
   * Creates a new state with updated domains from inference.
   * Assignment remains unchanged, but domains may be reduced.
   * 
   * @param newDomains - Updated domains after inference (e.g., from AC-3)
   * @returns New state with reduced domains
   */
  withInference(newDomains: Map<Variable, Domain>): SolverState {
    return new SolverState(this.assignment, newDomains, {
      nodesExplored: this.stats.nodesExplored,
      inferencesApplied: this.stats.inferencesApplied + 1,
    });
  }
}
