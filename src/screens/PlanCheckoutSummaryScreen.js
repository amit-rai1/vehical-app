import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { planApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { styles } from "../styles/appStyles";

export function PlanCheckoutSummaryScreen({ summary, onBack, onOrderCreated }) {
  const { showLoading, hideLoading, error } = useFeedback();
  const [creatingOrder, setCreatingOrder] = useState(false);

  const plan = summary?.plan;
  const serviceName = summary?.service?.name || summary?.service?.title || "Service";

  async function confirmAndPay() {
    if (!plan || !summary?.vehicleId || !summary?.addressId) {
      await error("Incomplete", "Missing plan details. Go back and try again.");
      return;
    }

    setCreatingOrder(true);
    showLoading("Starting payment…");
    try {
      const response = await planApi.purchase({
        servicePlanId: plan.id || plan.servicePlanId,
        vehicleId: summary.vehicleId,
        addressId: summary.addressId,
        preferredServiceTime: summary.preferredServiceTime
      });
      const payment = response?.data || response;
      if (!payment || !payment.razorpayOrderId) {
        throw new Error("Failed to create payment order.");
      }
      onOrderCreated?.({
        payment,
        service: summary.service,
        plan,
        vehicleId: summary.vehicleId,
        addressId: summary.addressId,
        preferredServiceTime: summary.preferredServiceTime,
        preferredTimeLabel: summary.preferredTimeLabel,
        vehicleLabel: summary.vehicleLabel,
        addressLabel: summary.addressLabel
      });
    } catch (err) {
      await error("Unable to start payment", err.message || "Please try again.");
    } finally {
      hideLoading();
      setCreatingOrder(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="Plan Details" subtitle="Confirm before payment" />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{plan?.name || "Selected Plan"}</Text>
        <Text style={styles.listSub}>{serviceName}</Text>
        <Text style={[styles.listTitle, { marginTop: 10 }]}>INR {plan?.price ?? "—"}</Text>
        <Text style={styles.listSub}>
          {plan?.validityInDays ?? "—"} days · {plan?.numberOfServices ?? "—"} services
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Your Selections</Text>
        <Text style={styles.listTitle}>Vehicle</Text>
        <Text style={styles.listSub}>{summary?.vehicleLabel || "—"}</Text>
        <Text style={[styles.listTitle, { marginTop: 10 }]}>Address</Text>
        <Text style={styles.listSub}>{summary?.addressLabel || "—"}</Text>
        <Text style={[styles.listTitle, { marginTop: 10 }]}>Preferred Time</Text>
        <Text style={styles.listSub}>
          {summary?.preferredTimeLabel || summary?.preferredServiceTime || "—"}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.listSub}>
          By continuing you agree to pay for this plan. Preferred time applies to every booking
          on this plan.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Back" variant="ghost" onPress={onBack} disabled={creatingOrder} />
        </View>
        <View style={styles.flex}>
          <Button
            title={creatingOrder ? "Starting..." : "Confirm & Pay"}
            onPress={confirmAndPay}
            disabled={creatingOrder}
            loading={creatingOrder}
          />
        </View>
      </View>
    </ScrollView>
  );
}
