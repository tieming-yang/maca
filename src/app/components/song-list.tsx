"use client";

import { Song, TableRow } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "./loading";
import { toast } from "sonner";

export default function SongList() {
  const {
    data: songs,
    isLoading,
    error,
  } = useQuery({
    queryKey: QueryKey.songs(),
    queryFn: () => Song.getAllWithMetadata(),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  if (error) {
    toast.error("We are having trouble to fetch the songs, please try again");
  }

  return (
    <section className="flex w-full h-full justify-center items-center flex-col pb-32 space-y-7 max-w-3xl mx-auto">
      {isLoading && <Loading isFullScreen />}
      <h2 className="text-xl font-bold sm:text-2xl md:text-3xl self-start">Recently Updated</h2>
      <ul className="grid sm:grid-cols-2 md:grid-cols-3 sm:gap-x-10 gap-y-3 w-full justify-center">
        {songs &&
          songs.map((song) => {
            return (
              <li
                className="text-xl xl:text-2xl leading-relaxed1 flex flex-col transition-all duration-200"
                style={{ filter: "drop-shadow(0 0 15px)" }}
                key={song.id ?? song.slug ?? song.name}
              >
                <Link
                  className="font-semibold"
                  href={`learn/${song.slug}`}
                  prefetch
                >
                  {song.name}
                </Link>
                <p className="text-white/70 text-sm">
                  {song.credits.primary_artist.at(0)?.display_name}
                </p>
                {/* <Link
                  className="text-white/70"
                  href={`artist/${
                    song.credits.primary_artist.at(0)?.id
                  }`}
                >
                  {song.credits.primary_artist.at(0)?.display_name}
                </Link> */}
              </li>
            );
          })}
      </ul>
    </section>
  );
}
