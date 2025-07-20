import { Assignment, Value, Variable } from "../data/types";
import { Domain } from "../data/domain";

export class SolverState {
  constructor(
    public readonly assignment: Assignment,
    public readonly domains: ReadonlyMap<Variable, Domain>,
    public readonly stats: {
      nodesExplored: number;
      inferencesApplied: number;
    },
  ) {}

  assign(variable: Variable, value: Value): SolverState {
    const newAssignment = new Map([...this.assignment, [variable, value]]);
    const newDomains = new Map(this.domains);
    newDomains.set(variable, new Domain([value]));

    return new SolverState(newAssignment, newDomains, {
      nodesExplored: this.stats.nodesExplored + 1,
      inferencesApplied: this.stats.inferencesApplied,
    });
  }

  withInference(newDomains: Map<Variable, Domain>): SolverState {
    return new SolverState(this.assignment, newDomains, {
      nodesExplored: this.stats.nodesExplored,
      inferencesApplied: this.stats.inferencesApplied + 1,
    });
  }
}
