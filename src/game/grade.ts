import { FULL_MASK, bitOf, digitsOf, lowestDigit, popcount } from './bits';
import { BOXES, BOX_INDEX, COL_INDEX, PEERS, ROW_INDEX, UNITS } from './board';
import { CELL_COUNT, type Grid } from './types';

export type Technique = 'naked-single' | 'hidden-single' | 'naked-pair' | 'pointing';

export const TECHNIQUE_LEVEL: Record<Technique, number> = {
  'naked-single': 1,
  'hidden-single': 1,
  'naked-pair': 2,
  pointing: 3,
};

export const STUCK_DEPTH = 4;

export interface Placement {
  kind: 'place';
  index: number;
  value: number;
  technique: Technique;
}

export interface Elimination {
  kind: 'eliminate';
  technique: Technique;
  index: number;
  values: number[];
}

export type Step = Placement | Elimination;

export interface Analysis {
  solved: boolean;
  /** 0 solved as given, 1 singles, 2 pairs, 3 pointing, 4 stuck. */
  depth: number;
  steps: Step[];
  remaining: number;
}

function candidateMasks(cells: readonly number[]): Int16Array {
  const candidates = new Int16Array(CELL_COUNT);
  for (let index = 0; index < CELL_COUNT; index++) {
    if (cells[index] !== 0) continue;
    let used = 0;
    for (const peer of PEERS[index]) {
      const value = cells[peer];
      if (value !== 0) used |= bitOf(value);
    }
    candidates[index] = ~used & FULL_MASK;
  }
  return candidates;
}

function countEmpty(cells: readonly number[]): number {
  let empty = 0;
  for (let index = 0; index < CELL_COUNT; index++) if (cells[index] === 0) empty++;
  return empty;
}

function findNakedSingle(cells: readonly number[], candidates: Int16Array): Placement | null {
  for (let index = 0; index < CELL_COUNT; index++) {
    if (cells[index] !== 0) continue;
    const mask = candidates[index];
    if (popcount(mask) === 1) {
      return { kind: 'place', index, value: lowestDigit(mask), technique: 'naked-single' };
    }
  }
  return null;
}

function findHiddenSingle(cells: readonly number[], candidates: Int16Array): Placement | null {
  for (const unit of UNITS) {
    for (let digit = 1; digit <= 9; digit++) {
      const bit = bitOf(digit);
      let found = -1;
      let count = 0;
      for (const index of unit) {
        if (cells[index] !== 0) continue;
        if ((candidates[index] & bit) === 0) continue;
        found = index;
        count++;
        if (count > 1) break;
      }
      if (count === 1) return { kind: 'place', index: found, value: digit, technique: 'hidden-single' };
    }
  }
  return null;
}

function findNakedPair(cells: readonly number[], candidates: Int16Array): Elimination | null {
  for (const unit of UNITS) {
    const pairs: number[] = [];
    for (const index of unit) {
      if (cells[index] === 0 && popcount(candidates[index]) === 2) pairs.push(index);
    }
    for (let a = 0; a < pairs.length; a++) {
      for (let b = a + 1; b < pairs.length; b++) {
        const first = pairs[a];
        const second = pairs[b];
        if (candidates[first] !== candidates[second]) continue;
        const mask = candidates[first];
        for (const index of unit) {
          if (index === first || index === second || cells[index] !== 0) continue;
          const removed = candidates[index] & mask;
          if (removed !== 0) {
            return { kind: 'eliminate', technique: 'naked-pair', index, values: digitsOf(removed) };
          }
        }
      }
    }
  }
  return null;
}

function findPointing(cells: readonly number[], candidates: Int16Array): Elimination | null {
  for (let box = 0; box < 9; box++) {
    for (let digit = 1; digit <= 9; digit++) {
      const bit = bitOf(digit);
      const spots: number[] = [];
      for (const index of BOXES[box]) {
        if (cells[index] === 0 && (candidates[index] & bit) !== 0) spots.push(index);
      }
      if (spots.length < 2 || spots.length > 3) continue;

      const row = ROW_INDEX[spots[0]];
      if (spots.every((index) => ROW_INDEX[index] === row)) {
        for (let col = 0; col < 9; col++) {
          const index = row * 9 + col;
          if (BOX_INDEX[index] === box || cells[index] !== 0) continue;
          if ((candidates[index] & bit) !== 0) {
            return { kind: 'eliminate', technique: 'pointing', index, values: [digit] };
          }
        }
      }

      const col = COL_INDEX[spots[0]];
      if (spots.every((index) => COL_INDEX[index] === col)) {
        for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
          const index = rowIndex * 9 + col;
          if (BOX_INDEX[index] === box || cells[index] !== 0) continue;
          if ((candidates[index] & bit) !== 0) {
            return { kind: 'eliminate', technique: 'pointing', index, values: [digit] };
          }
        }
      }
    }
  }
  return null;
}

export interface AnalyseOptions {
  maxLevel?: number;
  maxSteps?: number;
}

/**
 * Runs the technique ladder until solved or stuck. Eliminations are remembered as permanent
 * candidate removals, otherwise the same one would be rediscovered forever.
 */
export function analyse(grid: Grid, options: AnalyseOptions = {}): Analysis {
  const maxLevel = options.maxLevel ?? 3;
  const maxSteps = options.maxSteps ?? 400;
  const cells = grid.slice();
  const steps: Step[] = [];
  const eliminated: Array<{ index: number; values: number[] }> = [];

  const summarise = (solved: boolean): Analysis => ({
    solved,
    depth: solved ? steps.reduce((max, step) => Math.max(max, TECHNIQUE_LEVEL[step.technique]), 0) : STUCK_DEPTH,
    steps,
    remaining: countEmpty(cells),
  });

  for (;;) {
    if (countEmpty(cells) === 0) return summarise(true);
    if (steps.length >= maxSteps) return summarise(false);

    const candidates = candidateMasks(cells);
    for (const entry of eliminated) {
      let mask = candidates[entry.index];
      for (const value of entry.values) mask &= ~bitOf(value);
      candidates[entry.index] = mask;
    }

    const naked = findNakedSingle(cells, candidates);
    if (naked) {
      cells[naked.index] = naked.value;
      steps.push(naked);
      continue;
    }

    const hidden = findHiddenSingle(cells, candidates);
    if (hidden) {
      cells[hidden.index] = hidden.value;
      steps.push(hidden);
      continue;
    }

    if (maxLevel >= 2) {
      const pair = findNakedPair(cells, candidates);
      if (pair) {
        eliminated.push({ index: pair.index, values: pair.values });
        steps.push(pair);
        continue;
      }
    }

    if (maxLevel >= 3) {
      const pointing = findPointing(cells, candidates);
      if (pointing) {
        eliminated.push({ index: pointing.index, values: pointing.values });
        steps.push(pointing);
        continue;
      }
    }

    return summarise(false);
  }
}

/** First placement a player could justify, or null when only eliminations remain. */
export function findPlacement(grid: Grid): Placement | null {
  const analysis = analyse(grid, { maxLevel: 1, maxSteps: 1 });
  const first = analysis.steps[0];
  return first && first.kind === 'place' ? first : null;
}
