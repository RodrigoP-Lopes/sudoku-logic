import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Economy } from './economy';
import type { GameState } from './gameReducer';

const PREFIX = 'sudoku-logic:v1:';
const KEY_GAME = `${PREFIX}game`;
const KEY_ECONOMY = `${PREFIX}economy`;
const KEY_SETTINGS = `${PREFIX}settings`;



async function read<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

async function write(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failures must never interrupt play.
  }
}

export function loadGame(): Promise<GameState | null> {
  return read<GameState>(KEY_GAME);
}

export function saveGame(state: GameState): Promise<void> {
  return write(KEY_GAME, state);
}

export async function clearGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_GAME);
  } catch {
    // ignore
  }
}

export function loadEconomy(): Promise<Economy | null> {
  return read<Economy>(KEY_ECONOMY);
}

export function saveEconomy(economy: Economy): Promise<void> {
  return write(KEY_ECONOMY, economy);
}


