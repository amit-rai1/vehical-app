import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View
} from "react-native";
import { bookingApi } from "../api/client";
import { Header } from "../components/Header";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

const STATUS_STEPS = [
  { key: "Booked", match: [1, "Pending"] },
  { key: "Partner assigned", match: [2, "Confirmed"] },
  { key: "In progress", match: [3, "InProgress"] },
  { key: "Completed", match: [4, "Completed"] }
];

function statusIndex(status, partnerId) {
  const value = status;
  if (value === 4 || value === "Completed") return 3;
  if (value === 3 || value === "InProgress") return 2;
  if (value === 5 || value === "Cancelled") return -1;
  if (value === 2 || value === "Confirmed" || partnerId) return 1;
  return 0;
}

function formatWhen(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return String(value);
  }
}

export function TrackScreen({ refreshKey }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const response = await bookingApi.list({ pageNumber: 1, pageSize: 20 });
      const records =
        response?.data?.records || response?.data?.items || response?.data || [];
      setBookings(Array.isArray(records) ? records : []);
    } catch (error) {
      console.warn("Failed to load bookings:", error.message);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadBookings();
  }, [loadBookings, refreshKey]);

  if (loading) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
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
            loadBookings();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header title="Track Service" subtitle="Live status for your bookings." />

      {bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySub}>
            When you book a service from an active plan, tracking details will show up here.
          </Text>
        </View>
      ) : (
        bookings.map(booking => {
          const activeIndex = statusIndex(booking.status, booking.partnerId);
          const cancelled = booking.status === 5 || booking.status === "Cancelled";
          return (
            <View key={booking.bookingId} style={styles.panel}>
              <Text style={styles.panelTitle}>{booking.planName || "Service booking"}</Text>
              <Text style={styles.listSub}>
                #{booking.bookingId} · {booking.vehicleName || "Vehicle"}
              </Text>
              <Text style={styles.listSub}>
                {formatWhen(booking.scheduledAt)} · {booking.addressSummary || "Address"}
              </Text>
              <Text style={styles.listSub}>
                {booking.partnerName
                  ? `Partner: ${booking.partnerName}`
                  : "Partner: awaiting assignment"}
              </Text>
              {booking.startedAt ? (
                <Text style={styles.listSub}>Started: {formatWhen(booking.startedAt)}</Text>
              ) : null}
              {booking.completedAt ? (
                <Text style={styles.listSub}>Completed: {formatWhen(booking.completedAt)}</Text>
              ) : null}
              {cancelled ? (
                <Text style={[styles.listTitle, { color: colors.danger, marginTop: 12 }]}>
                  Cancelled
                </Text>
              ) : (
                <View style={styles.timeline}>
                  {STATUS_STEPS.map((step, index) => (
                    <View key={step.key} style={styles.timelineRow}>
                      <View
                        style={[
                          styles.timelineDot,
                          index <= activeIndex && styles.timelineActiveDot
                        ]}
                      />
                      <View style={styles.timelineTextWrap}>
                        <Text style={styles.timelineTitle}>{step.key}</Text>
                        <Text style={styles.timelineSub}>
                          {index < activeIndex
                            ? "Done"
                            : index === activeIndex
                              ? "Current"
                              : "Pending"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
