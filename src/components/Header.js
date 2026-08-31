import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

const logoSource = require("../../assets/logo.png");

export function Header({ title, subtitle, onLogout }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextBlock}>
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
        <Image
          source={logoSource}
          style={styles.headerLogo}
          accessibilityLabel="Marker logo"
        />
      )}
    </View>
  );
}
