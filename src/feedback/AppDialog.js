import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, softShadow } from "../theme";

const TYPE_META = {
  success: { icon: "✓", color: colors.success, bg: "#ecfdf5" },
  error: { icon: "!", color: colors.danger, bg: "#fff1f2" },
  info: { icon: "i", color: colors.primary, bg: "#ede9fe" },
  confirm: { icon: "?", color: colors.coral, bg: "#fff7ed" }
};

export function AppDialog({
  visible,
  type = "info",
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  danger = false,
  showCancel = false,
  onConfirm,
  onCancel
}) {
  const meta = TYPE_META[type] || TYPE_META.info;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
            <Text style={[styles.icon, { color: meta.color }]}>{meta.icon}</Text>
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {showCancel ? (
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={onCancel}
                activeOpacity={0.85}
              >
                <Text style={styles.btnGhostText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                danger && styles.btnDanger,
                !showCancel && styles.btnFull
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.paper,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    ...softShadow
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  icon: {
    fontSize: 26,
    fontWeight: "900"
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 18
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    gap: 10
  },
  btn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  btnFull: {
    flex: 1
  },
  btnPrimary: {
    backgroundColor: colors.primary
  },
  btnDanger: {
    backgroundColor: colors.danger
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  },
  btnGhost: {
    backgroundColor: colors.wash,
    borderWidth: 1,
    borderColor: colors.line
  },
  btnGhostText: {
    color: colors.ink,
    fontWeight: "700",
    fontSize: 15
  }
});
