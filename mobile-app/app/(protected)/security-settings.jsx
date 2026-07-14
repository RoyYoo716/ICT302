import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";
import { getSecuritySettings, updateSecuritySettings } from "../../src/services/api";

const settingRows = [
  {
    key: "twoFactorAuthentication",
    icon: "shield",
    title: "Two-Factor Authentication",
    description: "Require a code when signing in from new devices",
    badge: "Active",
    badgeWhenOn: true
  },
  {
    key: "biometricUnlock",
    icon: "user",
    title: "Biometric Unlock",
    description: "Use Face ID or fingerprint to open VAFPQR"
  },
  {
    key: "autoScanOnOpen",
    icon: "maximize",
    title: "Auto-Scan on Open",
    description: "Launch the scanner immediately when app opens"
  },
  {
    key: "safeMode",
    icon: "lock",
    title: "Safe Mode",
    description: "Block all QR access until scan result is confirmed",
    badge: "Recommended"
  }
];

const timeoutOptions = ["15min", "30min", "1hr", "4hrs", "Never"];

export default function SecuritySettingsRoute() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      const data = await getSecuritySettings();
      if (mounted) setSettings(data);
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  async function persistPatch(patch, previousSettings) {
    setError("");

    try {
      const updated = await updateSecuritySettings(patch);
      setSettings(updated);
    } catch {
      setSettings(previousSettings);
      setError("Unable to save setting. Please try again.");
    }
  }

  function handleToggle(key, value) {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      [key]: value
    };

    setSettings(nextSettings);
    persistPatch({ [key]: value }, previousSettings);
  }

  function handleTimeoutChange(value) {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      sessionTimeout: value
    };

    setSettings(nextSettings);
    persistPatch({ sessionTimeout: value }, previousSettings);
  }

  function handleRevokeSessions() {
    Alert.alert("Danger Zone", "This action is not available in the mock version.");
  }

  const currentSettings = settings ?? {
    twoFactorAuthentication: true,
    biometricUnlock: true,
    autoScanOnOpen: false,
    safeMode: true,
    sessionTimeout: "30min"
  };

  return (
    <AppScreen scroll showsVerticalScrollIndicator contentStyle={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={17} color={colors.blue300} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Security Settings</Text>
        <Text style={styles.subtitle}>
          Control how VAFPQR protects your account and device.
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {settingRows.map((row) => (
        <SettingToggleRow
          key={row.key}
          row={row}
          value={Boolean(currentSettings[row.key])}
          onValueChange={(value) => handleToggle(row.key, value)}
        />
      ))}

      <View style={styles.settingsCard}>
        <View style={styles.rowContent}>
          <View style={styles.iconBubble}>
            <Feather name="clock" size={17} color={colors.blue300} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.rowTitle}>Session Timeout</Text>
            <Text style={styles.rowDescription}>Auto sign out after inactivity</Text>
          </View>
        </View>

        <View style={styles.timeoutGrid}>
          {timeoutOptions.map((option) => {
            const selected = currentSettings.sessionTimeout === option;

            return (
              <Pressable
                key={option}
                style={[styles.timeoutPill, selected ? styles.timeoutPillSelected : null]}
                onPress={() => handleTimeoutChange(option)}
              >
                <Text
                  style={[styles.timeoutText, selected ? styles.timeoutTextSelected : null]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Text style={styles.dangerDescription}>
          These actions are irreversible. Proceed with caution.
        </Text>
        <Pressable style={styles.dangerButton} onPress={handleRevokeSessions}>
          <Text style={styles.dangerButtonText}>Revoke All Active Sessions</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function SettingToggleRow({ row, value, onValueChange }) {
  const showBadge = row.badge && (!row.badgeWhenOn || value);

  return (
    <View style={styles.settingsCard}>
      <View style={styles.rowContent}>
        <View style={styles.iconBubble}>
          <Feather name={row.icon} size={17} color={colors.blue300} />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.rowTitle}>{row.title}</Text>
            {showBadge ? (
              <Text style={[styles.badge, row.badge === "Recommended" ? styles.recommendedBadge : null]}>
                {row.badge}
              </Text>
            ) : null}
          </View>
          <Text style={styles.rowDescription}>{row.description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#15345D", true: colors.blue500 }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 34
  },
  backButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    marginBottom: 16
  },
  backText: {
    color: colors.blue300,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  header: {
    marginBottom: 22
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
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 4
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
  settingsCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(70,130,210,0.20)",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(77,152,255,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8
  },
  rowTitle: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  rowDescription: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 3
  },
  badge: {
    color: "#7DFFD6",
    backgroundColor: "rgba(0,214,155,0.18)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800"
  },
  recommendedBadge: {
    color: colors.blue200,
    backgroundColor: "rgba(77,152,255,0.26)"
  },
  timeoutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 16
  },
  timeoutPill: {
    minWidth: 54,
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(77,152,255,0.28)",
    backgroundColor: "rgba(5,14,31,0.62)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 11
  },
  timeoutPillSelected: {
    backgroundColor: colors.blue500,
    borderColor: colors.blue400
  },
  timeoutText: {
    color: colors.blue300,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  timeoutTextSelected: {
    color: colors.white
  },
  dangerCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,45,66,0.38)",
    backgroundColor: "rgba(45,13,36,0.62)",
    paddingHorizontal: 18,
    paddingVertical: 17,
    marginTop: 2
  },
  dangerTitle: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  dangerDescription: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 7,
    marginBottom: 16
  },
  dangerButton: {
    minHeight: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,45,66,0.65)",
    alignItems: "center",
    justifyContent: "center"
  },
  dangerButtonText: {
    color: colors.danger300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  }
});
