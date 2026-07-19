import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";

const sections = [
  {
    title: "1. Information We Collect",
    body:
      "Account Information: When you create an account, the service stores your name, email address, optional phone number, and a one-way hash of your password. Plain-text passwords are not stored.\n\nScan Records: The verification service records the QR record identifier when available, verification result, timestamp, IP address, user-agent information, and the signed-in account for scans made in the mobile app. Your mobile scan history is loaded from these server records."
  },
  {
    title: "2. How We Use Your Information",
    body:
      "The service uses account information to authenticate you and maintain your profile. Scan information is used to verify issued QR codes, show scan history, and support administrative monitoring. Notification delivery is not currently implemented."
  },
  {
    title: "3. Tamper Reports",
    body:
      "When you submit a tamper report, the service stores the QR code reference and description. Your name, contact details, location, and photo are included only when you provide or permit them. Administrators can review submitted reports."
  },
  {
    title: "4. Local Data",
    body:
      "Your authentication session and profile image are stored on your device. Clearing the app's data or uninstalling the app removes this local information. Server-held scan records remain available to your account after reinstalling. The profile image is not uploaded to the backend."
  },
  {
    title: "5. Data Security",
    body:
      "Passwords are hashed before database storage. Authenticated API requests use signed access tokens, and QR verification is performed by the server. No security control can eliminate every risk, so users should still review a destination before opening it."
  },
  {
    title: "6. Data Access and Correction",
    body:
      "You can view and update your name and phone number in Account Information. Your email address remains the account login identifier and cannot currently be changed from the app."
  },
  {
    title: "7. Current Limitations",
    body:
      "The current app does not provide account deletion, notification preferences, or server-synced profile images. Contact the project administrator if you need assistance with backend-held account or report data."
  }
];

export default function PrivacyPolicyRoute() {
  return (
    <AppScreen scroll contentStyle={styles.screen} showsVerticalScrollIndicator>
      <View style={styles.headerBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.blue300} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.updated}>Last updated: July 20, 2026</Text>

        <View style={styles.infoCard}>
          <Feather name="shield" size={17} color={colors.green300} />
          <Text style={styles.infoText}>
            This notice describes the data currently handled by the VAFPQR
            project. It does not claim features or safeguards that have not been
            implemented.
          </Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.bodyText}>{section.body}</Text>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: 16
  },
  headerBar: {
    minHeight: 58,
    backgroundColor: "#0B1738",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(77, 152, 255, 0.16)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32
  },
  updated: {
    color: colors.textSubtle,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginBottom: 20
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 214, 155, 0.42)",
    backgroundColor: "rgba(0, 214, 155, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    gap: 12,
    marginBottom: 26
  },
  infoText: {
    flex: 1,
    color: "#B8F7DF",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800"
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    marginBottom: 9
  },
  bodyText: {
    color: "#A9C3EA",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "600"
  }
});
