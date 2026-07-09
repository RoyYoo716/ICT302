import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

const slides = [
  {
    key: "scan",
    icon: "qrcode-scan",
    iconType: "material",
    tag: "REAL-TIME PROTECTION",
    title: "Scan QR Codes Safely",
    body:
      "Every QR code you scan is instantly analyzed against our threat intelligence database before any action is taken.",
    card: "#10285A",
    tagBg: "#174987",
    tagText: "#A8CFFF",
    iconColor: colors.blue300
  },
  {
    key: "detect",
    icon: "shield-alert-outline",
    iconType: "material",
    tag: "AI-POWERED DETECTION",
    title: "Detect Malicious QR Codes",
    body:
      "Advanced AI detects phishing URLs, malware distribution links, and credential harvesting attempts hidden in QR codes.",
    card: "#221C1D",
    tagBg: "#5B3C10",
    tagText: colors.warning300,
    iconColor: colors.warning300
  },
  {
    key: "protect",
    icon: "lock",
    iconType: "feather",
    tag: "ZERO-KNOWLEDGE PRIVACY",
    title: "Protect Your Information",
    body:
      "Your personal data and device are shielded. We never share scan data with third parties - privacy is our core principle.",
    card: "#073434",
    tagBg: "#0B5F4F",
    tagText: "#65FFD5",
    iconColor: colors.green500
  }
];

export default function OnboardingRoute() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const SlideIcon = slide.iconType === "material" ? MaterialCommunityIcons : Feather;

  function goNext() {
    if (isLast) {
      router.replace("/(public)/login");
      return;
    }

    setIndex((current) => current + 1);
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          onPress={() => setIndex((current) => Math.max(0, current - 1))}
          style={[styles.topAction, index === 0 && styles.hiddenAction]}
        >
          <Feather name="arrow-left" size={18} color={colors.blue300} />
        </Pressable>
        <Pressable hitSlop={12} onPress={() => router.replace("/(public)/login")}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: slide.card }]}>
        <Feather name="shield" size={58} color="rgba(255,255,255,0.11)" style={styles.watermark} />
        <View style={styles.iconBox}>
          <SlideIcon name={slide.icon} size={46} color={slide.iconColor} />
        </View>
        <View style={[styles.tag, { backgroundColor: slide.tagBg }]}>
          <Text style={[styles.tagText, { color: slide.tagText }]}>{slide.tag}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.pageDots}>
          {slides.map((item, dotIndex) => (
            <View
              key={item.key}
              style={[
                styles.pageDot,
                dotIndex === index ? styles.pageDotActive : null
              ]}
            />
          ))}
        </View>
        <GradientButton
          label={isLast ? "Get Started" : "Next"}
          icon="chevron-right"
          iconPosition="right"
          onPress={goNext}
          style={[styles.nextButton, isLast ? styles.getStartedButton : null]}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: 26,
    backgroundColor: colors.background
  },
  topBar: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22
  },
  topAction: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  hiddenAction: {
    opacity: 0
  },
  skip: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500"
  },
  card: {
    flex: 1,
    minHeight: 470,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(89,141,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    overflow: "hidden"
  },
  watermark: {
    position: "absolute",
    top: 18,
    right: 18
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(160,190,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 14
  },
  tagText: {
    ...typography.captionWide,
    fontSize: 9,
    lineHeight: 12
  },
  title: {
    ...typography.h3,
    color: colors.white,
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 12
  },
  body: {
    ...typography.bodySmall,
    color: colors.blue200,
    textAlign: "center",
    maxWidth: 252
  },
  bottomRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22
  },
  pageDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#1D4A84"
  },
  pageDotActive: {
    width: 20,
    backgroundColor: colors.blue400
  },
  nextButton: {
    width: 78,
    elevation: 8
  },
  getStartedButton: {
    width: 116
  }
});
