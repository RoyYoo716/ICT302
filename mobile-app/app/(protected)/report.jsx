import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { GradientButton, OutlineButton } from "../../src/components/ui/GradientButton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { submitTamperReport } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";

const LOCATION_PERMISSION_MESSAGE = "Location access is required to attach GPS evidence.";
const LOCATION_SETTINGS_MESSAGE = "Location access is required. Open Android Settings to enable it.";
const CAMERA_PERMISSION_MESSAGE = "Camera access is required to take an evidence photo.";
const CAMERA_SETTINGS_MESSAGE = "Camera access is required. Open Android Settings to enable it.";

export default function ReportRoute() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const reporterName = user?.fullName ?? "";
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState(user?.email ?? "");
  const [location, setLocation] = useState(null);
  const [evidencePhoto, setEvidencePhoto] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitRedirectTimer = useRef(null);

  const refreshPermissions = useCallback(async () => {
    try {
      const [nextLocationPermission, nextCameraPermission] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        ImagePicker.getCameraPermissionsAsync()
      ]);

      setLocationPermission(nextLocationPermission);
      setCameraPermission(nextCameraPermission);
    } catch {
      // Permission status refresh should not block the report form.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPermissions();
    }, [refreshPermissions])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        refreshPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshPermissions]);

  useEffect(() => {
    return () => {
      if (submitRedirectTimer.current) {
        clearTimeout(submitRedirectTimer.current);
      }
    };
  }, []);

  async function handleUseLocation() {
    setErrorMessage("");
    setStatusMessage("");
    setLocationLoading(true);

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      setLocationPermission(permission);

      if (!permission.granted && !permission.canAskAgain) {
        await openAppSettings(LOCATION_SETTINGS_MESSAGE);
        return;
      }

      if (!permission.granted) {
        setErrorMessage(LOCATION_PERMISSION_MESSAGE);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(currentLocation);
      setStatusMessage("GPS location captured.");
    } catch {
      setErrorMessage("Unable to capture current location.");
    } finally {
      setLocationLoading(false);
    }
  }

  async function handleTakePhoto() {
    setErrorMessage("");
    setStatusMessage("");
    setPhotoLoading(true);

    try {
      let permission = await ImagePicker.getCameraPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await ImagePicker.requestCameraPermissionsAsync();
      }

      setCameraPermission(permission);

      if (!permission.granted && !permission.canAskAgain) {
        await openAppSettings(CAMERA_SETTINGS_MESSAGE);
        return;
      }

      if (!permission.granted) {
        setErrorMessage(CAMERA_PERMISSION_MESSAGE);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.75
      });

      if (!result.canceled && result.assets?.[0]) {
        setEvidencePhoto(result.assets[0]);
        setStatusMessage("Evidence photo captured.");
      }
    } catch {
      setErrorMessage("Unable to take evidence photo.");
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handlePickPhoto() {
    setErrorMessage("");
    setStatusMessage("");
    setPhotoLoading(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Photo library permission is required to attach evidence.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.75
      });

      if (!result.canceled && result.assets?.[0]) {
        setEvidencePhoto(result.assets[0]);
        setStatusMessage("Evidence photo selected.");
      }
    } catch {
      setErrorMessage("Unable to select evidence photo.");
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleSubmit() {
    const trimmedDescription = description.trim();
    const qrCodeId = stringParam(params.qrId);
    setErrorMessage("");
    setStatusMessage("");

    if (!qrCodeId) {
      setErrorMessage("This report has no target QR code. Please rescan and try again.");
      return;
    }

    if (!trimmedDescription) {
      setErrorMessage("Description is required before submitting a report.");
      return;
    }

    if (!evidencePhoto) {
      setErrorMessage("An evidence photo is required before submitting a report.");
      return;
    }

    setSubmitting(true);

    try {
      await submitTamperReport({
        qrCodeId,
        description: trimmedDescription,
        contactInfo: contact.trim(),
        location: location
          ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
          : null,
        photo: evidencePhoto
      });

      setStatusMessage("Report submitted successfully.");
      if (submitRedirectTimer.current) {
        clearTimeout(submitRedirectTimer.current);
      }
      submitRedirectTimer.current = setTimeout(() => {
        submitRedirectTimer.current = null;
        router.replace("/(protected)/dashboard");
      }, 900);
    } catch (err) {
      console.error("report failed:", err);
      setErrorMessage(err.message || "Unable to submit report right now.");
    } finally {
      setSubmitting(false);
    }
  }

  async function openAppSettings(message) {
    setErrorMessage(message);

    try {
      await Linking.openSettings();
    } catch {
      setErrorMessage(`${message} Please open Android Settings manually.`);
    }
  }

  const locationDenied = locationPermission && !locationPermission.granted;
  const locationBlocked = locationDenied && locationPermission.canAskAgain === false;
  const cameraDenied = cameraPermission && !cameraPermission.granted;
  const cameraBlocked = cameraDenied && cameraPermission.canAskAgain === false;
  const locationHelper = locationDenied
    ? LOCATION_PERMISSION_MESSAGE
    : location
      ? `Captured: ${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`
      : "Attach your current GPS position to help verify where this QR code was found.";
  const locationButtonLabel = locationBlocked
    ? "Open Location Settings"
    : locationDenied
      ? "Enable Location"
      : location
        ? "Refresh Location"
        : "Use Current Location";
  const cameraHelper = cameraDenied
    ? CAMERA_PERMISSION_MESSAGE
    : "Attach a photo of the QR code or surrounding tampering.";
  const takePhotoLabel = cameraBlocked
    ? "Open Camera Settings"
    : cameraDenied
      ? "Enable Camera"
      : "Take Photo";

  return (
    <AppScreen scroll showsVerticalScrollIndicator contentStyle={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={15} color={colors.blue300} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Feather name="flag" size={32} color={colors.warning300} />
        </View>
        <Text style={styles.eyebrow}>TAMPER REPORT</Text>
        <Text style={styles.title}>Report QR Code</Text>
        <Text style={styles.subtitle}>
          Submit suspicious QR code evidence for review by the VAFPQR security team.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="map-pin" size={17} color={colors.green500} />
          <Text style={styles.cardTitle}>GPS Location</Text>
        </View>
        <Text style={styles.helper}>
          {locationHelper}
        </Text>
        <OutlineButton
          label={locationButtonLabel}
          icon="navigation"
          onPress={handleUseLocation}
          style={styles.inlineButton}
        />
        {locationLoading ? <Text style={styles.inlineStatus}>Capturing GPS...</Text> : null}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="camera" size={17} color={colors.blue300} />
          <Text style={styles.cardTitle}>Evidence Photo</Text>
        </View>
        <Text style={styles.helper}>{cameraHelper}</Text>
        {evidencePhoto ? (
          <View style={styles.previewRow}>
            <Image source={{ uri: evidencePhoto.uri }} style={styles.previewImage} />
            <View style={styles.previewTextWrap}>
              <Text style={styles.previewTitle}>Photo attached</Text>
              <Text style={styles.previewMeta} numberOfLines={1}>
                {evidencePhoto.fileName || "Evidence image"}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.evidenceRow}>
          <OutlineButton
            label={takePhotoLabel}
            icon="camera"
            onPress={handleTakePhoto}
            style={styles.evidenceButton}
          />
          <OutlineButton
            label="Gallery"
            icon="image"
            onPress={handlePickPhoto}
            style={styles.evidenceButton}
          />
        </View>
        {photoLoading ? <Text style={styles.inlineStatus}>Opening photo picker...</Text> : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what looks suspicious..."
          placeholderTextColor="#275D9A"
          multiline
          textAlignVertical="top"
          style={styles.descriptionInput}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>REPORTING AS</Text>
        <TextInput
          value={reporterName}
          editable={false}
          placeholder="Signed-in user"
          placeholderTextColor="#275D9A"
          autoCapitalize="words"
          style={styles.contactInput}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>OPTIONAL CONTACT</Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder="Email or phone number"
          placeholderTextColor="#275D9A"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.contactInput}
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {statusMessage ? <Text style={styles.successText}>{statusMessage}</Text> : null}

      <GradientButton
        label={submitting ? "Submitting..." : "Submit Report"}
        icon="send"
        variant="danger"
        loading={submitting}
        disabled={submitting}
        onPress={handleSubmit}
      />
      <Pressable onPress={() => router.replace("/(protected)/dashboard")}>
        <Text style={styles.dashboardLink}>Back to Dashboard</Text>
      </Pressable>
    </AppScreen>
  );
}

function stringParam(value) {
  return typeof value === "string" ? value : "";
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 30,
    backgroundColor: colors.background
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 18
  },
  backText: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  header: {
    alignItems: "center",
    marginBottom: 22
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.45)",
    backgroundColor: "rgba(48,35,25,0.72)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  eyebrow: {
    color: colors.warning300,
    backgroundColor: "rgba(245,158,11,0.18)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 5,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 2.3,
    marginBottom: 12
  },
  title: {
    ...typography.h2,
    color: colors.white,
    fontWeight: "800",
    textAlign: "center"
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.blue300,
    textAlign: "center",
    marginTop: 8
  },
  card: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(70,130,210,0.18)",
    backgroundColor: colors.surface,
    padding: 15,
    marginBottom: 13
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 6
  },
  cardTitle: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800"
  },
  helper: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12
  },
  inlineButton: {
    minHeight: 46
  },
  inlineStatus: {
    color: colors.blue300,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 9,
    textAlign: "center"
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(77,152,255,0.22)",
    backgroundColor: "rgba(3,8,18,0.34)",
    padding: 10,
    marginBottom: 12
  },
  previewImage: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: colors.backgroundDeep
  },
  previewTextWrap: {
    flex: 1
  },
  previewTitle: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  previewMeta: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2
  },
  evidenceRow: {
    flexDirection: "row",
    gap: 10
  },
  evidenceButton: {
    flex: 1,
    minHeight: 46
  },
  fieldGroup: {
    marginBottom: 14
  },
  label: {
    color: colors.blue300,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 2.4,
    marginBottom: 8
  },
  descriptionInput: {
    minHeight: 116,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20
  },
  contactInput: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.white,
    paddingHorizontal: 14,
    fontSize: 14,
    lineHeight: 20
  },
  errorText: {
    color: colors.danger300,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10
  },
  successText: {
    color: colors.green500,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10
  },
  dashboardLink: {
    color: colors.blue300,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 14
  }
});
