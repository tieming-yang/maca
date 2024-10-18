"use client";

import { useEffect, useRef, useState } from "react";
import Youtube from "react-youtube";
import { Line, lyric } from "./osaka-lover";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

const opts = {
  height: "780",
  width: "1280",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

export default function Home() {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentTimeStamp, setCurrentTimeStamp] = useState<number>(0);
  const [currentLine, setCurrentLine] = useState<Line>();
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const lyricsContianerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentLine = lyric.lines.find((line, index) => {
      const nextLyric = lyric.lines[index + 1];
      return (
        currentTimeStamp >= line.timeStamp &&
        (!nextLyric || currentTimeStamp < nextLyric.timeStamp)
      );
    });

    if (currentLine) {
      setCurrentLine({
        text: currentLine.text,
        timeStamp: currentLine.timeStamp,
      });
    }
  }, [currentTimeStamp]);

  useEffect(() => {
    if (!currentLine || !lyricsContianerRef.current) return;

    const sanitizedId = `#line-${currentLine.timeStamp
      .toString()
      .replace(".", "-")}`;
    const activeLine = document.querySelector(sanitizedId) as HTMLLIElement;

    if (activeLine) {
      const lyricsContainer = lyricsContianerRef.current;
      const lyricsContainerHeight = lyricsContainer.clientHeight;
      const activeLineOffsetTop = activeLine.offsetTop;
      const activeLineHight = activeLine.clientHeight;
      const offset = activeLineOffsetTop - lyricsContainerHeight / 2 + activeLineHight;

      lyricsContainer.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [currentLine]);

  const handleToggle = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };
  // keep this console.log for adjust the time
  // console.log("time", currentTimeStamp);
  return (
    <main className="flex min-h-dvh min-w-dvw flex-col max-h-dvh items-center overflow-y-hidden">
      <section className="fixed z-20 top-0 w-full">
        <div
          className="flex items-center justify-center w-full py-1 border-b shadow-xl gap-x-7 border-white/20 backdrop-blur-md bg-white/10 font-semibold"
          style={{ filter: "drop-shadow(0 0 7px)" }}
          id="metadata"
        >
          <div>
            <h1>{lyric.title}</h1>
            <p>{lyric.artist}</p>
          </div>
          <div>
            <p>作詞家: {lyric.lyricist}</p>
            <p>作曲家: {lyric.composer}</p>
          </div>
        </div>
      </section>

      <section
        className="overflow-y-auto py-24 h-full w-full flex flex-col px-5 md:px-0 items-center z-10 min-w-dvw bg-black/70 backdrop-blur-md"
        ref={lyricsContianerRef}
      >
        <ul className="flex flex-col gap-y-5">
          {lyric.lines.map((line) => {
            return (
              <li
                id={`line-${line.timeStamp}`}
                className={`transition-all duration-300 text-2xl font-bold ${
                  currentLine?.timeStamp === line.timeStamp
                    ? "text-white"
                    : "text-white/50"
                }`}
                key={line.timeStamp}
              >
                {line.text.map((part, index) => {
                  if (typeof part === "string") {
                    return <span key={index}>{part}</span>;
                  } else {
                    return (
                      <ruby key={index}>
                        {part.kanji}
                        <rt>{part.furigana}</rt>
                      </ruby>
                    );
                  }
                })}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="fixed z-0 top-32">
        <Youtube
          onReady={(e: YT.PlayerEvent) => {
            setPlayer(e.target);
          }}
          onPlay={() => {
            if (!player) {
              console.warn("player is not ready");
              return;
            }

            setIsPlaying(true);

            const id = setInterval(() => {
              setCurrentTimeStamp(player?.getCurrentTime());
            }, 100);

            setIntervalId(id);
          }}
          onPause={() => {
            setIsPlaying(false);
            if (!intervalId) {
              console.warn("intervalId is null");
              return;
            }
            clearInterval(intervalId);
          }}
          onEnd={() => {
            setIsPlaying(false);
            if (!intervalId) {
              console.warn("intervalId is null");
              return;
            }

            clearInterval(intervalId);
            setCurrentTimeStamp(0);
          }}
          videoId="E-DAUGDEeRA"
          opts={opts}
        />
      </section>

      <section className="fixed z-20 bottom-1 w-full">
        <nav className="flex items-center justify-center w-full px-16 py-1 border rounded-full shadow-xl gap-x-7 border-white/20 backdrop-blur-md bg-white/10">
          <button onMouseDown={handleToggle}>
            {isPlaying ? (
              <PauseIcon className="size-12" />
            ) : (
              <PlayIcon className="size-12" />
            )}
          </button>
        </nav>
      </section>
    </main>
  );
}
