"use client";

import { Song, TableRow } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "./loading";
import { toast } from "sonner";
import useProfile from "@/hooks/use-profile";
import { Button } from "@/app/components/ui/button";

export default function SongList() {
  const {
    data: songs,
    isLoading: isSongsLoading,
    error,
  } = useQuery({
    queryKey: QueryKey.songs(),
    queryFn: () => Song.getAllWithMetadata(),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
  const { profile, isProfileLoading } = useProfile();

  if (error) {
    toast.error("We are having trouble to fetch the songs, please try again");
  }
  const isLoading = isSongsLoading || isProfileLoading;
  const editable = profile?.role === "admin" || profile?.role === "editor";
  return (
    <section className="flex flex-col items-center justify-center w-full h-full px-0 pb-32 mx-auto space-y-7">
      {isLoading && <Loading isFullScreen />}
      <div className="self-start flex items-end-safe gap-x-2">
        <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">
          Recently Updated
        </h2>
        <span className="text-white/50">{songs?.length}</span>
      </div>
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
              <div
                key={song.id ?? song.slug ?? song.name}
                className="flex flex-col justify-center transition-all duration-200 border text-sm group snap-center xl:text-md hover:scale-110 hover:bg-white hover:text-black"
              >
                <Link
                  href={`learn/${song.slug}`}
                  className="w-full h-full p-2 sm:p-3"
                >
                  <li className="font-semibold whitespace-nowrap">
                    {song.name}
                  </li>
                  <div className="text-xs xl:text-sm text-white/75 group-hover:text-zinc-800 whitespace-nowrap">
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

                {editable && (
                  <Link href={`/edit/${song.slug}`}>
                    <Button variant="outline" className="rounded-none border-white w-full py-1">Edit</Button>
                  </Link>
                )}
              </div>
            );
          })}
      </ul>
    </section>
  );
}
