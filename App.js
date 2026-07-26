import React, { useMemo, useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { clearAuthToken } from "./src/api/client";
import { BottomTabs } from "./src/components/BottomTabs";
import { services } from "./src/constants/catalog";
import { AuthScreen } from "./src/screens/AuthScreen";
import { AddressesScreen } from "./src/screens/AddressesScreen";
import { BookingScreen } from "./src/screens/BookingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { TrackScreen } from "./src/screens/TrackScreen";
import { VehiclesScreen } from "./src/screens/VehiclesScreen";
import { styles } from "./src/styles/appStyles";
import { colors } from "./src/theme";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [selectedService, setSelectedService] = useState(services[0]);

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    setTab("home");
  }

  const screen = useMemo(() => {
    if (!user) {
      return <AuthScreen onSignedIn={setUser} />;
    }

    if (tab === "vehicles") {
      return <VehiclesScreen />;
    }

    if (tab === "addresses") {
      return <AddressesScreen />;
    }

    if (tab === "booking") {
      return <BookingScreen selectedService={selectedService} onNavigate={setTab} />;
    }

    if (tab === "track") {
      return <TrackScreen />;
    }

    return (
      <HomeScreen
        user={user}
        onNavigate={setTab}
        onLogout={handleLogout}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />
    );
  }, [selectedService, tab, user]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.wash} />
      <View style={styles.appShell}>{screen}</View>
      {user ? <BottomTabs activeTab={tab} onChange={setTab} /> : null}
    </SafeAreaView>
  );
}
