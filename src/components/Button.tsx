import React from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'flat';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'filled', disabled, style }: ButtonProps) {
  const { palette } = useTheme();
  const filled = variant === 'filled';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: filled ? palette.accent : 'transparent',
          borderWidth: filled ? 0 : 1,
          borderColor: palette.border,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: filled ? palette.accentText : palette.accent }]}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
});
