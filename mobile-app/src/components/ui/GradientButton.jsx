import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";

const variants = {
  primary: [colors.blue600, colors.cyan500],
  blue: [colors.blue600, colors.blue400],
  success: [colors.green600, colors.green500],
  danger: [colors.danger600, colors.danger500],
  dark: ["#1C1930", "#201C35"]
};

export function GradientButton({
  label,
  onPress,
  icon,
  iconPosition = "left",
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle
}) {
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style
      ]}
    >
      <LinearGradient
        colors={variants[variant] ?? variants.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.row}>
            {icon && iconPosition === "left" ? (
              <Feather name={icon} size={17} color={colors.white} />
            ) : null}
            <Text style={[styles.label, textStyle]}>{label}</Text>
            {icon && iconPosition === "right" ? (
              <Feather name={icon} size={17} color={colors.white} />
            ) : null}
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({
  label,
  onPress,
  icon,
  style,
  textColor = colors.blue200,
  borderColor = colors.border,
  backgroundColor = colors.surface
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outline,
        { borderColor, backgroundColor },
        pressed ? styles.pressed : null,
        style
      ]}
    >
      {icon ? <Feather name={icon} size={16} color={textColor} /> : null}
      <Text style={[styles.outlineLabel, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    borderRadius: 15,
    elevation: 8,
    shadowColor: colors.blue600,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.6
  },
  gradient: {
    minHeight: 56,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  label: {
    ...typography.button,
    color: colors.white
  },
  outline: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16
  },
  outlineLabel: {
    ...typography.button
  }
});
