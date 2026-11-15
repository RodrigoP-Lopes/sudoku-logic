import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BOXES, BOX_INDEX, COL_INDEX, COLS, ROW_INDEX, ROWS } from '../game/board';
import { isGiven, isWrong, type GameState } from '../state/gameReducer';
import { useTheme, type Palette } from '../theme';

const THIN = StyleSheet.hairlineWidth * 2;
const THICK = 2;

interface BoardProps {
  state: GameState;
  size: number;
  onSelect: (index: number) => void;
  locked?: boolean;
  reveal?: boolean;
}

export function Board({ state, size, onSelect, locked, reveal }: BoardProps) {
  const { palette } = useTheme();
  const cellSize = Math.floor(size / 9);
  const boardSize = cellSize * 9;
  const selected = state.selected;

  const peers = useMemo(() => {
    if (selected === null) return new Set<number>();
    const set = new Set<number>();
    for (const index of ROWS[ROW_INDEX[selected]]) set.add(index);
    for (const index of COLS[COL_INDEX[selected]]) set.add(index);
    for (const index of BOXES[BOX_INDEX[selected]]) set.add(index);
    set.delete(selected);
    return set;
  }, [selected]);

  const selectedValue = selected === null ? 0 : state.cells[selected];

  return (
    <View
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
          borderColor: palette.gridStrong,
          backgroundColor: palette.background,
        },
      ]}
    >
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((index) => {
            const colIndex = COL_INDEX[index];
            const value = state.cells[index];
            const isSelected = selected === index;
            const isPeer = peers.has(index);
            const sameValue = selectedValue !== 0 && value === selectedValue && !isSelected;

            return (
              <Cell
                key={index}
                size={cellSize}
                value={value}
                notes={state.notes[index]}
                given={isGiven(state, index)}
                wrong={!!reveal && isWrong(state, index)}
                selected={isSelected}
                peer={isPeer && !isSelected}
                sameValue={sameValue && !isPeer}
                palette={palette}
                label={`Row ${rowIndex + 1}, column ${colIndex + 1}, ${
                  value === 0 ? 'empty' : `value ${value}`
                }`}
                borderRight={colIndex === 8 ? 0 : colIndex % 3 === 2 ? THICK : THIN}
                borderRightColor={colIndex % 3 === 2 ? palette.gridStrong : palette.grid}
                borderBottom={rowIndex === 8 ? 0 : rowIndex % 3 === 2 ? THICK : THIN}
                borderBottomColor={rowIndex % 3 === 2 ? palette.gridStrong : palette.grid}
                onPress={() => onSelect(index)}
                disabled={!!locked}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

interface CellProps {
  size: number;
  value: number;
  notes: number;
  given: boolean;
  wrong: boolean;
  selected: boolean;
  peer: boolean;
  sameValue: boolean;
  palette: Palette;
  label: string;
  borderRight: number;
  borderRightColor: string;
  borderBottom: number;
  borderBottomColor: string;
  onPress: () => void;
  disabled: boolean;
}

const Cell = React.memo(function Cell({
  size,
  value,
  notes,
  given,
  wrong,
  selected,
  peer,
  sameValue,
  palette,
  label,
  borderRight,
  borderRightColor,
  borderBottom,
  borderBottomColor,
  onPress,
  disabled,
}: CellProps) {
  const background = selected
    ? palette.selected
    : sameValue
      ? palette.sameValue
      : peer
        ? palette.peer
        : palette.background;
  const color = wrong ? palette.wrong : given ? palette.given : palette.entered;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        borderRightWidth: borderRight,
        borderRightColor,
        borderBottomWidth: borderBottom,
        borderBottomColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {value !== 0 ? (
        <Text style={{ fontSize: Math.round(size * 0.52), fontWeight: given ? '600' : '400', color }}>
          {value}
        </Text>
      ) : notes !== 0 ? (
        <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 9 }, (_, position) => {
            const digit = position + 1;
            const present = (notes & (1 << (digit - 1))) !== 0;
            return (
              <Text
                key={position}
                style={{
                  width: size / 3,
                  height: size / 3,
                  textAlign: 'center',
                  fontSize: Math.max(8, Math.round(size * 0.2)),
                  color: palette.textMuted,
                  lineHeight: size / 3,
                }}
              >
                {present ? digit : ''}
              </Text>
            );
          })}
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  board: {
    borderWidth: THICK,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
