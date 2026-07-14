import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

export function AppScreen({
  children,
  scroll = false,
  style,
  contentStyle,
  safeStyle,
  showsVerticalScrollIndicator = false
}) {
  return (
    <SafeAreaView style={[styles.safe, safeStyle]} edges={["top", "bottom"]}>
      {scroll ? (
        <ScrollView
          style={[styles.root, style]}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, style, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1
  }
});
