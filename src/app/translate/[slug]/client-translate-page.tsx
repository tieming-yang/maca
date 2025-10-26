"use client";

import { Song } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { FaSave } from "react-icons/fa";
import { useState } from "react";

export default function ClientTranslatePage(props: { slug: string }) {
  const { slug } = props;

  const {
    data: song,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QueryKey.song(slug),
    queryFn: () => Song.getBundle(slug),
    placeholderData: (prev) => prev,
  });

  if (isError) {
    toast.error("Failed to load translation page", {
      description: "Plase try again!",
    });
  }

  const [translation, setTranslation] = useState();

  return (
    <main className="space-y-10 py-5 px-3">
      <h1 className="text-2xl md:text-3xl transition-all duration-300">
        Add Your Translation
      </h1>
      <ul className="flex items-center flex-col gap-y-5">
        {song?.lines &&
          song.lines.map((line, index) => {
            const { lyric, id } = line;

            return (
              <li key={id}>
                <div className="flex px-3 md:min-w-3xl min-w-svw gap-x-3 items-center-safe flex-col">
                  <p>{lyric}</p>
                  <input
                    type="text"
                    className={
                      "w-full border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
                    }
                    value={""}
                    onChange={(e) => {}}
                  ></input>
                </div>
              </li>
            );
          })}
      </ul>

      {/* Controls */}
      <div className="fixed bottom-20 right-5 flex flex-col gap-5">
        <Button
          className="rounded-none border-2"
          onClick={() => {
            toast.success("click!");
          }}
        >
          <FaSave />
        </Button>
      </div>
    </main>
  );
}
