import { bitOf } from './bits';
import { BOX_INDEX, COL_INDEX, ROW_INDEX } from './board';
import { analyse } from './grade';
import { mulberry32, randomSeed, shuffled, type Rng } from './rng';
import { countSolutions } from './solver';
import { CELL_COUNT, DIGITS, type Difficulty, type Puzzle } from './types';

const CLUE_TARGETS: Record<Difficulty, number> = {
  beginner: 50,
  easy: 44,
  medium: 34,
  hard: 27,
  expert: 24,
};

const MAX_ATTEMPTS = 12;

function range(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

export function generateSolution(rand: Rng): number[] {
  const cells = new Array<number>(CELL_COUNT).fill(0);
  const rowMask = new Int16Array(9);
  const colMask = new Int16Array(9);
  const boxMask = new Int16Array(9);

  const fill = (index: number): boolean => {
    if (index === CELL_COUNT) return true;
    const row = ROW_INDEX[index];
    const col = COL_INDEX[index];
    const box = BOX_INDEX[index];
    const used = rowMask[row] | colMask[col] | boxMask[box];

    for (const digit of shuffled(DIGITS, rand)) {
      const bit = bitOf(digit);
      if (used & bit) continue;
      cells[index] = digit;
      rowMask[row] |= bit;
      colMask[col] |= bit;
      boxMask[box] |= bit;
      if (fill(index + 1)) return true;
      rowMask[row] ^= bit;
      colMask[col] ^= bit;
      boxMask[box] ^= bit;
      cells[index] = 0;
    }

    return false;
  };

  if (!fill(0)) throw new Error('failed to build a complete grid');
  return cells;
}

/** Removes clues in random order while the puzzle keeps exactly one solution. */
export function carve(solution: readonly number[], targetClues: number, rand: Rng): number[] {
  const cells = solution.slice();
  let clues = CELL_COUNT;

  for (const index of shuffled(range(CELL_COUNT), rand)) {
    if (clues <= targetClues) break;
    const value = cells[index];
    cells[index] = 0;
    if (countSolutions(cells, 2) === 1) clues--;
    else cells[index] = value;
  }

  return cells;
}

function fitsDifficulty(difficulty: Difficulty, givens: readonly number[]): boolean {
  const { solved, depth } = analyse(givens);
  const clues = givens.filter((value) => value !== 0).length;
  switch (difficulty) {
    case 'beginner':
      return solved && depth <= 1 && clues >= 48;
    case 'easy':
      return solved && depth <= 1;
    case 'medium':
      return solved && depth <= 2;
    case 'hard':
      return solved ? depth >= 2 : true;
    case 'expert':
      return solved ? depth >= 3 : true;
  }
}

export function generatePuzzle(difficulty: Difficulty, seed: number = randomSeed()): Puzzle {
  const rand = mulberry32(seed);
  let fallback: Puzzle | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const solution = generateSolution(rand);
    const givens = carve(solution, CLUE_TARGETS[difficulty], rand);
    const puzzle: Puzzle = { difficulty, givens, solution };
    if (fitsDifficulty(difficulty, givens)) return puzzle;
    fallback = puzzle;
  }

  // Digging is randomised, so an attempt can land off-tier. The puzzle is still valid.
  return fallback as Puzzle;
}
