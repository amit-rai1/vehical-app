import React from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../styles/appStyles";

export function WelcomeScreen({ onContinue }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.welcomeRoot}>
      <StatusBar barStyle="light-content" backgroundColor="#103675" />
      <View style={[styles.welcomeHero, styles.welcomeHeroFallback]}>
        <View style={styles.welcomeOrbTop} />
        <View style={styles.welcomeOrbBottom} />
        <View
          style={[
            styles.welcomeOverlay,
            { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }
          ]}
        >
          <View style={styles.welcomeBrandBlock}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.welcomeLogo}
              resizeMode="contain"
              accessibilityLabel="MARKER"
            />
            <Text style={styles.welcomeBrandName}>MARKER</Text>
          </View>

          <View style={styles.welcomeCopyBlock}>
            <Text style={styles.welcomeHeadline}>Doorstep vehicle care</Text>
            <Text style={styles.welcomeSub}>
              Book washes and plans for your ride — partners at your door, on your schedule.
            </Text>
          </View>

          <TouchableOpacity style={styles.welcomeCta} onPress={onContinue} activeOpacity={0.88}>
            <Text style={styles.welcomeCtaText}>Log in or Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
