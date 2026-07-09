import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { BottomNav } from "../../src/components/layout/BottomNav";
import { colors } from "../../src/constants/colors";
import { spacing } from "../../src/constants/spacing";
import { typography } from "../../src/constants/typography";
import { getScanHistory, getUserProfile } from "../../src/services/api";
import { truncateMiddle } from "../../src/utils/formatters";

export default function DashboardRoute() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [userProfile, scans] = await Promise.all([
        getUserProfile(),
        getScanHistory()
      ]);

      if (mounted) {
        setProfile(userProfile);
        setHistory(scans);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const safeCount = history.filter((item) => item.status === "safe").length;
  const blockedCount = history.filter((item) => item.status === "blocked").length;
  const recent = history.slice(0, 3);

  return (
    <View style={styles.root}>
      <AppScreen scroll contentStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>WELCOME BACK</Text>
            <Text style={styles.name}>{profile?.name ?? "Alex Johnson"}</Text>
          </View>
          <Pressable onPress={() => router.push("/(protected)/profile")}>
            <LinearGradient
              colors={[colors.blue500, colors.cyan500]}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {(profile?.name ?? "Alex").slice(0, 1)}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View style={styles.statusTitleRow}>
              <Feather name="shield" size={18} color={colors.green500} />
              <Text style={styles.statusTitle}>Security Status</Text>
            </View>
            <Text style={styles.activePill}>ACTIVE</Text>
          </View>
          <View style={styles.statsRow}>
            <Stat value={history.length} label="Total Scans" />
            <Stat value={safeCount} label="Safe" />
            <Stat value={blockedCount} label="Blocked" />
          </View>
        </View>

        <Pressable onPress={() => router.push("/(protected)/scan")}>
          <LinearGradient
            colors={[colors.blue600, colors.cyan500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanButton}
          >
            <View style={styles.scanIconBox}>
              <Feather name="maximize" size={24} color={colors.white} />
            </View>
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Scans</Text>
          <Pressable onPress={() => router.push("/(protected)/history")}>
            <Text style={styles.viewAll}>View all 〉</Text>
          </Pressable>
        </View>

        <View style={styles.recentList}>
          {recent.map((item) => (
            <ScanRow key={item.id} item={item} />
          ))}
        </View>
      </AppScreen>
      <BottomNav active="dashboard" />
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ScanRow({ item }) {
  const isSafe = item.status === "safe";

  return (
    <View style={styles.scanRow}>
      <View style={[styles.scanStatusIcon, isSafe ? styles.safeIcon : styles.blockedIcon]}>
        <Feather name="shield" size={18} color={isSafe ? colors.green500 : colors.danger300} />
      </View>
      <View style={styles.scanInfo}>
        <Text style={styles.scanDomain}>{item.domain}</Text>
        <Text style={styles.scanUrl}>{truncateMiddle(item.url, 28)}</Text>
      </View>
      <View style={styles.scanMeta}>
        <Text style={[styles.badge, isSafe ? styles.safeBadge : styles.blockedBadge]}>
          {isSafe ? "SAFE" : "BLOCKED"}
        </Text>
        <Text style={styles.scanTime}>{isSafe ? "2 min ago" : "1 hr ago"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: spacing.bottomNavHeight + 24,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 26
  },
  welcome: {
    ...typography.captionWide,
    color: colors.textSubtle,
    fontSize: 10
  },
  name: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    marginTop: 2
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.45,
    shadowRadius: 20
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800"
  },
  statusCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,210,178,0.38)",
    backgroundColor: "rgba(0,75,82,0.72)",
    padding: 20,
    marginBottom: 20
  },
  statusTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17
  },
  statusTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  statusTitle: {
    color: colors.green300,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  activePill: {
    color: "#54FFC8",
    backgroundColor: "rgba(0,190,143,0.25)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800"
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  stat: {
    flex: 1,
    alignItems: "center"
  },
  statValue: {
    color: colors.white,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "800"
  },
  statLabel: {
    color: colors.green500,
    fontSize: 12,
    lineHeight: 16
  },
  scanButton: {
    minHeight: 62,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 13,
    marginBottom: 22,
    elevation: 8,
    shadowColor: colors.blue600,
    shadowOpacity: 0.25,
    shadowRadius: 18
  },
  scanIconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  scanButtonText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  recentTitle: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  viewAll: {
    color: colors.blue300,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  },
  recentList: {
    gap: 11
  },
  scanRow: {
    minHeight: 72,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(70,130,210,0.18)",
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12
  },
  scanStatusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  safeIcon: {
    backgroundColor: "rgba(0,214,155,0.13)"
  },
  blockedIcon: {
    backgroundColor: "rgba(255,93,103,0.16)"
  },
  scanInfo: {
    flex: 1,
    minWidth: 0
  },
  scanDomain: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  scanUrl: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "monospace"
  },
  scanMeta: {
    alignItems: "flex-end",
    gap: 5
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  safeBadge: {
    color: colors.green300,
    backgroundColor: "rgba(0,214,155,0.18)"
  },
  blockedBadge: {
    color: colors.danger300,
    backgroundColor: "rgba(255,93,103,0.2)"
  },
  scanTime: {
    color: colors.textSubtle,
    fontSize: 10,
    lineHeight: 14
  }
});
