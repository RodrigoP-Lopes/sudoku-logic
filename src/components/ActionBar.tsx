import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslate } from '../i18n';
import { useTheme } from '../theme';

interface ActionBarProps {
  notesMode: boolean;
  hintsLeft: number;
  checksLeft: number;
  checking: boolean;
  paused: boolean;
  disabled: boolean;
  onToggleNotes: () => void;
  onHint: () => void;
  onCheck: () => void;
  onTogglePause: () => void;
}

/** Icon toolbar under the app bar. Backspace erases, so there is no erase or undo button. */
export function ActionBar({
  notesMode,
  hintsLeft,
  checksLeft,
  checking,
  paused,
  disabled,
  onToggleNotes,
  onHint,
  onCheck,
  onTogglePause,
}: ActionBarProps) {
  const { palette } = useTheme();
  const t = useTranslate();

  return (
    <View
      style={[styles.bar, { backgroundColor: palette.surface, borderBottomColor: palette.divider }]}
    >
      <Action label={t('notes')} glyph="✎" onPress={onToggleNotes} disabled={disabled} active={notesMode} />
      <Action label={t('hint')} glyph="?" onPress={onHint} disabled={disabled} badge={hintsLeft} />
      <Action label={t('check')} glyph="!" onPress={onCheck} disabled={disabled} active={checking} badge={checksLeft} />
      <Action
        label={t(paused ? 'resumeGame' : 'pause')}
        glyph={paused ? '▶' : '❚❚'}
        onPress={onTogglePause}
      />
    </View>
  );
}

function Action({
  glyph,
  label,
  onPress,
  disabled,
  active,
  badge,
}: {
  glyph: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: number;
}) {
  const { palette } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: active ? palette.accentSoft : 'transparent',
          opacity: disabled ? 0.35 : pressed ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.glyphRow}>
        <Text style={[styles.glyph, { color: active ? palette.accent : palette.textMuted }]}>
          {glyph}
        </Text>
        {badge !== undefined ? (
          <Text style={[styles.badge, { color: palette.textMuted }]}>{badge}</Text>
        ) : null}
      </View>
      <Text style={[styles.label, { color: active ? palette.accent : palette.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  action: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  glyphRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  glyph: {
    fontSize: 18,
  },
  badge: {
    fontSize: 9,
    marginLeft: 2,
    marginTop: -1,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
