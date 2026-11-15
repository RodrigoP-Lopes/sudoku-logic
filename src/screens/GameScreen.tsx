import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { showRewardedAd } from '../ads/ads';
import { ActionBar } from '../components/ActionBar';
import { AppBar } from '../components/AppBar';
import { Board } from '../components/Board';
import { Dialog } from '../components/Dialog';
import { nextHint } from '../game/hints';
import { useTranslate, type Key } from '../i18n';
import type { Difficulty } from '../game/types';
import { grant, spend, type Currency, type Economy } from '../state/economy';
import { formatDuration, isGiven, type GameAction, type GameState } from '../state/gameReducer';
import { useTheme } from '../theme';

const PROMPT_TITLE: Record<Currency, Key> = { hints: 'outOfHints', checks: 'outOfChecks' };
const PROMPT_BODY: Record<Currency, Key> = { hints: 'hintsBody', checks: 'checksBody' };
const HINT_MESSAGE: Record<string, Key> = {
  'naked-single': 'hintNaked',
  'hidden-single': 'hintHidden',
  reveal: 'hintReveal',
  fix: 'hintFix',
};

interface GameScreenProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  economy: Economy;
  onEconomyChange: (economy: Economy) => void;
  onExit: () => void;
  onStartNewGame: (difficulty: Difficulty) => void;
}

export function GameScreen({
  state,
  dispatch,
  economy,
  onEconomyChange,
  onExit,
  onStartNewGame,
}: GameScreenProps) {
  const { palette } = useTheme();
  const t = useTranslate();
  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(width - 32, Math.max(240, Math.round(height * 0.62)));

  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [entry, setEntry] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [prompt, setPrompt] = useState<Currency | null>(null);
  const [adMessage, setAdMessage] = useState<string | null>(null);
  const [adBusy, setAdBusy] = useState(false);

  const playing = state.status === 'playing';

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!playing) {
      inputRef.current?.blur();
      setEntry('');
    }
  }, [playing]);

  useEffect(() => {
  }, [state.status]);

  const handleSelect = (index: number) => {
    if (!playing) return;
    dispatch({ type: 'select', index });
    inputRef.current?.focus();
  };

  /** The phone's own keyboard is the input: every keystroke lands here. */
  const handleEntry = (text: string) => {
    const digits = text.replace(/[^1-9]/g, '');
    setEntry('');
    setRevealed(false);

    if (digits.length === 0) {
      dispatch({ type: 'erase' });
      return;
    }

    const index = state.selected;
    if (index === null) {
      setNotice(t('tapFirst'));
      return;
    }
    if (isGiven(state, index)) {
      setNotice(t('givenCell'));
      return;
    }

    for (const character of digits) {
      dispatch({ type: 'input', digit: Number(character) });
    }
  };

  const requestHint = () => {
    const hint = nextHint(state.cells, state.puzzle.solution);
    if (!hint) return;

    if (hint.kind === 'fix') {
      setNotice(t(HINT_MESSAGE.fix));
      return;
    }

    const spent = spend(economy, 'hints');
    if (!spent) {
      setAdMessage(null);
      setPrompt('hints');
      return;
    }

    onEconomyChange(spent);
    dispatch({ type: 'applyHint', index: hint.index, value: hint.value });
    setNotice(t(HINT_MESSAGE[hint.kind === 'place' ? hint.technique : hint.kind]));
  };

  const requestCheck = () => {
    if (revealed) {
      setRevealed(false);
      return;
    }

    const spent = spend(economy, 'checks');
    if (!spent) {
      setAdMessage(null);
      setPrompt('checks');
      return;
    }

    onEconomyChange(spent);
    setRevealed(true);

    let wrong = 0;
    for (let index = 0; index < state.cells.length; index++) {
      if (state.cells[index] !== 0 && state.cells[index] !== state.puzzle.solution[index]) wrong++;
    }
    setNotice(wrong === 0 ? t('nothingWrong') : t('cellsWrong', { n: wrong }));
  };

  const runRewarded = async (currency: Currency) => {
    setAdBusy(true);
    setAdMessage(null);
    const outcome = await showRewardedAd();
    setAdBusy(false);

    if (outcome === 'earned') {
      setPrompt(null);
      onEconomyChange(grant(economy, currency));
      setNotice(t(currency === 'hints' ? 'hintAdded' : 'checkAdded'));
      return;
    }

    setAdMessage(
      outcome === 'unavailable'
        ? t('adUnavailable')
        : t('adClosed'),
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <AppBar
        title={t(state.puzzle.difficulty)}
        subtitle={formatDuration(state.elapsedMs)}
        onBack={onExit}
      />

      <ActionBar
        notesMode={state.notesMode}
        hintsLeft={economy.hints}
        checksLeft={economy.checks}
        checking={revealed}
        paused={state.status === 'paused'}
        disabled={!playing}
        onToggleNotes={() => dispatch({ type: 'toggleNotesMode' })}
        onHint={requestHint}
        onCheck={requestCheck}
        onTogglePause={() => dispatch({ type: state.status === 'paused' ? 'resume' : 'pause' })}
      />

      <View style={styles.boardArea}>
        <Board state={state} size={boardSize} onSelect={handleSelect} locked={!playing} reveal={revealed} />

        {state.status === 'paused' ? (
          <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
            <Text style={[styles.overlayTitle, { color: palette.surface }]}>PAUSED</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Resume game"
              onPress={() => dispatch({ type: 'resume' })}
              style={[styles.overlayAction, { borderColor: palette.surface }]}
            >
              <Text style={[styles.overlayActionText, { color: palette.surface }]}>{t('resumeAction')}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Text
        style={[styles.notice, { color: notice ? palette.textMuted : 'transparent' }]}
        numberOfLines={2}
      >
        {notice ?? ' '}
      </Text>

      <TextInput
        ref={inputRef}
        value={entry}
        onChangeText={handleEntry}
        onKeyPress={(event) => {
          if (event.nativeEvent.key === 'Backspace') {
            setRevealed(false);
            dispatch({ type: 'erase' });
          }
        }}
        keyboardType="number-pad"
        autoCorrect={false}
        caretHidden
        contextMenuHidden
        accessibilityLabel="Number entry"
        style={styles.keyboardInput}
      />

      <Dialog
        visible={state.status === 'won'}
        title={t('solved')}
        message={`${formatDuration(state.elapsedMs)} · ${t('hintsUsed', { n: state.hintsUsed })}`}
        confirmLabel={t('newPuzzle')}
        onConfirm={() => onStartNewGame(state.puzzle.difficulty)}
        cancelLabel={t('menu')}
        onCancel={onExit}
      />

      <Dialog
        visible={prompt !== null}
        title={prompt ? t(PROMPT_TITLE[prompt]) : ''}
        message={prompt ? adMessage ?? t(PROMPT_BODY[prompt]) : undefined}
        confirmLabel={adBusy ? t('loadingAd') : t('watchAd')}
        busy={adBusy}
        onConfirm={() => prompt && void runRewarded(prompt)}
        cancelLabel={t('cancel')}
        onCancel={() => {
          setPrompt(null);
          setAdMessage(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  overlayTitle: {
    fontSize: 20,
    letterSpacing: 3,
    fontWeight: '700',
  },
  overlayAction: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  overlayActionText: {
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '700',
  },
  notice: {
    fontSize: 12,
    minHeight: 32,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  keyboardInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2,
    height: 2,
    opacity: 0,
  },
});
