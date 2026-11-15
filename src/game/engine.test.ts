import { analyse } from './grade';
import { generatePuzzle, generateSolution } from './generator';
import { firstMistake, nextHint } from './hints';
import { mulberry32 } from './rng';
import { countSolutions, solveGrid } from './solver';
import type { Difficulty } from './types';

const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'
  .split('')
  .map(Number);
const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  .split('')
  .map(Number);

describe('solver', () => {
  it('solves a classic puzzle and reports one solution', () => {
    expect(solveGrid(PUZZLE)).toEqual(SOLUTION);
    expect(countSolutions(PUZZLE)).toBe(1);
  });

  it('rejects contradictory or malformed grids', () => {
    const broken = PUZZLE.slice();
    broken[2] = 5;
    expect(countSolutions(broken)).toBe(0);
    expect(countSolutions([1, 2, 3])).toBe(0);
  });
});

describe('grade', () => {
  it('solves singles-only puzzles and leaves no steps on a full grid', () => {
    expect(analyse(PUZZLE).solved).toBe(true);
    const full = analyse(SOLUTION);
    expect(full.depth).toBe(0);
    expect(full.steps).toHaveLength(0);
  });
});

describe('generator', () => {
  it('builds a complete grid deterministically', () => {
    const first = generateSolution(mulberry32(7));
    expect(first).toHaveLength(81);
    expect(countSolutions(first)).toBe(1);
    expect(generatePuzzle('medium', 99).givens).toEqual(generatePuzzle('medium', 99).givens);
  });

  it.each(['beginner', 'easy', 'medium', 'hard', 'expert'] as Difficulty[])(
    'produces a unique-solution %s puzzle',
    (difficulty) => {
      const puzzle = generatePuzzle(difficulty, 500 + difficulty.length);
      expect(countSolutions(puzzle.givens, 2)).toBe(1);
      for (let index = 0; index < 81; index++) {
        if (puzzle.givens[index] !== 0) expect(puzzle.givens[index]).toBe(puzzle.solution[index]);
      }
    },
  );
});

describe('hints', () => {
  it('suggests a placement, or asks to fix a wrong entry first', () => {
    const hint = nextHint(PUZZLE, SOLUTION);
    expect(hint?.kind).toBe('place');

    const wrong = PUZZLE.slice();
    wrong[2] = 9;
    expect(nextHint(wrong, SOLUTION)).toEqual({ kind: 'fix', index: 2 });
    expect(firstMistake(wrong, SOLUTION)).toBe(2);
  });

  it('returns null once the grid is solved', () => {
    expect(nextHint(SOLUTION, SOLUTION)).toBeNull();
  });
});
