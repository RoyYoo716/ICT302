import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";

export default function NotificationPreferencesRoute() {
  return (
    <AppScreen contentStyle={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={17} color={colors.blue300} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Notification</Text>
        <Text style={styles.subtitle}>Notification settings will be available in a future update.</Text>
      </View>

      <View style={styles.comingSoonCard}>
        <View style={styles.iconBubble}>
          <Feather name="bell" size={28} color={colors.blue300} />
        </View>
        <Text style={styles.cardTitle}>Coming Soon</Text>
        <Text style={styles.cardBody}>
          Notification delivery and preferences are not connected yet. The app does not
          save or send notification settings at this time.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 34
  },
  backButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    marginBottom: 16
  },
  backText: {
    color: colors.blue300,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  header: {
    marginBottom: 25
  },
  title: {
    color: colors.white,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.blue300,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 4
  },
  comingSoonCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(77,152,255,0.3)",
    backgroundColor: colors.surface,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(77,152,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  cardTitle: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  cardBody: {
    color: colors.blue200,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8
  }
});
