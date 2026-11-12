import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  bookingApi,
  feedbackApi,
  invoiceApi,
  partnerApi,
  planApi,
  profileApi
} from "../api/client";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function isPartnerUser(user) {
  return String(user?.roleName || "").toLowerCase().includes("partner");
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

function bookingStatusLabel(status) {
  const value = String(status ?? "");
  if (value === "1" || value === "Pending") return "Pending";
  if (value === "2" || value === "Confirmed") return "Confirmed";
  if (value === "3" || value === "InProgress") return "In Progress";
  if (value === "4" || value === "Completed") return "Completed";
  if (value === "5" || value === "Cancelled") return "Cancelled";
  return value || "—";
}

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

function planStatusLabel(status) {
  if (status === 1 || status === "PendingActivation") return "Pending";
  if (status === 2 || status === "Active") return "Active";
  if (status === 3 || status === "Expired") return "Expired";
  if (status === 4 || status === "Cancelled") return "Cancelled";
  return String(status ?? "—");
}

function genderLabel(gender) {
  if (gender === 1 || gender === "Male") return "Male";
  if (gender === 2 || gender === "Female") return "Female";
  if (gender === 3 || gender === "Other") return "Other";
  return null;
}

function MenuRow({ icon, title, subtitle, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.accountMenuRow, last && styles.accountMenuRowLast]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View style={styles.accountMenuIcon}>
        <Text style={styles.accountMenuIconText}>{icon}</Text>
      </View>
      <View style={styles.accountMenuTextWrap}>
        <Text style={styles.accountMenuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.accountMenuSub}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Text style={styles.accountMenuChevron}>›</Text> : null}
    </TouchableOpacity>
  );
}

function Section({ title, children, actionLabel, onAction }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{title}</Text>
        {actionLabel && onAction ? (
          <TouchableOpacity onPress={onAction}>
            <Text style={styles.linkText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function EmptyLine({ text }) {
  return <Text style={[styles.listSub, { marginBottom: 8 }]}>{text}</Text>;
}

export function AccountScreen({
  user,
  refreshKey,
  onNavigate,
  onLogout,
  onOpenJob,
  onUserUpdated
}) {
  const { showLoading, hideLoading, confirm } = useFeedback();
  const partner = isPartnerUser(user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [jobs, setJobs] = useState([]);

  const load = useCallback(async () => {
    showLoading("Loading account…");
    try {
      if (partner) {
        const [profileRes, jobsRes] = await Promise.all([
          profileApi.partner().catch(() => null),
          partnerApi.listJobs({ pageNumber: 1, pageSize: 50 }).catch(() => null)
        ]);
        const p = profileRes?.data || null;
        setProfile(p);
        if (p?.name && onUserUpdated) {
          onUserUpdated({ name: p.name, partnerStatus: p.partnerStatus ?? user?.partnerStatus });
        }
        const jobList =
          jobsRes?.data?.records || jobsRes?.data?.items || jobsRes?.data || [];
        setJobs(Array.isArray(jobList) ? jobList : []);
      } else {
        const [profileRes, plansRes, bookingsRes, invoicesRes, feedbackRes] =
          await Promise.all([
            profileApi.customer().catch(() => null),
            planApi.list({ pageNumber: 1, pageSize: 20 }).catch(() => null),
            bookingApi.list({ pageNumber: 1, pageSize: 20 }).catch(() => null),
            invoiceApi.list({ pageNumber: 1, pageSize: 20 }).catch(() => null),
            feedbackApi.list().catch(() => null)
          ]);
        const p = profileRes?.data || null;
        setProfile(p);
        if (p?.name && onUserUpdated) {
          onUserUpdated({ name: p.name });
        }
        const planList =
          plansRes?.data?.records || plansRes?.data?.items || plansRes?.data || [];
        const bookingList =
          bookingsRes?.data?.records ||
          bookingsRes?.data?.items ||
          bookingsRes?.data ||
          [];
        const invoiceList =
          invoicesRes?.data?.records ||
          invoicesRes?.data?.items ||
          invoicesRes?.data ||
          [];
        const feedbackList = feedbackRes?.data || [];
        setPlans(Array.isArray(planList) ? planList : []);
        setBookings(Array.isArray(bookingList) ? bookingList : []);
        setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
        setFeedback(Array.isArray(feedbackList) ? feedbackList : []);
      }
    } catch (err) {
      console.warn("Account load failed:", err.message);
    } finally {
      hideLoading();
      setLoading(false);
      setRefreshing(false);
    }
  }, [partner, showLoading, hideLoading]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load, refreshKey]);

  async function confirmLogout() {
    const ok = await confirm({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      danger: true
    });
    if (ok) onLogout?.();
  }

  const displayName = profile?.name || user?.name || (partner ? "Partner" : "Customer");
  const mobile = profile?.mobileNumber || user?.mobileNumber || "—";
  const email = profile?.email;

  const assigned = jobs.filter(j => {
    const s = String(j.status ?? "");
    return s === "2" || s === "Confirmed";
  }).length;
  const inProgress = jobs.filter(j => {
    const s = String(j.status ?? "");
    return s === "3" || s === "InProgress";
  }).length;
  const completed = jobs.filter(j => {
    const s = String(j.status ?? "");
    return s === "4" || s === "Completed";
  }).length;
  const cancelled = jobs.filter(j => {
    const s = String(j.status ?? "");
    return s === "5" || s === "Cancelled";
  }).length;
  const recentCompleted = jobs
    .filter(j => {
      const s = String(j.status ?? "");
      return s === "4" || s === "Completed" || s === "5" || s === "Cancelled";
    })
    .slice(0, 8);

  const activePlans = plans.filter(
    p => p.status === 2 || p.status === "Active" || p.status === 1 || p.status === "PendingActivation"
  ).length;

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
      <Header
        title="My Account"
        subtitle={partner ? "Partner Profile & Jobs" : "Profile & History"}
      />

      {loading ? null : (
        <>
          <View style={styles.accountHero}>
            <View style={styles.accountHeroRow}>
              {profile?.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.accountAvatar} />
              ) : (
                <View style={styles.accountAvatarFallback}>
                  <Text style={styles.accountAvatarLetter}>
                    {String(displayName).charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName}>{displayName}</Text>
                <Text style={styles.accountMeta}>+91 {mobile}</Text>
                {email ? <Text style={styles.accountMeta}>{email}</Text> : null}
                {!partner && genderLabel(profile?.gender) ? (
                  <Text style={styles.accountMeta}>{genderLabel(profile.gender)}</Text>
                ) : null}
                {partner ? (
                  <Text style={[styles.accountMeta, { marginTop: 6 }]}>
                    Status · {partnerStatusLabel(profile?.partnerStatus ?? user?.partnerStatus)}
                  </Text>
                ) : null}
              </View>
            </View>
            {partner && (profile?.address || profile?.city) ? (
              <Text style={[styles.accountMeta, { marginTop: 14 }]}>
                {[profile.address, profile.city, profile.state, profile.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            ) : null}
          </View>

          {!partner ? (
            <>
              <View style={styles.accountMenuCard}>
                <MenuRow
                  icon="▦"
                  title="My Plans"
                  subtitle={
                    plans.length
                      ? `${activePlans} active · ${plans.length} total`
                      : "No plans yet"
                  }
                  onPress={() => onNavigate?.("booking")}
                />
                <MenuRow
                  icon="◎"
                  title="Booking History"
                  subtitle={
                    bookings.length
                      ? `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`
                      : "No bookings yet"
                  }
                  onPress={() => onNavigate?.("track")}
                />
                <MenuRow
                  icon="▤"
                  title="Invoices"
                  subtitle={
                    invoices.length
                      ? `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`
                      : "No invoices yet"
                  }
                />
                <MenuRow
                  icon="★"
                  title="My Feedback"
                  subtitle={
                    feedback.length
                      ? `${feedback.length} review${feedback.length === 1 ? "" : "s"}`
                      : "No feedback yet"
                  }
                  last
                />
              </View>

              <Section title="My Plans" actionLabel="Book" onAction={() => onNavigate?.("booking")}>
                {plans.length === 0 ? (
                  <EmptyLine text="No plans yet." />
                ) : (
                  plans.slice(0, 5).map(plan => (
                    <View key={plan.planId} style={styles.accountListCard}>
                      <Text style={styles.listTitle}>{plan.planName}</Text>
                      <Text style={styles.listSub}>
                        {planStatusLabel(plan.status)} ·{" "}
                        {Math.max(0, (plan.totalServices || 0) - (plan.servicesUsed || 0))}{" "}
                        services left
                      </Text>
                      <Text style={styles.listSub}>
                        {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
                      </Text>
                    </View>
                  ))
                )}
              </Section>

              <Section
                title="Booking History"
                actionLabel="Track"
                onAction={() => onNavigate?.("track")}
              >
                {bookings.length === 0 ? (
                  <EmptyLine text="No bookings yet." />
                ) : (
                  bookings.slice(0, 8).map(b => (
                    <View key={b.bookingId} style={styles.accountListCard}>
                      <Text style={styles.listTitle}>
                        #{b.bookingId} · {b.planName || "Service"}
                      </Text>
                      <Text style={styles.listSub}>
                        {bookingStatusLabel(b.status)} · {formatWhen(b.scheduledAt)}
                      </Text>
                      {b.vehicleName || b.vehicleNumber ? (
                        <Text style={styles.listSub}>
                          {[b.vehicleName, b.vehicleNumber].filter(Boolean).join(" · ")}
                        </Text>
                      ) : null}
                    </View>
                  ))
                )}
              </Section>

              <Section title="Invoices">
                {invoices.length === 0 ? (
                  <EmptyLine text="No invoices yet." />
                ) : (
                  invoices.slice(0, 8).map(inv => (
                    <TouchableOpacity
                      key={inv.invoiceId}
                      style={styles.accountListCard}
                      activeOpacity={inv.pdfUrl ? 0.85 : 1}
                      onPress={() => {
                        if (inv.pdfUrl) Linking.openURL(inv.pdfUrl).catch(() => {});
                      }}
                    >
                      <Text style={styles.listTitle}>
                        {inv.invoiceNumber || `#${inv.invoiceId}`}
                      </Text>
                      <Text style={styles.listSub}>
                        {formatDate(inv.invoiceDate)} · {inv.currency || "INR"} {inv.amount}
                        {inv.pdfUrl ? " · Open PDF" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </Section>

              <Section title="My Feedback">
                {feedback.length === 0 ? (
                  <EmptyLine text="No feedback submitted yet." />
                ) : (
                  feedback.slice(0, 8).map((f, idx) => (
                    <View key={`${f.bookingId}-${idx}`} style={styles.accountListCard}>
                      <Text style={styles.listTitle}>
                        Booking #{f.bookingId} · {f.rating}/5
                      </Text>
                      {f.comments ? <Text style={styles.listSub}>{f.comments}</Text> : null}
                      <Text style={styles.listSub}>{formatDate(f.submittedOn)}</Text>
                    </View>
                  ))
                )}
              </Section>
            </>
          ) : (
            <>
              <Section title="Job Stats">
                <View style={styles.accountStatGrid}>
                  <View style={styles.accountStatCell}>
                    <Text style={styles.accountStatValue}>{assigned}</Text>
                    <Text style={styles.accountStatLabel}>Assigned</Text>
                  </View>
                  <View style={styles.accountStatCell}>
                    <Text style={styles.accountStatValue}>{inProgress}</Text>
                    <Text style={styles.accountStatLabel}>In Progress</Text>
                  </View>
                  <View style={styles.accountStatCell}>
                    <Text style={styles.accountStatValue}>{completed}</Text>
                    <Text style={styles.accountStatLabel}>Completed</Text>
                  </View>
                  <View style={styles.accountStatCell}>
                    <Text style={styles.accountStatValue}>{cancelled}</Text>
                    <Text style={styles.accountStatLabel}>Cancelled</Text>
                  </View>
                </View>
              </Section>

              <Section title="Recent Jobs" actionLabel="Jobs" onAction={() => onNavigate?.("jobs")}>
                {recentCompleted.length === 0 ? (
                  <EmptyLine text="No completed or cancelled jobs yet." />
                ) : (
                  recentCompleted.map(job => (
                    <TouchableOpacity
                      key={job.bookingId}
                      style={styles.accountListCard}
                      onPress={() => onOpenJob?.(job.bookingId)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.listTitle}>
                        #{job.bookingId} · {job.planName || "Service"}
                      </Text>
                      <Text style={styles.listSub}>
                        {bookingStatusLabel(job.status)} · {formatWhen(job.scheduledAt)}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </Section>
            </>
          )}

          <TouchableOpacity
            style={styles.accountLogoutBtn}
            onPress={confirmLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.accountLogoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
