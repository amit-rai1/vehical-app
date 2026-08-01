import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { partnerApi } from "../api/client";
import { Header } from "../components/Header";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function partnerStatusLabel(rawStatus) {
  if (rawStatus == null || rawStatus === "") return "Unknown";
  if (typeof rawStatus === "number") {
    return (
      ["", "Pending", "Approved", "Rejected", "Suspended", "Inactive"][rawStatus] ||
      String(rawStatus)
    );
  }
  return String(rawStatus);
}

function bookingStatusLabel(status) {
  const value = String(status ?? "");
  if (value === "1" || value === "Pending") return "Pending";
  if (value === "2" || value === "Confirmed") return "Assigned";
  if (value === "3" || value === "InProgress") return "In progress";
  if (value === "4" || value === "Completed") return "Completed";
  if (value === "5" || value === "Cancelled") return "Cancelled";
  return value || "—";
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

function isSameLocalDay(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function PartnerJobsScreen({
  user,
  onLogout,
  onOpenJob,
  todayOnly = false,
  refreshKey
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const statusLabel = partnerStatusLabel(user?.partnerStatus);
  const isPending =
    statusLabel === "Pending" ||
    user?.partnerStatus === 1 ||
    String(user?.partnerStatus).toLowerCase() === "pending";
  const isApproved =
    statusLabel === "Approved" ||
    user?.partnerStatus === 2 ||
    String(user?.partnerStatus || "").toLowerCase() === "approved";

  const loadJobs = useCallback(async () => {
    if (!isApproved) {
      setJobs([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const response = await partnerApi.listJobs({
        pageNumber: 1,
        pageSize: 50,
        todayOnly: Boolean(todayOnly)
      });
      const records =
        response?.data?.records || response?.data?.items || response?.data || [];
      setJobs(Array.isArray(records) ? records : []);
    } catch (error) {
      console.warn("Failed to load partner jobs:", error.message);
      setJobs([]);
      Alert.alert("Unable to load jobs", error.message || "Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isApproved, todayOnly]);

  useEffect(() => {
    setLoading(true);
    loadJobs();
  }, [loadJobs, refreshKey]);

  function confirmLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => onLogout?.() }
    ]);
  }

  const todayJobs = useMemo(
    () => (todayOnly ? jobs : jobs.filter(j => isSameLocalDay(j.scheduledAt))),
    [jobs, todayOnly]
  );

  const activeJobs = useMemo(
    () =>
      jobs.filter(j => {
        const s = String(j.status);
        return (
          s === "2" ||
          s === "Confirmed" ||
          s === "3" ||
          s === "InProgress"
        );
      }),
    [jobs]
  );

  const list = todayOnly ? todayJobs : activeJobs.length ? activeJobs : jobs;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadJobs();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header
        title={`Hello, ${user?.name || "Partner"}`}
        subtitle={todayOnly ? "Today’s schedule" : "Assigned jobs dashboard"}
        onLogout={confirmLogout}
      />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Account</Text>
        <Text style={styles.listTitle}>{statusLabel}</Text>
        <Text style={styles.listSub}>Mobile: +91 {user?.mobileNumber || "—"}</Text>
        {isPending ? (
          <Text style={[styles.listSub, { marginTop: 8 }]}>
            Your partner account is waiting for administrator approval. Jobs appear after
            approval.
          </Text>
        ) : null}
      </View>

      {!isApproved ? null : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          {!todayOnly ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today</Text>
              <Text style={styles.linkText}>{todayJobs.length} job(s)</Text>
            </View>
          ) : null}

          {!todayOnly && todayJobs.length > 0 ? (
            todayJobs.slice(0, 3).map(job => (
              <TouchableOpacity
                key={`today-${job.bookingId}`}
                style={styles.planCard}
                activeOpacity={0.85}
                onPress={() => onOpenJob?.(job.bookingId)}
              >
                <View style={styles.planCardHeader}>
                  <Text style={styles.planCardTitle}>{job.planName || "Service"}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{bookingStatusLabel(job.status)}</Text>
                  </View>
                </View>
                <Text style={styles.listSub}>{formatWhen(job.scheduledAt)}</Text>
                <Text style={styles.listSub}>
                  {job.customerName} · {job.vehicleNumber || "Vehicle"}
                </Text>
              </TouchableOpacity>
            ))
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {todayOnly ? "Today’s schedule" : "Assigned jobs"}
            </Text>
            <Text style={styles.linkText}>{list.length}</Text>
          </View>

          {list.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No jobs yet</Text>
              <Text style={styles.emptySub}>
                When customers book and you are assigned by location, jobs will show here.
              </Text>
            </View>
          ) : (
            list.map(job => (
              <TouchableOpacity
                key={job.bookingId}
                style={styles.planCard}
                activeOpacity={0.85}
                onPress={() => onOpenJob?.(job.bookingId)}
              >
                <View style={styles.planCardHeader}>
                  <Text style={styles.planCardTitle}>{job.planName || "Service"}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{bookingStatusLabel(job.status)}</Text>
                  </View>
                </View>
                <Text style={styles.listSub}>{formatWhen(job.scheduledAt)}</Text>
                <Text style={styles.listTitle}>{job.customerName || "Customer"}</Text>
                <Text style={styles.listSub}>
                  {job.vehicleMakeModel || "Vehicle"} · {job.vehicleNumber || "—"}
                </Text>
                <Text style={styles.listSub}>{job.addressSummary || "Address"}</Text>
                <Text style={[styles.linkText, { marginTop: 10 }]}>View details ›</Text>
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}
