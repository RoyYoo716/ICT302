import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { FormField } from "../../src/components/ui/FormField";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecureLogo } from "../../src/components/ui/SecureLogo";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { resetPassword } from "../../src/services/api";

export default function ResetPasswordRoute() {
  const params = useLocalSearchParams();
  const token = typeof params.token === "string" ? params.token : "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ token, newPassword });
      router.replace({
        pathname: "/(public)/login",
        params: { passwordReset: "1" }
      });
    } catch (apiError) {
      setError(apiError.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <View style={styles.brandRow}>
        <SecureLogo size={40} radius={12} iconSize={22} />
        <Text style={styles.brandText}>VAFPQR</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Choose a new password for your account.</Text>
      </View>

      {!token ? (
        <View style={styles.missingTokenCard}>
          <Feather name="alert-triangle" size={21} color={colors.warning300} />
          <Text style={styles.missingTokenText}>This reset link is missing its token.</Text>
        </View>
      ) : (
        <>
          <FormField
            label="NEW PASSWORD"
            icon="lock"
            value={newPassword}
            onChangeText={(value) => {
              setNewPassword(value);
              setError("");
            }}
            placeholder="At least 6 characters"
            secureTextEntry
            textContentType="newPassword"
          />

          <FormField
            label="CONFIRM NEW PASSWORD"
            icon="lock"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setError("");
            }}
            placeholder="Enter the new password again"
            secureTextEntry
            textContentType="newPassword"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GradientButton
            label="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            variant="blue"
            style={styles.resetButton}
          />
        </>
      )}

      <Pressable
        style={styles.backButton}
        onPress={() =>
          router.replace(token ? "/(public)/login" : "/(public)/forgot-password")
        }
      >
        <Feather name="arrow-left" size={15} color={colors.blue300} />
        <Text style={styles.backText}>{token ? "Back to Sign In" : "Request a New Link"}</Text>
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
  resetButton: {
    shadowColor: colors.blue600
  },
  missingTokenCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,210,26,0.35)",
    backgroundColor: "rgba(245,158,11,0.1)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 15
  },
  missingTokenText: {
    flex: 1,
    color: colors.warning300,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
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
