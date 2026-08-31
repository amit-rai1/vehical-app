import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { partnerApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { Field } from "../components/Field";
import { useFeedback } from "../feedback";
import { styles } from "../styles/appStyles";

function bookingStatusLabel(status) {
  const value = String(status ?? "");
  if (value === "1" || value === "Pending") return "Pending";
  if (value === "2" || value === "Confirmed") return "Assigned";
  if (value === "3" || value === "InProgress") return "In progress";
  if (value === "4" || value === "Completed") return "Completed";
  if (value === "5" || value === "Cancelled") return "Cancelled";
  return value || "—";
}

function isStatus(status, ...matches) {
  const value = String(status ?? "");
  return matches.some(m => value === String(m));
}

function formatWhen(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return String(value);
  }
}

function toDataUri(raw) {
  if (!raw) return null;
  if (String(raw).startsWith("data:")) return String(raw);
  return `data:image/jpeg;base64,${raw}`;
}

export function PartnerJobDetailScreen({ bookingId, onBack, onChanged }) {
  const { showLoading, hideLoading, success, error, info } = useFeedback();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [pickedImages, setPickedImages] = useState([]);

  const loadJob = useCallback(async () => {
    setLoading(true);
    showLoading("Loading job…");
    try {
      const response = await partnerApi.getJob(bookingId);
      const data = response?.data || response;
      setJob(data || null);
      setNotes(data?.partnerCompletionNotes || "");
    } catch (err) {
      await error("Unable to load job", err.message || "Please try again.");
      onBack?.();
    } finally {
      hideLoading();
      setLoading(false);
    }
  }, [bookingId, onBack, showLoading, hideLoading, error]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  async function openNavigation() {
    if (!job) return;
    const lat = job.addressLatitude;
    const lng = job.addressLongitude;
    if (lat == null || lng == null) {
      await info("No location", "This address has no map coordinates.");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    try {
      await Linking.openURL(url);
    } catch {
      await error("Unable to open maps", "Please open Google Maps manually.");
    }
  }

  async function callCustomer() {
    const mobile = job?.customerMobile || job?.addressMobile;
    if (!mobile) {
      await info("No phone", "Customer mobile number is not available.");
      return;
    }
    const tel = `tel:+91${String(mobile).replace(/\D/g, "")}`;
    try {
      await Linking.openURL(tel);
    } catch {
      await error("Unable to call", "Could not open the phone dialer.");
    }
  }

  async function handleStart() {
    setBusy(true);
    showLoading("Starting service…");
    try {
      await partnerApi.startJob(bookingId);
      await success("Service started", "Customer tracking now shows In Progress.");
      onChanged?.();
      await loadJob();
    } catch (err) {
      await error("Unable to start", err.message || "Please try again.");
    } finally {
      hideLoading();
      setBusy(false);
    }
  }

  async function appendPickedAssets(assets) {
    const incoming = (assets || [])
      .filter(a => a.base64)
      .map(a => ({
        uri: a.uri,
        base64: `data:${a.mimeType || "image/jpeg"};base64,${a.base64}`
      }));

    if (!incoming.length) {
      await error("No images", "Could not read selected images. Try again.");
      return;
    }

    setPickedImages(prev => {
      const merged = [...prev, ...incoming].slice(0, 5);
      return merged.map((img, index) => ({
        ...img,
        displayOrder: index + 1
      }));
    });
  }

  async function promptAddPhotos() {
    if (pickedImages.length >= 5) {
      await info("Limit reached", "You can upload up to 5 photos.");
      return;
    }
    Alert.alert("Add service photo", "Choose how to add photos", [
      { text: "Take photo", onPress: () => takePhoto() },
      { text: "Choose from gallery", onPress: () => pickFromGallery() },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      await error("Permission needed", "Allow camera access to take service photos.");
      return;
    }

    const remaining = 5 - pickedImages.length;
    if (remaining <= 0) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true
    });

    if (result.canceled) return;
    await appendPickedAssets(result.assets);
  }

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      await error(
        "Permission needed",
        "Allow photo library access to upload service images."
      );
      return;
    }

    const remaining = 5 - pickedImages.length;
    if (remaining <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: remaining
    });

    if (result.canceled) return;
    await appendPickedAssets(result.assets);
  }

  async function handleComplete() {
    if (!pickedImages.length) {
      await info("Images required", "Upload at least one service photo before completing.");
      return;
    }

    setBusy(true);
    showLoading("Completing service…");
    try {
      await partnerApi.completeJob(bookingId, {
        notes: notes || null,
        images: pickedImages.map((img, index) => ({
          base64: img.base64,
          displayOrder: img.displayOrder || index + 1
        }))
      });
      await success("Service completed", "Customer tracking now shows Completed.");
      setPickedImages([]);
      onChanged?.();
      await loadJob();
    } catch (err) {
      await error("Unable to complete", err.message || "Please try again.");
    } finally {
      hideLoading();
      setBusy(false);
    }
  }

  if (loading) {
    return <View style={styles.flex} />;
  }

  if (!job) {
    return (
      <View style={[styles.flex, styles.content]}>
        <Header title="Job details" subtitle="Not found" />
        <Button title="Back" variant="ghost" onPress={onBack} />
      </View>
    );
  }

  const confirmed = isStatus(job.status, 2, "Confirmed");
  const inProgress = isStatus(job.status, 3, "InProgress");
  const completed = isStatus(job.status, 4, "Completed");
  const existingImages = Array.isArray(job.completionImages) ? job.completionImages : [];

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header
        title={job.planName || "Job details"}
        subtitle={bookingStatusLabel(job.status)}
      />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Customer</Text>
        <Text style={styles.listTitle}>{job.customerName || "—"}</Text>
        <Text style={styles.listSub}>+91 {job.customerMobile || "—"}</Text>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button title="Call" variant="ghost" onPress={callCustomer} />
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Service</Text>
        <Text style={styles.listSub}>When: {formatWhen(job.scheduledAt)}</Text>
        <Text style={styles.listSub}>
          Vehicle: {job.vehicleMakeModel || "—"} · {job.vehicleNumber || "—"}
        </Text>
        {job.vehicleColor ? <Text style={styles.listSub}>Color: {job.vehicleColor}</Text> : null}
        {job.planDescription ? (
          <Text style={styles.listSub}>{job.planDescription}</Text>
        ) : null}
        {job.notes ? <Text style={styles.listSub}>Notes: {job.notes}</Text> : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Location</Text>
        <Text style={styles.listTitle}>{job.addressType || "Address"}</Text>
        <Text style={styles.listSub}>{job.fullAddress || "—"}</Text>
        <Text style={styles.listSub}>
          Contact: {job.contactPersonName || "—"} · +91 {job.addressMobile || "—"}
        </Text>
        <Button title="Navigate" onPress={openNavigation} />
      </View>

      {confirmed ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Arrive & start</Text>
          <Text style={styles.emptySub}>
            When you reach the customer address, start the service. Customer Track will show In
            Progress.
          </Text>
          <Button
            title={busy ? "Starting..." : "Start service"}
            onPress={handleStart}
            disabled={busy}
            loading={busy}
          />
        </View>
      ) : null}

      {inProgress ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Complete service</Text>
          <Text style={styles.emptySub}>
            Upload at least one photo of the completed work before marking the job complete.
          </Text>
          <Button title="Add photos" variant="ghost" onPress={promptAddPhotos} disabled={busy} />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button title="Camera" variant="ghost" onPress={takePhoto} disabled={busy} />
            </View>
            <View style={styles.flex}>
              <Button title="Gallery" variant="ghost" onPress={pickFromGallery} disabled={busy} />
            </View>
          </View>
          {pickedImages.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleStrip}>
              {pickedImages.map((img, index) => (
                <Image
                  key={`${img.uri}-${index}`}
                  source={{ uri: img.uri }}
                  style={styles.partnerJobThumb}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.listSub}>No photos selected yet.</Text>
          )}
          <Field
            label="Completion notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="What was done"
            multiline
          />
          <Button
            title={busy ? "Completing..." : "Complete service"}
            onPress={handleComplete}
            disabled={busy || !pickedImages.length}
            loading={busy}
          />
        </View>
      ) : null}

      {completed ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Completed</Text>
          <Text style={styles.listSub}>Finished: {formatWhen(job.completedAt)}</Text>
          {job.partnerCompletionNotes ? (
            <Text style={styles.listSub}>{job.partnerCompletionNotes}</Text>
          ) : null}
          {existingImages.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleStrip}>
              {existingImages.map((raw, index) => (
                <Image
                  key={`done-${index}`}
                  source={{ uri: toDataUri(raw) }}
                  style={styles.partnerJobThumb}
                />
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      {completed ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Customer feedback</Text>
          {job.customerRating != null ? (
            <>
              <Text style={styles.listTitle}>
                {"★".repeat(Math.min(5, Number(job.customerRating) || 0))}
                {"☆".repeat(Math.max(0, 5 - (Number(job.customerRating) || 0)))}{" "}
                ({job.customerRating}/5)
              </Text>
              {job.customerFeedbackComments ? (
                <Text style={styles.listSub}>{job.customerFeedbackComments}</Text>
              ) : (
                <Text style={styles.listSub}>No written message.</Text>
              )}
              {job.customerFeedbackSubmittedOn ? (
                <Text style={styles.listSub}>
                  Submitted: {formatWhen(job.customerFeedbackSubmittedOn)}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.emptySub}>Customer has not rated this service yet.</Text>
          )}
        </View>
      ) : null}

      <Button title="Back" variant="ghost" onPress={onBack} />
    </ScrollView>
  );
}
