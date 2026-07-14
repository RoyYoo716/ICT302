import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";

const sections = [
  {
    title: "1. Information We Collect",
    body:
      "Account Information: When you create an account, we collect your name, email address, and hashed password. We do not store plain-text passwords.\n\nDevice Information: We collect your device model, OS version, and a unique device identifier for security purposes only.\n\nScan Metadata: QR code payloads are transmitted to our servers for threat analysis. After analysis is complete, the payload is immediately discarded. We retain only the threat classification result and timestamp, not the QR content itself."
  },
  {
    title: "2. How We Use Your Information",
    body:
      "We use the information we collect to: (a) provide and maintain the App's scanning and threat-analysis features; (b) authenticate your identity and secure your account; (c) improve our threat intelligence databases; (d) send security alerts and account notifications you have opted into; and (e) comply with legal obligations."
  },
  {
    title: "3. Data Sharing",
    body:
      "We do not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregated threat data with security research partners to improve the global threat landscape. We may disclose information to law enforcement if required by a valid legal order."
  },
  {
    title: "4. Data Retention",
    body:
      "Account data is retained for as long as your account is active. Upon account deletion, all personal data is permanently purged within 30 days. Anonymized threat classification data may be retained indefinitely for research purposes."
  },
  {
    title: "5. Data Security",
    body:
      "We use industry-standard encryption (AES-256 at rest, TLS 1.3 in transit) to protect your data. Access to user data is strictly limited to authorized personnel under confidentiality obligations. We conduct regular third-party security audits."
  },
  {
    title: "6. Your Rights",
    body:
      "Under applicable privacy and data protection laws, including Singapore's PDPA where applicable, you may request access to the personal data we hold about you, request correction of inaccurate data, withdraw consent for optional processing, and ask questions about how your data is handled.\n\nTo exercise these rights, contact privacy@vafpqr.io."
  },
  {
    title: "7. Cookies & Tracking",
    body:
      "The mobile App does not use cookies. Our web properties use minimal first-party analytics cookies. We do not use cross-site tracking, fingerprinting, or behavioral advertising. You can opt out of analytics in your device settings."
  },
  {
    title: "8. Children's Privacy",
    body:
      "The App is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, contact us immediately at privacy@vafpqr.io."
  },
  {
    title: "9. Contact & DPO",
    body:
      "Data Protection Officer:\nprivacy@vafpqr.io\n\nVafpqr Security Inc.\n333 North Bridge Rd\nSingapore 188721"
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
        <Text style={styles.updated}>Last updated: June 1, 2026 - Singapore PDPA compliant</Text>

        <View style={styles.infoCard}>
          <Feather name="shield" size={17} color={colors.green300} />
          <Text style={styles.infoText}>
            VAFPQR is built on a zero-knowledge principle. We do not sell your
            data. We do not store your scan history on our servers. Your privacy
            is foundational to what we do.
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
