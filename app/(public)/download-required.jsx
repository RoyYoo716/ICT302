import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecureLogo } from "../../src/components/ui/SecureLogo";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

const features = [
  {
    title: "Real-time Threat Analysis",
    body: "AI-powered scan against 50M+ known threats",
    icon: "shield",
    color: colors.blue300
  },
  {
    title: "Zero-Data Policy",
    body: "We never store your scan history on our servers",
    icon: "lock",
    color: colors.green500
  },
  {
    title: "Instant Results",
    body: "Sub-second verification with actionable insights",
    icon: "zap",
    color: colors.warning300
  },
  {
    title: "4.9 on App Stores",
    body: "Trusted by 2.3 million users worldwide",
    icon: "star",
    color: colors.purple400
  }
];

export default function DownloadRequiredRoute() {
  return (
    <AppScreen
      scroll
      showsVerticalScrollIndicator
      contentStyle={styles.screen}
    >
      <View style={styles.header}>
        <SecureLogo size={60} radius={16} iconSize={30} />
        <Text style={styles.title}>VAFPQR Required</Text>
        <Text style={styles.subtitle}>
          This QR code links to a protected destination.{"\n"}
          Install VAFPQR to scan it safely.
        </Text>
      </View>

      <View style={styles.warningBox}>
        <Feather name="alert-triangle" size={16} color={colors.warning300} />
        <Text style={styles.warningText}>
          Opening unknown QR codes without security verification can expose your
          device to phishing attacks and malware.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Why use VAFPQR?</Text>

      <View style={styles.featureList}>
        {features.map((feature) => (
          <View style={styles.featureCard} key={feature.title}>
            <View style={styles.featureIcon}>
              <Feather name={feature.icon} size={18} color={feature.color} />
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureBody}>{feature.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonArea}>
        <GradientButton
          label="Get it on Google Play"
          icon="play"
          variant="dark"
          onPress={() => {}}
          style={styles.storeButton}
        />
        <Pressable style={styles.appleButton}>
          <FontAwesome name="apple" size={21} color={colors.backgroundDeep} />
          <Text style={styles.appleText}>Download on the App Store</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/(public)/login")}>
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 22,
    paddingBottom: 30,
    backgroundColor: colors.background
  },
  header: {
    alignItems: "center",
    marginBottom: 24
  },
  title: {
    ...typography.h2,
    color: colors.white,
    fontWeight: "800",
    marginTop: 14
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.blue300,
    textAlign: "center",
    marginTop: 6
  },
  warningBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.55)",
    backgroundColor: "rgba(48,35,25,0.72)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    marginBottom: 18
  },
  warningText: {
    flex: 1,
    color: colors.warning300,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700"
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    marginBottom: 12
  },
  featureList: {
    gap: 10
  },
  featureCard: {
    minHeight: 76,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(70,130,210,0.22)",
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 14
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(77,152,255,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  featureCopy: {
    flex: 1
  },
  featureTitle: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    marginBottom: 3
  },
  featureBody: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600"
  },
  buttonArea: {
    marginTop: 20,
    gap: 11
  },
  storeButton: {
    shadowColor: colors.purple400
  },
  appleButton: {
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  appleText: {
    color: colors.backgroundDeep,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  backText: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center",
    paddingTop: 2
  }
});
