import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { partnerApi, profileApi } from "../api/client";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

function isPartnerUser(user) {
  return String(user?.roleName || "").toLowerCase().includes("partner");
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
    >
      <View style={styles.accountMenuIcon}>
        <Text style={styles.accountMenuIconText}>{icon}</Text>
      </View>
      <View style={styles.accountMenuTextWrap}>
        <Text style={styles.accountMenuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.accountMenuSub}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.accountMenuChevron}>›</Text>
    </TouchableOpacity>
  );
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
        const profileRes = await profileApi.customer().catch(() => null);
        const p = profileRes?.data || null;
        setProfile(p);
        if (p?.name && onUserUpdated) {
          onUserUpdated({ name: p.name });
        }
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
          </View>

          {!partner ? (
            <View style={styles.accountMenuCard}>
              <MenuRow
                icon="▦"
                title="My Plans"
                subtitle="View purchased plans"
                onPress={() => onNavigate?.("myPlans")}
              />
              <MenuRow
                icon="◎"
                title="Booking History"
                subtitle="Track your services"
                onPress={() => onNavigate?.("track")}
              />
              <MenuRow
                icon="▤"
                title="Invoices"
                subtitle="Payments and receipts"
                onPress={() => onNavigate?.("invoices")}
              />
              <MenuRow
                icon="★"
                title="My Feedback"
                subtitle="Ratings you submitted"
                onPress={() => onNavigate?.("feedback")}
              />
              <MenuRow
                icon="💬"
                title="Customer Support"
                subtitle="Raise a ticket or share an image"
                onPress={() => onNavigate?.("help")}
                last
              />
            </View>
          ) : (
            <>
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
                <TouchableOpacity
                  style={styles.accountStatCell}
                  onPress={() => onNavigate?.("jobs")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.accountStatValue}>›</Text>
                  <Text style={styles.accountStatLabel}>Open Jobs</Text>
                </TouchableOpacity>
              </View>
              {jobs.slice(0, 5).map(job => (
                <TouchableOpacity
                  key={job.bookingId}
                  style={styles.accountListCard}
                  onPress={() => onOpenJob?.(job.bookingId)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.listTitle}>
                    #{job.bookingId} · {job.planName || "Service"}
                  </Text>
                  <Text style={styles.listSub}>{String(job.status ?? "")}</Text>
                </TouchableOpacity>
              ))}
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
