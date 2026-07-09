import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "vafpqr.session";
const USER_KEY = "vafpqr.user";

export async function saveSession({ token, user }) {
  if (Platform.OS === "web") {
    const webStorage = getWebStorage();
    if (!webStorage) return;

    webStorage.setItem(SESSION_KEY, token);
    webStorage.setItem(USER_KEY, JSON.stringify(user));
    return;
  }

  if (!(await isNativeSecureStoreAvailable())) return;

  try {
    await SecureStore.setItemAsync(SESSION_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch {
    // Keep the in-memory session alive if native secure storage is temporarily unavailable.
  }
}

export async function loadSession() {
  if (Platform.OS === "web") {
    const webStorage = getWebStorage();
    if (!webStorage) return null;

    const token = webStorage.getItem(SESSION_KEY);
    const userJson = webStorage.getItem(USER_KEY);

    if (!token) {
      return null;
    }

    return {
      token,
      user: parseStoredUser(userJson)
    };
  }

  if (!(await isNativeSecureStoreAvailable())) return null;

  let token;
  let userJson;

  try {
    [token, userJson] = await Promise.all([
      SecureStore.getItemAsync(SESSION_KEY),
      SecureStore.getItemAsync(USER_KEY)
    ]);
  } catch {
    return null;
  }

  if (!token) {
    return null;
  }

  return {
    token,
    user: parseStoredUser(userJson)
  };
}

export async function clearSession() {
  if (Platform.OS === "web") {
    const webStorage = getWebStorage();
    if (!webStorage) return;

    webStorage.removeItem(SESSION_KEY);
    webStorage.removeItem(USER_KEY);
    return;
  }

  if (!(await isNativeSecureStoreAvailable())) return;

  try {
    await Promise.all([
      SecureStore.deleteItemAsync(SESSION_KEY),
      SecureStore.deleteItemAsync(USER_KEY)
    ]);
  } catch {
    // Sign out should continue even if the native secure store entry is already unavailable.
  }
}

function getWebStorage() {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }

  return globalThis.localStorage;
}

async function isNativeSecureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function parseStoredUser(userJson) {
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}
