import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { addressApi } from "../api/client";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Header } from "../components/Header";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

export function BookingScreen({ selectedService, onNavigate }) {
  const [slot, setSlot] = useState("09:00 AM");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setLoadingAddresses(true);
    try {
      const response = await addressApi.dropdown();
      const data = response?.data || response || [];
      if (Array.isArray(data)) {
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.warn("Failed to load address dropdown:", error.message);
    } finally {
      setLoadingAddresses(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="Book Service" subtitle="Choose a service slot and pickup location." />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{selectedService?.title || "General Service"}</Text>
        <Text style={styles.listSub}>
          Estimated time: {selectedService?.time || "45 min"} | {selectedService?.price || "From INR 799"}
        </Text>
        <Text style={styles.panelTitle}>Select time</Text>
        <View style={styles.rowWrap}>
          {["09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM"].map(time => (
            <Chip key={time} label={time} active={slot === time} onPress={() => setSlot(time)} />
          ))}
        </View>
        <Text style={styles.panelTitle}>Pickup Address</Text>
        {loadingAddresses ? (
          <ActivityIndicator color={colors.primary} style={styles.inlineLoader} />
        ) : addresses.length === 0 ? (
          <View style={styles.addressPreview}>
            <Text style={styles.emptySub}>No addresses found. Please add an address first.</Text>
          </View>
        ) : (
          <>
            {addresses.map(address => (
              <TouchableOpacity
                key={address.addressId}
                onPress={() => setSelectedAddress(address)}
                style={[
                  styles.addressPreview,
                  selectedAddress?.addressId === address.addressId && styles.selectedAddress
                ]}
              >
                <View style={styles.addressChipRow}>
                  <Text style={styles.listTitle}>{address.addressType}</Text>
                  {address.isDefault ? <Text style={styles.defaultPill}>Default</Text> : null}
                </View>
                <Text style={styles.listSub}>{address.fullAddress}</Text>
                <Text style={styles.listSub}>
                  {address.contactPersonName} | {address.mobileNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
        <Button title="Confirm Booking" onPress={() => onNavigate("track")} />
      </View>
    </ScrollView>
  );
}