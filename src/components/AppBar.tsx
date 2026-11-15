import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';

interface AppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function AppBar({ title, subtitle, onBack }: AppBarProps) {
  const { palette } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: palette.appBar, borderBottomColor: palette.border }]}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <Text style={[styles.backGlyph, { color: palette.onAppBar }]}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}

      <View style={styles.titles}>
        <Text style={[styles.title, { color: palette.onAppBar }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: palette.onAppBar }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 22,
  },
  titles: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.75,
    marginTop: 1,
  },
});
