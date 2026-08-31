import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  addressApi,
  bannerApi,
  locationApi,
  planApi,
  vehicleApi
} from "../api/client";
import { Header } from "../components/Header";
import { PlanCalendar } from "../components/PlanCalendar";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

const BANNER_INTERVAL_MS = 5000;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 40;

function vehicleTypeShort(type) {
  const value = String(type ?? "");
  if (value === "1" || value === "TwoWheeler" || Number(type) === 1) return "2W";
  if (value === "2" || value === "FourWheeler" || Number(type) === 2) return "4W";
  return "—";
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

function toIstDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);
  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  return y && m && day ? new Date(`${y}-${m}-${day}T00:00:00`) : null;
}

function planDayProgress(startDate, endDate) {
  const start = toIstDateOnly(startDate);
  const end = toIstDateOnly(endDate);
  const today = toIstDateOnly(new Date());
  if (!start || !end || !today) return null;
  const msDay = 24 * 60 * 60 * 1000;
  const total = Math.max(1, Math.round((end - start) / msDay) + 1);
  let elapsed = Math.round((today - start) / msDay) + 1;
  elapsed = Math.min(total, Math.max(0, elapsed));
  const remaining = Math.max(0, total - elapsed);
  return { total, elapsed, remaining };
}

function isPending(status) {
  return status === 1 || status === "PendingActivation";
}

function isActive(status) {
  return status === 2 || status === "Active";
}

function addressLabel(a) {
  if (!a) return "Select address";
  const line = [a.addressLine1, a.city, a.pincode].filter(Boolean).join(", ");
  return line || a.fullAddress || "Saved address";
}

export function HomeScreen({
  user,
  onNavigate,
  onOpenServices,
  refreshKey
}) {
  const [plans, setPlans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [banners, setBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [serviceable, setServiceable] = useState(true);
  const [checkingPin, setCheckingPin] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [planDetails, setPlanDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [areaNote, setAreaNote] = useState("");
  const [submittingArea, setSubmittingArea] = useState(false);
  const bannerRef = useRef(null);

  const selectedAddress =
    addresses.find(a => a.addressId === selectedAddressId || a.id === selectedAddressId) ||
    addresses.find(a => a.isDefault) ||
    addresses[0] ||
    null;

  const checkPincode = useCallback(async pincode => {
    if (!pincode) {
      setServiceable(true);
      return;
    }
    setCheckingPin(true);
    try {
      const res = await locationApi.check(pincode);
      setServiceable(Boolean(res?.data?.isServiceable));
    } catch {
      setServiceable(true);
    } finally {
      setCheckingPin(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const [plansResponse, vehiclesResponse, addressesResponse, bannersResponse] =
        await Promise.all([
          planApi.list({ pageNumber: 1, pageSize: 50 }),
          vehicleApi.list({
            pageNumber: 1,
            pageSize: 20,
            search: "",
            isActive: true,
            sortBy: "CreatedOn",
            isAscending: false
          }),
          addressApi.list(),
          bannerApi.list().catch(() => ({ data: [] }))
        ]);

      const planRecords =
        plansResponse?.data?.records ||
        plansResponse?.data?.items ||
        plansResponse?.data ||
        [];
      const vehicleRecords =
        vehiclesResponse?.data?.records ||
        vehiclesResponse?.data?.items ||
        vehiclesResponse?.data ||
        [];
      const addressRecords =
        addressesResponse?.data?.records ||
        addressesResponse?.data?.items ||
        addressesResponse?.data ||
        [];
      const bannerRecords = bannersResponse?.data || [];

      setPlans(Array.isArray(planRecords) ? planRecords : []);
      setVehicles(Array.isArray(vehicleRecords) ? vehicleRecords : []);
      const addrSafe = Array.isArray(addressRecords) ? addressRecords : [];
      setAddresses(addrSafe);
      setBanners(Array.isArray(bannerRecords) ? bannerRecords : []);

      const def = addrSafe.find(a => a.isDefault) || addrSafe[0] || null;
      let nextSelectedId = null;
      setSelectedAddressId(prev => {
        const stillValid =
          prev != null && addrSafe.some(a => (a.addressId ?? a.id) === prev);
        nextSelectedId = stillValid ? prev : def ? def.addressId ?? def.id : null;
        return nextSelectedId;
      });
      const pinSource =
        addrSafe.find(a => (a.addressId ?? a.id) === nextSelectedId) || def;
      if (pinSource?.pincode) {
        await checkPincode(pinSource.pincode);
      } else {
        setServiceable(true);
      }
    } catch (error) {
      console.warn("Failed to load dashboard:", error.message);
      setPlans([]);
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkPincode]);

  useEffect(() => {
    setLoading(true);
    loadDashboard();
  }, [loadDashboard, refreshKey]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setBannerIndex(prev => {
        const next = (prev + 1) % banners.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, BANNER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  async function selectAddress(addr) {
    const id = addr.addressId ?? addr.id;
    setSelectedAddressId(id);
    setPickerOpen(false);
    await checkPincode(addr.pincode);
  }

  async function togglePlanCalendar(planId) {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
      return;
    }
    setExpandedPlanId(planId);
    if (planDetails[planId]) return;
    try {
      const res = await planApi.get(planId);
      setPlanDetails(prev => ({ ...prev, [planId]: res?.data || null }));
    } catch (error) {
      Alert.alert("Plan calendar", error.message || "Unable to load calendar.");
    }
  }

  async function submitAreaRequest() {
    if (!selectedAddress) return;
    setSubmittingArea(true);
    try {
      await locationApi.requestArea({
        name: user?.name || selectedAddress.contactPersonName || "Customer",
        mobile: user?.mobileNumber || selectedAddress.mobileNumber || "",
        pincode: selectedAddress.pincode,
        address: addressLabel(selectedAddress),
        notes: areaNote || null,
        sourceModule: 1
      });
      Alert.alert("Request sent", "Thanks! We'll notify you when we expand to your area.");
      setAreaNote("");
    } catch (error) {
      Alert.alert("Request", error.message || "Unable to submit request.");
    } finally {
      setSubmittingArea(false);
    }
  }

  function goBuyOrBook(target) {
    if (!serviceable) {
      Alert.alert(
        "Not available yet",
        "We're not available in your area yet. Leave a request below and we'll get back to you."
      );
      return;
    }
    if (target === "services") onOpenServices?.();
    else onNavigate?.(target);
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
            loadDashboard();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header title={`Hello, ${user?.name || "Customer"}`} />

      <TouchableOpacity
        style={styles.locationBar}
        onPress={() => setPickerOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.locationBarIcon}>📍</Text>
        <View style={styles.locationBarText}>
          <Text style={styles.locationBarTitle} numberOfLines={1}>
            {selectedAddress ? addressLabel(selectedAddress) : "Add delivery address"}
          </Text>
          <Text style={styles.locationBarSub}>
            {checkingPin
              ? "Checking serviceability…"
              : selectedAddress?.pincode
                ? `Pincode ${selectedAddress.pincode}`
                : "Tap to choose address"}
          </Text>
        </View>
        <Text style={styles.locationBarChevron}>▼</Text>
      </TouchableOpacity>

      {banners.length > 0 ? (
        <View style={styles.bannerWrap}>
          <FlatList
            ref={bannerRef}
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => String(item.id)}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
              setBannerIndex(idx);
            }}
            renderItem={({ item }) => (
              <View style={{ width: BANNER_WIDTH }}>
                <Image
                  source={{ uri: item.imageData }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </View>
            )}
          />
          <View style={styles.bannerDots}>
            {banners.map((_, i) => (
              <View
                key={i}
                style={[styles.bannerDot, i === bannerIndex && styles.bannerDotActive]}
              />
            ))}
          </View>
        </View>
      ) : null}

      {!serviceable && selectedAddress ? (
        <View style={styles.unserviceableCard}>
          <Text style={styles.unserviceableTitle}>We're not available in your area yet</Text>
          <Text style={styles.unserviceableSub}>
            Leave your details and we'll reach out when we expand to {selectedAddress.pincode}.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Optional note"
            placeholderTextColor={colors.muted}
            value={areaNote}
            onChangeText={setAreaNote}
          />
          <TouchableOpacity
            style={[styles.emptyCta, { marginTop: 10 }]}
            onPress={submitAreaRequest}
            disabled={submittingArea}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyCtaText}>
              {submittingArea ? "Sending…" : "Notify me"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.quickAction, !serviceable && styles.quickActionDisabled]}
          onPress={() => goBuyOrBook("booking")}
        >
          <Text style={styles.quickIcon}>📅</Text>
          <Text style={styles.quickText}>Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("vehicles")}>
          <Text style={styles.quickIcon}>🚗</Text>
          <Text style={styles.quickText}>Vehicles</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("addresses")}>
          <Text style={styles.quickIcon}>📍</Text>
          <Text style={styles.quickText}>Addresses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("help")}>
          <Text style={styles.quickIcon}>💬</Text>
          <Text style={styles.quickText}>Help</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Plans</Text>
        <TouchableOpacity onPress={() => goBuyOrBook("services")}>
          <Text style={[styles.linkText, !serviceable && { opacity: 0.45 }]}>Buy plan</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>You don’t have any plan yet</Text>
          <Text style={styles.emptySub}>
            Purchase a plan with vehicle, address, and preferred time. It activates after 2 days.
          </Text>
          <TouchableOpacity
            style={[styles.emptyCta, !serviceable && { opacity: 0.5 }]}
            onPress={() => goBuyOrBook("services")}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyCtaText}>Browse services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        plans.map(plan => {
          const remaining = Math.max(0, (plan.totalServices || 0) - (plan.servicesUsed || 0));
          const total = plan.totalServices || 1;
          const pending = isPending(plan.status);
          const dayProg = !pending ? planDayProgress(plan.startDate, plan.endDate) : null;
          const detail = planDetails[plan.planId];
          return (
            <View key={plan.planId} style={styles.planCard}>
              <View style={styles.planCardHeader}>
                <Text style={styles.planCardTitle}>{plan.planName}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{vehicleTypeShort(plan.vehicleType)}</Text>
                </View>
              </View>
              {pending ? (
                <Text style={styles.listSub}>
                  {plan.activationMessage ||
                    `Activates on ${formatDate(plan.startDate)} at 12:01 AM`}
                </Text>
              ) : dayProg ? (
                <>
                  <Text style={styles.listTitle}>
                    Day {dayProg.elapsed} of {dayProg.total}
                  </Text>
                  <Text style={styles.listSub}>{dayProg.remaining} days left</Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(dayProg.elapsed / dayProg.total) * 100}%` }
                      ]}
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.listSub}>Valid till: {formatDate(plan.endDate)}</Text>
              )}
              <View style={styles.progressMeta}>
                <Text style={styles.listSub}>
                  {remaining} of {total} services left · Used {plan.servicesUsed || 0}/{total}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.planBookLink}
                onPress={() => togglePlanCalendar(plan.planId)}
                activeOpacity={0.85}
              >
                <Text style={styles.linkText}>
                  {expandedPlanId === plan.planId ? "Hide calendar" : "Show plan calendar ›"}
                </Text>
              </TouchableOpacity>

              {expandedPlanId === plan.planId ? (
                <View style={{ marginTop: 10 }}>
                  {detail ? (
                    <PlanCalendar
                      startDate={detail.startDate}
                      endDate={detail.endDate}
                      completedDates={detail.completedServiceDates}
                      scheduledDates={detail.scheduledServiceDates}
                    />
                  ) : (
                    <ActivityIndicator color={colors.primary} />
                  )}
                </View>
              ) : null}
            </View>
          );
        })
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vehicles</Text>
        <TouchableOpacity onPress={() => onNavigate("vehicles")}>
          <Text style={styles.linkText}>Manage</Text>
        </TouchableOpacity>
      </View>
      {vehicles.slice(0, 3).map(v => (
        <View key={v.vehicleId} style={styles.addressPreview}>
          <Text style={styles.listTitle}>{v.vehicleNumber}</Text>
          <Text style={styles.listSub}>
            {[v.makeName, v.modelName].filter(Boolean).join(" · ")}
          </Text>
        </View>
      ))}

      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.sectionTitle}>Choose address</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {addresses.map(a => {
                const id = a.addressId ?? a.id;
                const selected = id === (selectedAddress?.addressId ?? selectedAddress?.id);
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.addressPreview, selected && { borderColor: colors.primary }]}
                    onPress={() => selectAddress(a)}
                  >
                    <Text style={styles.listTitle}>{addressLabel(a)}</Text>
                    <Text style={styles.listSub}>{a.pincode}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.emptyCta, { marginTop: 12 }]}
              onPress={() => {
                setPickerOpen(false);
                onNavigate("addresses");
              }}
            >
              <Text style={styles.emptyCtaText}>Add new address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10, alignItems: "center" }} onPress={() => setPickerOpen(false)}>
              <Text style={styles.linkText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
