import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { FormField } from "../../src/components/ui/FormField";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecureLogo } from "../../src/components/ui/SecureLogo";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordRoute() {
  const [email, setEmail] = useState("");

  function handleSendResetLink() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Forgot Password", "Please enter your email address.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      Alert.alert("Forgot Password", "Please enter a valid email address.");
      return;
    }

    Alert.alert("Forgot Password", "Password reset link sent successfully.");
  }

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <View style={styles.brandRow}>
        <SecureLogo size={40} radius={12} iconSize={22} />
        <Text style={styles.brandText}>VAFPQR</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we will send you a password reset link.
        </Text>
      </View>

      <FormField
        label="EMAIL ADDRESS"
        icon="user"
        value={email}
        onChangeText={setEmail}
        placeholder="alex@example.com"
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <GradientButton
        label="Send Reset Link"
        onPress={handleSendResetLink}
        variant="blue"
        style={styles.sendButton}
      />

      <Pressable
        style={styles.backButton}
        onPress={() => router.replace("/(public)/login")}
      >
        <Feather name="arrow-left" size={15} color={colors.blue300} />
        <Text style={styles.backText}>Back to Sign In</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 18,
    paddingBottom: 32,
    backgroundColor: colors.background
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 34
  },
  brandText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: 1.5
  },
  header: {
    marginBottom: 28
  },
  title: {
    ...typography.h1,
    color: colors.white,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800"
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.blue300,
    marginTop: 8
  },
  sendButton: {
    shadowColor: colors.blue600
  },
  backButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 16
  },
  backText: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  }
});
