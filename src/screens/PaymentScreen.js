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

  async function handlePay() {
    if (!orderId || !keyId) {
      Alert.alert("Payment error", "Missing Razorpay order details.");
      return;
    }

    setSubmitting(true);

    try {
      const amountInSubunits = Math.round(Number(amount || 0) * 100);

      const options = {
        key: keyId,
        amount: String(amountInSubunits),
        currency,
        name: "Vehicle Service Management",
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

      await paymentApi.confirmRazorpay({
        razorpayOrderId: data.razorpay_order_id,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature
      });

      Alert.alert("Payment success", "Your plan has been activated.");
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
      <Header title="Complete payment" subtitle="Securely pay for your service plan." />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Order summary</Text>
        <Text style={styles.listTitle}>
          {currency} {amount ?? "--"}
        </Text>
        <Text style={styles.listSub}>Order ID: {orderId || "Not available"}</Text>
        <Text style={styles.listSub}>
          You will be redirected to Razorpay to complete your payment using card, UPI,
          netbanking, wallet or other available methods.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Back" variant="ghost" onPress={onBack} />
        </View>
        <View style={styles.flex}>
          <Button
            title={submitting ? "Processing..." : "Pay with Razorpay"}
            onPress={handlePay}
            disabled={submitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}

