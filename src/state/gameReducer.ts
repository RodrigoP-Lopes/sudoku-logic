import { PEERS, isSolved } from '../game/board';
import { emptyGrid, type Puzzle } from '../game/types';

export type GameStatus = 'playing' | 'paused' | 'won';

export interface GameState {
  puzzle: Puzzle;
  cells: number[];
  /** Bitmask of pencil marks: bit (n - 1) set means n is pencilled in. */
  notes: number[];
  selected: number | null;
  notesMode: boolean;
  hintsUsed: number;
  elapsedMs: number;
  status: GameStatus;
  updatedAt: number;
}

export type GameAction =
  | { type: 'newGame'; puzzle: Puzzle }
  | { type: 'restore'; state: GameState }
  | { type: 'select'; index: number | null }
  | { type: 'toggleNotesMode' }
  | { type: 'input'; digit: number }
  | { type: 'erase' }
  | { type: 'applyHint'; index: number; value: number }
  | { type: 'tick'; ms: number }
  | { type: 'pause' }
  | { type: 'resume' };

export function createGame(puzzle: Puzzle, now: number = Date.now()): GameState {
  return {
    puzzle,
    cells: puzzle.givens.slice(),
    notes: emptyGrid(),
    selected: null,
    notesMode: false,
    hintsUsed: 0,
    elapsedMs: 0,
    status: 'playing',
    updatedAt: now,
  };
}

export function isGiven(state: GameState, index: number): boolean {
  return state.puzzle.givens[index] !== 0;
}

export function isWrong(state: GameState, index: number): boolean {
  const value = state.cells[index];
  return value !== 0 && !isGiven(state, index) && value !== state.puzzle.solution[index];
}

export function wrongCells(state: GameState): number[] {
  const wrong: number[] = [];
  for (let index = 0; index < state.cells.length; index++) {
    if (isWrong(state, index)) wrong.push(index);
  }
  return wrong;
}

function withOutcome(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  if (isSolved(state.cells, state.puzzle.solution)) return { ...state, status: 'won', selected: null };
  return state;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'newGame':
      return createGame(action.puzzle);

    case 'restore':
      return action.state;

    case 'select':
      if (state.status !== 'playing') return state;
      return { ...state, selected: action.index };

    case 'toggleNotesMode':
      return { ...state, notesMode: !state.notesMode };

    case 'input': {
      const index = state.selected;
      if (index === null || state.status !== 'playing' || isGiven(state, index)) return state;
      const bit = 1 << (action.digit - 1);

      if (state.notesMode) {
        const notes = state.notes.slice();
        notes[index] ^= bit;
        return { ...state, notes, updatedAt: Date.now() };
      }

      const cells = state.cells.slice();
      const notes = state.notes.slice();
      cells[index] = action.digit;
      notes[index] = 0;
      for (const peer of PEERS[index]) if (cells[peer] === 0) notes[peer] &= ~bit;

      return withOutcome({ ...state, cells, notes, updatedAt: Date.now() });
    }

    case 'erase': {
      const index = state.selected;
      if (index === null || state.status !== 'playing' || isGiven(state, index)) return state;
      if (state.cells[index] === 0 && state.notes[index] === 0) return state;
      const cells = state.cells.slice();
      const notes = state.notes.slice();
      cells[index] = 0;
      notes[index] = 0;
      return { ...state, cells, notes, updatedAt: Date.now() };
    }

    case 'applyHint': {
      if (state.status !== 'playing') return state;
      const cells = state.cells.slice();
      const notes = state.notes.slice();
      cells[action.index] = action.value;
      notes[action.index] = 0;
      return withOutcome({
        ...state,
        cells,
        notes,
        hintsUsed: state.hintsUsed + 1,
        selected: action.index,
        updatedAt: Date.now(),
      });
    }

    case 'tick':
      if (state.status !== 'playing') return state;
      return { ...state, elapsedMs: state.elapsedMs + action.ms };

    case 'pause':
      if (state.status !== 'playing') return state;
      return { ...state, status: 'paused', selected: null };

    case 'resume':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'playing' };

    default:
      return state;
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${`${totalSeconds % 60}`.padStart(2, '0')}`;
}
