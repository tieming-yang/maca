"use client";

import { LineRow } from "@/data/models/Line";
import { addFurigana } from "@/utils/furigana/addFurigana";
import { FuriganaType } from "@/utils/furigana/constants";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const fakeData =
  "描いた夢とここにある今\n二つの景色見比べても\n形を変えてここにあるのは\n確かな一つのもの\n過ぎゆく春を星見ながらも\n僕らの幕開けたあの夏";

type Props = {
  lines: LineRow[];
  activeLineIndex: number;
  player: YT.Player;
  setIsFuriganaReady: Dispatch<SetStateAction<boolean>>;
};

export default function FuriganaLine({
  lines,
  activeLineIndex,
  player,
  setIsFuriganaReady,
}: Props) {
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let observer: MutationObserver;
    async function _addFurigana(root: HTMLUListElement) {
      try {
        const elements = Array.from(root.querySelectorAll("*"));
        if (elements.length)
          await addFurigana(FuriganaType.Hiragana, ...elements);

        observer = new MutationObserver(async (records) => {
          const updated = records
            .flatMap((record) => Array.from(record.addedNodes))
            .filter(
              (node): node is Element => node.nodeType === Node.ELEMENT_NODE
            )
            .flatMap((node) => Array.from(node.querySelectorAll("*")));

          if (updated.length)
            await addFurigana(FuriganaType.Hiragana, ...updated);
        });

        observer.observe(root, { childList: true, subtree: true });
      } catch (err) {
        console.error("Add furigana effect error", err);
      } finally {
        setIsFuriganaReady(true);
      }
    }

    _addFurigana(root);

    return () => observer?.disconnect();
  }, [setIsFuriganaReady]);

  return (
    <div className="flex w-full h-full flex-col justify-center items-center space-y-10">
      <ul className="flex flex-col gap-y-5" ref={containerRef}>
        {lines.map((line, i) => {
          const { timestamp_sec, lyric, id } = line;
          const isActive = i === activeLineIndex;

          return (
            <li
              key={timestamp_sec}
              id={String(id)}
              onMouseDown={() => {
                player?.seekTo(timestamp_sec ?? 0, true);
                player?.playVideo();
              }}
              className={`transition-all duration-300 text-2xl font-bold ${
                isActive ? "text-white" : "text-white/50"
              }`}
            >
              {lyric}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
