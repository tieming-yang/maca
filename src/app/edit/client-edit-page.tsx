"use client";

import { Song, TableRow } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loading from "../components/loading";
import { Button } from "@/app/components/ui/button";

export default function ClientEditPage() {
  const router = useRouter();

  const {
    data: songs,
    isLoading,
    error,
  } = useQuery<TableRow[]>({
    queryKey: QueryKey.songs(),
    queryFn: () => Song.getAll(),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const handleCreate = () => {
    router.push("/edit/new");
  };

  if (isLoading) {
    return <Loading isFullScreen />;
  }

  return (
    <section className="w-full mx-auto max-w-5xl space-y-6 py-8 px-3 text-zinc-100">
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_20px_45px_-35px_rgba(12,12,12,1)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Songs</h1>
          <p className="text-sm text-zinc-400">
            Browse existing songs or create a new entry to edit its metadata.
          </p>
        </div>
        <Button type="button" onClick={handleCreate}>
          New Song
        </Button>

        {/* Test Song */}
        <div className="flex md:flex-col gap-1">
          <Link href="/learn/test-song" target="_blank">
            <Button>Test Song</Button>
          </Link>
          <Link href="/edit/test-song">
            <Button>Edit Test Song</Button>
          </Link>
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          Failed to load songs. Please refresh the page.
        </p>
      )}

      {!isLoading && songs && songs.length === 0 && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-400">
          No songs found. Click “New Song” to add the first entry.
        </p>
      )}

      {songs && songs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border pb-16 border-zinc-800 bg-zinc-950/60 shadow-[0_25px_55px_-40px_rgba(12,12,12,1)]">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Romaji
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Updated
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {songs.map((song) => {
                const createdAtLabel = song.created_at
                  ? new Date(song.created_at).toLocaleString()
                  : "—";

                return (
                  <tr key={song.id} className="transition hover:bg-zinc-900/40">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-100">
                      {song.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {song.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {createdAtLabel}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Button variant="outline">
                        <Link href={`/edit/${encodeURIComponent(song.slug)}`}>
                          Edit
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
