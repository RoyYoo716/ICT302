import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../src/constants/colors";
import { typography } from "../src/constants/typography";
import { SecureLogo } from "../src/components/ui/SecureLogo";
import { AppScreen } from "../src/components/ui/AppScreen";
import { useAuth } from "../src/context/AuthContext";

export default function SplashRoute() {
  const { session, isLoading } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) return undefined;

    let routeTimer;
    const timer = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(timer);
          routeTimer = setTimeout(() => {
            router.replace(session ? "/(protected)/dashboard" : "/(public)/onboarding");
          }, 260);
          return 100;
        }

        return Math.min(100, current + 4);
      });
    }, 42);

    return () => {
      clearInterval(timer);
      if (routeTimer) clearTimeout(routeTimer);
    };
  }, [isLoading, session]);

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.center}>
        <SecureLogo size={84} radius={18} iconSize={42} />
        <Text style={styles.brand}>VAFPQR</Text>
        <Text style={styles.subtitle}>SECURE QR CODE SCANNING</Text>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </View>

      <View style={styles.loadingArea}>
        <View style={styles.loadingRow}>
          <Text style={styles.loadingText}>Initializing...</Text>
          <Text style={styles.loadingText}>{progress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.version}>
          v2.4.1 - Protected by end-to-end encryption
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 22,
    backgroundColor: colors.background
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 36
  },
  brand: {
    ...typography.brandTitle,
    color: colors.white,
    marginTop: 26
  },
  subtitle: {
    ...typography.captionWide,
    color: colors.blue200,
    marginTop: 2
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 30
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#244F99"
  },
  dotActive: {
    backgroundColor: colors.blue400
  },
  loadingArea: {
    paddingBottom: 26
  },
  loadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  loadingText: {
    color: colors.blue300,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "monospace"
  },
  progressTrack: {
    height: 2,
    backgroundColor: "#1B3767",
    overflow: "hidden"
  },
  progressFill: {
    height: 2,
    backgroundColor: "#4CB7FF"
  },
  version: {
    color: "#2C65AA",
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: 17
  }
});
