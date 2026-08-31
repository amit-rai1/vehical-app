import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { catalogApi } from "../api/client";
import { Chip } from "../components/Chip";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { styles } from "../styles/appStyles";

const VEHICLE_FILTERS = [
  { key: "TwoWheeler", label: "2 Wheeler" },
  { key: "FourWheeler", label: "4 Wheeler" }
];

export function ServicesScreen({ onOpenPlanDetail }) {
  const { showLoading, hideLoading } = useFeedback();
  const [vehicleType, setVehicleType] = useState("TwoWheeler");
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadCatalog(vehicleType);
  }, [vehicleType]);

  async function loadCatalog(type) {
    setLoading(true);
    setLoadError(null);
    showLoading("Loading services…");
    try {
      const response = await catalogApi.list(type);
      const data = response?.data || response || [];
      setCatalog(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(e.message || "Failed to load services.");
      setCatalog([]);
    } finally {
      hideLoading();
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header
        title="Services"
        subtitle="Pick your ride, pick your plan — doorstep service in a tap."
      />

      <View style={styles.segmentRow}>
        {VEHICLE_FILTERS.map(filter => (
          <Chip
            key={filter.key}
            label={filter.label}
            active={vehicleType === filter.key}
            onPress={() => setVehicleType(filter.key)}
          />
        ))}
      </View>

      {loading ? null : loadError ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptySub}>{loadError}</Text>
        </View>
      ) : catalog.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No services found</Text>
          <Text style={styles.emptySub}>
            No {vehicleType === "TwoWheeler" ? "2-wheeler" : "4-wheeler"} services are available
            right now.
          </Text>
        </View>
      ) : (
        <View style={styles.serviceList}>
          {catalog.map(service => {
            const plans = Array.isArray(service.plans) ? service.plans : [];
            const minPrice =
              plans.length > 0 ? Math.min(...plans.map(p => Number(p.price ?? 0))) : null;
            const card = {
              id: service.id,
              title: service.name,
              icon: vehicleType === "TwoWheeler" ? "🛵" : "🚗",
              time: "Flexible",
              price: minPrice != null ? `From INR ${minPrice}` : "See plans",
              raw: service
            };

            return (
              <TouchableOpacity
                key={service.id}
                activeOpacity={0.86}
                onPress={() => onOpenPlanDetail?.(card)}
                style={styles.serviceCard}
              >
                <Text style={styles.serviceIcon}>{card.icon}</Text>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{card.title}</Text>
                  <Text style={styles.serviceMeta}>
                    {plans.length} plan{plans.length === 1 ? "" : "s"} · {card.price}
                  </Text>
                  {service.description ? (
                    <Text style={styles.listSub} numberOfLines={2}>
                      {service.description}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
