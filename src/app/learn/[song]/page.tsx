"use client";

import type { TLyric } from "@/songs/Song";

import { useCallback, useEffect, useRef, useState } from "react";
import Youtube from "react-youtube";
import { PlayIcon, PauseIcon, HomeIcon } from "@heroicons/react/24/solid";
import { LoaderCircle } from "lucide-react";
import { Song } from "@/songs/Song";
import Link from "next/link";

const opts = {
  height: "780",
  width: "1280",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

export default function Learn({ params }: { params: { song: string } }) {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedSong = decodeURIComponent(
    params.song
  ) as keyof typeof Song.songs;

  const lyricsContianerRef = useRef<HTMLDivElement>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTimeStamp, setCurrentTimeStamp] = useState<number>(0);
  const [currentLyric, setCurrentLyric] = useState<TLyric>();

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const isProgramaticlyScrolling = useRef(true);

  const currentSong = Song.songs[selectedSong];
  useEffect(() => {
    const CurrentLyric = currentSong.lyrics.find((lyric, index) => {
      const nextLyric = currentSong.lyrics[index + 1];
      return (
        currentTimeStamp >= lyric.timeStamp &&
        (!nextLyric || currentTimeStamp < nextLyric.timeStamp)
      );
    });

    if (CurrentLyric) {
      setCurrentLyric({
        text: CurrentLyric.text,
        timeStamp: CurrentLyric.timeStamp,
      });
    }
  }, [currentTimeStamp, currentSong]);

  useEffect(() => {
    if (!currentLyric || !lyricsContianerRef.current || !isAutoScrolling)
      return;

    const sanitizedId = `#line-${Song.sanitizeTimeStamp(
      currentLyric.timeStamp
    )}`;
    const activeLine = document.querySelector(sanitizedId) as HTMLLIElement;
    if (activeLine) {
      isProgramaticlyScrolling.current = true;
      activeLine.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(() => {
        isProgramaticlyScrolling.current = false;
      }, 1000);
    }
  }, [currentLyric, isAutoScrolling]);

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
      {!player && (
        <div className="fixed z-50 flex justify-center items-center top-0 w-full h-full bg-black/50 backdrop-blur-sm">
          <LoaderCircle className="h-9 w-9 animate-spin" />
        </div>
      )}
      <section className="fixed z-20 top-0 w-full">
        <div
          className="flex items-center justify-center w-full py-1 border-b shadow-xl gap-x-7 border-white/20 backdrop-blur-sm  font-semibold"
          style={{ filter: "drop-shadow(0 0 7px)" }}
          id="metadata"
        >
          <div>
            <h1 className="text-xl">{currentSong.name}</h1>
            <p>{currentSong.artist}</p>
          </div>
          <div>
            <p>作詞家: {currentSong.lyricist}</p>
            <p>作曲家: {currentSong.composer}</p>
          </div>
        </div>
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
            player?.seekTo(0, true);
          }}
          videoId={currentSong.youtubeId}
          opts={opts}
        />
      </section>

      <section
        className="overflow-y-auto py-24 h-full w-full flex flex-col px-5 xl:px-0 items-center z-10 min-w-dvw bg-black/70 backdrop-blur-md"
        ref={lyricsContianerRef}
      >
        <ul className="flex flex-col gap-y-5">
          {currentSong.lyrics.map((line) => {
            return (
              <li
                key={line.timeStamp}
                id={`line-${Song.timestampToSeconds(line.timeStamp)}`}
                onMouseDown={() => {
                  setCurrentTimeStamp(line.timeStamp);
                  player?.seekTo(line.timeStamp, true);
                  player?.playVideo();
                }}
                className={`transition-all duration-300 text-2xl font-bold ${
                  currentLyric?.timeStamp === line.timeStamp
                    ? "text-white"
                    : "text-white/50"
                }`}
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

      <section className="fixed z-20 bottom-1 w-full">
        <nav className="flex items-center justify-center w-full px-16 py-1 border rounded-full shadow-xl gap-x-7 border-white/20 backdrop-blur-md">
          <button>
            <Link href="/">
              <HomeIcon className="size-7" />
            </Link>
          </button>

          <button onMouseDown={handleToggle}>
            {isPlaying ? (
              <PauseIcon className="size-14" />
            ) : (
              <PlayIcon className="size-14" />
            )}
          </button>
        </nav>
      </section>
    </main>
  );
}
