import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

export function Header({ title, subtitle, onLogout }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextBlock}>
        <Text style={styles.greeting}>Vehicle Service Management</Text>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onLogout ? (
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>VS</Text>
        </View>
      )}
    </View>
  );
}
