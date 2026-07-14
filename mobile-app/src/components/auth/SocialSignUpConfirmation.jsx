import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { AppScreen } from "../ui/AppScreen";
import { GradientButton } from "../ui/GradientButton";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const providerConfig = {
  google: {
    provider: "google",
    providerName: "Google",
    icon: "google",
    iconColor: "#4285F4",
    cardColors: ["#3B8BFF", "#34A853"],
    defaultName: "Alex Johnson",
    defaultEmail: "alex@gmail.com",
    namePlaceholder: "Alex Johnson",
    emailPlaceholder: "alex@gmail.com",
    verifiedLabel: "Verified by Google",
    buttonLabel: "Continue with Google"
  },
  apple: {
    provider: "apple",
    providerName: "Apple",
    icon: "apple",
    iconColor: colors.white,
    cardColors: null,
    defaultName: "",
    defaultEmail: "",
    namePlaceholder: "Your full name",
    emailPlaceholder: "you@example.com",
    verifiedLabel: "",
    buttonLabel: "Continue with Apple"
  }
};

export function SocialSignUpConfirmation({ provider }) {
  const config = providerConfig[provider] ?? providerConfig.google;
  const { signInWithProvider } = useAuth();
  const [fullName, setFullName] = useState(config.defaultName);
  const [email, setEmail] = useState(config.defaultEmail);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openTerms() {
    router.push("/(public)/terms-of-service");
  }

  function openPrivacy() {
    router.push("/(public)/privacy-policy");
  }

  async function handleContinue() {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithProvider(config.provider, {
        name: trimmedName,
        email: trimmedEmail
      });
      router.replace("/(protected)/dashboard");
    } catch {
      setError(`Unable to continue with ${config.providerName}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <Pressable style={styles.backRow} onPress={() => router.replace("/(public)/login")}>
        <Feather name="arrow-left" size={16} color={colors.blue300} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <ProviderCard config={config} />

      <View style={styles.header}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Confirm your details to continue</Text>
      </View>

      <SocialInput
        label="FULL NAME"
        icon="user"
        value={fullName}
        onChangeText={(text) => {
          setFullName(text);
          setError("");
        }}
        placeholder={config.namePlaceholder}
        autoCapitalize="words"
      />

      <SocialInput
        label="EMAIL ADDRESS"
        icon="mail"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        placeholder={config.emailPlaceholder}
        keyboardType="email-address"
        autoCapitalize="none"
        verified={Boolean(config.verifiedLabel)}
      />

      {config.verifiedLabel ? (
        <Text style={styles.verifiedText}>{config.verifiedLabel}</Text>
      ) : null}

      <View style={styles.termsRow}>
        <Pressable
          style={[styles.checkbox, agreeTerms ? styles.checkboxChecked : null]}
          onPress={() => {
            setAgreeTerms((current) => !current);
            setError("");
          }}
        >
          {agreeTerms ? <Feather name="check" size={12} color={colors.white} /> : null}
        </Pressable>
        <Text style={styles.termsText}>
          I agree to the{" "}
          <Text style={styles.linkText} onPress={openTerms}>
            Terms of Service
          </Text>{" "}
          and{"\n"}
          <Text style={styles.linkText} onPress={openPrivacy}>
            Privacy Policy
          </Text>
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <GradientButton
        label={config.buttonLabel}
        onPress={handleContinue}
        loading={loading}
        disabled={loading}
        variant="blue"
        style={styles.continueButton}
      />
    </AppScreen>
  );
}

function ProviderCard({ config }) {
  const content = (
    <>
      <FontAwesome name={config.icon} size={17} color={config.iconColor} />
      <View>
        <Text style={styles.providerTitle}>Sign up with {config.providerName}</Text>
        <Text style={styles.providerSubtitle}>Quick & secure account creation</Text>
      </View>
    </>
  );

  if (config.cardColors) {
    return (
      <LinearGradient
        colors={config.cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.providerCard, styles.providerCardFilled]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.providerCard, styles.providerCardOutline]}>
      {content}
    </View>
  );
}

function SocialInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  verified = false
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
        <Feather name={icon} size={15} color={colors.blue300} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#275D9A"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
        {verified ? <Feather name="check-circle" size={15} color={colors.green500} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 34,
    backgroundColor: colors.background
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    marginBottom: 20
  },
  backText: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  providerCard: {
    minHeight: 52,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    marginBottom: 22
  },
  providerCardFilled: {
    borderWidth: 0
  },
  providerCardOutline: {
    borderWidth: 1,
    borderColor: "rgba(138, 168, 210, 0.55)",
    backgroundColor: colors.surface
  },
  providerTitle: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800"
  },
  providerSubtitle: {
    color: "#C7D9F4",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600"
  },
  header: {
    marginBottom: 22
  },
  title: {
    ...typography.h1,
    color: colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3
  },
  fieldGroup: {
    marginBottom: 13
  },
  inputLabel: {
    ...typography.captionWide,
    color: colors.blue300,
    marginBottom: 8
  },
  inputBox: {
    minHeight: 39,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    paddingVertical: 0
  },
  verifiedText: {
    color: colors.green500,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "monospace",
    marginTop: -8,
    marginBottom: 18
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 21
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.blue500,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  checkboxChecked: {
    backgroundColor: colors.blue500
  },
  termsText: {
    flex: 1,
    color: colors.blue200,
    fontSize: 12,
    lineHeight: 18
  },
  linkText: {
    color: colors.blue300,
    fontWeight: "800",
    textDecorationLine: "underline"
  },
  error: {
    color: colors.danger300,
    backgroundColor: "rgba(255,45,66,0.1)",
    borderColor: "rgba(255,45,66,0.25)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 17
  },
  continueButton: {
    shadowColor: colors.blue600
  }
});
