import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Header } from "../components/Header";
import { services } from "../constants/catalog";
import { styles } from "../styles/appStyles";

export function HomeScreen({ user, onNavigate, onLogout, selectedService, setSelectedService }) {
  function confirmLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => onLogout?.() }
    ]);
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.homeHeaderRow}>
        <View style={styles.flex}>
          <Header title={`Welcome${user?.name ? `, ${user.name}` : ""}`} subtitle="Your garage, bookings, and service health at a glance." />
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promo}>
        <View style={styles.promoText}>
          <Text style={styles.promoKicker}>Care plan</Text>
          <Text style={styles.promoTitle}>Flat 20% off on periodic service</Text>
          <Text style={styles.promoSub}>Priority doorstep pickup available today.</Text>
        </View>
        <View style={styles.carShape}>
          <View style={styles.carTop} />
          <View style={styles.carBody} />
          <View style={styles.wheels}>
            <View style={styles.wheel} />
            <View style={styles.wheel} />
          </View>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("vehicles")}>
          <Text style={styles.quickIcon}>CAR</Text>
          <Text style={styles.quickText}>My Vehicles</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("addresses")}>
          <Text style={styles.quickIcon}>PIN</Text>
          <Text style={styles.quickText}>Addresses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate("booking")}>
          <Text style={styles.quickIcon}>CAL</Text>
          <Text style={styles.quickText}>Book Service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
        <Text style={styles.linkText}>See all</Text>
      </View>
      <View style={styles.serviceList}>
        {services.map(service => (
          <TouchableOpacity
            key={service.id}
            activeOpacity={0.86}
            onPress={() => {
              setSelectedService(service);
              onNavigate("booking");
            }}
            style={[styles.serviceCard, selectedService?.id === service.id && styles.selectedCard]}
          >
            <Text style={styles.serviceIcon}>{service.icon}</Text>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceMeta}>
                {service.time} | {service.price}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
