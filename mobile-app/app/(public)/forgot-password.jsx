import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { FormField } from "../../src/components/ui/FormField";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecureLogo } from "../../src/components/ui/SecureLogo";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { requestPasswordReset } from "../../src/services/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordRoute() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateResetLink() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      setResult(await requestPasswordReset(trimmedEmail));
    } catch (apiError) {
      setError(apiError.message || "Unable to create a reset link.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenResetForm() {
    const token = getTokenFromResetLink(result?.resetLink);
    if (!token) {
      setError("The reset link is missing its token. Please create a new link.");
      return;
    }

    router.push({
      pathname: "/(public)/reset-password",
      params: { token }
    });
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
          Enter your email address to create a password reset link.
        </Text>
      </View>

      {result ? (
        <View style={styles.resultCard}>
          <View style={styles.resultIcon}>
            <Feather name="check" size={22} color={colors.green500} />
          </View>
          <Text style={styles.resultTitle}>Reset request completed</Text>
          <Text style={styles.resultMessage}>{result.message}</Text>
          {result.resetLink ? (
            <GradientButton
              label="Open Reset Form"
              icon="arrow-right"
              iconPosition="right"
              onPress={handleOpenResetForm}
              variant="blue"
              style={styles.sendButton}
            />
          ) : null}
          <Pressable
            style={styles.tryAgainButton}
            onPress={() => {
              setResult(null);
              setError("");
            }}
          >
            <Text style={styles.tryAgainText}>Use another email</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FormField
            label="EMAIL ADDRESS"
            icon="user"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError("");
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GradientButton
            label="Create Reset Link"
            onPress={handleCreateResetLink}
            loading={loading}
            variant="blue"
            style={styles.sendButton}
          />
        </>
      )}

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

function getTokenFromResetLink(resetLink) {
  if (typeof resetLink !== "string") return "";
  const match = resetLink.match(/[?&]token=([^&]+)/);
  if (!match) return "";

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
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
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,214,155,0.34)",
    backgroundColor: colors.surface,
    alignItems: "center",
    padding: 20
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,214,155,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  resultTitle: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center"
  },
  resultMessage: {
    color: colors.blue200,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 7,
    marginBottom: 18
  },
  tryAgainButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  tryAgainText: {
    color: colors.blue300,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
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
