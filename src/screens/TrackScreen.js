import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { bookingApi, feedbackApi, skipRequestApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { useFeedback } from "../feedback";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

const STATUS_STEPS = [
  { key: "Booked", match: [1, "Pending"] },
  { key: "Partner assigned", match: [2, "Confirmed"] },
  { key: "In progress", match: [3, "InProgress"] },
  { key: "Completed", match: [4, "Completed"] }
];

const SKIP_STATUS = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected"
};

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

function isCancelled(status) {
  return status === 5 || status === "Cancelled";
}

function isActiveBooking(status) {
  return !isCompleted(status) && !isCancelled(status);
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

function asRecords(payload) {
  const data = payload?.data;
  const rows = data?.records ?? data?.items ?? data;
  return Array.isArray(rows) ? rows : [];
}

function canRequestSkip(booking) {
  if (!booking?.scheduledAt) return false;
  if (!isActiveBooking(booking.status)) return false;
  const when = new Date(booking.scheduledAt).getTime();
  if (Number.isNaN(when)) return false;
  return when - Date.now() >= 24 * 60 * 60 * 1000;
}

function withinSkipWindowBlocked(booking) {
  if (!booking?.scheduledAt) return false;
  if (!isActiveBooking(booking.status)) return false;
  const when = new Date(booking.scheduledAt).getTime();
  if (Number.isNaN(when)) return false;
  return when - Date.now() < 24 * 60 * 60 * 1000;
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

function skipStatusLabel(status) {
  return SKIP_STATUS[status] || String(status || "");
}

export function TrackScreen({ refreshKey }) {
  const { showLoading, hideLoading, success, error, info } = useFeedback();
  const [bookings, setBookings] = useState([]);
  const [skipByBookingId, setSkipByBookingId] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingBookingId, setRatingBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [skipFormBookingId, setSkipFormBookingId] = useState(null);
  const [skipReason, setSkipReason] = useState("");
  const [submittingSkip, setSubmittingSkip] = useState(false);

  const loadTrackData = useCallback(async () => {
    showLoading("Loading bookings…");
    try {
      const [bookingsRes, skipsRes] = await Promise.all([
        bookingApi.list({ pageNumber: 1, pageSize: 50 }).catch(err => {
          console.warn("Failed to load bookings:", err.message);
          return null;
        }),
        skipRequestApi.list(1, 50).catch(err => {
          console.warn("Failed to load skip requests:", err.message);
          return null;
        })
      ]);

      if (bookingsRes) {
        setBookings(asRecords(bookingsRes));
      } else {
        setBookings([]);
      }

      if (skipsRes) {
        const skips = asRecords(skipsRes);
        const map = {};
        for (const skip of skips) {
          const bookingId = skip.serviceBookingId ?? skip.bookingId;
          if (bookingId == null) continue;
          const existing = map[bookingId];
          // Prefer Pending, else newest by requestedOn
          if (!existing) {
            map[bookingId] = skip;
            continue;
          }
          const existingPending =
            existing.status === 1 || existing.status === "Pending";
          const nextPending = skip.status === 1 || skip.status === "Pending";
          if (nextPending && !existingPending) {
            map[bookingId] = skip;
            continue;
          }
          const existingOn = new Date(existing.requestedOn || 0).getTime();
          const nextOn = new Date(skip.requestedOn || 0).getTime();
          if (nextOn >= existingOn) map[bookingId] = skip;
        }
        setSkipByBookingId(map);
      }
    } finally {
      hideLoading();
      setLoading(false);
      setRefreshing(false);
    }
  }, [showLoading, hideLoading]);

  useEffect(() => {
    setLoading(true);
    loadTrackData();
  }, [loadTrackData, refreshKey]);

  async function callPartner(mobile) {
    if (!mobile) {
      await info("No phone", "Partner mobile is not available yet.");
      return;
    }
    const tel = `tel:+91${String(mobile).replace(/\D/g, "")}`;
    try {
      await Linking.openURL(tel);
    } catch {
      await error("Unable to call", "Could not open the phone dialer.");
    }
  }

  function openRateForm(bookingId) {
    setRatingBookingId(bookingId);
    setRating(5);
    setComments("");
  }

  function openSkipForm(bookingId) {
    setSkipFormBookingId(bookingId);
    setSkipReason("");
    setRatingBookingId(null);
  }

  function closeSkipForm() {
    setSkipFormBookingId(null);
    setSkipReason("");
  }

  async function submitSkipRequest(bookingId) {
    const reason = skipReason.trim().slice(0, 500);
    setSubmittingSkip(true);
    showLoading("Submitting skip request…");
    try {
      await skipRequestApi.create({
        serviceBookingId: bookingId,
        reason: reason || "Unable to take service"
      });
      await success(
        "Skip request sent",
        "Waiting for admin approval. If approved, this booking is cancelled and your plan end date extends by 1 day."
      );
      closeSkipForm();
      await loadTrackData();
    } catch (err) {
      await error("Request failed", err.message || "Please try again.");
    } finally {
      hideLoading();
      setSubmittingSkip(false);
    }
  }

  async function submitFeedback(bookingId) {
    if (rating < 1 || rating > 5) {
      await info("Rating required", "Please choose 1 to 5 stars.");
      return;
    }
    setSubmittingFeedback(true);
    showLoading("Submitting feedback…");
    try {
      await feedbackApi.submit({
        bookingId,
        rating,
        comments: comments.trim() || null
      });
      await success("Thank you", "Your feedback was submitted.");
      setRatingBookingId(null);
      setComments("");
      await loadTrackData();
    } catch (err) {
      await error("Feedback failed", err.message || "Please try again.");
    } finally {
      hideLoading();
      setSubmittingFeedback(false);
    }
  }

  const subtitle = useMemo(
    () => "Track status, call partner, or request to skip (24h+ before).",
    []
  );

  if (loading) {
    return <View style={styles.flex} />;
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
            loadTrackData();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Header title="Track Service" subtitle={subtitle} />

      {bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySub}>
            When you book a service from an active plan, tracking details will show up here.
          </Text>
        </View>
      ) : (
        bookings.map(booking => {
          const bookingId = booking.bookingId;
          const activeIndex = statusIndex(booking.status, booking.partnerId);
          const cancelled = isCancelled(booking.status);
          const completed = isCompleted(booking.status);
          const showRate = completed && !booking.hasFeedback;
          const isRatingThis = ratingBookingId === bookingId;
          const isSkipForm = skipFormBookingId === bookingId;
          const skip = skipByBookingId[bookingId];
          const skipLabel = skip ? skipStatusLabel(skip.status) : null;
          const skipPending = skipLabel === "Pending";
          const eligibleSkip = canRequestSkip(booking) && !skipPending;
          const blockedBy24h = withinSkipWindowBlocked(booking) && !skipPending;

          return (
            <View key={bookingId} style={styles.panel}>
              <Text style={styles.panelTitle}>{booking.planName || "Service booking"}</Text>
              <Text style={styles.listSub}>
                #{bookingId} · {booking.vehicleName || "Vehicle"}
              </Text>
              <Text style={styles.listSub}>
                {formatWhen(booking.scheduledAt)} · {booking.addressSummary || "Address"}
              </Text>

              {skipLabel ? (
                <View
                  style={[
                    styles.skipStatusBadge,
                    skipPending && styles.skipStatusPending,
                    skipLabel === "Approved" && styles.skipStatusApproved,
                    skipLabel === "Rejected" && styles.skipStatusRejected
                  ]}
                >
                  <Text style={styles.skipStatusText}>
                    Skip request: {skipLabel}
                    {skip.adminNotes ? ` · ${skip.adminNotes}` : ""}
                  </Text>
                </View>
              ) : null}

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

              {skipPending ? (
                <Text style={[styles.listSub, { marginTop: 12, color: colors.primaryDark }]}>
                  Skip request pending — waiting for admin approval.
                </Text>
              ) : null}

              {blockedBy24h ? (
                <Text style={[styles.listSub, { marginTop: 12 }]}>
                  Skip requests must be raised at least 24 hours before the scheduled time.
                </Text>
              ) : null}

              {eligibleSkip && !isSkipForm ? (
                <TouchableOpacity
                  style={styles.skipCta}
                  onPress={() => openSkipForm(bookingId)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.skipCtaText}>Request to skip this service</Text>
                </TouchableOpacity>
              ) : null}

              {isSkipForm ? (
                <View style={styles.skipFormBox}>
                  <Text style={styles.panelTitle}>Skip this service</Text>
                  <Text style={styles.listSub}>
                    Submit at least 24 hours before. If admin approves, this booking is cancelled
                    and your plan end date extends by 1 day.
                  </Text>
                  <Text style={styles.label}>Reason (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={skipReason}
                    onChangeText={value => setSkipReason(value.slice(0, 500))}
                    placeholder="Why do you need to skip?"
                    placeholderTextColor="#9a9dad"
                    multiline
                    maxLength={500}
                  />
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Button
                        title="Cancel"
                        variant="ghost"
                        onPress={closeSkipForm}
                        disabled={submittingSkip}
                      />
                    </View>
                    <View style={styles.flex}>
                      <Button
                        title={submittingSkip ? "Sending..." : "Submit request"}
                        onPress={() => submitSkipRequest(bookingId)}
                        disabled={submittingSkip}
                        loading={submittingSkip}
                      />
                    </View>
                  </View>
                </View>
              ) : null}

              {completed && booking.hasFeedback ? (
                <Text style={[styles.listSub, { marginTop: 12 }]}>
                  Thanks — you already rated this service.
                </Text>
              ) : null}

              {showRate && !isRatingThis ? (
                <TouchableOpacity
                  style={styles.primaryCta}
                  onPress={() => openRateForm(bookingId)}
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
                        onPress={() => submitFeedback(bookingId)}
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
