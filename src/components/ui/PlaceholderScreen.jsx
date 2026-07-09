import { Text, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const toneColors = {
  default: [colors.blue500, colors.cyan500],
  success: [colors.green600, colors.green500],
  warning: [colors.warning500, colors.warning600],
  danger: [colors.danger600, colors.danger500]
};

export function PlaceholderScreen({
  icon: Icon,
  iconName,
  tone = "default",
  eyebrow,
  title,
  body,
  primaryLabel,
  secondaryLabel,
  onPrimaryPress,
  onSecondaryPress
}) {
  const gradient = toneColors[tone] ?? toneColors.default;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.screen,
        paddingTop: 76,
        paddingBottom: 32
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.lg
          }}
        >
          {Icon ? <Icon name={iconName} size={34} color={colors.white} /> : null}
        </LinearGradient>
        {eyebrow ? (
          <Text style={[typography.captionWide, { color: colors.blue300 }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text
          style={[
            typography.h1,
            {
              color: colors.white,
              textAlign: "center",
              marginTop: spacing.sm
            }
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            typography.bodySmall,
            {
              color: colors.blue200,
              textAlign: "center",
              marginTop: spacing.md,
              maxWidth: 280
            }
          ]}
        >
          {body}
        </Text>
      </View>

      {primaryLabel ? (
        <Pressable onPress={onPrimaryPress}>
          <LinearGradient
            colors={[colors.blue600, colors.blue400]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              minHeight: 56,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.md
            }}
          >
            <Text style={[typography.button, { color: colors.white }]}>
              {primaryLabel}
            </Text>
          </LinearGradient>
        </Pressable>
      ) : null}

      {secondaryLabel ? (
        <Pressable
          onPress={onSecondaryPress}
          style={{
            minHeight: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={[typography.button, { color: colors.blue200 }]}>
            {secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
