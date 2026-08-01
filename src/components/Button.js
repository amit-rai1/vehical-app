import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/appStyles";

export function Button({ title, onPress, loading, variant = "primary", compact, disabled }) {
  const isDisabled = Boolean(loading || disabled);
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        styles[`${variant}Button`],
        compact && styles.compactButton,
        isDisabled && styles.buttonDisabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.buttonText, variant !== "primary" && styles.secondaryButtonText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
