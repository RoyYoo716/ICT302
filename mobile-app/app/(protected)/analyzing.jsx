import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { verifyQRCode } from "../../src/services/api";

const steps = [
  { label: "Contacting verification server...", doneAt: 40 },
  { label: "Validating signature & expiry...", doneAt: 75 },
  { label: "Checking blacklist status...", doneAt: 100 }
];

export default function AnalyzingRoute() {
  const params = useLocalSearchParams();
  const scannedValue = typeof params.value === "string" ? params.value : "";
  const source = typeof params.source === "string" ? params.source : "camera";
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => Math.min(100, current + 5));
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100) return;

    let mounted = true;

    if (!scannedValue) {
      router.replace("/(protected)/scan");
      return;
    }

    async function finish() {
      const verification = await verifyQRCode({
        value: scannedValue
      });
      if (!mounted) return;

      const routeParams = {
        status: verification.status,
        reason: verification.reason ?? "",
        destinationUrl: verification.destinationUrl ?? "",
        domain: verification.domain ?? "",
        qrId: verification.qrId ?? "",
        label: verification.label ?? "",
        scannedValue,
        source
      };

      if (verification.status === "valid") {
        router.replace({ pathname: "/(protected)/safe-result", params: routeParams });
        return;
      }

      router.replace({ pathname: "/(protected)/warning-result", params: routeParams });
    }

    finish();

    return () => {
      mounted = false;
    };
  }, [progress, scannedValue, source]);

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.progressWrap}>
        <View style={styles.progressRing} />
        <View
          style={[
            styles.progressArc,
            { transform: [{ rotate: `${Math.min(progress * 2.4, 240)}deg` }] }
          ]}
        />
        <View style={styles.progressCenter}>
          <Feather name="shield" size={24} color={colors.blue200} />
          <Text style={styles.progressText}>{Math.min(progress, 99)}%</Text>
        </View>
      </View>

      <Text style={styles.title}>Analyzing QR Code...</Text>
      <Text style={styles.subtitle}>
        The verification server is checking the QR signature, expiry, and
        current status.
      </Text>

      <View style={styles.stepList}>
        {steps.map((step) => {
          const done = progress >= step.doneAt;
          const active = progress < step.doneAt && progress >= step.doneAt - 25;
          return (
            <View style={styles.stepRow} key={step.label}>
              <View
                style={[
                  styles.stepDot,
                  done ? styles.stepDone : null,
                  active ? styles.stepActive : null
                ]}
              >
                {done ? <Feather name="check" size={11} color={colors.white} /> : null}
              </View>
              <Text
                style={[
                  styles.stepText,
                  done || active ? styles.stepTextActive : null
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: colors.background
  },
  progressWrap: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28
  },
  progressRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 6,
    borderColor: "#0C2B5D"
  },
  progressArc: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 6,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: colors.cyan500,
    borderRightColor: colors.blue400
  },
  progressCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  progressText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    marginTop: 4
  },
  title: {
    ...typography.h3,
    color: colors.white,
    fontWeight: "800",
    textAlign: "center"
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.blue300,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28
  },
  stepList: {
    width: "100%",
    maxWidth: 260,
    gap: 11
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  stepDot: {
    width: 15,
    height: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#0C2B5D",
    alignItems: "center",
    justifyContent: "center"
  },
  stepActive: {
    borderColor: colors.blue300
  },
  stepDone: {
    borderColor: colors.green500,
    backgroundColor: colors.green500
  },
  stepText: {
    color: "rgba(77,126,189,0.35)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    fontFamily: "monospace"
  },
  stepTextActive: {
    color: colors.white
  }
});
