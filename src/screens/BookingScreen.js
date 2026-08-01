import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { addressApi, bookingApi, planApi, vehicleApi } from "../api/client";
import { Button } from "../components/Button";
import {
  BookingTimePicker,
  getDefaultBookingSchedule,
  isPastScheduled,
  toScheduledDate
} from "../components/BookingTimePicker";
import { Header } from "../components/Header";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function vehicleTypeLabel(type) {
  const value = String(type ?? "");
  if (value === "1" || value === "TwoWheeler" || Number(type) === 1) return "2W";
  if (value === "2" || value === "FourWheeler" || Number(type) === 2) return "4W";
  return "Vehicle";
}

function sameVehicleType(a, b) {
  if (a == null || b == null || a === "" || b === "") return false;
  const left = String(a);
  const right = String(b);
  if (left === right) return true;
  const normalize = value => {
    if (value === "1" || value === "TwoWheeler") return "2W";
    if (value === "2" || value === "FourWheeler") return "4W";
    if (Number(value) === 1) return "2W";
    if (Number(value) === 2) return "4W";
    return value;
  };
  return normalize(left) === normalize(right);
}

export function BookingScreen({
  onNavigate,
  refreshKey,
  pendingPlanId,
  onPendingPlanConsumed
}) {
  const [timeValue, setTimeValue] = useState(() => getDefaultBookingSchedule());
  const [vehicles, setVehicles] = useState([]);
  const [plans, setPlans] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  async function loadData() {
    setLoading(true);
    try {
      const [vehiclesRes, plansRes, addressesRes] = await Promise.all([
        vehicleApi.list({
          pageNumber: 1,
          pageSize: 50,
          search: "",
          isActive: true,
          sortBy: "CreatedOn",
          isAscending: false
        }),
        planApi.list({ pageNumber: 1, pageSize: 50, isActiveOnly: true }),
        addressApi.dropdown()
      ]);

      const vehicleList =
        vehiclesRes?.data?.records || vehiclesRes?.data?.items || vehiclesRes?.data || [];
      const planList = plansRes?.data?.records || plansRes?.data?.items || plansRes?.data || [];
      const addressList = addressesRes?.data || addressesRes || [];

      const vehiclesSafe = Array.isArray(vehicleList) ? vehicleList : [];
      const plansSafe = Array.isArray(planList) ? planList : [];
      const addressesSafe = Array.isArray(addressList) ? addressList : [];

      setVehicles(vehiclesSafe);
      setPlans(plansSafe);
      setAddresses(addressesSafe);

      const defaultAddress = addressesSafe.find(a => a.isDefault) || addressesSafe[0];
      setSelectedAddress(defaultAddress || null);

      if (pendingPlanId && plansSafe.some(p => p.planId === pendingPlanId)) {
        setSelectedPlanId(pendingPlanId);
        onPendingPlanConsumed?.();
      } else if (!selectedPlanId && plansSafe.length) {
        setSelectedPlanId(plansSafe[0].planId);
      }
    } catch (error) {
      console.warn("Failed to load booking data:", error.message);
      Alert.alert("Unable to load booking", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = useMemo(
    () => plans.find(p => p.planId === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const matchingVehicles = useMemo(() => {
    if (!selectedPlan) return [];
    return vehicles.filter(v => sameVehicleType(v.vehicleType, selectedPlan.vehicleType));
  }, [vehicles, selectedPlan]);

  useEffect(() => {
    if (!matchingVehicles.length) {
      setSelectedVehicleId(null);
      return;
    }
    if (!matchingVehicles.some(v => v.vehicleId === selectedVehicleId)) {
      const def = matchingVehicles.find(v => v.isDefault) || matchingVehicles[0];
      setSelectedVehicleId(def.vehicleId);
    }
  }, [matchingVehicles, selectedVehicleId]);

  useEffect(() => {
    if (pendingPlanId && plans.some(p => p.planId === pendingPlanId)) {
      setSelectedPlanId(pendingPlanId);
      onPendingPlanConsumed?.();
    }
  }, [pendingPlanId, plans, onPendingPlanConsumed]);

  async function handleConfirm() {
    if (!selectedPlanId) {
      Alert.alert("Select plan", "Please select an active plan first.", [
        { text: "Cancel", style: "cancel" },
        { text: "Browse services", onPress: () => onNavigate("services") }
      ]);
      return;
    }
    if (!selectedVehicleId) {
      Alert.alert(
        "Add a matching vehicle",
        `Add a ${vehicleTypeLabel(selectedPlan?.vehicleType)} vehicle to book with this plan.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add vehicle", onPress: () => onNavigate("vehicles") }
        ]
      );
      return;
    }
    if (!selectedAddress?.addressId) {
      Alert.alert("Select address", "Please add or select a pickup address.");
      return;
    }

    if (isPastScheduled(timeValue)) {
      Alert.alert(
        "Invalid date & time",
        "Please select a date and time that is not in the past."
      );
      return;
    }

    setSubmitting(true);
    try {
      await bookingApi.create({
        vehicleId: selectedVehicleId,
        addressId: selectedAddress.addressId,
        customerPlanId: selectedPlanId,
        scheduledAt: toScheduledDate(timeValue).toISOString(),
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
        subtitle="1) Active plan → 2) Matching vehicle → 3) Address & time"
      />

      <View style={styles.panel}>
        <Text style={styles.stepLabel}>Step 1 · Active plan</Text>
        {plans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No active plan yet</Text>
            <Text style={styles.emptySub}>
              Browse services and buy a 2W or 4W plan, then book anytime with any matching vehicle.
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
                    <Text style={styles.typeBadgeText}>{vehicleTypeLabel(plan.vehicleType)}</Text>
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

      <View style={styles.panel}>
        <Text style={styles.stepLabel}>Step 2 · Vehicle ({vehicleTypeLabel(selectedPlan?.vehicleType)})</Text>
        {!selectedPlan ? (
          <Text style={styles.emptySub}>Select a plan first to see matching vehicles.</Text>
        ) : matchingVehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No {vehicleTypeLabel(selectedPlan.vehicleType)} vehicles
            </Text>
            <Text style={styles.emptySub}>
              This plan covers all your {vehicleTypeLabel(selectedPlan.vehicleType)} vehicles. Add
              one to continue.
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => onNavigate("vehicles")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>Add vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          matchingVehicles.map(v => (
            <TouchableOpacity
              key={v.vehicleId}
              onPress={() => setSelectedVehicleId(v.vehicleId)}
              style={[
                styles.addressPreview,
                selectedVehicleId === v.vehicleId && styles.selectedAddress
              ]}
            >
              <View style={styles.addressChipRow}>
                <Text style={styles.listTitle}>{v.vehicleNumber || "Vehicle"}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{vehicleTypeLabel(v.vehicleType)}</Text>
                </View>
              </View>
              <Text style={styles.listSub}>
                {v.vehicleMakeName} {v.vehicleModelName}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.stepLabel}>Step 3 · Address & time</Text>
        <Text style={styles.panelTitle}>Select time</Text>
        <BookingTimePicker value={timeValue} onChange={setTimeValue} />

        <Text style={styles.panelTitle}>Pickup Address</Text>
        {addresses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptySub}>No addresses found. Add a pickup address to continue.</Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => onNavigate("addresses")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>Add address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map(address => (
            <TouchableOpacity
              key={address.addressId}
              onPress={() => setSelectedAddress(address)}
              style={[
                styles.addressPreview,
                selectedAddress?.addressId === address.addressId && styles.selectedAddress
              ]}
            >
              <View style={styles.addressChipRow}>
                <Text style={styles.listTitle}>{address.addressType}</Text>
                {address.isDefault ? <Text style={styles.defaultPill}>Default</Text> : null}
              </View>
              <Text style={styles.listSub}>{address.fullAddress}</Text>
            </TouchableOpacity>
          ))
        )}

        <Button
          title={submitting ? "Booking..." : "Confirm Booking"}
          onPress={handleConfirm}
          disabled={submitting || !plans.length || !matchingVehicles.length}
          loading={submitting}
        />
      </View>
    </ScrollView>
  );
}
