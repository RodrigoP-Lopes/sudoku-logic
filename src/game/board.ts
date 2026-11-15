import { CELL_COUNT, SIZE } from './types';

export const BOX = 3;

export const ROW_INDEX = new Int8Array(CELL_COUNT);
export const COL_INDEX = new Int8Array(CELL_COUNT);
export const BOX_INDEX = new Int8Array(CELL_COUNT);

for (let index = 0; index < CELL_COUNT; index++) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  ROW_INDEX[index] = row;
  COL_INDEX[index] = col;
  BOX_INDEX[index] = Math.floor(row / BOX) * BOX + Math.floor(col / BOX);
}

export const ROWS: readonly (readonly number[])[] = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => row * SIZE + col),
);

export const COLS: readonly (readonly number[])[] = Array.from({ length: SIZE }, (_, col) =>
  Array.from({ length: SIZE }, (_, row) => row * SIZE + col),
);

export const BOXES: readonly (readonly number[])[] = Array.from({ length: SIZE }, (_, box) => {
  const cells: number[] = [];
  const startRow = Math.floor(box / BOX) * BOX;
  const startCol = (box % BOX) * BOX;
  for (let row = 0; row < BOX; row++) {
    for (let col = 0; col < BOX; col++) {
      cells.push((startRow + row) * SIZE + startCol + col);
    }
  }
  return cells;
});

/** 9 rows, 9 columns, 9 boxes. */
export const UNITS: readonly (readonly number[])[] = [...ROWS, ...COLS, ...BOXES];

export const PEERS: readonly (readonly number[])[] = Array.from({ length: CELL_COUNT }, (_, index) => {
  const peers = new Set<number>();
  for (const cell of ROWS[ROW_INDEX[index]]) peers.add(cell);
  for (const cell of COLS[COL_INDEX[index]]) peers.add(cell);
  for (const cell of BOXES[BOX_INDEX[index]]) peers.add(cell);
  peers.delete(index);
  return [...peers];
});

export function isSolved(grid: readonly number[], solution: readonly number[]): boolean {
  for (let index = 0; index < CELL_COUNT; index++) {
    if (grid[index] !== solution[index]) return false;
  }
  return true;
}
