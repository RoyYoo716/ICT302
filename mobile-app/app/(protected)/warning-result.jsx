import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { OutlineButton } from "../../src/components/ui/GradientButton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

export default function WarningResultRoute() {
  const params = useLocalSearchParams();
  const result = buildWarningResult(params);
  const statusMessages = {
    expired: "This QR code has expired and can no longer be trusted.",
    invalid: "This QR code could not be verified. It may have been tampered with or was not issued by this system.",
    blacklisted: "This QR code has been blacklisted by an administrator.",
    suspicious: "This QR code has been flagged as suspicious following a tamper report."
  };

  function goToReport() {
    router.push({
      pathname: "/(protected)/report",
      params: {
        qrId: result.qrId,
        label: result.label,
        destinationUrl: result.destinationUrl,
        domain: result.domain,
        scannedValue: params.scannedValue,
        source: params.source
      }
    });
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
        <Text style={styles.pill}>VERIFICATION WARNING</Text>
        <Text style={styles.title}>QR Code Not Verified</Text>
        <Text style={styles.description}>
          {statusMessages[result.status] ?? result.reason}
        </Text>

        <View style={styles.threatCard}>
          <ThreatRow label="Status" value={result.status.toUpperCase()} />
          {result.reason ? <ThreatRow label="Reason" value={result.reason} /> : null}
          {result.domain ? <ThreatRow label="Destination" value={result.domain} /> : null}
        </View>

        {result.qrId ? (
          <OutlineButton
            label="Report QR Code"
            icon="flag"
            onPress={goToReport}
            style={styles.outlineButton}
          />
        ) : null}
        <Pressable onPress={() => router.replace("/(protected)/dashboard")}>
          <Text style={styles.dashboardLink}>Back to Dashboard</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function buildWarningResult(params) {
  const result = {
    status: stringParam(params.status, "invalid"),
    reason: stringParam(params.reason, ""),
    destinationUrl: stringParam(params.destinationUrl, ""),
    domain: stringParam(params.domain, ""),
    qrId: stringParam(params.qrId, ""),
    label: stringParam(params.label, "")
  };
  return result;
}

function stringParam(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
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
