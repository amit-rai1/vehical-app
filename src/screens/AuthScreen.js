import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { authApi, setAuthToken } from "../api/client";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Field } from "../components/Field";
import {
  LocationMapPicker,
  getCurrentCoordinates,
  reverseGeocode
} from "../components/LocationMapPicker";
import { useFeedback } from "../feedback";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

const RESEND_COOLDOWN_SECONDS = 15;
const OTP_EXPIRY_SECONDS = 5 * 60;
const MAX_OTP_SENDS = 3;
const SEND_WINDOW_MS = 1 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 3;

function normalizeRole(roleName) {
  const value = String(roleName || "").toLowerCase();
  if (value.includes("partner")) return "Partner";
  if (value.includes("customer")) return "Customer";
  return roleName || "";
}

function formatMmSs(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseWaitSeconds(message) {
  const match = String(message || "").match(/wait\s+(\d+)\s+seconds/i);
  return match ? Number(match[1]) : null;
}

export function AuthScreen({ onSignedIn }) {
  const { showLoading, hideLoading, success, error, info } = useFeedback();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("mobile");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("customer");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [verifyAttemptsLeft, setVerifyAttemptsLeft] = useState(MAX_VERIFY_ATTEMPTS);
  const [otpHint, setOtpHint] = useState("");
  const [sendHistory, setSendHistory] = useState([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationPicked, setLocationPicked] = useState(false);
  const [profilePreviewUri, setProfilePreviewUri] = useState(null);
  const [form, setForm] = useState({
    name: "",
    alternateContactNumber: "",
    email: "",
    gender: "1",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    latitude: "",
    longitude: "",
    idProofNumber: "",
    profileImage: ""
  });

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const tickActive = resendCooldown > 0 || otpExpiresIn > 0;

  useEffect(() => {
    if (!tickActive) return undefined;
    const timer = setInterval(() => {
      setResendCooldown(current => (current > 0 ? current - 1 : 0));
      setOtpExpiresIn(current => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [tickActive]);

  const recentSendCount = useMemo(() => {
    const cutoff = Date.now() - SEND_WINDOW_MS;
    return sendHistory.filter(ts => ts >= cutoff).length;
  }, [sendHistory, tickActive, step]);

  function startOtpTimers(cooldownSeconds = RESEND_COOLDOWN_SECONDS) {
    setResendCooldown(cooldownSeconds);
    setOtpExpiresIn(OTP_EXPIRY_SECONDS);
    setVerifyAttemptsLeft(MAX_VERIFY_ATTEMPTS);
    setOtpHint("");
    setOtp("");
  }

  function buildUserSession(data, overrides = {}) {
    return {
      userId: data?.userId ?? null,
      mobileNumber,
      name: overrides.name || data?.name || form.name || "User",
      token: data?.token || null,
      roleId: data?.roleId ?? null,
      roleName: normalizeRole(data?.roleName) || overrides.roleName || "",
      partnerStatus: data?.partnerStatus ?? null,
      registered: true
    };
  }

  function resetToMobile() {
    setStep("mobile");
    setOtp("");
    setOtpHint("");
    setResendCooldown(0);
    setOtpExpiresIn(0);
    setVerifyAttemptsLeft(MAX_VERIFY_ATTEMPTS);
    setLocationPicked(false);
    setProfilePreviewUri(null);
    setForm(current => ({
      ...current,
      profileImage: "",
      idProofNumber: "",
      latitude: "",
      longitude: ""
    }));
  }

  async function pickImageAsDataUri({ allowsEditing = false, aspect } = {}) {
    return new Promise(resolve => {
      Alert.alert("Add photo", "Choose source", [
        {
          text: "Camera",
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              error("Permission needed", "Allow camera access to take a photo.");
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing,
              aspect,
              quality: 0.55,
              base64: true
            });
            if (result.canceled || !result.assets?.length || !result.assets[0].base64) {
              resolve(null);
              return;
            }
            const asset = result.assets[0];
            resolve({
              uri: asset.uri,
              dataUri: `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
            });
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              error("Permission needed", "Allow photo library access.");
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing,
              aspect,
              quality: 0.55,
              base64: true
            });
            if (result.canceled || !result.assets?.length || !result.assets[0].base64) {
              resolve(null);
              return;
            }
            const asset = result.assets[0];
            resolve({
              uri: asset.uri,
              dataUri: `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
            });
          }
        },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) }
      ]);
    });
  }

  async function pickProfileImage() {
    const picked = await pickImageAsDataUri({ allowsEditing: true, aspect: [1, 1] });
    if (!picked) return;
    setProfilePreviewUri(picked.uri);
    update("profileImage", picked.dataUri);
  }

  async function sendOtp({ isResend = false } = {}) {
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      await error("Invalid mobile", "Enter a valid 10-digit Indian mobile number.");
      return;
    }

    const cutoff = Date.now() - SEND_WINDOW_MS;
    const recent = sendHistory.filter(ts => ts >= cutoff);
    if (recent.length >= MAX_OTP_SENDS) {
      await error(
        "OTP limit reached",
        "Too many OTP requests. Please try again after 1 minute."
      );
      setSendHistory(recent);
      return;
    }

    if (isResend && resendCooldown > 0) {
      await info("Please wait", `You can resend OTP in ${resendCooldown} seconds.`);
      return;
    }

    setLoading(true);
    showLoading("Sending OTP…");
    try {
      await authApi.sendOtp(mobileNumber);
      setSendHistory([...recent, Date.now()]);
      startOtpTimers(RESEND_COOLDOWN_SECONDS);
      setStep("otp");
    } catch (err) {
      const waitSeconds = parseWaitSeconds(err.message);
      if (waitSeconds != null) {
        setResendCooldown(waitSeconds);
        setStep("otp");
      }
      await error("OTP could not be sent", err.message);
    } finally {
      hideLoading();
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!/^\d{6}$/.test(otp)) {
      await error("Invalid OTP", "Enter the 6-digit OTP sent to your mobile.");
      return;
    }

    if (otpExpiresIn <= 0) {
      await error("OTP expired", "This OTP has expired. Please request a new OTP.");
      return;
    }

    if (verifyAttemptsLeft <= 0) {
      await error(
        "Attempts exceeded",
        "Maximum OTP attempts exceeded. Please request a new OTP."
      );
      return;
    }

    setLoading(true);
    showLoading("Verifying OTP…");
    try {
      const response = await authApi.verifyOtp(mobileNumber, otp);
      const data = response?.data || {};

      if (data.token) {
        const roleName = normalizeRole(data.roleName);
        if (role === "partner" && roleName === "Customer") {
          await info(
            "Wrong account type",
            "This mobile is registered as a Customer. Switch to Customer to continue."
          );
          return;
        }
        if (role === "customer" && roleName === "Partner") {
          await info(
            "Wrong account type",
            "This mobile is registered as a Partner. Switch to Partner to continue."
          );
          return;
        }

        setAuthToken(data.token);
        onSignedIn(
          buildUserSession(data, {
            name: data.name || form.name || (roleName === "Partner" ? "Partner" : "Customer"),
            roleName
          })
        );
        return;
      }

      if (data.isRegistered === false) {
        setStep("register");
        return;
      }

      await error("Login failed", response?.message || "Unable to verify OTP.");
    } catch (err) {
      const message = err.message || "Unable to verify OTP.";
      const remainingMatch = message.match(/(\d+)\s+attempt/i);
      if (remainingMatch) {
        const remaining = Number(remainingMatch[1]);
        setVerifyAttemptsLeft(remaining);
        setOtpHint(`Invalid OTP. ${remaining} attempt(s) remaining.`);
      } else if (/maximum otp attempts/i.test(message) || /expired/i.test(message)) {
        setVerifyAttemptsLeft(0);
        setOtpExpiresIn(0);
        setOtpHint(message);
      } else {
        setVerifyAttemptsLeft(current => Math.max(0, current - 1));
        setOtpHint(message);
      }
      await error("OTP verification failed", message);
    } finally {
      hideLoading();
      setLoading(false);
    }
  }

  async function register() {
    if (!form.name.trim()) {
      await error("Name required", "Please enter your full name.");
      return;
    }
    if (!form.profileImage) {
      await error("Profile image required", "Please upload a profile photo to continue.");
      return;
    }

    if (role === "partner") {
      if (!form.address.trim()) {
        await error("Workshop address required", "Workshop address is mandatory for partners.");
        return;
      }
      if (!form.country.trim()) {
        await error("Country required", "Please enter your country.");
        return;
      }
      const lat = Number(form.latitude);
      const lng = Number(form.longitude);
      if (!locationPicked || !Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
        await error(
          "Workshop location required",
          "Please set your workshop location using current location or the map."
        );
        return;
      }
    }

    setLoading(true);
    showLoading("Submitting registration…");
    try {
      const base = {
        name: form.name.trim(),
        mobileNumber,
        alternateContactNumber: form.alternateContactNumber || null,
        email: form.email || null,
        profileImage: form.profileImage
      };

      if (role === "customer") {
        const response = await authApi.registerCustomer({
          ...base,
          gender: Number(form.gender || 1)
        });
        const data = response?.data || {};
        if (!data.token) {
          throw new Error(response?.message || "Registration succeeded but no token returned.");
        }
        setAuthToken(data.token);
        onSignedIn(
          buildUserSession(data, {
            name: form.name.trim(),
            roleName: "Customer"
          })
        );
        return;
      }

      const response = await authApi.registerPartner({
        ...base,
        address: form.address.trim(),
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        pincode: form.pincode || null,
        latitude: Number(form.latitude || 0),
        longitude: Number(form.longitude || 0),
        idProofNumber: form.idProofNumber.trim() || null
      });

      await success(
        "Registration submitted",
        response?.message ||
          "Partner registration submitted successfully. Waiting for administrator approval."
      );
      resetToMobile();
    } catch (err) {
      await error("Registration failed", err.message);
    } finally {
      hideLoading();
      setLoading(false);
    }
  }

  const canResend = resendCooldown <= 0 && recentSendCount < MAX_OTP_SENDS && !loading;

  return (
    <View style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.authContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../../assets/logo.png")}
            style={{
              width: 112,
              height: 96,
              resizeMode: "contain",
              alignSelf: "center",
              marginBottom: 18,
              backgroundColor: "#fff"
            }}
            accessibilityLabel="App logo"
          />

          <View style={[styles.rowWrap, styles.rolePicker]}>
            <Chip
              label="Customer"
              active={role === "customer"}
              onPress={() => setRole("customer")}
            />
            <Chip
              label="Partner"
              active={role === "partner"}
              onPress={() => setRole("partner")}
            />
          </View>

          {step === "mobile" ? (
            <View style={styles.panel}>
              <Field
                label="Mobile Number"
                value={mobileNumber}
                onChangeText={value => setMobileNumber(value.replace(/\D/g, "").slice(0, 10))}
                keyboardType="phone-pad"
                placeholder="10-digit mobile"
              />
              <Text style={styles.listSub}>
                Use a WhatsApp-enabled mobile number to register. OTP sent to this number.
              </Text>
              <Button
                title="Send OTP"
                loading={loading}
                disabled={loading || recentSendCount >= MAX_OTP_SENDS}
                onPress={() => sendOtp({ isResend: false })}
              />
              {recentSendCount >= MAX_OTP_SENDS ? (
                <Text style={[styles.listSub, { color: colors.danger, marginTop: 8 }]}>
                  Too many OTP requests for this number. Try again after 1 minute.
                </Text>
              ) : null}
            </View>
          ) : null}

          {step === "otp" ? (
            <View style={styles.panel}>
              <Field
                label="OTP"
                value={otp}
                onChangeText={value => setOtp(value.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                placeholder="Enter 6-digit OTP"
              />
              <Text style={styles.listSub}>OTP sent to +91 {mobileNumber}</Text>
              <Text style={styles.listSub}>
                Expires in {formatMmSs(otpExpiresIn)}
                {otpExpiresIn <= 0 ? " · expired — resend required" : ""}
              </Text>
              <Text style={[styles.listSub, { marginBottom: 12 }]}>
                Verify attempts left: {verifyAttemptsLeft}/{MAX_VERIFY_ATTEMPTS}
              </Text>
              {otpHint ? (
                <Text style={[styles.listSub, { color: colors.danger, marginBottom: 8 }]}>
                  {otpHint}
                </Text>
              ) : null}
              <Button
                title="Verify OTP"
                loading={loading}
                disabled={loading || otpExpiresIn <= 0 || verifyAttemptsLeft <= 0}
                onPress={verifyOtp}
              />
              <View style={styles.otpLinkRow}>
                <TouchableOpacity
                  onPress={() => canResend && sendOtp({ isResend: true })}
                  disabled={!canResend}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Text
                    style={[
                      styles.otpLinkLeft,
                      !canResend && styles.otpLinkDisabled
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : recentSendCount >= MAX_OTP_SENDS
                        ? "OTP limit reached"
                        : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={resetToMobile}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Text style={styles.otpLinkRight}>Change Mobile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {step === "register" ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>
                Complete {role === "partner" ? "partner" : "customer"} profile
              </Text>
              <Text style={styles.listSub}>Mobile: +91 {mobileNumber}</Text>

              <Text style={styles.label}>Profile photo *</Text>
              <View style={styles.profileImageRow}>
                <View style={styles.profileImagePreview}>
                  {profilePreviewUri ? (
                    <Image source={{ uri: profilePreviewUri }} style={styles.profileImage} />
                  ) : (
                    <Text style={styles.profileImagePlaceholder}>No photo</Text>
                  )}
                </View>
                <View style={styles.flex}>
                  <Button title="Upload photo" compact onPress={pickProfileImage} />
                  {form.profileImage ? (
                    <TouchableOpacity
                      onPress={() => {
                        setProfilePreviewUri(null);
                        update("profileImage", "");
                      }}
                    >
                      <Text style={[styles.linkText, { marginTop: 8 }]}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <Field
                label="Full Name *"
                value={form.name}
                onChangeText={value => update("name", value)}
              />
              <Field
                label="Email"
                value={form.email}
                onChangeText={value => update("email", value)}
                keyboardType="email-address"
              />
              <Field
                label="Alternate Contact"
                value={form.alternateContactNumber}
                onChangeText={value => update("alternateContactNumber", value)}
                keyboardType="phone-pad"
              />
              {role === "customer" ? (
                <View style={styles.rowWrap}>
                  <Chip
                    label="Male"
                    active={form.gender === "1"}
                    onPress={() => update("gender", "1")}
                  />
                  <Chip
                    label="Female"
                    active={form.gender === "2"}
                    onPress={() => update("gender", "2")}
                  />
                  <Chip
                    label="Other"
                    active={form.gender === "3"}
                    onPress={() => update("gender", "3")}
                  />
                </View>
              ) : (
                <>
                  <Field
                    label="Workshop Address *"
                    value={form.address}
                    onChangeText={value => update("address", value)}
                    multiline
                  />
                  <View style={styles.twoCol}>
                    <Field
                      label="City"
                      value={form.city}
                      onChangeText={value => update("city", value)}
                    />
                    <Field
                      label="State"
                      value={form.state}
                      onChangeText={value => update("state", value)}
                    />
                  </View>
                  <View style={styles.twoCol}>
                    <Field
                      label="Pincode"
                      value={form.pincode}
                      onChangeText={value => update("pincode", value)}
                      keyboardType="number-pad"
                    />
                    <Field
                      label="Country *"
                      value={form.country}
                      onChangeText={value => update("country", value)}
                    />
                  </View>
                  <Field
                    label="Id proof number (optional)"
                    value={form.idProofNumber}
                    onChangeText={value => update("idProofNumber", value)}
                    autoCapitalize="characters"
                    maxLength={50}
                  />
                  <Text style={styles.listSub}>
                    Workshop address and location are mandatory. Id proof number is optional.
                  </Text>

                  <Text style={styles.label}>Workshop location *</Text>
                  <View style={styles.locationSummary}>
                    <Text style={styles.listSub}>
                      {locationPicked
                        ? `${Number(form.latitude).toFixed(6)}, ${Number(form.longitude).toFixed(6)}`
                        : "No location selected yet"}
                    </Text>
                    <View style={styles.locationActionsRow}>
                      <TouchableOpacity
                        style={[styles.geoDetectBtn, locating && styles.geoDetectBtnDisabled]}
                        disabled={locating}
                        onPress={async () => {
                          setLocating(true);
                          try {
                            const coords = await getCurrentCoordinates();
                            const hint = await reverseGeocode(
                              coords.latitude,
                              coords.longitude
                            );
                            setForm(current => ({
                              ...current,
                              latitude: String(coords.latitude),
                              longitude: String(coords.longitude),
                              city: hint?.city || "",
                              state: hint?.state || "",
                              country: hint?.country || "India",
                              pincode: hint?.pincode || "",
                              address: hint?.addressLine || hint?.displayName || ""
                            }));
                            setLocationPicked(true);
                          } catch (err) {
                            error("Location unavailable", err.message);
                          } finally {
                            setLocating(false);
                          }
                        }}
                      >
                        {locating ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.geoDetectText}>Use current location</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.geoDetectBtn}
                        onPress={() => setMapVisible(true)}
                      >
                        <Text style={styles.geoDetectText}>Pick on map</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              <Button
                title={role === "partner" ? "Register Partner" : "Register Customer"}
                loading={loading}
                onPress={register}
              />
              <Button title="Back to OTP" variant="ghost" onPress={() => setStep("otp")} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationMapPicker
        visible={mapVisible}
        initialLatitude={form.latitude || undefined}
        initialLongitude={form.longitude || undefined}
        onClose={() => setMapVisible(false)}
        onConfirm={({ latitude, longitude, addressHint }) => {
          setForm(current => ({
            ...current,
            latitude: String(latitude),
            longitude: String(longitude),
            city: addressHint?.city || "",
            state: addressHint?.state || "",
            country: addressHint?.country || "India",
            pincode: addressHint?.pincode || "",
            address: addressHint?.addressLine || addressHint?.displayName || ""
          }));
          setLocationPicked(true);
          setMapVisible(false);
        }}
      />
    </View>
  );
}
