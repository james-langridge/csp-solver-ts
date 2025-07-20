import { Domain } from "./domain";
import { Assignment, Variable } from "./types";
import { Constraint } from "../constraints/constraint";

export class CSP {
  public readonly variables: readonly Variable[];
  public readonly constraints: readonly Constraint[];
  private readonly domains: ReadonlyMap<Variable, Domain>;

  constructor(
    variables: Variable[],
    domains: Map<Variable, Domain>,
    constraints: Constraint[],
  ) {
    for (const variable of variables) {
      if (!domains.has(variable)) {
        throw new Error(`Variable ${variable} has no domain`);
      }
    }

    for (const constraint of constraints) {
      const scope = constraint.getScope?.() || [];
      for (const variable of scope) {
        if (!variables.includes(variable)) {
          throw new Error(
            `Constraint references unknown variable: ${variable}`,
          );
        }
      }
    }

    this.variables = Object.freeze([...variables]);
    this.constraints = Object.freeze([...constraints]);
    this.domains = new Map(domains);
    Object.freeze(this);
  }

  getDomain(variable: Variable): Domain {
    const domain = this.domains.get(variable);
    if (!domain) {
      throw new Error(`Unknown variable: ${variable}`);
    }
    return domain;
  }

  withDomain(variable: Variable, newDomain: Domain): CSP | null {
    if (newDomain.size === 0) return null;

    const newDomains = new Map(this.domains);
    newDomains.set(variable, newDomain);

    return new CSP([...this.variables], newDomains, [...this.constraints]);
  }

  withDomains(newDomains: Map<Variable, Domain>): CSP {
    return new CSP([...this.variables], newDomains, [...this.constraints]);
  }

  getConstraintsInvolving(variable: Variable): Constraint[] {
    return this.constraints.filter((c) => {
      const scope = c.getScope?.() || [];
      return scope.includes(variable);
    });
  }

  isConsistent(assigment: Assignment): boolean {
    return this.constraints.every((c) => c.isSatisfied(assigment));
  }
}
