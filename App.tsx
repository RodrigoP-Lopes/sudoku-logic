import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { LanguageProvider, detectLanguage } from './src/i18n';
import { StatusBar } from 'expo-status-bar';

import { initialiseAds } from './src/ads/ads';
import { generatePuzzle } from './src/game/generator';
import type { Difficulty } from './src/game/types';
import { DifficultyScreen } from './src/screens/DifficultyScreen';
import { GameScreen } from './src/screens/GameScreen';
import { applyDailyGrant, createEconomy, type Economy } from './src/state/economy';
import { createGame, gameReducer, type GameAction, type GameState } from './src/state/gameReducer';
import {
  clearGame,
  loadEconomy,
  loadGame,
  saveEconomy,
  saveGame,
} from './src/state/storage';
import { useTheme } from './src/theme';

type Screen = 'difficulties' | 'game';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider language={detectLanguage()}>
        <GameShell />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function GameShell() {
  const { palette } = useTheme();

  const [screen, setScreen] = useState<Screen>('difficulties');
  const [game, setGame] = useState<GameState | null>(null);
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [economy, setEconomy] = useState<Economy>(() => createEconomy());
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const send = useCallback((action: GameAction) => {
    setGame((current) => (current ? gameReducer(current, action) : current));
  }, []);

  useEffect(() => {
    void initialiseAds();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [storedEconomy, storedGame] = await Promise.all([loadEconomy(), loadGame()]);
      if (cancelled) return;

      // Older saves predate the checks currency (and can hold nulls), so rebuild the fields.
      const fresh = createEconomy();
      const baseEconomy = {
        hints: Number.isFinite(storedEconomy?.hints) ? (storedEconomy as { hints: number }).hints : fresh.hints,
        checks: Number.isFinite(storedEconomy?.checks) ? (storedEconomy as { checks: number }).checks : fresh.checks,
        lastDailyDate: storedEconomy?.lastDailyDate ?? fresh.lastDailyDate,
      };
      setEconomy(applyDailyGrant(baseEconomy));
      if (storedGame && (storedGame.status === 'playing' || storedGame.status === 'paused')) {
        setSavedGame(storedGame.status === 'paused' ? { ...storedGame, status: 'playing' } : storedGame);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Autosave. Finished games are dropped rather than resumed.
  useEffect(() => {
    if (!game || game.status === 'won') return;
    const timer = setTimeout(() => void saveGame(game), 400);
    return () => clearTimeout(timer);
  }, [game]);

  useEffect(() => {
    void saveEconomy(economy);
  }, [economy]);

  useEffect(() => {
    if (game?.status !== 'playing' || screen !== 'game') return;
    const timer = setInterval(() => send({ type: 'tick', ms: 1000 }), 1000);
    return () => clearInterval(timer);
  }, [game?.status, screen, send]);

  const leaveGame = useCallback(() => {
    if (game && game.status !== 'won') setSavedGame(game);
    setGame(null);
    setScreen('difficulties');
  }, [game]);

  const startGame = useCallback((difficulty: Difficulty) => {
    setBusy(true);
    // Yield a frame so the press paints before generation blocks the JS thread.
    setTimeout(() => {
      const puzzle = generatePuzzle(difficulty);
      setGame(createGame(puzzle));
      setSavedGame(null);
      void clearGame();
      setScreen('game');
      setBusy(false);
    }, 60);
  }, []);

  const resumeGame = useCallback(() => {
    const target = game ?? savedGame;
    if (!target) return;
    setGame(target);
    setScreen('game');
  }, [game, savedGame]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'game') return false;
      leaveGame();
      return true;
    });
    return () => subscription.remove();
  }, [screen, leaveGame]);

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: palette.background }]}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'bottom']}
    >
      <StatusBar style="dark" />

      {screen === 'game' && game ? (
        <GameScreen
          state={game}
          dispatch={send}
          economy={economy}
          onEconomyChange={setEconomy}
          onExit={leaveGame}
          onStartNewGame={startGame}
        />
      ) : (
        <DifficultyScreen
          busy={busy}
          canResume={Boolean(savedGame ?? game)}
          onPick={startGame}
          onResume={resumeGame}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
