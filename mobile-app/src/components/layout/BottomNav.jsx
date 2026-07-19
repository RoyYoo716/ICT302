import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

const items = [
  { key: "dashboard", label: "Home", icon: "home", route: "/(protected)/dashboard" },
  { key: "scan", label: "Scan", icon: "maximize", route: "/(protected)/scan" },
  { key: "history", label: "History", icon: "rotate-ccw", route: "/(protected)/history" },
  { key: "profile", label: "Profile", icon: "user", route: "/(protected)/profile" }
];

export function BottomNav({ active }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.nav,
    {
      height: spacing.bottomNavHeight + insets.bottom,
      paddingBottom: insets.bottom,
    },]}>


      {items.map((item) => {
        const isActive = active === item.key;

        return (
          <Pressable
            key={item.key}
            onPress={() => router.replace(item.route)}
            style={styles.item}
          >
            <Feather
              name={item.icon}
              size={19}
              color={isActive ? colors.blue300 : "#245486"}
            />
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: spacing.bottomNavHeight,
    borderTopWidth: 1,
    borderTopColor: "rgba(77,152,255,0.12)",
    backgroundColor: "rgba(7,17,38,0.98)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16
  },
  item: {
    width: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  label: {
    color: "#245486",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700"
  },
  labelActive: {
    color: colors.blue300
  }
});
