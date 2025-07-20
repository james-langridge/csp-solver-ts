import { CSP } from "../data/csp";
import { SolverResult, Variable } from "../data/types";
import { SolverState } from "./state";
import { search } from "./search";
import { Domain } from "../data/domain";

export function solveCSP(csp: CSP): SolverResult {
  const startTime = performance.now();

  // Initialize solver state
  const initialDomains = new Map<Variable, Domain>();
  for (const variable of csp.variables) {
    initialDomains.set(variable, csp.getDomain(variable));
  }

  const initialState = new SolverState(new Map(), initialDomains, {
    nodesExplored: 0,
    inferencesApplied: 0,
  });

  // Run search
  const finalState = search(csp, initialState);

  const endTime = performance.now();

  if (finalState) {
    return {
      success: true,
      assignment: finalState.assignment,
      stats: {
        ...finalState.stats,
        timeMs: endTime - startTime,
      },
    };
  } else {
    return {
      success: false,
      reason: "No solution exists that satisfies all constraints",
      stats: {
        nodesExplored: initialState.stats.nodesExplored,
        inferencesApplied: initialState.stats.inferencesApplied,
        timeMs: endTime - startTime,
      },
    };
  }
}
