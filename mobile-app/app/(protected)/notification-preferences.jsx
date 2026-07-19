import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, Pressable, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";
import {
  getNotificationPreferences,
  updateNotificationPreferences
} from "../../src/services/api";

const preferenceSections = [
  {
    label: "SECURITY ALERTS",
    rows: [
      {
        key: "threatAlerts",
        icon: "shield",
        iconColor: colors.danger300,
        title: "Threat Alerts",
        description: "Instantly notified when a QR code is flagged"
      },
      {
        key: "safeScanConfirmations",
        icon: "shield",
        iconColor: colors.green500,
        title: "Safe Scan Confirmations",
        description: "Notify me when a scan passes verification"
      }
    ]
  },
  {
    label: "REPORTS & UPDATES",
    rows: [
      {
        key: "weeklySecurityDigest",
        icon: "file-text",
        iconColor: colors.blue300,
        title: "Weekly Security Digest",
        description: "Summary of your scan activity every Monday"
      },
      {
        key: "appUpdates",
        icon: "zap",
        iconColor: colors.cyan500,
        title: "App Updates",
        description: "Get notified about new features and fixes"
      }
    ]
  },
  {
    label: "OTHER",
    rows: [
      {
        key: "promotionalOffers",
        icon: "star",
        iconColor: colors.warning300,
        title: "Promotional Offers",
        description: "Deals and discounts on VAFPQR Pro"
      },
      {
        key: "scanReminders",
        icon: "bell",
        iconColor: colors.purple400,
        title: "Scan Reminders",
        description: "Reminders to scan QR codes in public spaces"
      }
    ]
  }
];

export default function NotificationPreferencesRoute() {
  const [preferences, setPreferences] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPreferences() {
      const data = await getNotificationPreferences();
      if (mounted) setPreferences(data);
    }

    loadPreferences();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleToggle(key, value) {
    const previousPreferences = preferences;
    const nextPreferences = {
      ...currentPreferences,
      [key]: value
    };

    setPreferences(nextPreferences);
    setError("");

    try {
      const updated = await updateNotificationPreferences({ [key]: value });
      setPreferences(updated);
    } catch {
      setPreferences(previousPreferences);
      setError("Unable to save notification preference. Please try again.");
    }
  }

  const currentPreferences = preferences ?? {
    threatAlerts: true,
    safeScanConfirmations: false,
    weeklySecurityDigest: true,
    appUpdates: true,
    promotionalOffers: false,
    scanReminders: false
  };

  return (
    <AppScreen scroll showsVerticalScrollIndicator contentStyle={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={17} color={colors.blue300} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Notification</Text>
        <Text style={styles.subtitle}>Choose how and when VAFPQR contacts you.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {preferenceSections.map((section) => (
        <View key={section.label} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.label}</Text>
          <View style={styles.groupCard}>
            {section.rows.map((row, index) => (
              <PreferenceRow
                key={row.key}
                row={row}
                value={Boolean(currentPreferences[row.key])}
                isLast={index === section.rows.length - 1}
                onValueChange={(value) => handleToggle(row.key, value)}
              />
            ))}
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

function PreferenceRow({ row, value, isLast, onValueChange }) {
  return (
    <View style={[styles.preferenceRow, isLast ? styles.preferenceRowLast : null]}>
      <View style={[styles.iconBubble, { backgroundColor: `${row.iconColor}1A` }]}>
        <Feather name={row.icon} size={16} color={row.iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.rowTitle}>{row.title}</Text>
        <Text style={styles.rowDescription}>{row.description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#15345D", true: colors.blue500 }}
        thumbColor={colors.white}
      />
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
    marginBottom: 25
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
  section: {
    marginBottom: 25
  },
  sectionLabel: {
    color: "#3477B9",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 12
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(70,130,210,0.20)",
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  preferenceRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(90,145,210,0.13)"
  },
  preferenceRowLast: {
    borderBottomWidth: 0
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    minWidth: 0
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
  }
});
