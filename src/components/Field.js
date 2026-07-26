import React from "react";
import { Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";

export function Field({ label, value, onChangeText, keyboardType = "default", placeholder, multiline, autoCapitalize, editable = true }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder || label}
        placeholderTextColor="#9a9dad"
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        editable={editable}
        style={[styles.input, multiline && styles.textArea, !editable && styles.inputDisabled]}
      />
    </View>
  );
}
