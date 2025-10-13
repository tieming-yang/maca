"use client";

import { Song, TableRow } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function SongList() {
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

  return (
    <>
      <h1>this is the list</h1>
      {songs &&
        songs.map((song) => {
          return (
            <li
              className="text-xl leading-relaxed font-semibold"
              style={{ filter: "drop-shadow(0 0 15px)" }}
              key={song.id ?? song.slug ?? song.name}
            >
              <Link href={`learn/${Song.toSlug(song.romaji)}`} prefetch>
                {song.name}
              </Link>
            </li>
          );
        })}
    </>
  );
}
