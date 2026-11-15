export const CELL_COUNT = 81;
export const SIZE = 9;

export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type Digit = (typeof DIGITS)[number];

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
export const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

export type Grid = readonly number[];

export interface Puzzle {
  difficulty: Difficulty;
  /** Clue values; 0 is a cell the player fills in. */
  givens: number[];
  solution: number[];
}

export function emptyGrid(): number[] {
  return new Array<number>(CELL_COUNT).fill(0);
}
