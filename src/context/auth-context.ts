import { createContext, useContext } from "react";
import type {
  FootprintResult,
  GamificationState,
  LifestyleInput,
  UserData,
  UserProfile,
} from "@/types";

/** The authenticated session user (a thin view over the Firebase/demo user). */
export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
}

/** Everything the rest of the app can read or do with the current session. */
export interface AuthContextValue {
  user: SessionUser | null;
  userData: UserData | null;
  loading: boolean;
  demoMode: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  saveFootprint: (lifestyle: LifestyleInput, footprint: FootprintResult) => Promise<void>;
  updateGame: (game: GamificationState) => Promise<void>;
}

/** Context object. The provider that fills it lives in AuthContext.tsx. */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Access the current auth session. Must be used within <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
