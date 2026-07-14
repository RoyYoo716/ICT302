import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { FormField } from "../../src/components/ui/FormField";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecureLogo } from "../../src/components/ui/SecureLogo";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginRoute() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn({ email, password });
      router.replace("/(protected)/dashboard");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <View style={styles.brandRow}>
        <SecureLogo size={40} radius={12} iconSize={22} />
        <Text style={styles.brandText}>VAFPQR</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your secure account</Text>
      </View>

      <FormField
        label="EMAIL ADDRESS"
        icon="user"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        placeholder="alex@example.com"
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <FormField
        label="PASSWORD"
        icon="lock"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError("");
        }}
        placeholder="Enter your password"
        secureTextEntry
        textContentType="password"
      />

      <Pressable style={styles.forgotButton} onPress={() => router.push("/(public)/forgot-password")}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <GradientButton
        label="Sign In Securely"
        onPress={handleSignIn}
        loading={loading}
        variant="blue"
        style={styles.signInButton}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <Pressable
          style={styles.socialButton}
          onPress={() => router.push("/(public)/google-sign-up")}
        >
          <FontAwesome name="google" size={16} color="#EA4335" />
          <Text style={styles.socialText}>Google</Text>
        </Pressable>
        <Pressable
          style={styles.socialButton}
          onPress={() => router.push("/(public)/apple-sign-up")}
        >
          <FontAwesome name="apple" size={18} color={colors.white} />
          <Text style={styles.socialText}>Apple</Text>
        </Pressable>
      </View>

      <View style={styles.bottomSpacer} />
      <Text style={styles.bottomText}>
        Don't have an account?{" "}
        <Text
          style={styles.bottomLink}
          onPress={() => router.push("/(public)/register")}
        >
          Create Account
        </Text>
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 18,
    paddingBottom: 32,
    backgroundColor: colors.background
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28
  },
  brandText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: 1.5
  },
  header: {
    marginBottom: 28
  },
  title: {
    ...typography.h1,
    color: colors.white,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800"
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.blue300,
    marginTop: 3
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 18
  },
  forgotText: {
    color: colors.blue300,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
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
  signInButton: {
    shadowColor: colors.blue600
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(82,139,220,0.22)"
  },
  dividerText: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "monospace"
  },
  socialRow: {
    flexDirection: "row",
    gap: 10
  },
  socialButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  socialText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  bottomSpacer: {
    flex: 1,
    minHeight: 24
  },
  bottomText: {
    color: colors.textSubtle,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20
  },
  bottomLink: {
    color: colors.blue300,
    fontWeight: "800"
  }
});
