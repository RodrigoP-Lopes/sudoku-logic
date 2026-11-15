import { findPlacement, type Technique } from './grade';
import { CELL_COUNT, type Grid } from './types';

export type Hint =
  | { kind: 'place'; index: number; value: number; technique: Technique }
  | { kind: 'reveal'; index: number; value: number }
  | { kind: 'fix'; index: number };

/** First cell that disagrees with the solution; hints are meaningless until it is cleared. */
export function firstMistake(cells: Grid, solution: Grid): number {
  for (let index = 0; index < CELL_COUNT; index++) {
    if (cells[index] !== 0 && cells[index] !== solution[index]) return index;
  }
  return -1;
}

export function nextHint(cells: Grid, solution: Grid): Hint | null {
  const mistake = firstMistake(cells, solution);
  if (mistake !== -1) return { kind: 'fix', index: mistake };

  const placement = findPlacement(cells);
  if (placement) {
    return { kind: 'place', index: placement.index, value: placement.value, technique: placement.technique };
  }

  for (let index = 0; index < CELL_COUNT; index++) {
    if (cells[index] === 0) return { kind: 'reveal', index, value: solution[index] };
  }
  return null;
}

export function hintMessage(hint: Hint): string {
  switch (hint.kind) {
    case 'fix':
      return 'One of your entries is wrong. Clear the highlighted cell first.';
    case 'reveal':
      return 'Nothing simple is left here, so a cell has been filled in for you.';
    case 'place':
      return hint.technique === 'naked-single'
        ? 'Only one number fits in the highlighted cell.'
        : 'The highlighted number fits in only one cell of its row, column or box.';
  }
}
