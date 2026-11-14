import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { planApi } from "../api/client";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

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

function planStatusLabel(status) {
  if (status === 1 || status === "PendingActivation") return "Pending";
  if (status === 2 || status === "Active") return "Active";
  if (status === 3 || status === "Expired") return "Expired";
  if (status === 4 || status === "Cancelled") return "Cancelled";
  return String(status ?? "—");
}

export function MyPlansScreen({ onBack, onBook, refreshKey }) {
  const { showLoading, hideLoading } = useFeedback();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const load = useCallback(async () => {
    showLoading("Loading plans…");
    try {
      const res = await planApi.list({ pageNumber: 1, pageSize: 50 });
      const rows = res?.data?.records ?? res?.data?.items ?? res?.data ?? [];
      setPlans(Array.isArray(rows) ? rows : []);
      setErrorMsg(null);
    } catch (err) {
      setPlans([]);
      setErrorMsg(err.message || "Unable to load plans.");
    } finally {
      hideLoading();
      setLoading(false);
      setRefreshing(false);
    }
  }, [showLoading, hideLoading]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load, refreshKey]);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header title="My Plans" subtitle="Purchased plans on your account" />
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }}>
        <Text style={styles.linkText}>‹ Back to Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.emptyCta} onPress={onBook} activeOpacity={0.85}>
        <Text style={styles.emptyCtaText}>Book a Service</Text>
      </TouchableOpacity>

      {loading ? null : errorMsg ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Couldn’t Load Plans</Text>
          <Text style={styles.emptySub}>{errorMsg}</Text>
          <TouchableOpacity style={[styles.emptyCta, { marginTop: 10 }]} onPress={load}>
            <Text style={styles.emptyCtaText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Plans Yet</Text>
          <Text style={styles.emptySub}>Buy a plan from Services to get started.</Text>
        </View>
      ) : (
        plans.map(plan => (
          <View key={plan.planId} style={styles.accountListCard}>
            <Text style={styles.listTitle}>{plan.planName}</Text>
            <Text style={styles.listSub}>
              {planStatusLabel(plan.status)} ·{" "}
              {Math.max(0, (plan.totalServices || 0) - (plan.servicesUsed || 0))} services left
            </Text>
            <Text style={styles.listSub}>
              {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
