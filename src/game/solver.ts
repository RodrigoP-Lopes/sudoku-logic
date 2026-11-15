import { FULL_MASK, digitOfBit, popcount } from './bits';
import { BOX_INDEX, COL_INDEX, ROW_INDEX } from './board';
import { CELL_COUNT, type Grid } from './types';

function sanitize(grid: Grid): Int8Array | null {
  if (grid.length !== CELL_COUNT) return null;
  const cells = new Int8Array(CELL_COUNT);
  for (let index = 0; index < CELL_COUNT; index++) {
    const value = grid[index];
    if (!Number.isInteger(value) || value < 0 || value > 9) return null;
    cells[index] = value;
  }
  return cells;
}

/** MRV backtracking, stopping once `limit` solutions exist (2 is enough for uniqueness). */
function search(grid: Grid, limit: number): { count: number; first: number[] | null } {
  const cells = sanitize(grid);
  const result = { count: 0, first: null as number[] | null };
  if (!cells) return result;

  const rowMask = new Int16Array(9);
  const colMask = new Int16Array(9);
  const boxMask = new Int16Array(9);

  for (let index = 0; index < CELL_COUNT; index++) {
    const value = cells[index];
    if (value === 0) continue;
    const bit = 1 << (value - 1);
    const row = ROW_INDEX[index];
    const col = COL_INDEX[index];
    const box = BOX_INDEX[index];
    if (rowMask[row] & bit || colMask[col] & bit || boxMask[box] & bit) return result;
    rowMask[row] |= bit;
    colMask[col] |= bit;
    boxMask[box] |= bit;
  }

  const step = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;

    for (let index = 0; index < CELL_COUNT; index++) {
      if (cells[index] !== 0) continue;
      const mask =
        ~(rowMask[ROW_INDEX[index]] | colMask[COL_INDEX[index]] | boxMask[BOX_INDEX[index]]) & FULL_MASK;
      const count = popcount(mask);
      if (count === 0) return false;
      if (count < bestCount) {
        best = index;
        bestMask = mask;
        bestCount = count;
        if (count === 1) break;
      }
    }

    if (best === -1) {
      result.count++;
      if (result.first === null) result.first = Array.from(cells);
      return result.count >= limit;
    }

    const row = ROW_INDEX[best];
    const col = COL_INDEX[best];
    const box = BOX_INDEX[best];
    let mask = bestMask;

    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      cells[best] = digitOfBit(bit);
      rowMask[row] |= bit;
      colMask[col] |= bit;
      boxMask[box] |= bit;

      if (step()) {
        cells[best] = 0;
        return true;
      }

      rowMask[row] ^= bit;
      colMask[col] ^= bit;
      boxMask[box] ^= bit;
      cells[best] = 0;
    }

    return false;
  };

  step();
  return result;
}

export function countSolutions(grid: Grid, limit = 2): number {
  return search(grid, limit).count;
}

export function solveGrid(grid: Grid): number[] | null {
  return search(grid, 1).first;
}
