import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { GradientButton, OutlineButton } from "../../src/components/ui/GradientButton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { mockWarningResult } from "../../src/data/mockData";

export default function WarningResultRoute() {
  const params = useLocalSearchParams();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const result = buildWarningResult(params);

  function goToReport() {
    router.push({
      pathname: "/(protected)/report",
      params: {
        destinationUrl: result.destinationUrl,
        domain: result.domain,
        scannedValue: params.scannedValue,
        source: params.source
      }
    });
  }

  function handleBlockAccess() {
    Alert.alert(
      "Confirm Block",
      "Are you sure you want to block access to this QR code? This action will prevent opening the destination from this scan result.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Block",
          style: "destructive",
          onPress: () => {
            Alert.alert("Blocked", "Access blocked for this QR code.");
          }
        }
      ]
    );
  }

  return (
    <AppScreen scroll showsVerticalScrollIndicator contentStyle={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.replace("/(protected)/dashboard")}>
        <Feather name="arrow-left" size={15} color={colors.blue300} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.warningCircle}>
          <Feather name="alert-triangle" size={48} color={colors.danger300} />
        </View>
        <Text style={styles.pill}>THREAT DETECTED</Text>
        <Text style={styles.title}>Potentially Unsafe QR Code</Text>
        <Text style={styles.description}>
          This QR code points to a known phishing domain. Access has been blocked
          to protect your device.
        </Text>

        <View style={styles.threatCard}>
          <ThreatRow label="Threat Type" value={result.threatType} />
          <ThreatRow label="Risk Level" value={result.riskLevel} />
          <ThreatRow label="Domain" value={result.domain} />
          <ThreatRow label="Reported by" value={`${result.reportedBy.toLocaleString()} users`} />
        </View>

        {detailsOpen ? (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Why is this unsafe?</Text>
            {result.reasons.map((reason) => (
              <View style={styles.reasonRow} key={reason}>
                <Text style={styles.bullet}>-</Text>
                <Text style={styles.reason}>{reason}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <GradientButton
          label="Block Access"
          icon="shield"
          variant="danger"
          onPress={handleBlockAccess}
          style={styles.blockButton}
        />
        <OutlineButton
          label={detailsOpen ? "Hide Details" : "View Details"}
          icon="info"
          onPress={() => setDetailsOpen((current) => !current)}
          borderColor="rgba(255,63,82,0.45)"
          textColor={colors.danger300}
          style={styles.outlineButton}
        />
        <OutlineButton
          label="Report QR Code"
          icon="flag"
          onPress={goToReport}
          style={styles.outlineButton}
        />
        <Pressable onPress={() => router.replace("/(protected)/dashboard")}>
          <Text style={styles.dashboardLink}>Back to Dashboard</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function buildWarningResult(params) {
  return {
    ...mockWarningResult,
    destinationUrl: stringParam(params.destinationUrl, mockWarningResult.destinationUrl),
    domain: stringParam(params.domain, mockWarningResult.domain),
    threatType: stringParam(params.threatType, mockWarningResult.threatType),
    riskLevel: stringParam(params.riskLevel, mockWarningResult.riskLevel),
    reportedBy: numberParam(params.reportedBy, mockWarningResult.reportedBy),
    reasons: parseReasons(params.reasons) ?? mockWarningResult.reasons
  };
}

function stringParam(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function numberParam(value, fallback) {
  if (typeof value !== "string" || value.length === 0) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseReasons(value) {
  if (typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function ThreatRow({ label, value }) {
  return (
    <View style={styles.threatRow}>
      <Text style={styles.threatLabel}>{label}</Text>
      <Text style={styles.threatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.background
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 22
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
  warningCircle: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,62,78,0.5)",
    backgroundColor: "rgba(255,43,68,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: colors.danger500,
    shadowOpacity: 0.18,
    shadowRadius: 36
  },
  pill: {
    color: colors.danger300,
    backgroundColor: "rgba(255,63,82,0.22)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 14
  },
  title: {
    ...typography.h3,
    color: colors.white,
    fontWeight: "800",
    textAlign: "center"
  },
  description: {
    ...typography.bodySmall,
    color: colors.blue300,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20
  },
  threatCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,63,82,0.5)",
    backgroundColor: "rgba(45,13,36,0.8)",
    padding: 15,
    marginBottom: 13
  },
  threatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10
  },
  threatLabel: {
    width: 78,
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    fontFamily: "monospace"
  },
  threatValue: {
    flex: 1,
    color: colors.danger300,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    fontFamily: "monospace",
    textAlign: "right"
  },
  detailsCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,63,82,0.35)",
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 13
  },
  detailsTitle: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    marginBottom: 8
  },
  reasonRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 4
  },
  bullet: {
    color: colors.danger300,
    fontSize: 13,
    lineHeight: 18
  },
  reason: {
    flex: 1,
    color: colors.blue300,
    fontSize: 12,
    lineHeight: 18
  },
  blockButton: {
    marginBottom: 10,
    shadowColor: colors.danger500
  },
  outlineButton: {
    marginBottom: 10
  },
  dashboardLink: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 2
  }
});
