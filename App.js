import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, StatusBar, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
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

SplashScreen.preventAutoHideAsync().catch(() => {});

const CUSTOMER_TAB_KEYS = [
  "home",
  "services",
  "booking",
  "vehicles",
  "addresses",
  "track",
  "account"
];

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

  useEffect(() => {
    const onHardwareBack = () => {
      if (!user) {
        return false;
      }

      if (isPartner(user)) {
        if (screen === "partnerJobDetail") {
          setSelectedPartnerJobId(null);
          setScreen("root");
          return true;
        }
        if (partnerTab !== "jobs") {
          setPartnerTab("jobs");
          setScreen("root");
          return true;
        }
        return false;
      }

      if (screen === "payment") {
        setScreen("planDetail");
        return true;
      }
      if (screen === "planDetail") {
        setScreen("root");
        return true;
      }

      if (tab === "help") {
        setTab("account");
        setScreen("root");
        return true;
      }

      if (tab !== "home") {
        setTab("home");
        setScreen("root");
        return true;
      }

      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [user, screen, tab, partnerTab]);

  const content = useMemo(() => {
    if (!user) {
      return (
        <AuthScreen
          onSignedIn={nextUser => {
            setUser(nextUser);
            setTab("home");
            setScreen("root");
            bumpRefresh();
          }}
        />
      );
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
          activeTab={CUSTOMER_TAB_KEYS.includes(tab) ? tab : "home"}
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
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    setAppReady(true);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (!appReady) return;
    await SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <FeedbackProvider>
        <AppShell />
      </FeedbackProvider>
    </SafeAreaProvider>
  );
}
