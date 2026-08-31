import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { helpApi } from "../api/client";
import { Header } from "../components/Header";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function statusLabel(status) {
  if (status === 1 || status === "Open") return "Open";
  if (status === 2 || status === "InProgress") return "In progress";
  if (status === 3 || status === "Resolved") return "Resolved";
  if (status === 4 || status === "Closed") return "Closed";
  return String(status ?? "—");
}

export function HelpScreen({ onBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await helpApi.list();
      const list = res?.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (error) {
      console.warn("Help load failed:", error.message);
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Help", "Subject and message are required.");
      return;
    }
    setSaving(true);
    try {
      await helpApi.create({
        subject: subject.trim(),
        message: message.trim()
      });
      setSubject("");
      setMessage("");
      setShowForm(false);
      Alert.alert("Help", "Ticket submitted. We'll get back to you soon.");
      await load();
    } catch (error) {
      Alert.alert("Help", error.message || "Unable to submit ticket.");
    } finally {
      setSaving(false);
    }
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
            load();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header title="Help" subtitle="Raise a ticket or track replies" />
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }}>
        <Text style={styles.linkText}>‹ Back to home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.emptyCta}
        onPress={() => setShowForm(v => !v)}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyCtaText}>{showForm ? "Cancel" : "Raise help"}</Text>
      </TouchableOpacity>

      {showForm ? (
        <View style={[styles.planCard, { marginTop: 14 }]}>
          <Text style={styles.listTitle}>Subject</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Booking issue"
            placeholderTextColor={colors.muted}
          />
          <Text style={[styles.listTitle, { marginTop: 10 }]}>Message</Text>
          <TextInput
            style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]}
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder="Describe your issue"
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity
            style={[styles.emptyCta, { marginTop: 12, opacity: saving ? 0.6 : 1 }]}
            onPress={submit}
            disabled={saving}
          >
            <Text style={styles.emptyCtaText}>{saving ? "Submitting…" : "Submit ticket"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.sectionHeader, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>My tickets</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : tickets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No tickets yet</Text>
          <Text style={styles.emptySub}>Tap Raise help if you need support.</Text>
        </View>
      ) : (
        tickets.map(t => (
          <View key={t.id} style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <Text style={styles.planCardTitle}>{t.subject}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{statusLabel(t.status)}</Text>
              </View>
            </View>
            <Text style={styles.listSub}>{t.message}</Text>
            {t.adminReply ? (
              <Text style={[styles.listTitle, { marginTop: 8 }]}>Reply: {t.adminReply}</Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}
