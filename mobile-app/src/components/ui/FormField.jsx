import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";

export function FormField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  textContentType,
  style
}) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={[styles.group, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        {icon ? <Feather name={icon} size={16} color={colors.blue300} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#275D9A"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={hidden}
          textContentType={textContentType}
          style={styles.input}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((current) => !current)} hitSlop={10}>
            <Feather
              name={hidden ? "eye" : "eye-off"}
              size={16}
              color={colors.blue300}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    width: "100%",
    marginBottom: 18
  },
  label: {
    ...typography.captionWide,
    color: colors.blue300,
    marginBottom: 9
  },
  inputBox: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 15
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    paddingVertical: 0
  }
});
