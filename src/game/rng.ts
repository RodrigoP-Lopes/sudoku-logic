export type Rng = () => number;

/** Small seedable PRNG so puzzles can be reproduced in tests. */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) ^ Date.now()) >>> 0;
}

export function shuffled<T>(items: readonly T[], rand: Rng): T[] {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(rand() * (index + 1));
    const tmp = copy[index];
    copy[index] = copy[swap];
    copy[swap] = tmp;
  }
  return copy;
}
