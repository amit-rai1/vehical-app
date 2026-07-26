import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

const tabs = [
  ["home", "\u{1F3E0}", "Home"],
  ["vehicles", "\u{1F697}", "Vehicles"],
  ["booking", "\u{1F4C5}", "Book"],
  ["track", "\u{1F4CD}", "Track"]
];

export function BottomTabs({ activeTab, onChange }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map(([key, icon, label]) => {
        const active = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{icon}</Text>
            <Text style={[styles.tabLabel, active && styles.activeTab]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
