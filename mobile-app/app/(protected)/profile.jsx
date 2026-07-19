import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
      {
        icon: "user",
        title: "Account Information",
        route: "/(protected)/account-information"
      },
      {
        icon: "lock",
        title: "Change Password",
        route: "/(protected)/change-password"
      },
      {
        icon: "bell",
        title: "Notification",
        route: "/(protected)/notification-preferences"
      }
    ]
  },
  {
    title: "PRIVACY & LEGAL",
    rows: [
      {
        icon: "briefcase",
        title: "Privacy Policy",
        subtitle: "Last updated Jun 2026",
        route: "/(public)/privacy-policy"
      },
      { icon: "info", title: "Terms of Service", route: "/(public)/terms-of-service" }
    ]
  }
];

export default function ProfileRoute() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadProfile() {
        const user = await getUserProfile();
        if (mounted) setProfile(user);
      }

      loadProfile();

      return () => {
        mounted = false;
      };
    }, [])
  );

  async function handleSignOut() {
    await signOut();
    router.replace("/(public)/login");
  }

  const user = profile ?? {};
  const menuSections = sections.map((section) => {
    if (section.title !== "ACCOUNT") return section;

    return {
      ...section,
      rows: section.rows.map((row) =>
        row.title === "Account Information" ? { ...row, subtitle: user.email } : row
      )
    };
  });

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
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{(user.fullName ?? "?").slice(0, 1)}</Text>
            )}
          </LinearGradient>
          <View style={styles.userCopy}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phoneNumber || "No phone number"}</Text>
          </View>
        </View>

        {menuSections.map((section) => (
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
                  onPress={row.route ? () => router.push(row.route) : undefined}
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
    overflow: "hidden",
    elevation: 8,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.35,
    shadowRadius: 22
  },
  avatarImage: {
    width: "100%",
    height: "100%"
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
  userPhone: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 2
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
