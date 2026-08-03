import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { bookingApi, feedbackApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

const STATUS_STEPS = [
  { key: "Booked", match: [1, "Pending"] },
  { key: "Partner assigned", match: [2, "Confirmed"] },
  { key: "In progress", match: [3, "InProgress"] },
  { key: "Completed", match: [4, "Completed"] }
];

function statusIndex(status, partnerId) {
  const value = status;
  if (value === 4 || value === "Completed") return 3;
  if (value === 3 || value === "InProgress") return 2;
  if (value === 5 || value === "Cancelled") return -1;
  if (value === 2 || value === "Confirmed" || partnerId) return 1;
  return 0;
}

function isCompleted(status) {
  return status === 4 || status === "Completed";
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

function StarPicker({ rating, onChange }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(star => {
        const active = rating >= star;
        return (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            style={styles.starButton}
            activeOpacity={0.8}
          >
            <Text style={[styles.starGlyph, active && styles.starGlyphActive]}>
              {active ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function TrackScreen({ refreshKey }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingBookingId, setRatingBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const response = await bookingApi.list({ pageNumber: 1, pageSize: 20 });
      const records =
        response?.data?.records || response?.data?.items || response?.data || [];
      setBookings(Array.isArray(records) ? records : []);
    } catch (error) {
      console.warn("Failed to load bookings:", error.message);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadBookings();
  }, [loadBookings, refreshKey]);

  async function callPartner(mobile) {
    if (!mobile) {
      Alert.alert("No phone", "Partner mobile is not available yet.");
      return;
    }
    const tel = `tel:+91${String(mobile).replace(/\D/g, "")}`;
    try {
      await Linking.openURL(tel);
    } catch {
      Alert.alert("Unable to call", "Could not open the phone dialer.");
    }
  }

  function openRateForm(bookingId) {
    setRatingBookingId(bookingId);
    setRating(5);
    setComments("");
  }

  async function submitFeedback(bookingId) {
    if (rating < 1 || rating > 5) {
      Alert.alert("Rating required", "Please choose 1 to 5 stars.");
      return;
    }
    setSubmittingFeedback(true);
    try {
      await feedbackApi.submit({
        bookingId,
        rating,
        comments: comments.trim() || null
      });
      Alert.alert("Thank you", "Your feedback was submitted.");
      setRatingBookingId(null);
      setComments("");
      await loadBookings();
    } catch (error) {
      Alert.alert("Feedback failed", error.message || "Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.flex, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
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
            loadBookings();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header title="Track Service" subtitle="Live status, partner details, and ratings." />

      {bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySub}>
            When you book a service from an active plan, tracking details will show up here.
          </Text>
        </View>
      ) : (
        bookings.map(booking => {
          const activeIndex = statusIndex(booking.status, booking.partnerId);
          const cancelled = booking.status === 5 || booking.status === "Cancelled";
          const completed = isCompleted(booking.status);
          const showRate = completed && !booking.hasFeedback;
          const isRatingThis = ratingBookingId === booking.bookingId;

          return (
            <View key={booking.bookingId} style={styles.panel}>
              <Text style={styles.panelTitle}>{booking.planName || "Service booking"}</Text>
              <Text style={styles.listSub}>
                #{booking.bookingId} · {booking.vehicleName || "Vehicle"}
              </Text>
              <Text style={styles.listSub}>
                {formatWhen(booking.scheduledAt)} · {booking.addressSummary || "Address"}
              </Text>

              <View style={styles.partnerInfoCard}>
                {booking.partnerName || booking.partnerId ? (
                  <>
                    <Text style={styles.listTitle}>
                      Partner: {booking.partnerName || "Assigned"}
                    </Text>
                    <Text style={styles.listSub}>
                      Mobile: {booking.partnerMobile ? `+91 ${booking.partnerMobile}` : "—"}
                    </Text>
                    {booking.partnerMobile ? (
                      <TouchableOpacity
                        style={styles.secondaryCta}
                        onPress={() => callPartner(booking.partnerMobile)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.secondaryCtaText}>Call partner</Text>
                      </TouchableOpacity>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.listSub}>Partner: awaiting assignment</Text>
                )}
              </View>

              {booking.startedAt ? (
                <Text style={styles.listSub}>Started: {formatWhen(booking.startedAt)}</Text>
              ) : null}
              {booking.completedAt ? (
                <Text style={styles.listSub}>Completed: {formatWhen(booking.completedAt)}</Text>
              ) : null}

              {cancelled ? (
                <Text style={[styles.listTitle, { color: colors.danger, marginTop: 12 }]}>
                  Cancelled
                </Text>
              ) : (
                <View style={styles.timeline}>
                  {STATUS_STEPS.map((step, index) => (
                    <View key={step.key} style={styles.timelineRow}>
                      <View
                        style={[
                          styles.timelineDot,
                          index <= activeIndex && styles.timelineActiveDot
                        ]}
                      />
                      <View style={styles.timelineTextWrap}>
                        <Text style={styles.timelineTitle}>{step.key}</Text>
                        <Text style={styles.timelineSub}>
                          {index < activeIndex
                            ? "Done"
                            : index === activeIndex
                              ? "Current"
                              : "Pending"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {completed && booking.hasFeedback ? (
                <Text style={[styles.listSub, { marginTop: 12 }]}>
                  Thanks — you already rated this service.
                </Text>
              ) : null}

              {showRate && !isRatingThis ? (
                <TouchableOpacity
                  style={styles.primaryCta}
                  onPress={() => openRateForm(booking.bookingId)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryCtaText}>Rate this service</Text>
                </TouchableOpacity>
              ) : null}

              {isRatingThis ? (
                <View style={styles.feedbackBox}>
                  <Text style={styles.panelTitle}>Your rating</Text>
                  <StarPicker rating={rating} onChange={setRating} />
                  <Text style={styles.label}>Feedback message</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={comments}
                    onChangeText={setComments}
                    placeholder="How was the service?"
                    placeholderTextColor="#9a9dad"
                    multiline
                  />
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Button
                        title="Cancel"
                        variant="ghost"
                        onPress={() => setRatingBookingId(null)}
                        disabled={submittingFeedback}
                      />
                    </View>
                    <View style={styles.flex}>
                      <Button
                        title={submittingFeedback ? "Sending..." : "Submit feedback"}
                        onPress={() => submitFeedback(booking.bookingId)}
                        disabled={submittingFeedback}
                        loading={submittingFeedback}
                      />
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
