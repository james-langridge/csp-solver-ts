# CSP Solver - TypeScript

A Constraint Satisfaction Problem (CSP) solver implemented in TypeScript. This implementation uses backtracking search with MRV heuristic and AC-3 constraint propagation.

## Features

- **Immutable Data Structures**: Enables backtracking without manual state restoration
- **Search Heuristics**: 
  - MRV (Minimum Remaining Values) for variable selection
  - Degree heuristic for tie-breaking
  - Extensible value ordering framework
- **Constraint Propagation**: AC-3 (Arc Consistency) algorithm implementation
- **Constraint Types**: Unary, binary, and all-different constraints
- **TypeScript Types**: Type definitions for all public APIs
- **Built-in Problem Generators**: Classic CSP examples included (map coloring, N-Queens)

## Usage Example

```typescript
import { CSPBuilder, constraints, solveCSP } from 'csp-solver-ts';

// Create a simple map coloring problem
const csp = new CSPBuilder()
  .addVariables(['WA', 'NT', 'SA'], ['red', 'green', 'blue'])
  .addConstraint(constraints.differentValues('WA', 'NT'))
  .addConstraint(constraints.differentValues('WA', 'SA'))
  .addConstraint(constraints.differentValues('NT', 'SA'))
  .build();

// Solve it
const result = solveCSP(csp);

if (result.success) {
  console.log('Solution found:', result.assignment);
  console.log('Statistics:', result.stats);
}
```

## Core Concepts

### CSP Definition

A Constraint Satisfaction Problem consists of:
- **Variables**: Entities that need values assigned
- **Domains**: Possible values for each variable
- **Constraints**: Restrictions on valid assignments

### Solver Algorithm

The solver uses backtracking search with:

1. **Variable Selection**: MRV (Minimum Remaining Values) heuristic
2. **Constraint Propagation**: AC-3 algorithm
3. **Search**: Depth-first search with backtracking

### Implementation

The codebase uses:
- Immutable data structures for CSP components
- Side-effect free functions for solver logic
- TypeScript for type checking

## API Reference

### Building CSPs

```typescript
const builder = new CSPBuilder()
  .addVariable(variable, domain)
  .addVariables(variables, sharedDomain)
  .addConstraint(constraint)
  .addAllDifferent(variables)
  .addPairwiseConstraints(variables, constraintFactory)
  .build();
```

### Constraint Factories

```typescript
// Binary constraints
constraints.differentValues(var1, var2)  // var1 ≠ var2
constraints.equalTo(variable, value)     // variable = value

// Global constraints  
constraints.allDifferent([var1, var2, ...])

// Custom constraints
constraints.custom(
  (assignment) => { /* return true if satisfied */ },
  scope,
  description
)
```

### Solving

```typescript
const result = solveCSP(csp);

if (result.success) {
  // Access the solution
  for (const [variable, value] of result.assignment) {
    console.log(`${variable} = ${value}`);
  }
  
  // Performance metrics
  console.log(`Nodes explored: ${result.stats.nodesExplored}`);
  console.log(`Time: ${result.stats.timeMs}ms`);
}
```

## Examples

### Map Coloring

```typescript
import { problems, solveCSP } from 'csp-solver-ts';

const australia = problems.createAustraliaMapProblem();
const result = solveCSP(australia);
```

### N-Queens

```typescript
const queens = problems.createNQueensProblem(8);
const result = solveCSP(queens);

if (result.success) {
  // Visualize the board
  const board = Array(8).fill(null).map(() => Array(8).fill('.'));
  for (const [row, col] of result.assignment) {
    const r = parseInt(row.replace('row', ''));
    const c = parseInt(col.replace('col', ''));
    board[r][c] = 'Q';
  }
  console.log(board.map(row => row.join(' ')).join('\n'));
}
```

### Sudoku (Custom Implementation)

```typescript
const sudoku = new CSPBuilder();

// Add variables for each cell
for (let row = 0; row < 9; row++) {
  for (let col = 0; col < 9; col++) {
    sudoku.addVariable(`r${row}c${col}`, ['1','2','3','4','5','6','7','8','9']);
  }
}

// Add row constraints
for (let row = 0; row < 9; row++) {
  const rowVars = Array.from({length: 9}, (_, col) => `r${row}c${col}`);
  sudoku.addAllDifferent(rowVars);
}

// Add column constraints...
// Add box constraints...
// Add given values...

const result = solveCSP(sudoku.build());
```

## Implementation Details

The solver uses several techniques to improve efficiency:

- **Immutable Data Structures**: Enables backtracking without manual state restoration
- **MRV Heuristic**: Reduces nodes explored by choosing most constrained variables first
- **AC-3 Algorithm**: Prunes search space through constraint propagation
- **Early Failure Detection**: Domain wipeout immediately triggers backtracking

Note: Performance characteristics will vary based on problem complexity and structure. The implementation prioritizes code clarity and correctness over raw performance.

## Contributing

Possible areas for enhancement:

- Additional constraint types
- Value ordering heuristics (e.g., LCV)
- Alternative inference algorithms
- Additional problem examples
- Performance optimizations

## License

MIT
