import React from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, Text, View } from "react-native";
import { colors, softShadow } from "../theme";

const logoSource = require("../../assets/logo.png");

export function GlobalLoader({ visible, message }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop} pointerEvents="auto">
        <View style={styles.card}>
          <Image source={logoSource} style={styles.logo} />
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.message}>{message || "Just a moment…"}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: "center",
    gap: 12,
    ...softShadow
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    resizeMode: "contain"
  },
  message: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  }
});
