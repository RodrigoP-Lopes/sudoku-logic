export const FULL_MASK = 0x1ff;

const POPCOUNT = new Uint8Array(512);
for (let mask = 1; mask < 512; mask++) POPCOUNT[mask] = POPCOUNT[mask >> 1] + (mask & 1);

export function popcount(mask: number): number {
  return POPCOUNT[mask & FULL_MASK];
}

export function bitOf(digit: number): number {
  return 1 << (digit - 1);
}

export function digitOfBit(bit: number): number {
  return 31 - Math.clz32(bit) + 1;
}

export function digitsOf(mask: number): number[] {
  const digits: number[] = [];
  for (let digit = 1; digit <= 9; digit++) if (mask & bitOf(digit)) digits.push(digit);
  return digits;
}

export function lowestDigit(mask: number): number {
  return digitOfBit(mask & -mask);
}
