import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { FormField } from "../../src/components/ui/FormField";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterRoute() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openTerms(event) {
    event?.stopPropagation?.();
    router.push("/(public)/terms-of-service");
  }

  function openPrivacy(event) {
    event?.stopPropagation?.();
    router.push("/(public)/privacy-policy");
  }

  async function handleCreateAccount() {
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp({ fullName, email, phoneNumber, password });
      router.replace({ pathname: "/(public)/login", params: { registered: "1" } });
    } catch (err) {
      console.error("register failed:", err);
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <Feather name="arrow-left" size={16} color={colors.blue300} />
        <Text style={styles.backText}>Back to Login</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join VAFPQR for protected QR scanning</Text>
      </View>

      <FormField
        label="FULL NAME"
        icon="user"
        value={fullName}
        onChangeText={(text) => {
          setFullName(text);
          setError("");
        }}
        placeholder="Name"
        autoCapitalize="words"
        textContentType="name"
      />
      <FormField
        label="EMAIL ADDRESS"
        icon="globe"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        placeholder="E-mail"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <FormField
        label="PHONE NUMBER (OPTIONAL)"
        icon="phone"
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          setError("");
        }}
        placeholder="+65 XXXX XXXX"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />
      <FormField
        label="PASSWORD"
        icon="lock"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError("");
        }}
        placeholder="Min. 8 characters"
        secureTextEntry
        textContentType="newPassword"
      />
      <FormField
        label="CONFIRM PASSWORD"
        icon="lock"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setError("");
        }}
        placeholder="Repeat password"
        secureTextEntry
        textContentType="newPassword"
        style={styles.lastField}
      />

      <Pressable
        style={styles.termsRow}
        onPress={() => {
          setAgreeTerms((current) => !current);
          setError("");
        }}
      >
        <View style={[styles.checkbox, agreeTerms ? styles.checkboxChecked : null]}>
          {agreeTerms ? <Feather name="check" size={13} color={colors.white} /> : null}
        </View>
        <Text style={styles.termsText}>
          I agree to the{" "}
          <Text style={styles.linkText} onPress={openTerms}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={styles.linkText} onPress={openPrivacy}>
            Privacy Policy
          </Text>.
        </Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <GradientButton
        label="Create Secure Account"
        onPress={handleCreateAccount}
        loading={loading}
        variant="blue"
      />

      <Text style={styles.bottomText}>
        Already have an account?{" "}
        <Text style={styles.bottomLink} onPress={() => router.replace("/(public)/login")}>
          Sign In
        </Text>
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: 30,
    backgroundColor: colors.background
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 22
  },
  backText: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  header: {
    marginBottom: 20
  },
  title: {
    ...typography.h1,
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800"
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.blue300,
    marginTop: 2
  },
  lastField: {
    marginBottom: 12
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.blue500,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  checkboxChecked: {
    backgroundColor: colors.blue500
  },
  termsText: {
    flex: 1,
    color: colors.blue200,
    fontSize: 13,
    lineHeight: 19
  },
  linkText: {
    color: colors.blue300,
    textDecorationLine: "underline",
    fontWeight: "700"
  },
  error: {
    color: colors.danger300,
    backgroundColor: "rgba(255,45,66,0.1)",
    borderColor: "rgba(255,45,66,0.25)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 17
  },
  bottomText: {
    color: colors.textSubtle,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14
  },
  bottomLink: {
    color: colors.blue300,
    fontWeight: "800"
  }
});
