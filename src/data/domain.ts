import { Value } from "./types";

export class Domain {
  private readonly values: ReadonlySet<Value>;

  constructor(values: Iterable<Value>) {
    const valueSet = new Set(values);
    if (valueSet.size === 0) {
      throw new Error("Domain cannot be empty - CSP would be unsolvable");
    }
    this.values = valueSet;
  }

  get size(): number {
    return this.values.size;
  }

  contains(value: Value): boolean {
    return this.values.has(value);
  }

  filter(predicate: (value: Value) => boolean): Domain | null {
    const filtered = Array.from(this.values).filter(predicate);
    return filtered.length > 0 ? new Domain(filtered) : null;
  }

  remove(valuesToRemove: Set<Value>): Domain | null {
    const remaining = Array.from(this.values).filter(
      (v) => !valuesToRemove.has(v),
    );
    return remaining.length > 0 ? new Domain(remaining) : null;
  }

  toArray(): Value[] {
    return Array.from(this.values);
  }

  [Symbol.iterator](): Iterator<Value> {
    return this.values[Symbol.iterator]();
  }

  equals(other: Domain): boolean {
    if (this.size !== other.size) return false;
    for (const value of this.values) {
      if (!other.contains(value)) return false;
    }
    return true;
  }
}
