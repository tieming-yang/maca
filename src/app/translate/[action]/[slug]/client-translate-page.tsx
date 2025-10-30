"use client";

import { Song } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { FaSave } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Translation,
  TranslationVersionRow,
  TranslationLinesInsert,
  DraftTranslation,
} from "@/data/models/Translation";
import { FormAction } from "../page";
import Loading from "@/app/components/loading";
import { DraftTranslationLine } from "../../../../data/models/Translation";

export default function ClientTranslatePage(props: {
  action: FormAction;
  slug: string;
  translationVersionId?: string;
}) {
  const { action, slug, translationVersionId } = props;

  const isNew = action === "create" && !translationVersionId;

  const {
    data: song,
    isLoading: isSongLoading,
    isError: isSongError,
    error: songError,
  } = useQuery({
    queryKey: QueryKey.song(slug),
    queryFn: () => Song.getBundle(slug),
    placeholderData: (prev) => prev,
  });

  if (isSongError) {
    toast.error("Failed to load translation page", {
      description: `${songError.message}`,
    });
  }

  const [translation, setTranslation] = useState<DraftTranslation | null>(null);

  useEffect(() => {
    if (!song) return;

    setTranslation((prev) => {
      return {
        song_id: song.id,
        status: prev?.status ?? "draft",
        title: prev?.title ?? null,
        language_code: prev?.language_code ?? "en",
        lines: Object.fromEntries(
          song.lines.map((line, index) => {
            const timestamp = line.timestamp_sec;

            return [
              String(timestamp),
              {
                text: "",
                timestamp_sec: line.timestamp_sec,
              } satisfies DraftTranslationLine,
            ];
          })
        ),
      };
    });
  }, [song]);

  const isPageLoading = isSongLoading;
  return (
    <main className="space-y-10 py-5 px-3">
      {isPageLoading && <Loading isFullScreen />}
      <h1 className="text-2xl md:text-3xl transition-all duration-300">
        Add Your Translation
      </h1>
      <ul className="flex items-center flex-col gap-y-5">
        {song?.lines &&
          song.lines.map((line, index) => {
            const { lyric, id, timestamp_sec } = line;
            const translationLine = translation?.lines[timestamp_sec];

            return (
              <li key={id}>
                <div className="flex px-3 md:min-w-3xl min-w-svw gap-x-3 items-center-safe flex-col">
                  <p>{lyric}</p>
                  <input
                    type="text"
                    className={
                      "w-full border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
                    }
                    value={translationLine?.text}
                    onChange={(e) => {
                      const newTranslationLine = e.target.value;

                      setTranslation((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          lines: {
                            ...prev?.lines,
                            [timestamp_sec]: newTranslationLine,
                          },
                        };
                      });
                    }}
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
            console.warn(translation);
          }}
        >
          <FaSave />
        </Button>
      </div>
    </main>
  );
}
