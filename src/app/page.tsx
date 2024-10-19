"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Youtube from "react-youtube";
import { Line, lyric } from "./osaka-lover";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { Lyric } from "./lyric";

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

  const lyricsContianerRef = useRef<HTMLDivElement>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTimeStamp, setCurrentTimeStamp] = useState<number>(0);
  const [currentLine, setCurrentLine] = useState<Line>();

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const isProgramaticlyScrolling = useRef(true);

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
    if (!currentLine || !lyricsContianerRef.current || !isAutoScrolling) return;

    const sanitizedId = `#line-${Lyric.sanitizeTimeStamp(
      currentLine.timeStamp
    )}`;
    const activeLine = document.querySelector(sanitizedId) as HTMLLIElement;
    if (activeLine) {
      isProgramaticlyScrolling.current = true;
      activeLine.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(() => {
        isProgramaticlyScrolling.current = false;
      }, 1000);
    }
  }, [currentLine, isAutoScrolling]);

  useEffect(() => {
    const handleScroll = () => {
      if (isProgramaticlyScrolling.current) return;
      setIsAutoScrolling(false);
      isProgramaticlyScrolling.current = false;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsAutoScrolling(true);
      }, 3000);
    };

    if (!lyricsContianerRef.current) return;
    const lyricsContainer = lyricsContianerRef.current;
    lyricsContainer.addEventListener("scroll", handleScroll);

    return () => {
      lyricsContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [player, isPlaying]);

  useEffect(() => {
    const handleSpaceKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener("keydown", handleSpaceKeyDown);

    return () => {
      window.removeEventListener("keydown", handleSpaceKeyDown);
    };
  }, [handleToggle]);

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

            updateIntervalRef.current = setInterval(() => {
              setCurrentTimeStamp(player?.getCurrentTime());
            }, 100);
          }}
          onPause={() => {
            setIsPlaying(false);
            if (!updateIntervalRef.current) {
              console.warn("intervalId is null");
              return;
            }
            clearInterval(updateIntervalRef.current);
          }}
          onEnd={() => {
            setIsPlaying(false);
            if (!updateIntervalRef.current) {
              console.warn("intervalId is null");
              return;
            }

            clearInterval(updateIntervalRef.current);

            setCurrentTimeStamp(0);
          }}
          videoId="E-DAUGDEeRA"
          opts={opts}
        />
      </section>

                id={`line-${Lyric.sanitizeTimeStamp(line.timeStamp)}`}
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
