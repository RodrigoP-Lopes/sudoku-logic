import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { Button } from './Button';

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  busy?: boolean;
}

export function Dialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  busy,
}: DialogProps) {
  const { palette } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onCancel?.()}>
      <View style={[styles.backdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          {message ? <Text style={[styles.message, { color: palette.textMuted }]}>{message}</Text> : null}
          <View style={styles.actions}>
            {cancelLabel && onCancel ? (
              <Button
                label={cancelLabel}
                variant="flat"
                onPress={onCancel}
                disabled={busy}
                style={styles.action}
              />
            ) : null}
            <Button
              label={confirmLabel}
              variant="flat"
              onPress={onConfirm}
              disabled={busy}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 2,
    borderWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  action: {
    paddingHorizontal: 12,
  },
});
