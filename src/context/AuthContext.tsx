import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User as FbUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { STORAGE_KEYS } from "@/lib/constants";
import { initGameState } from "@/lib/gamification";
import { AuthContext, type AuthContextValue, type SessionUser } from "./auth-context";
import type {
  GamificationState,
  LifestyleInput,
  FootprintResult,
  UserData,
  UserProfile,
} from "@/types";

const LS_USERS = STORAGE_KEYS.demoUsers;
const LS_SESSION = STORAGE_KEYS.demoSession;
const dataKey = STORAGE_KEYS.userData;

function baseUserData(user: SessionUser): UserData {
  return {
    profile: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      city: "",
      state: "",
      householdSize: 3,
      homeType: "apartment",
      onboarded: false,
      createdAt: Date.now(),
    },
    game: initGameState(),
  };
}

// ── Storage abstraction (Firestore when configured, localStorage in demo) ────
async function loadUserData(user: SessionUser): Promise<UserData> {
  if (isFirebaseConfigured && db) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as UserData;
    const fresh = baseUserData(user);
    await setDoc(ref, fresh);
    return fresh;
  }
  const raw = localStorage.getItem(dataKey(user.uid));
  if (raw) return JSON.parse(raw) as UserData;
  const fresh = baseUserData(user);
  localStorage.setItem(dataKey(user.uid), JSON.stringify(fresh));
  return fresh;
}

async function persistUserData(uid: string, data: UserData): Promise<void> {
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } else {
    localStorage.setItem(dataKey(uid), JSON.stringify(data));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const demoMode = !isFirebaseConfigured;

  // Refs hold the latest values so sequential mutations in the same tick
  // (e.g. saveFootprint then updateGame) compose instead of clobbering.
  const userRef = useRef<SessionUser | null>(null);
  const dataRef = useRef<UserData | null>(null);

  const hydrate = useCallback(async (u: SessionUser | null) => {
    setUser(u);
    userRef.current = u;
    const data = u ? await loadUserData(u) : null;
    setUserData(data);
    dataRef.current = data;
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (fb: FbUser | null) => {
        void hydrate(
          fb
            ? {
                uid: fb.uid,
                email: fb.email ?? "",
                displayName: fb.displayName ?? fb.email?.split("@")[0] ?? "Friend",
              }
            : null,
        );
      });
    }
    // Demo mode: restore session from localStorage
    const raw = localStorage.getItem(LS_SESSION);
    void hydrate(raw ? (JSON.parse(raw) as SessionUser) : null);
  }, [hydrate]);

  // ── Auth methods ──────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await hydrate({ uid: cred.user.uid, email, displayName: name });
        return;
      }
      const users = JSON.parse(localStorage.getItem(LS_USERS) || "{}");
      if (users[email]) throw new Error("An account with this email already exists.");
      const uid = `demo-${Date.now()}`;
      users[email] = { uid, password, name };
      localStorage.setItem(LS_USERS, JSON.stringify(users));
      const session = { uid, email, displayName: name };
      localStorage.setItem(LS_SESSION, JSON.stringify(session));
      await hydrate(session);
    },
    [hydrate],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, password);
        return;
      }
      const users = JSON.parse(localStorage.getItem(LS_USERS) || "{}");
      const record = users[email];
      if (!record || record.password !== password) throw new Error("Invalid email or password.");
      const session = { uid: record.uid, email, displayName: record.name };
      localStorage.setItem(LS_SESSION, JSON.stringify(session));
      await hydrate(session);
    },
    [hydrate],
  );

  const signInWithGoogle = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      await signInWithPopup(auth, googleProvider);
      return;
    }
    const uid = "demo-google";
    const session = { uid, email: "guest@prithvi.app", displayName: "Guest Explorer" };
    localStorage.setItem(LS_SESSION, JSON.stringify(session));
    await hydrate(session);
  }, [hydrate]);

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured && auth) await fbSignOut(auth);
    else localStorage.removeItem(LS_SESSION);
    await hydrate(null);
  }, [hydrate]);

  // ── Data mutations ──────────────────────────────────────────────────────────
  // Builds the next state from the LATEST committed value (via ref), updates
  // local state immediately, then persists. Failures to persist never break the
  // in-app experience.
  const commit = useCallback(async (update: (prev: UserData) => UserData) => {
    const prev = dataRef.current;
    if (!prev) return;
    const next = update(prev);
    dataRef.current = next;
    setUserData(next);
    const uid = userRef.current?.uid;
    if (uid) {
      try {
        await persistUserData(uid, next);
      } catch (err) {
        console.error("Failed to persist user data:", err);
      }
    }
  }, []);

  const saveProfile = useCallback(
    async (profile: Partial<UserProfile>) => {
      await commit((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...profile, onboarded: true },
      }));
    },
    [commit],
  );

  const saveFootprint = useCallback(
    async (lifestyle: LifestyleInput, footprint: FootprintResult) => {
      await commit((prev) => ({ ...prev, lifestyle, footprint }));
    },
    [commit],
  );

  const updateGame = useCallback(
    async (game: GamificationState) => {
      await commit((prev) => ({ ...prev, game }));
    },
    [commit],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userData,
      loading,
      demoMode,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      saveProfile,
      saveFootprint,
      updateGame,
    }),
    [
      user,
      userData,
      loading,
      demoMode,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      saveProfile,
      saveFootprint,
      updateGame,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
