import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  StyleSheet,
  Text,
  View
} from "react-native";
import { colors, softShadow } from "../theme";

const logoSource = require("../../assets/logo.png");

export function GlobalLoader({ visible, message }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop} pointerEvents="auto">
        <View style={styles.card}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Image source={logoSource} style={styles.logo} accessibilityLabel="App logo" />
          </Animated.View>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>{message || "Just a moment…"}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(232, 241, 251, 0.92)",
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
    gap: 14,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    ...softShadow
  },
  logo: {
    width: 88,
    height: 76,
    resizeMode: "contain",
    backgroundColor: "#fff"
  },
  message: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  }
});
