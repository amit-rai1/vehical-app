import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { bookingApi, planApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { PlanCalendar } from "../components/PlanCalendar";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function vehicleTypeLabel(type) {
  const value = String(type ?? "");
  if (value === "1" || value === "TwoWheeler" || Number(type) === 1) return "2W";
  if (value === "2" || value === "FourWheeler" || Number(type) === 2) return "4W";
  return "Vehicle";
}

export function BookingScreen({
  onNavigate,
  refreshKey,
  pendingPlanId,
  onPendingPlanConsumed
}) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planDetail, setPlanDetail] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [refreshKey]);

  async function loadPlans() {
    setLoading(true);
    try {
      const plansRes = await planApi.list({
        pageNumber: 1,
        pageSize: 50,
        isActiveOnly: true
      });
      const planList = plansRes?.data?.records || plansRes?.data?.items || plansRes?.data || [];
      const plansSafe = Array.isArray(planList) ? planList : [];
      setPlans(plansSafe);

      if (pendingPlanId && plansSafe.some(p => p.planId === pendingPlanId)) {
        setSelectedPlanId(pendingPlanId);
        onPendingPlanConsumed?.();
      } else if (!selectedPlanId && plansSafe.length) {
        setSelectedPlanId(plansSafe[0].planId);
      }
    } catch (error) {
      Alert.alert("Unable to load booking", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedPlanId) {
      setPlanDetail(null);
      return;
    }
    (async () => {
      setDetailLoading(true);
      setBookingDate(null);
      try {
        const res = await planApi.get(selectedPlanId);
        setPlanDetail(res?.data || null);
      } catch (error) {
        setPlanDetail(null);
        Alert.alert("Plan details", error.message || "Unable to load plan.");
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [selectedPlanId]);

  useEffect(() => {
    if (pendingPlanId && plans.some(p => p.planId === pendingPlanId)) {
      setSelectedPlanId(pendingPlanId);
      onPendingPlanConsumed?.();
    }
  }, [pendingPlanId, plans, onPendingPlanConsumed]);

  const selectedPlan = useMemo(
    () => plans.find(p => p.planId === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  async function handleConfirm() {
    if (!selectedPlanId) {
      Alert.alert("Select plan", "Please select an active plan first.", [
        { text: "Cancel", style: "cancel" },
        { text: "Browse services", onPress: () => onNavigate("services") }
      ]);
      return;
    }
    if (!bookingDate) {
      Alert.alert("Select date", "Please choose a service date from the calendar.");
      return;
    }

    setSubmitting(true);
    try {
      await bookingApi.create({
        customerPlanId: selectedPlanId,
        bookingDate,
        notes: null
      });
      Alert.alert(
        "Booking placed",
        "Your service is booked. A partner will be assigned shortly.",
        [{ text: "Track", onPress: () => onNavigate("track") }]
      );
    } catch (error) {
      Alert.alert("Booking failed", error.message || "Unable to create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header
        title="Book Service"
        subtitle="Select plan → pick a date in your plan window"
      />

      <View style={styles.panel}>
        <Text style={styles.stepLabel}>Step 1 · Active plan</Text>
        {plans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No active plan yet</Text>
            <Text style={styles.emptySub}>
              Buy a plan first. After it activates, you can book service dates here.
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => onNavigate("services")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>Buy a plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plans.map(plan => {
            const remaining = Math.max(0, (plan.totalServices || 0) - (plan.servicesUsed || 0));
            return (
              <TouchableOpacity
                key={plan.planId}
                onPress={() => setSelectedPlanId(plan.planId)}
                style={[
                  styles.addressPreview,
                  selectedPlanId === plan.planId && styles.selectedAddress
                ]}
              >
                <View style={styles.addressChipRow}>
                  <Text style={styles.listTitle}>{plan.planName}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {vehicleTypeLabel(plan.vehicleType)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.listSub}>
                  {remaining} services left · valid till{" "}
                  {plan.endDate ? new Date(plan.endDate).toLocaleDateString("en-IN") : "—"}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {selectedPlan ? (
        <View style={styles.panel}>
          <Text style={styles.stepLabel}>Locked for this plan</Text>
          {detailLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Text style={styles.listSub}>
                Vehicle: {planDetail?.vehicleName || selectedPlan.vehicleName || "—"}
              </Text>
              <Text style={styles.listSub}>
                Address: {planDetail?.addressSummary || "—"}
              </Text>
              <Text style={styles.listSub}>
                Time: {planDetail?.preferredServiceTime || selectedPlan.preferredServiceTime || "—"}
              </Text>
            </>
          )}
        </View>
      ) : null}

      {selectedPlan && planDetail ? (
        <View style={styles.panel}>
          <Text style={styles.stepLabel}>Step 2 · Choose service date</Text>
          <PlanCalendar
            startDate={planDetail.startDate}
            endDate={planDetail.endDate}
            completedDates={planDetail.completedServiceDates}
            scheduledDates={planDetail.scheduledServiceDates}
            selectedDate={bookingDate}
            onSelectDate={setBookingDate}
          />
          {bookingDate ? (
            <Text style={[styles.listTitle, { marginTop: 8 }]}>Selected: {bookingDate}</Text>
          ) : null}
        </View>
      ) : null}

      <Button
        title={submitting ? "Booking..." : "Confirm booking"}
        onPress={handleConfirm}
        disabled={submitting || !selectedPlanId || !bookingDate}
      />
    </ScrollView>
  );
}
