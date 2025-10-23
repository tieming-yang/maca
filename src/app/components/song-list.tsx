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
    <section className="flex flex-col items-center justify-center w-full h-full max-w-5xl px-0 pb-32 mx-auto space-y-7">
      {isLoading && <Loading isFullScreen />}
      <h2 className="self-start text-xl font-bold sm:text-2xl md:text-3xl">
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
                className="flex flex-col justify-center p-2 transition-all duration-200 border text-md group snap-center xl:text-xl sm:p-3 hover:scale-110 hover:bg-white hover:text-black"
                // style={{ filter: "drop-shadow(0 0 15px)" }}
                key={song.id ?? song.slug ?? song.name}
              >
                <li className="font-semibold whitespace-nowrap">{song.name}</li>
                <div className="text-sm text-white/75 group-hover:text-zinc-800 whitespace-nowrap">
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
