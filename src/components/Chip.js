import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/appStyles";

export function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[styles.chip, active && styles.activeChip]}>
      <Text style={[styles.chipText, active && styles.activeChipText]}>{label}</Text>
    </TouchableOpacity>
  );
}
