import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { feedbackApi } from "../api/client";
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

export function MyFeedbackScreen({ onBack, refreshKey }) {
  const { showLoading, hideLoading } = useFeedback();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const load = useCallback(async () => {
    showLoading("Loading feedback…");
    try {
      const res = await feedbackApi.list();
      const rows = res?.data || [];
      setFeedback(Array.isArray(rows) ? rows : []);
      setErrorMsg(null);
    } catch (err) {
      setFeedback([]);
      setErrorMsg(err.message || "Unable to load feedback.");
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
      <Header title="My Feedback" subtitle="Ratings you submitted" />
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }}>
        <Text style={styles.linkText}>‹ Back to Account</Text>
      </TouchableOpacity>

      {loading ? null : errorMsg ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Couldn’t Load Feedback</Text>
          <Text style={styles.emptySub}>{errorMsg}</Text>
          <TouchableOpacity style={[styles.emptyCta, { marginTop: 10 }]} onPress={load}>
            <Text style={styles.emptyCtaText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : feedback.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Feedback Yet</Text>
          <Text style={styles.emptySub}>Rate completed services from Track.</Text>
        </View>
      ) : (
        feedback.map((f, idx) => (
          <View key={`${f.bookingId}-${idx}`} style={styles.accountListCard}>
            <Text style={styles.listTitle}>
              Booking #{f.bookingId} · {f.rating}/5
            </Text>
            {f.comments ? <Text style={styles.listSub}>{f.comments}</Text> : null}
            <Text style={styles.listSub}>{formatDate(f.submittedOn)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
