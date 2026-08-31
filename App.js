import React, { useMemo, useState } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { clearAuthToken } from "./src/api/client";
import { BottomTabs } from "./src/components/BottomTabs";
import { AuthScreen } from "./src/screens/AuthScreen";
import { AccountScreen } from "./src/screens/AccountScreen";
import { AddressesScreen } from "./src/screens/AddressesScreen";
import { BookingScreen } from "./src/screens/BookingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { HelpScreen } from "./src/screens/HelpScreen";
import { PartnerJobDetailScreen } from "./src/screens/PartnerJobDetailScreen";
import { PartnerJobsScreen } from "./src/screens/PartnerJobsScreen";
import { PlanDetailScreen } from "./src/screens/PlanDetailScreen";
import { PaymentScreen } from "./src/screens/PaymentScreen";
import { ServicesScreen } from "./src/screens/ServicesScreen";
import { TrackScreen } from "./src/screens/TrackScreen";
import { VehiclesScreen } from "./src/screens/VehiclesScreen";
import { styles } from "./src/styles/appStyles";
import { colors } from "./src/theme";
import { FeedbackProvider } from "./src/feedback";

function isPartner(user) {
  return String(user?.roleName || "").toLowerCase().includes("partner");
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [partnerTab, setPartnerTab] = useState("jobs");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPartnerJobId, setSelectedPartnerJobId] = useState(null);
  const [screen, setScreen] = useState("root");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingBookingPlanId, setPendingBookingPlanId] = useState(null);

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    setTab("home");
    setPartnerTab("jobs");
    setScreen("root");
    setSelectedService(null);
    setSelectedPartnerJobId(null);
    setPaymentInfo(null);
    setPendingBookingPlanId(null);
  }

  function bumpRefresh() {
    setRefreshKey(key => key + 1);
  }

  function patchUser(partial) {
    setUser(current => (current ? { ...current, ...partial } : current));
  }

  const content = useMemo(() => {
    if (!user) {
      return <AuthScreen onSignedIn={setUser} />;
    }

    if (isPartner(user)) {
      if (screen === "partnerJobDetail" && selectedPartnerJobId) {
        return (
          <PartnerJobDetailScreen
            bookingId={selectedPartnerJobId}
            onBack={() => {
              setSelectedPartnerJobId(null);
              setScreen("root");
            }}
            onChanged={bumpRefresh}
          />
        );
      }

      if (partnerTab === "account") {
        return (
          <AccountScreen
            user={user}
            refreshKey={refreshKey}
            onLogout={handleLogout}
            onUserUpdated={patchUser}
            onNavigate={next => {
              if (next === "jobs") {
                setPartnerTab("jobs");
                setScreen("root");
              }
            }}
            onOpenJob={id => {
              setSelectedPartnerJobId(id);
              setScreen("partnerJobDetail");
            }}
          />
        );
      }

      return (
        <PartnerJobsScreen
          user={user}
          refreshKey={refreshKey}
          todayOnly={partnerTab === "schedule"}
          onOpenJob={id => {
            setSelectedPartnerJobId(id);
            setScreen("partnerJobDetail");
          }}
        />
      );
    }

    if (screen === "planDetail" && selectedService) {
      return (
        <PlanDetailScreen
          service={selectedService}
          onBack={() => setScreen("root")}
          onOrderCreated={info => {
            setPaymentInfo(info);
            setScreen("payment");
          }}
        />
      );
    }

    if (screen === "payment" && paymentInfo) {
      return (
        <PaymentScreen
          user={user}
          paymentInfo={paymentInfo}
          onBack={() => setScreen("planDetail")}
          onPaymentSuccess={() => {
            setPaymentInfo(null);
            setScreen("root");
            setTab("home");
            bumpRefresh();
          }}
        />
      );
    }

    if (tab === "vehicles") {
      return <VehiclesScreen />;
    }

    if (tab === "addresses") {
      return <AddressesScreen />;
    }

    if (tab === "services") {
      return (
        <ServicesScreen
          onOpenPlanDetail={service => {
            setSelectedService(service);
            setScreen("planDetail");
          }}
        />
      );
    }

    if (tab === "booking") {
      return (
        <BookingScreen
          refreshKey={refreshKey}
          pendingPlanId={pendingBookingPlanId}
          onPendingPlanConsumed={() => setPendingBookingPlanId(null)}
          onNavigate={next => {
            if (next === "track" || next === "home") {
              bumpRefresh();
            }
            setTab(next);
            setScreen("root");
          }}
        />
      );
    }

    if (tab === "track") {
      return <TrackScreen refreshKey={refreshKey} />;
    }

    if (tab === "help") {
      return (
        <HelpScreen
          onBack={() => {
            setTab("account");
            setScreen("root");
          }}
        />
      );
    }

    if (tab === "account") {
      return (
        <AccountScreen
          user={user}
          refreshKey={refreshKey}
          onLogout={handleLogout}
          onUserUpdated={patchUser}
          onNavigate={next => {
            setTab(next);
            setScreen("root");
          }}
        />
      );
    }

    return (
      <HomeScreen
        user={user}
        refreshKey={refreshKey}
        onNavigate={next => {
          setTab(next);
          setScreen("root");
        }}
        onOpenServices={() => {
          setTab("services");
          setScreen("root");
        }}
      />
    );
  }, [
    partnerTab,
    paymentInfo,
    pendingBookingPlanId,
    refreshKey,
    screen,
    selectedPartnerJobId,
    selectedService,
    tab,
    user
  ]);

  const showCustomerTabs = Boolean(user) && !isPartner(user) && screen === "root";
  const showPartnerTabs =
    Boolean(user) && isPartner(user) && screen === "root";
  const showTabs = showCustomerTabs || showPartnerTabs;
  const bottomPad = showTabs ? Math.max(insets.bottom, 12) + 88 : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.wash} />
      <View style={[styles.appShell, { paddingBottom: showTabs ? 0 : bottomPad }]}>
        {content}
      </View>
      {showCustomerTabs ? (
        <BottomTabs
          variant="customer"
          bottomInset={Math.max(insets.bottom, 12)}
          activeTab={
            ["home", "services", "booking", "track", "account"].includes(tab) ? tab : "home"
          }
          onChange={next => {
            setTab(next);
            setScreen("root");
          }}
        />
      ) : null}
      {showPartnerTabs ? (
        <BottomTabs
          variant="partner"
          bottomInset={Math.max(insets.bottom, 12)}
          activeTab={
            ["jobs", "schedule", "account"].includes(partnerTab) ? partnerTab : "jobs"
          }
          onChange={next => {
            setPartnerTab(next);
            setScreen("root");
            setSelectedPartnerJobId(null);
          }}
        />
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FeedbackProvider>
        <AppShell />
      </FeedbackProvider>
    </SafeAreaProvider>
  );
}
