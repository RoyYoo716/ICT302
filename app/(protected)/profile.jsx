import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { BottomNav } from "../../src/components/layout/BottomNav";
import { colors } from "../../src/constants/colors";
import { spacing } from "../../src/constants/spacing";
import { getUserProfile } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

const sections = [
  {
    title: "ACCOUNT",
    rows: [
      { icon: "user", title: "Account Information", subtitle: "alex@example.com" },
      { icon: "lock", title: "Change Password", subtitle: "Last changed 30 days ago" }
    ]
  },
  {
    title: "SECURITY",
    rows: [
      { icon: "shield", title: "Security Settings", subtitle: "Two-factor authentication: ON" },
      { icon: "bell", title: "Notification Preferences", subtitle: "Threat alerts enabled" }
    ]
  },
  {
    title: "PRIVACY & LEGAL",
    rows: [
      { icon: "briefcase", title: "Privacy Policy", subtitle: "Last updated Jun 2026" },
      { icon: "info", title: "Terms of Service" }
    ]
  }
];

export default function ProfileRoute() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const user = await getUserProfile();
      if (mounted) setProfile(user);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    router.replace("/(public)/login");
  }

  const user = profile ?? {
    name: "Alex Johnson",
    email: "alex@example.com",
    plan: "PRO PLAN"
  };

  return (
    <View style={styles.root}>
      <AppScreen scroll showsVerticalScrollIndicator contentStyle={styles.content}>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.userRow}>
          <LinearGradient
            colors={[colors.blue500, colors.cyan500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text>
          </LinearGradient>
          <View style={styles.userCopy}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.plan}>{user.plan}</Text>
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.rows.map((row, index) => (
                <Pressable
                  key={row.title}
                  style={[
                    styles.menuRow,
                    index === section.rows.length - 1 ? styles.menuRowLast : null
                  ]}
                >
                  <View style={styles.menuIcon}>
                    <Feather name={row.icon} size={18} color={colors.blue300} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{row.title}</Text>
                    {row.subtitle ? <Text style={styles.menuSubtitle}>{row.subtitle}</Text> : null}
                  </View>
                  <Feather name="chevron-right" size={17} color="#27659F" />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Feather name="log-out" size={17} color={colors.danger300} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </AppScreen>
      <BottomNav active="profile" />
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
    paddingHorizontal: 32,
    paddingTop: 14,
    paddingBottom: spacing.bottomNavHeight + 28,
    backgroundColor: colors.background
  },
  pageTitle: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    marginBottom: 22
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 30
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.35,
    shadowRadius: 22
  },
  avatarText: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800"
  },
  userCopy: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800"
  },
  userEmail: {
    color: colors.textSubtle,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  plan: {
    alignSelf: "flex-start",
    color: colors.blue200,
    backgroundColor: "rgba(77,152,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    marginTop: 4
  },
  section: {
    marginBottom: 22
  },
  sectionLabel: {
    color: "#3477B9",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 10
  },
  menuCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(70,130,210,0.18)",
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  menuRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(90,145,210,0.13)"
  },
  menuRowLast: {
    borderBottomWidth: 0
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(77,152,255,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  menuText: {
    flex: 1,
    minWidth: 0
  },
  menuTitle: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  menuSubtitle: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 2
  },
  signOutButton: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,64,82,0.48)",
    backgroundColor: "rgba(45,13,36,0.78)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 2
  },
  signOutText: {
    color: colors.danger300,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  }
});
