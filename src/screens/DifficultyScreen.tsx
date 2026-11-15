import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppBar } from '../components/AppBar';
import { DIFFICULTIES, type Difficulty } from '../game/types';
import { useTranslate } from '../i18n';
import { useTheme } from '../theme';

const CLUES: Record<Difficulty, number> = {
  beginner: 50,
  easy: 44,
  medium: 34,
  hard: 27,
  expert: 24,
};

interface DifficultyScreenProps {
  busy: boolean;
  canResume: boolean;
  onPick: (difficulty: Difficulty) => void;
  onResume: () => void;
}

export function DifficultyScreen({
  busy,
  canResume,
  onPick,
  onResume,
}: DifficultyScreenProps) {
  const { palette } = useTheme();
  const t = useTranslate();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <AppBar
        title={t('newGame')}
        subtitle={t('pickDifficulty')}
      />

      <View style={styles.list}>
        {canResume ? (
          <Item label={t('resume')} detail={t('unfinished')} onPress={onResume} disabled={busy} accent />
        ) : null}

        {DIFFICULTIES.map((difficulty) => (
          <Item
            key={difficulty}
            label={t(difficulty)}
            detail={`${CLUES[difficulty]} ${t('clueUnit')}`}
            onPress={() => onPick(difficulty)}
            disabled={busy}
          />
        ))}
      </View>
    </View>
  );
}

function Item({
  label,
  detail,
  onPress,
  disabled,
  accent,
}: {
  label: string;
  detail: string;
  onPress: () => void;
  disabled: boolean;
  accent?: boolean;
}) {
  const { palette } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: pressed ? palette.surfaceAlt : palette.surface,
          borderColor: accent ? palette.accent : palette.border,
        },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={[styles.itemLabel, { color: accent ? palette.accent : palette.text }]}>{label}</Text>
      <Text style={[styles.itemDetail, { color: palette.textMuted }]}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  item: {
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderRadius: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 1,
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
  itemDetail: {
    fontSize: 11,
  },
});
