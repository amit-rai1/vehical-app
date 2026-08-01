import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { planApi, vehicleApi } from "../api/client";
import { Header } from "../components/Header";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function vehicleTypeShort(type) {
  const value = String(type ?? "");
  if (value === "1" || value === "TwoWheeler" || Number(type) === 1) return "2W";
  if (value === "2" || value === "FourWheeler" || Number(type) === 2) return "4W";
  return "—";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return String(value);
  }
}

export function HomeScreen({
  user,
  onNavigate,
  onLogout,
  onOpenServices,
  onBookWithPlan,
  refreshKey
}) {
  const [plans, setPlans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [plansResponse, vehiclesResponse] = await Promise.all([
        planApi.list({ pageNumber: 1, pageSize: 50, isActiveOnly: true }),
        vehicleApi.list({
          pageNumber: 1,
          pageSize: 20,
          search: "",
          isActive: true,
          sortBy: "CreatedOn",
          isAscending: false
        })
      ]);

      const planRecords =
        plansResponse?.data?.records ||
        plansResponse?.data?.items ||
        plansResponse?.data ||
        [];
      const vehicleRecords =
        vehiclesResponse?.data?.records ||
        vehiclesResponse?.data?.items ||
        vehiclesResponse?.data ||
        [];

      setPlans(Array.isArray(planRecords) ? planRecords : []);
      setVehicles(Array.isArray(vehicleRecords) ? vehicleRecords : []);
    } catch (error) {
      console.warn("Failed to load dashboard:", error.message);
      setPlans([]);
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDashboard();
  }, [loadDashboard, refreshKey]);

  function confirmLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => onLogout?.() }
    ]);
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDashboard();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header
        title={`Hello, ${user?.name || "Customer"}`}
        subtitle="Browse services → Buy plan → Book anytime"
        onLogout={confirmLogout}
      />

      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("booking")}>
          <Text style={styles.quickIcon}>📅</Text>
          <Text style={styles.quickText}>Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("vehicles")}>
          <Text style={styles.quickIcon}>🚗</Text>
          <Text style={styles.quickText}>Vehicles</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("addresses")}>
          <Text style={styles.quickIcon}>📍</Text>
          <Text style={styles.quickText}>Addresses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("track")}>
          <Text style={styles.quickIcon}>🔎</Text>
          <Text style={styles.quickText}>Track</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Plans</Text>
        <TouchableOpacity onPress={onOpenServices}>
          <Text style={styles.linkText}>Buy plan</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>You don’t have any active plan</Text>
          <Text style={styles.emptySub}>
            Purchase a 2-wheeler or 4-wheeler plan once, then book any matching vehicle without
            paying each time.
          </Text>
          <TouchableOpacity style={styles.emptyCta} onPress={onOpenServices} activeOpacity={0.85}>
            <Text style={styles.emptyCtaText}>Browse services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        plans.map(plan => {
          const remaining = Math.max(0, (plan.totalServices || 0) - (plan.servicesUsed || 0));
          const total = plan.totalServices || 1;
          const usedRatio = Math.min(1, (plan.servicesUsed || 0) / total);
          return (
            <View key={plan.planId} style={styles.planCard}>
              <View style={styles.planCardHeader}>
                <Text style={styles.planCardTitle}>{plan.planName}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{vehicleTypeShort(plan.vehicleType)}</Text>
                </View>
              </View>
              <Text style={styles.listSub}>
                Works with any of your {vehicleTypeShort(plan.vehicleType)} vehicles
              </Text>
              <Text style={styles.listSub}>Valid till: {formatDate(plan.endDate)}</Text>
              <View style={styles.progressMeta}>
                <Text style={styles.listTitle}>
                  {remaining} of {total} services left
                </Text>
                <Text style={styles.listSub}>
                  Used {plan.servicesUsed || 0}/{total}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${usedRatio * 100}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.planBookLink}
                onPress={() => onBookWithPlan?.(plan.planId)}
                activeOpacity={0.85}
              >
                <Text style={styles.linkText}>Book with this plan ›</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Vehicles</Text>
        <TouchableOpacity onPress={() => onNavigate("vehicles")}>
          <Text style={styles.linkText}>Manage</Text>
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptySub}>
            Add vehicles so you can book services with your active plans.
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleStrip}>
          {vehicles.map(v => (
            <View key={v.vehicleId} style={styles.vehicleChipCard}>
              <Text style={styles.listTitle}>{v.vehicleNumber || "Vehicle"}</Text>
              <Text style={styles.listSub}>
                {v.vehicleMakeName} {v.vehicleModelName}
              </Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{vehicleTypeShort(v.vehicleType)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}
