"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Profile } from "@/data/models/Profile";
import { createClient } from "@/utils/supabase/client";
import Loading from "../../components/loading";
import { QueryKey } from "@/data/query-keys";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function ClientProfilePage() {
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();
  const query = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      query.setQueryData(QueryKey.authUser, session?.user ?? null);
    });
    return () => sub.subscription?.unsubscribe();
  }, [query, supabase]);

  // --- get auth user so we can distinguish "my profile" vs "someone else's" ---
  const { data: authUser } = useQuery({
    queryKey: QueryKey.authUser,
    queryFn: async () => (await supabase.auth.getUser()).data.user,
    // ensure we don't keep stale user around across navigations
    staleTime: 0,
    refetchOnMount: "always",
  });

  // --- sign out as a mutation (handles pending/error + cache cleanup) ---
  const signOutMutation = useMutation({
    mutationKey: ["auth", "signout"],
    mutationFn: async () => await Profile.signOut(),
    onSuccess: async () => {
      // Clear auth-aware caches so UI updates immediately
      query.removeQueries({ queryKey: ["profile"], exact: false });
      query.setQueryData(QueryKey.authUser, null);
      router.replace("/auth?mode=signin");
    },
  });

  // --- load the requested profile (publicly viewable) ---
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: QueryKey.profile(uid ?? ""),
    queryFn: () => Profile.getById(uid),
    initialData: () => query.getQueryData(QueryKey.profile(uid ?? "")),
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    gcTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!uid,
  });

  // --- navigation decisions when no profile is found ---
  useEffect(() => {
    if (!uid || isLoading) return;

    if (!profile) {
      router.replace("/auth?mode=signin");
    }
  }, [uid, isLoading, profile, authUser, router]);

  if (isLoading) {
    return (
      <main className="p-6 text-white">
        <Loading isFullScreen />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 text-red-400">
        <p>Error: {(error as Error).message}</p>
      </main>
    );
  }

  if (!profile) {
    // If we get here, we're likely in the middle of a redirect.
    return null;
  }

  return (
    <main className="p-6 text-white space-y-7 flex justify-center flex-col items-center h-svh">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      <div className="space-y-2">
        <div>
          <span className="opacity-70">Username:</span>{" "}
          {profile.username ?? "—"}
        </div>

        <div>
          <span className="opacity-70">Joined:</span>{" "}
          {profile.created_at?.slice(0, 10) ?? "—"}
        </div>
        {profile.role === "admin" && (
          //TODO: Put it to the navbar
          <Button>
            <Link href="/edit">Edit</Link>
          </Button>
        )}
      </div>

      {/* Only show Sign Out if this is the signed-in user's profile */}
      {authUser?.id === uid && (
        <Button
          variant="danger"
          onClick={() => signOutMutation.mutate()}
          disabled={signOutMutation.isPending}
          aria-busy={signOutMutation.isPending}
        >
          {signOutMutation.isPending ? <Loading /> : "Sign Out"}
        </Button>
      )}
    </main>
  );
}
