import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body:
      'By using VAFPQR ("the App"), you agree to use it responsibly and in accordance with applicable rules. If you do not agree, do not use the App.'
  },
  {
    title: "2. Description of Service",
    body:
      "VAFPQR verifies QR codes issued by this system. The server checks the QR token's signature and expiry and checks whether its database record is active, suspicious, or blacklisted before returning a result."
  },
  {
    title: "3. Eligibility",
    body:
      "You must be at least 13 years of age to use the App. By using the App, you represent that you are at least 13 years old. If you are under 18, you represent that your parent or guardian has reviewed and agreed to these Terms on your behalf."
  },
  {
    title: "4. User Accounts",
    body:
      "To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
  },
  {
    title: "5. Acceptable Use",
    body:
      "You agree not to misuse the App, interfere with security features, reverse engineer the App, submit harmful content, or use the service to violate any applicable laws or third-party rights."
  },
  {
    title: "6. Verification Results",
    body:
      "A passed result confirms that the QR code was issued by this system, its signed token is valid and unexpired, and its record was not suspicious or blacklisted at verification time. It does not inspect destination websites for phishing, malware, or other content and does not guarantee that a destination is safe."
  },
  {
    title: "7. Disclaimer of Warranties",
    body:
      'THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE." WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED OR ERROR-FREE. QR VERIFICATION DOES NOT ANALYZE OR GUARANTEE THE SAFETY OF DESTINATION CONTENT. YOU SHOULD REVIEW A DESTINATION BEFORE OPENING IT.',
    strong: true
  },
  {
    title: "8. Limitation of Liability",
    body:
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PROJECT TEAM SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM USE OF THE APP.",
    strong: true
  },
  {
    title: "9. Changes to Terms",
    body:
      "These terms may be updated as the project changes. The updated date shown in the app indicates the current version."
  },
  {
    title: "10. Contact Us",
    body:
      "Contact the VAFPQR project administrator if you have questions about the service or these terms."
  }
];

export default function TermsOfServiceRoute() {
  return (
    <AppScreen scroll contentStyle={styles.screen} showsVerticalScrollIndicator>
      <View style={styles.headerBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.blue300} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.updated}>Last updated: July 20, 2026</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={[styles.bodyText, section.strong ? styles.strongBody : null]}>
              {section.body}
            </Text>
          </View>
        ))}

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            By using VAFPQR, you acknowledge that you have read, understood, and
            agree to these Terms of Service.
          </Text>
        </View>
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
    paddingBottom: 28
  },
  updated: {
    color: colors.textSubtle,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginBottom: 20
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
  },
  strongBody: {
    color: "#A8BCE0",
    fontWeight: "800"
  },
  noticeBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(77, 152, 255, 0.48)",
    backgroundColor: "rgba(37, 109, 255, 0.17)",
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 2
  },
  noticeText: {
    color: "#A9C3EA",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  },
});
