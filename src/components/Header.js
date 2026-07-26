import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export function Header({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Vehicle Service Management</Text>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>VS</Text>
      </View>
    </View>
  );
}
