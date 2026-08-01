import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Header } from "../components/Header";
import { styles } from "../styles/appStyles";

/** @deprecated Use PartnerJobsScreen — kept for reference only. */
export function PartnerHomeScreen({ user, onLogout }) {
  const rawStatus = user?.partnerStatus;
  const status =
    rawStatus == null
      ? "Unknown"
      : typeof rawStatus === "number"
        ? ["", "Pending", "Approved", "Rejected", "Suspended", "Inactive"][rawStatus] ||
          String(rawStatus)
        : String(rawStatus);

  function confirmLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => onLogout?.() }
    ]);
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header
        title={`Hello, ${user?.name || "Partner"}`}
        subtitle="Partner workspace"
        onLogout={confirmLogout}
      />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Account status</Text>
        <Text style={styles.listTitle}>{status}</Text>
        <Text style={styles.listSub}>Mobile: +91 {user?.mobileNumber || "—"}</Text>
      </View>
    </ScrollView>
  );
}
