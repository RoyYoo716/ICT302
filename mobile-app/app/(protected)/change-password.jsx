import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";
import { changePassword } from "../../src/services/api";

export default function ChangePasswordRoute() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMismatch = Boolean(confirmPassword && confirmPassword !== newPassword);

  function clearErrorAndSet(setter, value) {
    setter(value);
    setError("");
  }

  function validate() {
    if (!currentPassword) {
      return "Current Password is required.";
    }

    if (!newPassword) {
      return "New Password is required.";
    }

    if (!confirmPassword) {
      return "Confirm New Password is required.";
    }

    if (newPassword.length < 6) {
      return "New Password must be at least 6 characters.";
    }

    if (newPassword === currentPassword) {
      return "New password must be different from the current password.";
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  async function handleUpdatePassword() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Change Password", response.message, [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (apiError) {
      setError(apiError?.message || "Unable to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={17} color={colors.blue300} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Choose a strong, unique password to protect your account.
        </Text>
      </View>

      <PasswordField
        label="CURRENT PASSWORD"
        value={currentPassword}
        onChangeText={(value) => clearErrorAndSet(setCurrentPassword, value)}
        placeholder="Enter current password"
      />
      <PasswordField
        label="NEW PASSWORD"
        value={newPassword}
        onChangeText={(value) => clearErrorAndSet(setNewPassword, value)}
        placeholder="Min. 6 characters"
      />
      <PasswordField
        label="CONFIRM NEW PASSWORD"
        value={confirmPassword}
        onChangeText={(value) => clearErrorAndSet(setConfirmPassword, value)}
        placeholder="Repeat new password"
        hasError={passwordsMismatch}
      />

      {passwordsMismatch ? <Text style={styles.inlineError}>Passwords do not match</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.updateButton, loading ? styles.updateButtonDisabled : null]}
        onPress={loading ? undefined : handleUpdatePassword}
      >
        <Feather name="lock" size={17} color={colors.white} />
        <Text style={styles.updateText}>{loading ? "Updating" : "Update Password"}</Text>
      </Pressable>
    </AppScreen>
  );
}

function PasswordField({ label, value, onChangeText, placeholder, hasError = false }) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputBox, hasError ? styles.inputBoxError : null]}>
        <Feather name="lock" size={16} color={colors.blue300} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#275D9A"
          secureTextEntry={hidden}
          textContentType="password"
          autoCapitalize="none"
          style={styles.input}
        />
        <Pressable onPress={() => setHidden((current) => !current)} hitSlop={10}>
          <Feather name={hidden ? "eye" : "eye-off"} size={16} color={colors.blue300} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 30,
    paddingTop: 16,
    paddingBottom: 36
  },
  backButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    marginBottom: 18
  },
  backText: {
    color: colors.blue300,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  header: {
    marginBottom: 28
  },
  title: {
    color: colors.white,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.blue300,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 4
  },
  fieldGroup: {
    width: "100%",
    marginBottom: 18
  },
  fieldLabel: {
    color: colors.blue300,
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 9
  },
  inputBox: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 15
  },
  inputBoxError: {
    borderColor: colors.danger500
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    paddingVertical: 0
  },
  inlineError: {
    color: colors.danger300,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: -10,
    marginBottom: 14,
    marginLeft: 4
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
  strengthCard: {
    marginTop: -2,
    marginBottom: 24
  },
  strengthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  strengthTitle: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  strengthValue: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  strengthBars: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 10
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(39,93,154,0.55)"
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4
  },
  requirementText: {
    color: "#275D9A",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  requirementPassed: {
    color: colors.green500
  },
  updateButton: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: "#10285A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 2
  },
  updateButtonDisabled: {
    opacity: 0.72
  },
  updateText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  }
});
