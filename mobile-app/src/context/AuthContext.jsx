import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login, register, socialSignIn } from "../services/api";
import { clearSession, loadSession, saveSession } from "../services/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const stored = await loadSession();
        if (mounted && stored?.token) {
          setSession(stored.token);
          setUser(stored.user);
        }
      } catch {
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function signIn(credentials) {
    const response = await login(credentials);
    setSession(response.token);
    setUser(response.user);
    await saveSession({ token: response.token, user: response.user });
    return response;
  }

  async function signUp(payload) {
    const response = await register(payload);
    setSession(response.token);
    setUser(response.user);
    await saveSession({ token: response.token, user: response.user });
    return response;
  }

  async function signInWithProvider(provider, profile) {
    const response = await socialSignIn(provider, profile);
    setSession(response.token);
    setUser(response.user);
    await saveSession({ token: response.token, user: response.user });
    return response;
  }

  async function signOut() {
    await clearSession();
    setSession(null);
    setUser(null);
  }

  async function updateUser(nextUser) {
    const mergedUser = {
      ...(user ?? {}),
      ...nextUser
    };

    setUser(mergedUser);

    if (session) {
      await saveSession({ token: session, user: mergedUser });
    }

    return mergedUser;
  }

  const value = useMemo(
    () => ({
      session,
      user,
      isLoading,
      signIn,
      signUp,
      signInWithProvider,
      signOut,
      updateUser
    }),
    [session, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
