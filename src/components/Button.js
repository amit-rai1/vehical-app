import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/appStyles";

export function Button({ title, onPress, loading, variant = "primary", compact }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={loading}
      onPress={onPress}
      style={[styles.button, styles[`${variant}Button`], compact && styles.compactButton]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.buttonText, variant !== "primary" && styles.secondaryButtonText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
