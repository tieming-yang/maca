"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Profile } from "@/data/models/Profile";
import { QueryKey } from "@/data/query-keys";

export default function ClientAuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- form state ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // signup only

  const query = useQueryClient();

  // --- mode from query (?mode=signin|signup) ---
  const mode = useMemo(() => {
    const m = (searchParams.get("mode") || "signin").toLowerCase();
    return m === "signup" ? "signup" : ("signin" as const);
  }, [searchParams]);

  const setMode = useCallback(
    (next: "signin" | "signup") => {
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      sp.set("mode", next);
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (searchParams) return;
    setMode("signin");
  }, [setMode, searchParams]);

  // ---- mutations ----
  const signUpMutation = useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username: string;
    }) => Profile.signUp({ email, password, username }),
    retry: 0,
    onSuccess: async ({ user }) => {
      if (!user) {
        throw new Error("User sign up failed");
      }
      query.setQueryData(["auth", "user"], user);

      console.info("Sign up success", user);
      const uid = user.id;
      await query.fetchQuery({
        queryKey: QueryKey.profile(uid),
        queryFn: () => Profile.getById(uid),
        staleTime: 0,
        retry: 2,
      });

      router.replace(`/profile/${uid}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      console.error(msg);
    },
  });

  const signInMutation = useMutation({
    mutationKey: ["auth", "signin"],
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      Profile.signIn({ email, password }),
    retry: 0,
    onSuccess: async ({ user }) => {
      console.info("Sign in success", user);
      const uid = user.id;

      query.setQueryData(["auth", "user"], user);
      await query.fetchQuery({
        queryKey: QueryKey.profile(uid),
        queryFn: () => Profile.getById(uid),
        staleTime: 0,
        retry: 2,
      });

      router.replace(`/profile/${uid}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      console.error(msg);
    },
  });

  // ---- submit handlers ----
  function handleSubmitSignUp(e: React.FormEvent) {
    e.preventDefault();
    signUpMutation.mutate({ email, password, username });
  }

  function handleSubmitSignIn(e: React.FormEvent) {
    e.preventDefault();
    signInMutation.mutate({ email, password });
  }

  const isPending = signUpMutation.isPending || signInMutation.isPending;

  return (
    <main className="mx-auto max-w-md p-6 text-white">
      {/* Tabs / Mode Switcher */}
      <div className="mb-6 flex gap-2">
        <button
          className={`px-3 py-1 rounded-full border ${
            mode === "signin" ? "bg-white/10" : "bg-transparent"
          }`}
          onClick={() => setMode("signin")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`px-3 py-1 rounded-full border ${
            mode === "signup" ? "bg-white/10" : "bg-transparent"
          }`}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign up
        </button>
      </div>

      {/* Forms */}
      {mode === "signup" ? (
        <form onSubmit={handleSubmitSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-full border border-white/20 bg-black/30 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-full border border-white/20 bg-black/30 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Username</label>
            <input
              type="text"
              required
              minLength={3}
              className="w-full rounded-full border border-white/20 bg-black/30 px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-full bg-emerald-600 px-4 py-2 font-semibold disabled:opacity-50"
          >
            {signUpMutation.isPending ? "Signing up…" : "Create account"}
          </button>

          {signUpMutation.isError && (
            <p className="mt-2 text-sm text-red-400">
              {(signUpMutation.error as Error).message}
            </p>
          )}
          {signUpMutation.isSuccess && (
            <p className="mt-2 text-sm text-emerald-400">
              {signUpMutation.data.session
                ? "Signed up and signed in."
                : "Sign-up successful. Check your email to confirm your account."}
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={handleSubmitSignIn} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-full border border-white/20 bg-black/30 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-full border border-white/20 bg-black/30 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-full bg-emerald-600 px-4 py-2 font-semibold disabled:opacity-50"
          >
            {signInMutation.isPending ? "Signing in…" : "Sign in"}
          </button>

          {signInMutation.isError && (
            <p className="mt-2 text-sm text-red-400">
              {(signInMutation.error as Error).message ===
              "Invalid login credentials"
                ? "Invalid signin credentialscredentials 😰"
                : (signInMutation.error as Error).message}
            </p>
          )}
        </form>
      )}
    </main>
  );
}
