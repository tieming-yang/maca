"use client";

import { Song, SongBundle } from "@/data/models/Song";
import { QueryKey } from "@/data/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { FaSave } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import {
  Translation,
  TranslationVersionRow,
  TranslationLinesInsert,
  DraftTranslation,
  LanguageCodeArray,
  TranslationStatusMap,
  TranslationStatus,
} from "@/data/models/Translation";
import { FormAction } from "../page";
import Loading from "@/app/components/loading";
import { PublicTranslationStatus } from "../../../../data/models/Translation";
import {
  DraftTranslationLine,
  LanguageCode,
} from "../../../../data/models/Translation";
import { useRouter } from "next/navigation";

function makeBlankTranslation(song: SongBundle) {
  return {
    song_id: song.id,
    status: TranslationStatusMap.Draft,
    title: null,
    language_code: LanguageCode.En,
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
}

export default function ClientTranslationCreatePage(props: {
  action: FormAction;
  slug: string;
  translationVersionId?: string;
}) {
  const { action, slug, translationVersionId } = props;
  const router = useRouter();

  const isNew = action === "create" && !translationVersionId;

  const storageKey = useMemo(
    () => `maca:create:translationForm:${slug}`,
    [slug]
  );

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

    const blankTranslation = makeBlankTranslation(song);

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        localStorage.setItem(storageKey, JSON.stringify(blankTranslation));
        setTranslation(blankTranslation);
        return;
      }

      const parsedTranslation = JSON.parse(raw);
      setTranslation(parsedTranslation);
    } catch {
      localStorage.setItem(storageKey, JSON.stringify(blankTranslation));

      setTranslation(blankTranslation);
    }
  }, [song, storageKey]);

  useEffect(() => {
    if (!translation) return;

    localStorage.setItem(storageKey, JSON.stringify(translation));
  }, [translation, translation?.lines, storageKey]);

  const saveMutation = useMutation({
    mutationFn: async (newTranslation: DraftTranslation) => {
      if (!newTranslation.title) {
        toast.error("We need a title.");
        return;
      }

      const sanitizedNewTranslation = {
        ...newTranslation,
        lines: Object.values(newTranslation.lines),
      };

      if (sanitizedNewTranslation.status === "published") {
        for (const line of sanitizedNewTranslation?.lines) {
          const hasTranslation = line.text?.trim();
          if (!hasTranslation) {
            //TODO: Jump to the first unfilled line
            toast.error("Save faild", {
              description: `If you want to public your translation please translation the whole song. ${Song.secondsToTimestamp(
                line.timestamp_sec!
              )} don't have a translation yet.`,
            });
            return;
          }
        }
      }
    },
    onSuccess: (refreshed, translation) => {
      router.replace("");
      localStorage.removeItem(storageKey);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error happened when save";

      toast.error("Error on Save", {
        description: message,
      });
    },
  });

  const isPageLoading = isSongLoading;
  return (
    <main className="space-y-10 py-5 px-3">
      {isPageLoading && <Loading isFullScreen />}
      <h1 className="text-2xl md:text-3xl transition-all duration-300">
        Add Your Translation
      </h1>

      {/* Metadata */}
      <h2 className="text-xl text-center">Basic Info</h2>
      <section
        className={`border px-3 py-5 flex justify-center flex-col md:flex-row`}
      >
        <label className="grid gap-1">
          <span>title</span>
          <input
            type="text"
            placeholder="awsome translation v1"
            className={
              "w-full border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
            }
            value={translation?.title ?? ""}
            onChange={(e) => {
              setTranslation((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  title: e.target.value,
                };
              });
            }}
          ></input>
        </label>
        <label className="grid gap-1">
          <span>langauge</span>
          <select
            className={
              "w-full border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
            }
            value={translation?.language_code ?? LanguageCode.En}
            onChange={(e) => {
              const newLanguageCode = e.target.value;
              setTranslation((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  language_code: newLanguageCode,
                };
              });
            }}
          >
            {LanguageCodeArray.map(([key, value]) => {
              return (
                <option value={value} key={key} className="w-full">
                  {value}
                </option>
              );
            })}
          </select>
        </label>
        <label className="grid gap-1">
          <span>status</span>
          <select
            className={
              "w-full border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
            }
            value={translation?.status ?? TranslationStatusMap.Draft}
            onChange={(e) => {
              const newStatus = e.target.value as TranslationStatus;
              setTranslation((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  status: newStatus,
                };
              });
            }}
          >
            {PublicTranslationStatus.map(([key, value]) => {
              return (
                <option value={value} key={key} className="w-full">
                  {value}
                </option>
              );
            })}
          </select>
        </label>
      </section>

      <ul className="flex items-center flex-col gap-y-5">
        {song?.lines &&
          song.lines.map((line, index) => {
            const { lyric, id, timestamp_sec } = line;
            const inputId = `translation-line-${timestamp_sec}`;
            const translationLine = translation?.lines[timestamp_sec];

            return (
              <li key={id}>
                <div className="flex px-3 md:min-w-3xl min-w-svw gap-x-3 items-center-safe flex-col">
                  <div className="flex justify-between w-full">
                    <span>{Song.secondsToTimestamp(timestamp_sec)}</span>
                    <span>{lyric}</span>
                  </div>
                  <label htmlFor={inputId} className="sr-only">
                    Translation for {Song.secondsToTimestamp(timestamp_sec)}
                  </label>
                  <input
                    id={inputId}
                    type="text"
                    className={
                      "w-full border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
                    }
                    value={translationLine?.text ?? ""}
                    onChange={(e) => {
                      const newTranslationLine = e.target.value;

                      setTranslation((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          lines: {
                            ...prev?.lines,
                            [timestamp_sec]: {
                              text: newTranslationLine,
                              timestamp_sec,
                            },
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
          disabled={!translation}
          onClick={() => {
            if (!translation) return;

            saveMutation.mutate(translation);
          }}
        >
          <FaSave />
        </Button>
      </div>
    </main>
  );
}
