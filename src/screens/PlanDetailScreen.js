import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { addressApi, planApi, vehicleApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { styles } from "../styles/appStyles";

function vehicleTypeLabel(type) {
  const value = String(type ?? "");
  if (value === "1" || value === "TwoWheeler" || Number(type) === 1) return "2 Wheeler";
  if (value === "2" || value === "FourWheeler" || Number(type) === 2) return "4 Wheeler";
  return "Vehicle";
}

function sameVehicleType(a, b) {
  if (a == null || b == null || a === "" || b === "") return false;
  const normalize = value => {
    if (value === "1" || value === "TwoWheeler" || Number(value) === 1) return "2W";
    if (value === "2" || value === "FourWheeler" || Number(value) === 2) return "4W";
    return String(value);
  };
  return normalize(a) === normalize(b);
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8..19

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function PlanDetailScreen({ service, onBack, onOrderCreated }) {
  const { showLoading, hideLoading, error, info } = useFeedback();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const serviceName = service?.raw?.name || service?.title || "Service plan";
  const serviceVehicleType = service?.raw?.vehicleType;
  const typeLabel = vehicleTypeLabel(serviceVehicleType);

  useEffect(() => {
    const rawPlans = Array.isArray(service?.raw?.plans) ? service.raw.plans : [];
    setPlans(rawPlans);
    if (rawPlans.length) {
      setSelectedPlanId(rawPlans[0].id || rawPlans[0].servicePlanId);
    }
  }, [service]);

  useEffect(() => {
    (async () => {
      showLoading("Loading details…");
      try {
        const [vehiclesRes, addressesRes] = await Promise.all([
          vehicleApi.list({
            pageNumber: 1,
            pageSize: 50,
            search: "",
            isActive: true,
            sortBy: "CreatedOn",
            isAscending: false
          }),
          addressApi.dropdown()
        ]);
        const vehicleList =
          vehiclesRes?.data?.records || vehiclesRes?.data?.items || vehiclesRes?.data || [];
        const addressList = addressesRes?.data || addressesRes || [];
        const vehiclesSafe = Array.isArray(vehicleList) ? vehicleList : [];
        const addressesSafe = Array.isArray(addressList) ? addressList : [];
        setVehicles(vehiclesSafe);
        setAddresses(addressesSafe);
        const matching = vehiclesSafe.filter(v =>
          sameVehicleType(v.vehicleType, serviceVehicleType)
        );
        const defV = matching.find(v => v.isDefault) || matching[0];
        if (defV) setVehicleId(defV.vehicleId);
        const defA = addressesSafe.find(a => a.isDefault) || addressesSafe[0];
        if (defA) setAddressId(defA.addressId);
      } catch (err) {
        console.warn(err.message);
      } finally {
        hideLoading();
      }
    })();
  }, [serviceVehicleType, showLoading, hideLoading]);

  const selectedPlan = useMemo(
    () => plans.find(p => (p.id || p.servicePlanId) === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const matchingVehicles = useMemo(
    () => vehicles.filter(v => sameVehicleType(v.vehicleType, serviceVehicleType)),
    [vehicles, serviceVehicleType]
  );

  async function handleBuyPlan() {
    if (!selectedPlan) {
      await info("Select a plan", "Please select a plan to continue.");
      return;
    }
    if (!vehicleId) {
      await info("Select vehicle", `Please select a ${typeLabel} vehicle for this plan.`);
      return;
    }
    if (!addressId) {
      await info("Select address", "Please select a service address.");
      return;
    }

    setCreatingOrder(true);
    showLoading("Starting payment…");
    try {
      const preferredServiceTime = `${pad2(hour)}:${pad2(minute)}`;
      const body = {
        servicePlanId: selectedPlan.id || selectedPlan.servicePlanId,
        vehicleId,
        addressId,
        preferredServiceTime
      };

      const response = await planApi.purchase(body);
      const payment = response?.data || response;

      if (!payment || !payment.razorpayOrderId) {
        throw new Error("Failed to create payment order.");
      }

      onOrderCreated?.({
        payment,
        service: service?.raw || service,
        plan: selectedPlan,
        vehicleId,
        addressId,
        preferredServiceTime
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
      <Header title="Review & buy" subtitle={serviceName} />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>1. Choose a plan</Text>
        {plans.length === 0 ? (
          <Text style={styles.emptySub}>No plans available for this service right now.</Text>
        ) : (
          plans.map(plan => {
            const key = plan.id || plan.servicePlanId;
            const isSelected = key === selectedPlanId;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.86}
                onPress={() => setSelectedPlanId(key)}
                style={[styles.serviceCard, isSelected && styles.selectedCard]}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{plan.name}</Text>
                  <Text style={styles.serviceMeta}>
                    {plan.validityInDays} days • {plan.numberOfServices} services
                  </Text>
                  <Text style={styles.listTitle}>INR {plan.price}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>2. Select vehicle ({typeLabel})</Text>
        {matchingVehicles.length === 0 ? (
          <Text style={styles.emptySub}>Add a matching vehicle before purchasing.</Text>
        ) : (
          matchingVehicles.map(v => (
            <TouchableOpacity
              key={v.vehicleId}
              onPress={() => setVehicleId(v.vehicleId)}
              style={[
                styles.addressPreview,
                vehicleId === v.vehicleId && styles.selectedAddress
              ]}
            >
              <Text style={styles.listTitle}>{v.vehicleNumber || v.vehicleName}</Text>
              <Text style={styles.listSub}>
                {[v.makeName, v.modelName].filter(Boolean).join(" · ")}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>3. Select address</Text>
        {addresses.length === 0 ? (
          <Text style={styles.emptySub}>Add a service address before purchasing.</Text>
        ) : (
          addresses.map(a => (
            <TouchableOpacity
              key={a.addressId}
              onPress={() => setAddressId(a.addressId)}
              style={[
                styles.addressPreview,
                addressId === a.addressId && styles.selectedAddress
              ]}
            >
              <Text style={styles.listTitle}>{a.addressType || "Address"}</Text>
              <Text style={styles.listSub}>
                {a.addressLine1 || a.label || a.fullAddress || ""}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>4. Preferred service time</Text>
        <Text style={styles.listSub}>Used for every booking on this plan.</Text>
        <Text style={[styles.listSub, { marginTop: 8 }]}>Hour</Text>
        <View style={styles.rowWrap}>
          {HOURS.map(h => (
            <TouchableOpacity
              key={h}
              onPress={() => setHour(h)}
              style={[styles.chip, hour === h && styles.activeChip]}
            >
              <Text style={[styles.chipText, hour === h && styles.activeChipText]}>
                {pad2(h)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.listSub, { marginTop: 8 }]}>Minutes</Text>
        <View style={styles.rowWrap}>
          {[0, 15, 30, 45].map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMinute(m)}
              style={[styles.chip, minute === m && styles.activeChip]}
            >
              <Text style={[styles.chipText, minute === m && styles.activeChipText]}>
                {pad2(m)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.listTitle, { marginTop: 8 }]}>
          {pad2(hour)}:{pad2(minute)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Back" variant="ghost" onPress={onBack} />
        </View>
        <View style={styles.flex}>
          <Button
            title={creatingOrder ? "Starting..." : "Continue to pay"}
            onPress={handleBuyPlan}
            disabled={creatingOrder || !selectedPlan}
          />
        </View>
      </View>
    </ScrollView>
  );
}
