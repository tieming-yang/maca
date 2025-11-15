"use client";
import { useQuery } from "@tanstack/react-query";
import { FormAction } from "../../page";
import { QueryKey } from "@/data/query-keys";
import {
  LanguageCode,
  LanguageCodeArray,
  PublicTranslationStatus,
  Translation,
  TranslationStatus,
  TranslationStatusMap,
} from "@/data/models/Translation";
import { Button } from "@/app/components/ui/button";
import Loading from "@/app/components/loading";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSong from "@/hooks/use-song";
import { Song } from "@/songs/Song";
import { FaSave } from "react-icons/fa";

export default function ClientTranslationUpdatePage(props: {
  action: FormAction;
  slug: string;
  translationVersionId: string;
}) {
  const { action, slug, translationVersionId } = props;

  const [newTranslation, setNewTranslation] = useState<Translation | null>(
    null
  );

  const { song, isSongLoading } = useSong(slug);

  const {
    data: translation,
    isLoading: isTranslationLoading,
    error: translationError,
  } = useQuery({
    queryKey: QueryKey.translationLines(translationVersionId),
    queryFn: () => Translation.get(translationVersionId),
    placeholderData: (prev) => prev,
  });

  if (translationError) {
    toast.error("Failed to Load the Translation, Try it Later");
  }

  useEffect(() => {
    if (!translation || translationError) return;
    setNewTranslation(translation);
  }, [translation, translationError]);

  const isPageLoading = isTranslationLoading || isSongLoading;

  return (
    <main className="space-y-10 py-5 px-3">
      {isPageLoading && <Loading isFullScreen />}
      <h1 className="text-2xl md:text-3xl transition-all duration-300">
        Edit Your Translation
      </h1>

      {/* Metadata */}
      <h2 className="text-xl text-center">Basic Info</h2>
      <section className={`px-3 py-5 flex justify-center flex-col gap-y-5 `}>
        <label className="grid gap-1">
          <span>title</span>
          <input
            type="text"
            className={
              "border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
            }
            value={newTranslation?.title ?? ""}
            onChange={(e) => {
              setNewTranslation((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  title: e.target.value,
                };
              });
            }}
          ></input>
        </label>
        <div className="flex self-center-safe">
          <label className="grid gap-1">
            <span>langauge</span>
            <select
              className={
                "w-full border h-10 px-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50"
              }
              value={translation?.language_code ?? LanguageCode.En}
              onChange={(e) => {
                const newLanguageCode = e.target.value;
                setNewTranslation((prev) => {
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
                setNewTranslation((prev) => {
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
        </div>
      </section>

      <ul className="flex items-center flex-col gap-y-5 pb-30">
        {song?.lines &&
          newTranslation &&
          song.lines.map((line, index) => {
            const { lyric, id, timestamp_sec } = line;
            const inputId = `translation-line-${timestamp_sec}`;
            const translationLine = newTranslation?.lines.find(
              (line) => line?.timestamp_sec === timestamp_sec
            );

            return (
              <li key={id}>
                <div className="flex px-3 md:min-w-3xl min-w-svw gap-x-3 items-center-safe flex-col">
                  <div className="flex justify-between w-full">
                    <span>{lyric}</span>
                    <span>{Song.secondsToTimestamp(timestamp_sec)}</span>
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

                      setNewTranslation((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          lines: prev?.lines.map((line) =>
                            line.timestamp_sec === timestamp_sec
                              ? { ...line, text: newTranslationLine }
                              : line
                          ),
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

            // saveMutation.mutate(translation);
          }}
        >
          <FaSave />
        </Button>
      </div>
    </main>
  );
}
