const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const bottomTabs = `import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

const tabs = [
  ["home", "\\u{1F3E0}", "Home"],
  ["vehicles", "\\u{1F697}", "Vehicles"],
  ["booking", "\\u{1F4C5}", "Book"],
  ["track", "\\u{1F4CD}", "Track"]
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
`;

fs.writeFileSync(path.join(root, "src/components/BottomTabs.js"), bottomTabs);
console.log("BottomTabs.js updated");

const catalogPath = path.join(root, "src/constants/catalog.js");
let catalog = fs.readFileSync(catalogPath, "utf8");
catalog = catalog.replace('icon: "GS"', 'icon: "\\u{1F527}"');
catalog = catalog.replace('icon: "AC"', 'icon: "\\u{2744}\\u{FE0F}"');
catalog = catalog.replace('icon: "BT"', 'icon: "\\u{1F50B}"');
catalog = catalog.replace('icon: "WD"', 'icon: "\\u{1F6BF}"');
fs.writeFileSync(catalogPath, catalog);
console.log("catalog.js updated");