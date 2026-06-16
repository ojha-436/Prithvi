import { useState } from "react";

type LoadingKind = "email" | "google" | null;

/**
 * Shared state and error-handling wrapper for auth form actions.
 * Eliminates the identical try/catch/finally boilerplate across Login and Signup.
 */
export function useAuthForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<LoadingKind>(null);

  async function run(
    kind: Exclude<LoadingKind, null>,
    action: () => Promise<void>,
    fallback = "Something went wrong. Please try again.",
  ): Promise<void> {
    setError("");
    setLoading(kind);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setLoading(null);
    }
  }

  return { error, setError, loading, run };
}
