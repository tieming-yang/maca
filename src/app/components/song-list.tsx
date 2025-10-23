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
    <section className="flex w-full h-full justify-center items-center px-0 flex-col pb-32 space-y-7 max-w-5xl mx-auto">
      {isLoading && <Loading isFullScreen />}
      <h2 className="text-xl font-bold sm:text-2xl md:text-3xl self-start">
        Recently Updated
      </h2>
      <ul
        className="w-full overflow-x-auto snap-x snap-mandatory"
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(5, minmax(0, 1fr))",
          gap: "0.75rem",
          padding: "0.5rem 0",
        }}
      >
        {songs &&
          songs.map((song) => {
            const primaryArtist =
              song.credits?.primary_artist.at(0)?.display_name;
            const featureArtist =
              song.credits?.featured_artist.at(0)?.display_name;

            return (
              <Link
                href={`learn/${song.slug}`}
                prefetch
                className="text-md snap-center xl:text-xl border p-2 sm:p-3 justify-center flex flex-col transition-all duration-200"
                // style={{ filter: "drop-shadow(0 0 15px)" }}
                key={song.id ?? song.slug ?? song.name}
              >
                <li className="font-semibold whitespace-nowrap">{song.name}</li>
                <div className="text-white/75 text-sm whitespace-nowrap">
                  {featureArtist ? (
                    <span>
                      {primaryArtist} & {featureArtist}
                    </span>
                  ) : (
                    <span>{primaryArtist}</span>
                  )}
                </div>
                {/* <Link
                  className="text-white/70"
                  href={`artist/${
                    song.credits.primary_artist.at(0)?.id
                  }`}
                >
                  {song.credits.primary_artist.at(0)?.display_name}
                </Link> */}
              </Link>
            );
          })}
      </ul>
    </section>
  );
}
