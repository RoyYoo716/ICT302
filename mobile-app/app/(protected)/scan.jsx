import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomNav } from "../../src/components/layout/BottomNav";
import { colors } from "../../src/constants/colors";
import { spacing } from "../../src/constants/spacing";

const CAMERA_PERMISSION_MESSAGE = "Camera permission is required to scan QR codes.";

export default function ScanRoute() {
  const [cameraPermission, requestCameraPermission, getCameraPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);
  const [message, setMessage] = useState("");
  const scanLockedRef = useRef(false);
  const scanLineProgress = useRef(new Animated.Value(0)).current;

  const refreshCameraPermission = useCallback(async () => {
    const permission = await getCameraPermission();

    if (permission?.granted) {
      setMessage((current) => (current === CAMERA_PERMISSION_MESSAGE ? "" : current));
      return;
    }

    setMessage(CAMERA_PERMISSION_MESSAGE);
  }, [getCameraPermission]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineProgress, {
          toValue: 1,
          duration: 1650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(scanLineProgress, {
          toValue: 0,
          duration: 1650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [scanLineProgress]);

  useFocusEffect(
    useCallback(() => {
      scanLockedRef.current = false;
      setIsScanned(false);
      refreshCameraPermission();
    }, [refreshCameraPermission])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        refreshCameraPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshCameraPermission]);

  function startAnalysis(value, source, mockFallback = false) {
    if (scanLockedRef.current) return;
    scanLockedRef.current = true;
    setIsScanned(true);
    router.push({
      pathname: "/(protected)/analyzing",
      params: {
        value,
        source,
        mockFallback: mockFallback ? "true" : "false"
      }
    });
  }

  function handleBarcodeScanned(event) {
    const value = event?.data;
    if (!value || isScanned || scanLockedRef.current) return;
    startAnalysis(value, "camera");
  }

  async function handleEnableCamera() {
    const permission = await requestCameraPermission();
    if (!permission?.granted) {
      setMessage(CAMERA_PERMISSION_MESSAGE);
      return;
    }

    setMessage((current) => (current === CAMERA_PERMISSION_MESSAGE ? "" : current));
  }

  const cameraReady = cameraPermission?.granted;
  const visibleMessage = cameraReady && message === CAMERA_PERMISSION_MESSAGE ? "" : message;
  const scanLineTranslateY = scanLineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 158]
  });

  return (
    <View style={styles.root}>
      {cameraReady ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          active={!isScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={isScanned ? undefined : handleBarcodeScanned}
        />
      ) : null}
      <View style={styles.cameraOverlay} />
      <View style={styles.gridHorizontal} />
      <View style={styles.gridVertical} />

      <View style={styles.topBar}>
        <Pressable style={styles.circleButton} onPress={() => router.replace("/(protected)/dashboard")}>
          <Feather name="x" size={20} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>QR Scanner</Text>
        <Pressable style={styles.circleButton}>
          <Feather name="zap" size={18} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.scannerArea}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTl]} />
          <View style={[styles.corner, styles.cornerTr]} />
          <View style={[styles.corner, styles.cornerBl]} />
          <View style={[styles.corner, styles.cornerBr]} />
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]} />
          {cameraReady ? null : (
            <MaterialCommunityIcons name="qrcode-scan" size={58} color="rgba(77,152,255,0.28)" />
          )}
        </View>
        <Text style={styles.instruction}>
          {cameraReady ? "Align QR code within the frame" : "Camera access is required"}
        </Text>
        <Text style={styles.helper}>Scanning will start automatically</Text>
        {visibleMessage ? <Text style={styles.statusText}>{visibleMessage}</Text> : null}
        {!cameraReady ? (
          <Pressable style={styles.permissionButton} onPress={handleEnableCamera}>
            <Feather name="camera" size={15} color={colors.white} />
            <Text style={styles.permissionText}>Enable Camera</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={cameraReady ? undefined : handleEnableCamera}>
          <LinearGradient
            colors={[colors.blue500, colors.cyan500]}
            style={styles.cameraButton}
          >
            <Feather name="camera" size={27} color={colors.white} />
          </LinearGradient>
        </Pressable>
      </View>

      <BottomNav active="scan" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
    paddingTop: 52,
    paddingBottom: spacing.bottomNavHeight,
    overflow: "hidden"
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3,8,18,0.42)"
  },
  gridHorizontal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(35,88,160,0.08)"
  },
  gridVertical: {
    ...StyleSheet.absoluteFillObject,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(35,88,160,0.08)",
    marginHorizontal: "32%"
  },
  topBar: {
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(110,150,210,0.28)",
    backgroundColor: "rgba(4,10,24,0.55)",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  scannerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 34
  },
  frame: {
    width: 225,
    height: 225,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(77,152,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13,31,53,0.22)",
    shadowColor: colors.blue300,
    shadowOpacity: 0.24,
    shadowRadius: 24
  },
  scanLine: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 32,
    height: 2,
    backgroundColor: colors.blue300,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.9,
    shadowRadius: 10
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: colors.blue300
  },
  cornerTl: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16
  },
  cornerTr: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16
  },
  cornerBl: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16
  },
  cornerBr: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16
  },
  instruction: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: "monospace",
    marginTop: 28,
    textAlign: "center"
  },
  helper: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  statusText: {
    color: colors.warning300,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 38
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.blue600,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 16
  },
  permissionText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.bottomNavHeight + 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3
  },
  cameraButton: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.38,
    shadowRadius: 24
  }
});
