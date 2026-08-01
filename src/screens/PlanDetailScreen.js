import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { planApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { styles } from "../styles/appStyles";

function vehicleTypeLabel(type) {
  const value = String(type ?? "");
  if (value === "1" || value === "TwoWheeler" || Number(type) === 1) return "2 Wheeler";
  if (value === "2" || value === "FourWheeler" || Number(type) === 2) return "4 Wheeler";
  return "Vehicle";
}

function coversCopy(type) {
  const label = vehicleTypeLabel(type);
  if (label === "2 Wheeler") return "Covers all your 2 Wheeler vehicles";
  if (label === "4 Wheeler") return "Covers all your 4 Wheeler vehicles";
  return "Covers all matching vehicles of this type";
}

export function PlanDetailScreen({ service, onBack, onOrderCreated }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
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

  const selectedPlan = useMemo(
    () =>
      plans.find(p => (p.id || p.servicePlanId) === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  async function handleBuyPlan() {
    if (!selectedPlan) {
      Alert.alert("Select a plan", "Please select a plan to continue.");
      return;
    }

    setCreatingOrder(true);
    try {
      const body = {
        servicePlanId: selectedPlan.id || selectedPlan.servicePlanId
      };

      const response = await planApi.purchase(body);
      const payment = response?.data || response;

      if (!payment || !payment.razorpayOrderId) {
        throw new Error("Failed to create payment order.");
      }

      onOrderCreated?.({
        payment,
        service: service?.raw || service,
        plan: selectedPlan
      });
    } catch (error) {
      Alert.alert("Unable to start payment", error.message || "Please try again.");
    } finally {
      setCreatingOrder(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="Plan details" subtitle={serviceName} />

      <View style={styles.panel}>
        <View style={styles.planCardHeader}>
          <Text style={styles.panelTitle}>Vehicle coverage</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel === "2 Wheeler" ? "2W" : typeLabel === "4 Wheeler" ? "4W" : typeLabel}</Text>
          </View>
        </View>
        <Text style={styles.emptySub}>{coversCopy(serviceVehicleType)}</Text>
        <Text style={styles.listSub}>
          Buy once, then book any of your {typeLabel.toLowerCase()} vehicles at checkout.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>1. Choose a plan</Text>
        {plans.length === 0 ? (
          <Text style={styles.emptySub}>No plans available for this service right now.</Text>
        ) : (
          <View>
            {plans.map(plan => {
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
            })}
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Back" variant="ghost" onPress={onBack} />
        </View>
        <View style={styles.flex}>
          <Button
            title={creatingOrder ? "Starting payment..." : "Buy plan"}
            onPress={handleBuyPlan}
            disabled={creatingOrder || !selectedPlan}
          />
        </View>
      </View>
    </ScrollView>
  );
}
