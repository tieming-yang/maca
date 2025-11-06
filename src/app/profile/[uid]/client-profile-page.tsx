"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Profile } from "@/data/models/Profile";
import Loading from "../../components/loading";
import { QueryKey } from "@/data/query-keys";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import useAuthUser from "@/hooks/use-auth-user";
import { Translation } from "@/data/models/Translation";
import { PANEL_CLASS } from "@/app/edit/[slug]/client-song-edit-page";
import { toast } from "sonner";

export default function ClientProfilePage() {
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();
  const query = useQueryClient();

  const { authUser, isAuthUserLoading, isAuthUserError } = useAuthUser();

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
    isLoading: isProfileLoading,
    error: isProfileError,
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

  const {
    data: userTranslations,
    isLoading: isUserTranslationLoading,
    error: userTranslationError,
  } = useQuery({
    queryKey: QueryKey.userTranslations(uid),
    queryFn: () => Translation.getByUser(uid),
    enabled: !!uid,
  });

  // --- navigation decisions when no profile is found ---
  useEffect(() => {
    if (!uid || isProfileLoading) return;

    if (!profile) {
      router.replace("/auth?mode=signin");
    }
  }, [uid, isProfileLoading, profile, authUser, router]);

  if (isAuthUserLoading || isProfileLoading) {
    return (
      <main className="p-6 text-white">
        <Loading isFullScreen />
      </main>
    );
  }

  if (isProfileError || isAuthUserError) {
    return (
      <main className="p-6 text-red-400">
        <p>Error: {(isProfileError as Error).message}</p>
      </main>
    );
  }

  if (userTranslationError) {
    toast.error("Failed to Load Translations", {
      description: `${userTranslationError.message}`,
    });
  }

  if (!profile) {
    // If we get here, we're likely in the middle of a redirect.
    return null;
  }

  return (
    <main
      className={`w-full font-mono max-w-3xl mx-auto space-y-6 py-8 text-zinc-100 px-3`}
    >
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_20px_45px_-35px_rgba(12,12,12,1)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        </div>
      </header>

      <div
        className={`${PANEL_CLASS} flex flex-col items-center justify-around py-5 gap-y-3`}
      >
        <div>
          <span className="opacity-70">Username:</span>{" "}
          {profile.username ?? "—"}
        </div>

        <div>
          <span className="opacity-70">Joined:</span>{" "}
          {profile.created_at?.slice(0, 10) ?? "—"}
        </div>
        <div className="flex gap-x-3">
          {profile.role === "admin" && (
            //TODO: Put it to the navbar
            <Button>
              <Link href="/edit">Edit Songs</Link>
            </Button>
          )}
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
        </div>
      </div>

      <section>
        <h2 className="font-mono text-2xl mb-4">Your Translations</h2>
        <div className={`${PANEL_CLASS}`}>
          {isUserTranslationLoading ? (
            <Loading />
          ) : (
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Language
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                    status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {userTranslations &&
                  userTranslations.map((translation) => {
                    const createdAtLabel = translation.created_at
                      ? new Date(translation.created_at).toLocaleString()
                      : "—";

                    return (
                      <tr
                        key={translation.id}
                        className="transition hover:bg-zinc-900/40"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-zinc-100">
                          {translation.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400">
                          {translation.language_code}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400">
                          {createdAtLabel}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400">
                          {translation.status}
                        </td>

                        <td className="px-4 py-3 text-right text-sm">
                          <Button variant="outline">
                            <Link
                              href={`/translate/update/${translation.song_id}/${translation.id}`}
                            >
                              Edit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
