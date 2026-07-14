import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { GradientButton, OutlineButton } from "../../src/components/ui/GradientButton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { mockSafeResult } from "../../src/data/mockData";
import { saveScanHistoryRecord } from "../../src/services/api";

export default function SafeResultRoute() {
  const params = useLocalSearchParams();
  const [linkError, setLinkError] = useState("");
  const [savingScan, setSavingScan] = useState(false);
  const destinationUrl =
    typeof params.destinationUrl === "string" && params.destinationUrl.length > 0
      ? params.destinationUrl
      : mockSafeResult.destinationUrl;
  const domain =
    typeof params.domain === "string" && params.domain.length > 0
      ? params.domain
      : mockSafeResult.domain;
  const hasDestinationUrl = Boolean(destinationUrl);

  async function handleOpenLink() {
    const safeUrl = getAllowedWebUrl(destinationUrl);

    if (!safeUrl) {
      setLinkError("Only http:// and https:// destination links can be opened.");
      return;
    }

    try {
      setLinkError("");
      const canOpen = await Linking.canOpenURL(safeUrl);
      if (!canOpen) {
        setLinkError("This destination URL cannot be opened on this device.");
        return;
      }
      await Linking.openURL(safeUrl);
    } catch {
      setLinkError("Unable to open this destination URL.");
    }
  }

  async function handleSaveScan() {
    if (savingScan) return;

    setSavingScan(true);

    try {
      await saveScanHistoryRecord({
        id: stringParam(params.scanId),
        destinationUrl,
        domain,
        status: "safe",
        scannedValue: stringParam(params.scannedValue) || destinationUrl,
        source: stringParam(params.source) || "result"
      });
      Alert.alert("Saved", "Scan saved successfully.");
    } catch {
      Alert.alert("Save Failed", "Unable to save scan right now.");
    } finally {
      setSavingScan(false);
    }
  }

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.replace("/(protected)/dashboard")}>
        <Feather name="arrow-left" size={15} color={colors.blue300} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.safeCircle}>
          <Feather name="check" size={48} color={colors.green500} />
        </View>
        <Text style={styles.pill}>SAFE QR CODE</Text>
        <Text style={styles.title}>Verification Passed</Text>
        <Text style={styles.description}>
          This QR code has been verified safe. No threats, phishing attempts, or
          malware detected.
        </Text>

        <View style={styles.destinationCard}>
          <Text style={styles.cardLabel}>DESTINATION URL</Text>
          <Text style={styles.url}>{destinationUrl || "No destination URL"}</Text>
          <View style={styles.divider} />
          <View style={styles.securityRow}>
            <SecurityItem icon="shield" text="SSL Valid" green />
            <SecurityItem icon="globe" text={domain} />
            <SecurityItem icon="check-circle" text="No threats" green />
          </View>
        </View>

        <GradientButton
          label="Open Link"
          icon="external-link"
          variant="success"
          disabled={!hasDestinationUrl}
          onPress={handleOpenLink}
          style={styles.openButton}
        />
        {linkError ? <Text style={styles.errorText}>{linkError}</Text> : null}
        <OutlineButton
          label="Save Scan"
          icon="bookmark"
          onPress={handleSaveScan}
          style={styles.saveButton}
        />

        <Pressable onPress={() => router.replace("/(protected)/dashboard")}>
          <Text style={styles.dashboardLink}>Back to Dashboard</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function stringParam(value) {
  return typeof value === "string" ? value : "";
}

function getAllowedWebUrl(value) {
  if (!value) return "";

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function SecurityItem({ icon, text, green = false }) {
  return (
    <View style={styles.securityItem}>
      <Feather name={icon} size={12} color={green ? colors.green500 : colors.blue300} />
      <Text style={[styles.securityText, green ? styles.securityGreen : null]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 30,
    backgroundColor: colors.background
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 28
  },
  backText: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  content: {
    alignItems: "center"
  },
  safeCircle: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,214,155,0.45)",
    backgroundColor: "rgba(0,214,155,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: colors.green500,
    shadowOpacity: 0.18,
    shadowRadius: 36
  },
  pill: {
    color: colors.green300,
    backgroundColor: "rgba(0,214,155,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 15
  },
  title: {
    ...typography.h2,
    color: colors.white,
    fontWeight: "800",
    textAlign: "center"
  },
  description: {
    ...typography.bodySmall,
    color: colors.blue300,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 26
  },
  destinationCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,214,155,0.32)",
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 18
  },
  cardLabel: {
    color: colors.textSubtle,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 2.5,
    textAlign: "center",
    marginBottom: 9
  },
  url: {
    color: colors.blue200,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
    fontFamily: "monospace",
    textAlign: "center"
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(90,145,210,0.22)",
    marginVertical: 13
  },
  securityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  securityText: {
    color: colors.blue300,
    fontSize: 10,
    lineHeight: 14
  },
  securityGreen: {
    color: colors.green500
  },
  openButton: {
    marginBottom: 11
  },
  errorText: {
    color: colors.danger300,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "center",
    marginTop: -4,
    marginBottom: 12
  },
  saveButton: {
    width: "100%",
    marginBottom: 22
  },
  dashboardLink: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center"
  }
});
