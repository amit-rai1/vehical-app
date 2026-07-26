import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Header } from "../components/Header";
import { styles } from "../styles/appStyles";

const trackingSteps = ["Booking confirmed", "Partner assigned", "Pickup started", "In progress", "Completed"];

export function TrackScreen() {
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="Track Service" subtitle="Live service status for your active booking." />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>General Service</Text>
        <Text style={styles.listSub}>Kia Sonet | Home pickup | 09:00 AM</Text>
        <View style={styles.timeline}>
          {trackingSteps.map((step, index) => (
            <View key={step} style={styles.timelineRow}>
              <View style={[styles.timelineDot, index < 3 && styles.timelineActiveDot]} />
              <View style={styles.timelineTextWrap}>
                <Text style={styles.timelineTitle}>{step}</Text>
                <Text style={styles.timelineSub}>{index < 3 ? "Done" : index === 3 ? "Next update shortly" : "Pending"}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
