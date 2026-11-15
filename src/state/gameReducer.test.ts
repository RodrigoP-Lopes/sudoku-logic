import type { Puzzle } from '../game/types';
import { applyDailyGrant, createEconomy, dateKey, grant, spend } from './economy';
import { createGame, gameReducer, isGiven, isWrong, wrongCells, type GameAction, type GameState } from './gameReducer';

const GIVENS = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'
  .split('')
  .map(Number);
const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  .split('')
  .map(Number);

const puzzle: Puzzle = { difficulty: 'easy', givens: GIVENS, solution: SOLUTION };

function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(gameReducer, state);
}

describe('gameReducer', () => {
  it('starts from the givens only', () => {
    const state = createGame(puzzle);
    expect(state.cells).toEqual(GIVENS);
    expect(state.status).toBe('playing');
  });

  it('accepts wrong entries without ending the game', () => {
    const state = run(
      createGame(puzzle),
      { type: 'select', index: 2 },
      { type: 'input', digit: 5 },
      { type: 'input', digit: 6 },
      { type: 'input', digit: 7 },
    );
    expect(state.status).toBe('playing');
    expect(isWrong(state, 2)).toBe(true);
    expect(wrongCells(state)).toEqual([2]);
  });

  it('refuses to edit givens and erases with backspace semantics', () => {
    const given = run(createGame(puzzle), { type: 'select', index: 0 }, { type: 'input', digit: 9 });
    expect(given.cells[0]).toBe(5);
    expect(isGiven(given, 0)).toBe(true);

    const erased = run(
      createGame(puzzle),
      { type: 'select', index: 2 },
      { type: 'input', digit: 5 },
      { type: 'erase' },
    );
    expect(erased.cells[2]).toBe(0);
  });

  it('pencils marks in notes mode and clears peers on placement', () => {
    const notes = run(
      createGame(puzzle),
      { type: 'toggleNotesMode' },
      { type: 'select', index: 3 },
      { type: 'input', digit: 4 },
      { type: 'toggleNotesMode' },
    );
    expect(notes.notes[3]).toBe(0b1000);
    expect(run(notes, { type: 'select', index: 2 }, { type: 'input', digit: 4 }).notes[3]).toBe(0);
  });

  it('wins when the grid matches the solution and accumulates time while playing', () => {
    let state = createGame(puzzle);
    for (let index = 0; index < 81; index++) {
      if (state.cells[index] === 0) {
        state = run(state, { type: 'applyHint', index, value: SOLUTION[index] });
      }
    }
    expect(state.status).toBe('won');

    const timed = run(
      createGame(puzzle),
      { type: 'tick', ms: 1000 },
      { type: 'pause' },
      { type: 'tick', ms: 1000 },
    );
    expect(timed.elapsedMs).toBe(1000);
    expect(timed.status).toBe('paused');
  });
});

describe('economy', () => {
  const day = new Date(2026, 4, 12, 9);

  it('grants both currencies once per calendar day', () => {
    const start = createEconomy(day);
    expect(start.hints).toBe(3);
    expect(start.checks).toBe(2);

    const spent = spend(start, 'checks')!;
    expect(spent.checks).toBe(1);
    expect(applyDailyGrant(spent, new Date(2026, 4, 12, 23)).checks).toBe(1);
    expect(applyDailyGrant(spent, new Date(2026, 4, 13)).checks).toBe(3);
  });

  it('spends, grants and floors at zero', () => {
    expect(spend({ hints: 0, checks: 0, lastDailyDate: '2026-05-12' }, 'hints')).toBeNull();
    expect(grant({ hints: 1, checks: 0, lastDailyDate: '2026-05-12' }, 'hints').hints).toBe(2);
    expect(dateKey(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});
