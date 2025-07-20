import { Value } from "./types";

/**
 * Immutable set of possible values for a CSP variable. Domains are fundamental
 * to constraint satisfaction - they define the search space for each variable.
 * 
 * During the solving process, domains are progressively reduced through inference
 * (like AC-3) and backtracking. An empty domain indicates an impossible assignment,
 * triggering backtracking in the search algorithm.
 * 
 * Immutability ensures that domain modifications during search don't affect other
 * branches of the search tree, enabling efficient backtracking without complex
 * state management.
 */
export class Domain {
  private readonly values: ReadonlySet<Value>;

  /**
   * Creates a new domain from an iterable of values. Duplicates are automatically
   * removed since domains are sets.
   * 
   * @param values - The possible values for this domain. Must be non-empty.
   * @throws Error if the resulting domain would be empty (indicates unsolvable CSP)
   */
  constructor(values: Iterable<Value>) {
    const valueSet = new Set(values);
    if (valueSet.size === 0) {
      throw new Error("Domain cannot be empty - CSP would be unsolvable");
    }
    this.values = valueSet;
  }

  /**
   * Number of values in this domain. Used by heuristics like MRV (Minimum
   * Remaining Values) to choose which variable to assign next.
   */
  get size(): number {
    return this.values.size;
  }

  /**
   * Tests whether a value is still possible for this variable.
   * Used during constraint checking and value selection.
   */
  contains(value: Value): boolean {
    return this.values.has(value);
  }

  /**
   * Creates a new domain containing only values that satisfy the predicate.
   * Used by inference algorithms to eliminate inconsistent values.
   * 
   * @returns New filtered domain, or null if all values were filtered out
   *          (indicates this variable has no valid assignments)
   */
  filter(predicate: (value: Value) => boolean): Domain | null {
    const filtered = Array.from(this.values).filter(predicate);
    return filtered.length > 0 ? new Domain(filtered) : null;
  }

  /**
   * Creates a new domain with specified values removed. Commonly used by
   * AC-3 to eliminate values that can't satisfy binary constraints.
   * 
   * @returns New reduced domain, or null if all values were removed
   */
  remove(valuesToRemove: Set<Value>): Domain | null {
    const remaining = Array.from(this.values).filter(
      (v) => !valuesToRemove.has(v),
    );
    return remaining.length > 0 ? new Domain(remaining) : null;
  }

  /**
   * Converts domain to array for algorithms that need indexed access.
   * Order is not guaranteed to be stable across calls.
   */
  toArray(): Value[] {
    return Array.from(this.values);
  }

  /**
   * Enables iteration over domain values using for...of loops.
   * Essential for constraint checking and value selection.
   */
  [Symbol.iterator](): Iterator<Value> {
    return this.values[Symbol.iterator]();
  }

  /**
   * Tests domain equality. Two domains are equal if they contain exactly
   * the same values. Used to detect when inference has reached a fixed point.
   */
  equals(other: Domain): boolean {
    if (this.size !== other.size) return false;
    for (const value of this.values) {
      if (!other.contains(value)) return false;
    }
    return true;
  }
}
