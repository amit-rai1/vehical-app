import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { addressApi } from "../api/client";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Header } from "../components/Header";
import { Select } from "../components/Select";
import {
  LocationMapPicker,
  getCurrentCoordinates,
  reverseGeocode
} from "../components/LocationMapPicker";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

const ADDRESS_TYPES = [
  { value: "Home", label: "🏠 Home" },
  { value: "Office", label: "🏢 Office" },
  { value: "Other", label: "📌 Other" }
];

const DEFAULT_LAT = "18.5204";
const DEFAULT_LNG = "73.8567";

const ADDRESS_TYPE_BADGE = {
  Home: "HM",
  Office: "OF",
  Other: "OT"
};

const EMPTY_FORM = {
  addressType: "Home",
  contactPersonName: "",
  mobileNumber: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LNG,
  isDefault: false
};

export function AddressesScreen() {
  const [addresses, setAddresses] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const loadAddresses = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await addressApi.list();
      const data = response?.data?.records || response?.data?.items || response?.data || [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Failed to load addresses:", error.message);
      setAddresses([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  }

  function startAdd() {
    resetForm();
    // First address becomes default automatically per business rules.
    setForm(current => ({ ...current, isDefault: addresses.length === 0 }));
    setShowForm(true);
  }

  function startEdit(address) {
    setEditingId(address.addressId);
    setForm({
      addressType: address.addressType || "Home",
      contactPersonName: address.contactPersonName || "",
      mobileNumber: address.mobileNumber || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "India",
      pincode: address.pincode ? String(address.pincode) : "",
      latitude: address.latitude ? String(address.latitude) : DEFAULT_LAT,
      longitude: address.longitude ? String(address.longitude) : DEFAULT_LNG,
      isDefault: address.isDefault || false
    });
    setShowForm(true);
  }

  function applyLocation(latitude, longitude, addressHint) {
    setForm(current => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
      city: addressHint?.city || "",
      state: addressHint?.state || "",
      country: addressHint?.country || "India",
      pincode: addressHint?.pincode || "",
      addressLine1: addressHint?.addressLine || addressHint?.displayName || ""
    }));
  }

  async function detectLocation() {
    setLocating(true);
    try {
      const coords = await getCurrentCoordinates();
      const hint = await reverseGeocode(coords.latitude, coords.longitude);
      applyLocation(coords.latitude, coords.longitude, hint);
    } catch (error) {
      Alert.alert(
        "Location unavailable",
        error.message || "Could not get your location. Please pick on the map."
      );
    } finally {
      setLocating(false);
    }
  }

  async function saveAddress() {
    if (!form.contactPersonName) {
      Alert.alert("Missing field", "Please enter a contact person name.");
      return;
    }
    if (!form.mobileNumber) {
      Alert.alert("Missing field", "Please enter a mobile number.");
      return;
    }
    if (!form.addressLine1) {
      Alert.alert("Missing field", "Please enter address line 1.");
      return;
    }
    if (!form.city) {
      Alert.alert("Missing field", "Please enter a city.");
      return;
    }
    if (!form.pincode) {
      Alert.alert("Missing field", "Please enter a pincode.");
      return;
    }
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      Alert.alert("Location required", "Please set location with current GPS or pick on map.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        // First address becomes default automatically; server enforces single default.
        isDefault: editingId ? form.isDefault : addresses.length === 0 ? true : form.isDefault
      };

      if (editingId) {
        await addressApi.update(editingId, payload);
        Alert.alert("Address updated", "Your address was updated successfully.");
      } else {
        await addressApi.create(payload);
        Alert.alert("Address saved", "This address is ready for bookings.");
      }
      resetForm();
      await loadAddresses();
    } catch (error) {
      Alert.alert(editingId ? "Update failed" : "Save failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(address) {
    Alert.alert(
      "Delete Address",
      `Remove ${address.addressType || ""} address?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAddress(address.addressId)
        }
      ]
    );
  }

  async function deleteAddress(id) {
    setActionLoadingId(id);
    try {
      await addressApi.remove(id);
      await loadAddresses();
    } catch (error) {
      Alert.alert("Delete failed", error.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function setDefaultAddress(id) {
    setActionLoadingId(id);
    try {
      await addressApi.makeDefault(id);
      await loadAddresses();
    } catch (error) {
      Alert.alert("Failed to set default", error.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <>
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="My Addresses" subtitle="Pickup and drop locations for service bookings." />

      {!showForm ? (
        <Button title="+ Add Address" onPress={startAdd} />
      ) : (
        <View style={styles.panel}>
          <View style={styles.formHeader}>
            <Text style={styles.panelTitle}>
              {editingId ? "Edit Address" : "Add Address"}
            </Text>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.linkText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Select
            label="Address Type"
            placeholder="Select type"
            options={ADDRESS_TYPES}
            value={form.addressType}
            onChange={(value) => update("addressType", value)}
            searchable={false}
          />

          <Field
            label="Contact Person Name"
            value={form.contactPersonName}
            onChangeText={value => update("contactPersonName", value)}
            placeholder="John Doe"
          />
          <Field
            label="Mobile Number"
            value={form.mobileNumber}
            onChangeText={value => update("mobileNumber", value)}
            keyboardType="phone-pad"
            placeholder="9876543210"
          />
          <Field
            label="Address Line 1"
            value={form.addressLine1}
            onChangeText={value => update("addressLine1", value)}
            placeholder="Street / Building"
          />
          <Field
            label="Address Line 2"
            value={form.addressLine2}
            onChangeText={value => update("addressLine2", value)}
            placeholder="Flat / Floor (optional)"
          />
          <Field
            label="Landmark"
            value={form.landmark}
            onChangeText={value => update("landmark", value)}
            placeholder="Near Mall"
          />
          <View style={styles.twoCol}>
            <Field
              label="City"
              value={form.city}
              onChangeText={value => update("city", value)}
              placeholder="Pune"
            />
            <Field
              label="State"
              value={form.state}
              onChangeText={value => update("state", value)}
              placeholder="Maharashtra"
            />
          </View>
          <View style={styles.twoCol}>
            <Field
              label="Pincode"
              value={form.pincode}
              onChangeText={value => update("pincode", value)}
              keyboardType="number-pad"
              placeholder="411001"
            />
            <Field
              label="Country"
              value={form.country}
              onChangeText={value => update("country", value)}
              placeholder="India"
            />
          </View>

          <View style={styles.geoSectionHeader}>
            <Text style={styles.label}>Location on map</Text>
            <TouchableOpacity
              style={[styles.geoDetectBtn, locating && styles.geoDetectBtnDisabled]}
              onPress={detectLocation}
              disabled={locating}
            >
              {locating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.geoDetectText}>Current location</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.locationSummary}>
            <Text style={styles.listSub}>
              {form.latitude && form.longitude
                ? `${Number(form.latitude).toFixed(6)}, ${Number(form.longitude).toFixed(6)}`
                : "No coordinates set"}
            </Text>
            <Text style={styles.geoHint}>
              Use your current GPS position or pick a pin on the free OpenStreetMap.
            </Text>
            <View style={styles.locationActionsRow}>
              <TouchableOpacity style={styles.geoDetectBtn} onPress={() => setMapVisible(true)}>
                <Text style={styles.geoDetectText}>Pick on map</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => update("isDefault", !form.isDefault)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, form.isDefault && styles.checkboxActive]} />
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity>

          <Button
            title={editingId ? "Update Address" : "Save Address"}
            loading={saving}
            onPress={saveAddress}
          />
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        {addresses.length > 0 ? (
          <Text style={styles.countPill}>{addresses.length}</Text>
        ) : null}
      </View>

      {loadingList ? (
        <ActivityIndicator color={colors.primary} size="large" style={styles.bigLoader} />
      ) : addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>No addresses yet</Text>
          <Text style={styles.emptySub}>Add your first address to get started.</Text>
        </View>
      ) : (
        addresses.map(address => {
          const isActioning = actionLoadingId === address.addressId;
          return (
            <View key={address.addressId} style={styles.listItem}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {ADDRESS_TYPE_BADGE[address.addressType] || "AD"}
                </Text>
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>
                  {address.addressType} | {address.contactPersonName}
                </Text>
                <Text style={styles.listSub}>
                  {address.fullAddress ||
                    `${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}`}
                </Text>
                <Text style={styles.listSub}>
                  📞 {address.mobileNumber}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => startEdit(address)}
                    disabled={isActioning}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(address)}
                    disabled={isActioning}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionDeleteText}>Delete</Text>
                  </TouchableOpacity>
                  {!address.isDefault ? (
                    <TouchableOpacity
                      onPress={() => setDefaultAddress(address.addressId)}
                      disabled={isActioning}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              {isActioning ? (
                <ActivityIndicator color={colors.primary} />
              ) : address.isDefault ? (
                <Text style={styles.defaultPill}>Default</Text>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>

      <LocationMapPicker
        visible={mapVisible}
        initialLatitude={form.latitude}
        initialLongitude={form.longitude}
        onClose={() => setMapVisible(false)}
        onConfirm={({ latitude, longitude, addressHint }) => {
          applyLocation(latitude, longitude, addressHint);
          setMapVisible(false);
        }}
      />
    </>
  );
}