import React, { useCallback, useEffect, useState } from "react";
import { Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { invoiceApi } from "../api/client";
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

export function InvoicesScreen({ onBack, refreshKey }) {
  const { showLoading, hideLoading } = useFeedback();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const load = useCallback(async () => {
    showLoading("Loading invoices…");
    try {
      const res = await invoiceApi.list({ pageNumber: 1, pageSize: 50 });
      const rows = res?.data?.records ?? res?.data?.items ?? res?.data ?? [];
      setInvoices(Array.isArray(rows) ? rows : []);
      setErrorMsg(null);
    } catch (err) {
      setInvoices([]);
      setErrorMsg(err.message || "Unable to load invoices.");
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
      <Header title="Invoices" subtitle="Payments and receipts" />
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }}>
        <Text style={styles.linkText}>‹ Back to Account</Text>
      </TouchableOpacity>

      {loading ? null : errorMsg ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Couldn’t Load Invoices</Text>
          <Text style={styles.emptySub}>{errorMsg}</Text>
          <TouchableOpacity style={[styles.emptyCta, { marginTop: 10 }]} onPress={load}>
            <Text style={styles.emptyCtaText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : invoices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Invoices Yet</Text>
          <Text style={styles.emptySub}>Invoices appear after a successful plan purchase.</Text>
        </View>
      ) : (
        invoices.map(inv => (
          <TouchableOpacity
            key={inv.invoiceId}
            style={styles.accountListCard}
            activeOpacity={inv.pdfUrl ? 0.85 : 1}
            onPress={() => {
              if (inv.pdfUrl) Linking.openURL(inv.pdfUrl).catch(() => {});
            }}
          >
            <Text style={styles.listTitle}>{inv.invoiceNumber || `#${inv.invoiceId}`}</Text>
            <Text style={styles.listSub}>
              {formatDate(inv.invoiceDate)} · {inv.currency || "INR"} {inv.amount}
              {inv.pdfUrl ? " · Open PDF" : ""}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
