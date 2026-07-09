import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "../../constants/colors";

export function SecureLogo({ size = 50, radius = 15, iconSize }) {
  const dot = Math.max(3, Math.round(size * 0.06));

  return (
    <LinearGradient
      colors={[colors.blue500, colors.cyan500]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: radius
        }
      ]}
    >
      <Feather name="shield" size={iconSize ?? size * 0.46} color={colors.white} />
      <View style={[styles.qrCluster, { right: size * 0.2, bottom: size * 0.2 }]}>
        <View style={[styles.dot, { width: dot, height: dot }]} />
        <View style={[styles.dot, { width: dot, height: dot }]} />
        <View style={[styles.dot, { width: dot, height: dot }]} />
        <View style={[styles.dot, { width: dot, height: dot }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 }
  },
  qrCluster: {
    position: "absolute",
    flexDirection: "row",
    flexWrap: "wrap",
    width: 12,
    gap: 2
  },
  dot: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.white
  }
});
