"use client";

import { Song, TableRow } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "./loading";

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
    <section className="flex w-full h-full justify-center items-center flex-col space-y-7">
      {isLoading && <Loading isFullScreen />}
      <h2 className="text-5xl">Recently Updated</h2>
      <ul>
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
      </ul>
    </section>
  );
}
