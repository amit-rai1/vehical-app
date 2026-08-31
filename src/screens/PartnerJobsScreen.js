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

function isActiveStatus(status) {
  const s = String(status ?? "");
  return s === "2" || s === "Confirmed" || s === "3" || s === "InProgress";
}

function isHistoryStatus(status) {
  const s = String(status ?? "");
  return s === "4" || s === "Completed" || s === "5" || s === "Cancelled";
}

function JobCard({ job, onOpenJob }) {
  return (
    <TouchableOpacity
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
      <Text style={[styles.linkText, styles.jobCardCta]}>View details ›</Text>
    </TouchableOpacity>
  );
}

export function PartnerJobsScreen({
  user,
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

  const activeJobs = useMemo(() => jobs.filter(j => isActiveStatus(j.status)), [jobs]);
  const historyJobs = useMemo(() => jobs.filter(j => isHistoryStatus(j.status)), [jobs]);
  const todayActive = useMemo(
    () => activeJobs.filter(j => isSameLocalDay(j.scheduledAt)),
    [activeJobs]
  );
  const todayHistory = useMemo(
    () => historyJobs.filter(j => isSameLocalDay(j.scheduledAt)),
    [historyJobs]
  );

  const assignedList = todayOnly ? todayActive : activeJobs;
  const historyList = todayOnly ? todayHistory : historyJobs;

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
        subtitle={todayOnly ? "Today’s schedule" : "Jobs & service history"}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {todayOnly ? "Today · Active" : "Assigned jobs"}
            </Text>
            <Text style={styles.linkText}>{assignedList.length}</Text>
          </View>

          {assignedList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No active jobs</Text>
              <Text style={styles.emptySub}>
                When customers book and you are assigned, new jobs show up here.
              </Text>
            </View>
          ) : (
            assignedList.map(job => (
              <JobCard key={job.bookingId} job={job} onOpenJob={onOpenJob} />
            ))
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {todayOnly ? "Today · History" : "Service history"}
            </Text>
            <Text style={styles.linkText}>{historyList.length}</Text>
          </View>

          {historyList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No completed services yet</Text>
              <Text style={styles.emptySub}>
                Finished jobs appear here so you can review photos and customer feedback.
              </Text>
            </View>
          ) : (
            historyList.map(job => (
              <JobCard key={`hist-${job.bookingId}`} job={job} onOpenJob={onOpenJob} />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}
