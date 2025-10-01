"use client";

import { Song, TableRow } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  return (
    <section className="w-full max-w-5xl space-y-6 py-8 px-3 text-zinc-100">
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_20px_45px_-35px_rgba(12,12,12,1)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Songs</h1>
          <p className="text-sm text-zinc-400">
            Browse existing songs or create a new entry to edit its metadata.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-teal-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-teal-300"
        >
          New Song
        </button>
      </header>

      {isLoading && <p className="text-sm text-zinc-400">Loading…</p>}
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
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-[0_25px_55px_-40px_rgba(12,12,12,1)]">
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
                      {song.romaji}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {createdAtLabel}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <Link
                        href={`/edit/${encodeURIComponent(song.slug)}`}
                        className="rounded-full border border-teal-500/60 px-3 py-2 font-medium text-teal-200 transition hover:bg-teal-500/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-teal-300"
                      >
                        Edit
                      </Link>
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
