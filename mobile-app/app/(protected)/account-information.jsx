import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { colors } from "../../src/constants/colors";
import { getUserProfile, updateUserProfile } from "../../src/services/api";
import { saveLocalAvatar } from "../../src/services/avatarStorage";
import { useAuth } from "../../src/context/AuthContext";

function createForm(profile) {
  return {
    fullName: profile?.fullName ?? "",
    email: profile?.email ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    avatarUri: profile?.avatarUri ?? null
  };
}

export default function AccountInformationRoute() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(createForm(null));
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const user = await getUserProfile();

      if (mounted) {
        setProfile(user);
        setForm(createForm(user));
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
    setError("");
  }

  function handleAvatarAction() {
    Alert.alert("Update Avatar", "Choose a photo source.", [
      { text: "Cancel", style: "cancel" },
      { text: "Choose from Library", onPress: () => pickAvatar("library") },
      { text: "Take Photo", onPress: () => pickAvatar("camera") }
    ]);
  }

  async function pickAvatar(source) {
    setError("");
    setUpdatingAvatar(true);

    try {
      if (source === "camera") {
        let permission = await ImagePicker.getCameraPermissionsAsync();

        if (!permission.granted && permission.canAskAgain) {
          permission = await ImagePicker.requestCameraPermissionsAsync();
        }

        if (!permission.granted) {
          setError("Camera permission is required to take an avatar photo.");
          return;
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setError("Photo library permission is required to choose an avatar.");
          return;
        }
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85
          })
          : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85
          });

      if (result.canceled) return;

      const sourceUri = result.assets?.[0]?.uri;
      if (!sourceUri || !profile?.id) {
        throw new Error("Unable to identify the selected image or signed-in user.");
      }

      const avatarUri = await saveLocalAvatar({ sourceUri, userId: profile.id });
      const nextProfile = { ...profile, avatarUri };

      setProfile(nextProfile);
      setForm((current) => ({ ...current, avatarUri }));
      await updateUser({ avatarUri });
    } catch (avatarError) {
      setError(avatarError?.message || "Unable to update avatar. Please try again.");
    } finally {
      setUpdatingAvatar(false);
    }
  }

  async function handleSave() {
    const nextName = form.fullName.trim();
    const nextPhone = form.phoneNumber.trim();
    const phoneDigits = nextPhone.replace(/\D/g, "");

    if (!nextName) {
      setError("Full Name is required.");
      return;
    }

    if (
      nextPhone &&
      (/[^0-9+\-().\s]/.test(nextPhone) || phoneDigits.length < 7 || phoneDigits.length > 15)
    ) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updatedProfile = await updateUserProfile({
        fullName: nextName,
        phoneNumber: nextPhone
      });

      const nextProfile = { ...updatedProfile, avatarUri: form.avatarUri };
      await updateUser(nextProfile);
      setProfile(nextProfile);
      setForm(createForm(nextProfile));
      setIsEditing(false);
    } catch (apiError) {
      setError(apiError?.message || "Unable to save account information. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const avatarLetter = (form.fullName || profile?.fullName || "?").slice(0, 1);

  return (
    <AppScreen scroll contentStyle={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={17} color={colors.blue300} />
          <Text style={styles.backText}>Profile</Text>
        </Pressable>

        <Pressable
          style={[styles.headerAction, isEditing ? styles.saveAction : null]}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={saving}
        >
          <Feather
            name={isEditing ? "save" : "edit-2"}
            size={14}
            color={colors.white}
          />
          <Text style={styles.headerActionText}>{saving ? "Saving" : isEditing ? "Save" : "Edit"}</Text>
        </Pressable>
      </View>

      <View style={styles.avatarBlock}>
        <LinearGradient
          colors={[colors.blue500, colors.cyan500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          {form.avatarUri ? (
            <Image source={{ uri: form.avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          )}
        </LinearGradient>
        {isEditing ? (
          <Pressable
            style={styles.avatarEditButton}
            onPress={handleAvatarAction}
            disabled={updatingAvatar}
          >
            <Feather name={updatingAvatar ? "clock" : "edit-2"} size={14} color={colors.white} />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AccountField
        label="FULL NAME"
        icon="user"
        value={form.fullName}
        editable={isEditing}
        locked={!isEditing}
        onChangeText={(value) => updateField("fullName", value)}
      />
      <AccountField
        label="EMAIL ADDRESS"
        icon="mail"
        value={form.email}
        editable={false}
        locked
      />
      <AccountField
        label="PHONE NUMBER"
        icon="smartphone"
        value={form.phoneNumber}
        editable={isEditing}
        locked={!isEditing}
        placeholder="+65 XXXX XXXX"
        placeholderTextColor="#275D9A"
        keyboardType="phone-pad"
        onChangeText={(value) => updateField("phoneNumber", value)}
      />
    </AppScreen>
  );
}

function AccountField({
  label,
  icon,
  value,
  editable,
  locked,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "words",
  onChangeText
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputBox, editable ? styles.inputBoxEditing : null]}>
        <Feather name={icon} size={16} color={colors.blue300} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#275D9A"
          style={[styles.input, editable ? styles.inputEditing : null]}
        />
        {locked ? <Feather name="lock" size={14} color="#27659F" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 30,
    paddingTop: 16,
    paddingBottom: 34
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 38
  },
  backText: {
    color: colors.blue300,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  headerAction: {
    minHeight: 38,
    borderRadius: 14,
    backgroundColor: "rgba(37,109,255,0.26)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 15
  },
  saveAction: {
    backgroundColor: colors.blue500
  },
  headerActionText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: 26
  },
  avatar: {
    width: 102,
    height: 102,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: colors.cyan500,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarText: {
    color: colors.white,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "800"
  },
  avatarEditButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.blue500,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    marginLeft: 76,
    borderWidth: 2,
    borderColor: colors.background
  },
  planBadge: {
    color: colors.blue200,
    backgroundColor: "rgba(77,152,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 8
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
  fieldGroup: {
    width: "100%",
    marginBottom: 18
  },
  fieldLabel: {
    color: colors.blue300,
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 9
  },
  inputBox: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 15
  },
  inputBoxEditing: {
    borderColor: colors.borderStrong
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: "#A9C3EA",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    paddingVertical: 0
  },
  inputEditing: {
    color: colors.white
  }
});
