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
    <section className="flex w-full h-full justify-center items-center flex-col space-y-7">
      {isLoading && <Loading isFullScreen />}
      <h2 className="text-3xl">Recently Updated</h2>
      <ul className="flex flex-col gap-y-1.5">
        {songs &&
          songs.map((song) => {
            return (
              <li
                className="text-md sm:text-xl leading-relaxed1 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-10  transition-all duration-200"
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
                <p className="text-white/70">
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
