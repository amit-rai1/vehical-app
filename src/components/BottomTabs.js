import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

const CUSTOMER_TABS = [
  ["home", "⌂", "Home"],
  ["services", "☰", "Services"],
  ["booking", "▦", "Book"],
  ["track", "◎", "Track"],
  ["account", "☺", "Account"]
];

const PARTNER_TABS = [
  ["jobs", "▦", "Jobs"],
  ["schedule", "📅", "Today"],
  ["account", "☺", "Account"]
];

export function BottomTabs({
  activeTab,
  onChange,
  bottomInset = 16,
  variant = "customer"
}) {
  const tabs = variant === "partner" ? PARTNER_TABS : CUSTOMER_TABS;

  return (
    <View style={[styles.tabBar, { bottom: bottomInset }]}>
      {tabs.map(([key, icon, label]) => {
        const active = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            style={[styles.tabButton, active && styles.tabButtonActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, active && styles.activeTab]}>{icon}</Text>
            <Text style={[styles.tabLabel, active && styles.activeTab]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
