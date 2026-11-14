import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { helpApi } from "../api/client";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function statusLabel(status) {
  if (status === 1 || status === "Open") return "Open";
  if (status === 2 || status === "InProgress") return "In Progress";
  if (status === 3 || status === "Resolved") return "Resolved";
  if (status === 4 || status === "Closed") return "Closed";
  return String(status ?? "—");
}

function imageUri(value) {
  if (!value) return null;
  const raw = String(value);
  if (raw.startsWith("data:") || raw.startsWith("http")) return raw;
  return `data:image/jpeg;base64,${raw}`;
}

export function HelpScreen({ onBack }) {
  const { showLoading, hideLoading, success, error, info } = useFeedback();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    showLoading("Loading tickets…");
    try {
      const res = await helpApi.list();
      const list = res?.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Help load failed:", err.message);
      setTickets([]);
    } finally {
      hideLoading();
      setLoading(false);
      setRefreshing(false);
    }
  }, [showLoading, hideLoading]);

  useEffect(() => {
    load();
  }, [load]);

  async function pickAttachment() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        await error("Permission needed", "Allow photo access to share an image with support.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.5,
        base64: true
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const dataUrl = asset.base64
        ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
        : asset.uri;
      setAttachment({ uri: asset.uri, dataUrl });
    } catch (err) {
      await error("Image", err?.message || "Unable to pick image.");
    }
  }

  async function submit() {
    if (!subject.trim() || !message.trim()) {
      await info("Customer Support", "Subject and message are required.");
      return;
    }
    setSaving(true);
    showLoading("Submitting ticket…");
    try {
      await helpApi.create({
        subject: subject.trim(),
        message: message.trim(),
        attachmentImage: attachment?.dataUrl || null
      });
      setSubject("");
      setMessage("");
      setAttachment(null);
      setShowForm(false);
      await success("Customer Support", "Ticket submitted. We'll get back to you soon.");
      await load();
    } catch (err) {
      await error("Customer Support", err.message || "Unable to submit ticket.");
    } finally {
      hideLoading();
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
      <Header title="Customer Support" subtitle="Raise a ticket or track replies" />
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }}>
        <Text style={styles.linkText}>‹ Back to Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.emptyCta}
        onPress={() => setShowForm(v => !v)}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyCtaText}>{showForm ? "Cancel" : "Raise Ticket"}</Text>
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
          <Text style={[styles.listTitle, { marginTop: 10 }]}>Share Image (optional)</Text>
          <TouchableOpacity style={styles.secondaryCta} onPress={pickAttachment} activeOpacity={0.85}>
            <Text style={styles.secondaryCtaText}>
              {attachment ? "Change Image" : "Attach Image"}
            </Text>
          </TouchableOpacity>
          {attachment?.uri ? (
            <Image
              source={{ uri: attachment.uri }}
              style={{ width: "100%", height: 160, borderRadius: 12, marginTop: 10 }}
              resizeMode="cover"
            />
          ) : null}
          <TouchableOpacity
            style={[styles.emptyCta, { marginTop: 12, opacity: saving ? 0.6 : 1 }]}
            onPress={submit}
            disabled={saving}
          >
            <Text style={styles.emptyCtaText}>{saving ? "Submitting…" : "Submit Ticket"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.sectionHeader, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>My Tickets</Text>
      </View>

      {loading ? null : tickets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Tickets Yet</Text>
          <Text style={styles.emptySub}>Tap Raise Ticket if you need support.</Text>
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
            {t.attachmentImage ? (
              <Image
                source={{ uri: imageUri(t.attachmentImage) }}
                style={{ width: "100%", height: 140, borderRadius: 12, marginTop: 10 }}
                resizeMode="cover"
              />
            ) : null}
            {t.adminReply ? (
              <Text style={[styles.listTitle, { marginTop: 8 }]}>Reply: {t.adminReply}</Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}
