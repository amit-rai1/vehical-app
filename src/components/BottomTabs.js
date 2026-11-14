import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

const logoSource = require("../../assets/logo.png");

const CUSTOMER_TABS = [
  ["home", "⌂", "Home"],
  ["services", "☰", "Services"],
  ["booking", "▦", "Book"],
  ["vehicles", "🚗", "Vehicles"],
  ["addresses", "📍", "Address"],
  ["track", "◎", "Track"],
  ["account", "logo", "Account"]
];

const PARTNER_TABS = [
  ["jobs", "▦", "Jobs"],
  ["schedule", "📅", "Today"],
  ["account", "logo", "Account"]
];

export function BottomTabs({
  activeTab,
  onChange,
  bottomInset = 16,
  variant = "customer"
}) {
  const tabs = variant === "partner" ? PARTNER_TABS : CUSTOMER_TABS;
  const compact = tabs.length > 5;

  return (
    <View style={[styles.tabBar, { bottom: bottomInset }]}>
      {tabs.map(([key, icon, label]) => {
        const active = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.tabButton,
              compact && styles.tabButtonCompact,
              active && styles.tabButtonActive
            ]}
            activeOpacity={0.7}
          >
            {icon === "logo" ? (
              <Image
                source={logoSource}
                style={[
                  styles.tabLogoIcon,
                  compact && styles.tabLogoIconCompact,
                  active && styles.tabLogoIconActive
                ]}
                resizeMode="contain"
              />
            ) : (
              <Text
                style={[styles.tabIcon, compact && styles.tabIconCompact, active && styles.activeTab]}
              >
                {icon}
              </Text>
            )}
            <Text
              style={[styles.tabLabel, compact && styles.tabLabelCompact, active && styles.activeTab]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
