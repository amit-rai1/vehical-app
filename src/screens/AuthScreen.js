import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from "react-native";
import { authApi, setAuthToken } from "../api/client";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Field } from "../components/Field";
import { styles } from "../styles/appStyles";

export function AuthScreen({ onSignedIn }) {
  const [mobileNumber, setMobileNumber] = useState("7800356804");
  const [otp, setOtp] = useState("654321");
  const [step, setStep] = useState("mobile");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("customer");
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
    latitude: "18.5204",
    longitude: "73.8567",
    aadharNumber: ""
  });

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  async function sendOtp() {
    setLoading(true);
    try {
      await authApi.sendOtp(mobileNumber);
      setStep("otp");
    } catch (error) {
      Alert.alert("OTP could not be sent", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    try {
      const response = await authApi.verifyOtp(mobileNumber, otp);
      const data = response?.data || {};
      if (data.token) {
        setAuthToken(data.token);
        onSignedIn({ mobileNumber, name: form.name || "Customer", token: data.token, registered: true });
      } else {
        setStep("register");
      }
    } catch (error) {
      Alert.alert("OTP verification failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function register() {
    setLoading(true);
    try {
      const base = {
        name: form.name,
        mobileNumber,
        alternateContactNumber: form.alternateContactNumber,
        email: form.email,
        profileImage: ""
      };
      const payload =
        role === "customer"
          ? { ...base, gender: Number(form.gender || 1) }
          : {
              ...base,
              address: form.address,
              city: form.city,
              state: form.state,
              country: form.country,
              pincode: form.pincode,
              latitude: Number(form.latitude || 0),
              longitude: Number(form.longitude || 0),
              aadharNumber: form.aadharNumber
            };
      const response = role === "customer" ? await authApi.registerCustomer(payload) : await authApi.registerPartner(payload);
      const token = response?.data?.token;
      if (token) setAuthToken(token);
      onSignedIn({ mobileNumber, name: form.name || "Customer", token, registered: true });
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>VS</Text>
          </View>
          <Text style={styles.authTitle}>Vehicle Service Management</Text>
          <Text style={styles.authCopy}>Book trusted doorstep service, manage vehicles, and track every visit from one place.</Text>

          {step === "mobile" ? (
            <View style={styles.panel}>
              <Field label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
              <Button title="Send OTP" loading={loading} onPress={sendOtp} />
            </View>
          ) : null}

          {step === "otp" ? (
            <View style={styles.panel}>
              <Field label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
              <Button title="Verify OTP" loading={loading} onPress={verifyOtp} />
              <Button title="Change Mobile" variant="ghost" onPress={() => setStep("mobile")} />
            </View>
          ) : null}

          {step === "register" ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Complete profile</Text>
              <View style={styles.row}>
                <Chip label="Customer" active={role === "customer"} onPress={() => setRole("customer")} />
                <Chip label="Partner" active={role === "partner"} onPress={() => setRole("partner")} />
              </View>
              <Field label="Full Name" value={form.name} onChangeText={value => update("name", value)} />
              <Field label="Email" value={form.email} onChangeText={value => update("email", value)} keyboardType="email-address" />
              <Field label="Alternate Contact" value={form.alternateContactNumber} onChangeText={value => update("alternateContactNumber", value)} keyboardType="phone-pad" />
              {role === "customer" ? (
                <Field label="Gender Id" value={form.gender} onChangeText={value => update("gender", value)} keyboardType="number-pad" />
              ) : (
                <>
                  <Field label="Workshop Address" value={form.address} onChangeText={value => update("address", value)} multiline />
                  <View style={styles.twoCol}>
                    <Field label="City" value={form.city} onChangeText={value => update("city", value)} />
                    <Field label="State" value={form.state} onChangeText={value => update("state", value)} />
                  </View>
                  <View style={styles.twoCol}>
                    <Field label="Pincode" value={form.pincode} onChangeText={value => update("pincode", value)} keyboardType="number-pad" />
                    <Field label="Aadhar Number" value={form.aadharNumber} onChangeText={value => update("aadharNumber", value)} keyboardType="number-pad" />
                  </View>
                </>
              )}
              <Button title={`Register ${role}`} loading={loading} onPress={register} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
