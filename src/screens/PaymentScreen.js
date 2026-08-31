import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { paymentApi } from "../api/client";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { styles } from "../styles/appStyles";

export function PaymentScreen({ user, paymentInfo, onBack, onPaymentSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const payment = paymentInfo?.payment;
  const amount = payment?.amount ?? 0;
  const currency = payment?.currency || "INR";
  const orderId = payment?.razorpayOrderId;
  const keyId = payment?.keyId;
  const amountLabel = Number.isFinite(Number(amount))
    ? `₹${Number(amount).toLocaleString("en-IN")}`
    : null;

  async function handlePay() {
    if (!orderId || !keyId) {
      Alert.alert("Payment error", "Missing payment order details.");
      return;
    }

    setSubmitting(true);

    try {
      const amountInSubunits = Math.round(Number(amount || 0) * 100);

      const options = {
        key: keyId,
        amount: String(amountInSubunits),
        currency,
        name: "Marker",
        description: paymentInfo?.plan?.name || "Service plan purchase",
        order_id: orderId,
        prefill: {
          name: user?.name || "",
          email: "",
          contact: user?.mobileNumber ? `+91${user.mobileNumber}` : ""
        },
        theme: { color: "#6d28d9" },
        retry: { enabled: true, max_count: 4 }
      };

      const data = await RazorpayCheckout.open(options);

      const confirm = await paymentApi.confirmRazorpay({
        razorpayOrderId: data.razorpay_order_id,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature
      });

      const message =
        confirm?.data?.activationMessage ||
        confirm?.message ||
        "Thanks for purchasing the plan.";

      Alert.alert("Purchase successful", message);
      onPaymentSuccess?.();
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        Alert.alert(
          "Payment failed",
          `${error.description || "Unable to complete payment."}`
        );
      } else if (error?.message && error.message !== "User cancelled the payment") {
        Alert.alert("Payment failed", error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="Review & pay" subtitle="Confirm your plan purchase." />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Order summary</Text>
        <Text style={styles.listTitle}>{paymentInfo?.plan?.name || "Service plan"}</Text>
        <Text style={[styles.listTitle, { marginTop: 6 }]}>
          {amountLabel || `${currency} ${amount ?? "--"}`}
        </Text>
        {paymentInfo?.preferredServiceTime ? (
          <Text style={styles.listSub}>
            Preferred time: {paymentInfo.preferredServiceTime}
          </Text>
        ) : null}
        <Text style={[styles.listSub, { marginTop: 8 }]}>
          Your plan activates 2 days after purchase at 12:01 AM.
        </Text>
        <Text style={styles.listSub}>Secure payment</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Back" variant="ghost" onPress={onBack} />
        </View>
        <View style={styles.flex}>
          <Button
            title={
              submitting
                ? "Processing..."
                : amountLabel
                  ? `Pay ${amountLabel}`
                  : "Complete purchase"
            }
            onPress={handlePay}
            disabled={submitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}
