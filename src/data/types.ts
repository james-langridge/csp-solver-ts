export type Variable = string;
export type Value = string;
export type Assignment = ReadonlyMap<Variable, Value>;

export type SolverResult =
  | { sucess: true; assignment: Assignment; stats: SolverStats }
  | { sucess: false; reason: string; stats: SolverStats };

export interface SolverStats {
  nodesExplored: number;
  timeMs: number;
  inferencesApplied: number;
}
