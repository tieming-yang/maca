"use client";

import type { TLyric, TSong } from "@/songs/Song";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Youtube from "react-youtube";
import {
  PlayIcon,
  PauseIcon,
  LanguageIcon,
} from "@heroicons/react/24/solid";

import { ListIcon, LoaderCircle } from "lucide-react";
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

type Params = Promise<{ song: string }>;

export default function LearnPage(props: { params: Params }) {
  const params = use(props.params);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedSong = decodeURIComponent(
    params.song
  ) as keyof typeof Song.songs;

  const lyricsContianerRef = useRef<HTMLDivElement>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Song related states
  const [songDuration, setSongDuration] = useState<number | null>(null);
  const [currentTimestampSec, setCurrentTimeStamp] = useState<number>(0);
  const [currentLyric, setCurrentLyric] = useState<TLyric>();

  // Scrolling states
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const isProgramaticlyScrolling = useRef(true);

  // Slider states
  const [scrubbedTimestampSec, setScrubbedTimestampSec] = useState<
    number | null
  >(null);
  const isScrubbingRef = useRef(false);

  const [showZh, setShowZh] = useState(true);

  // Derived Values
  const currentSong = useMemo(() => {
    return Song.sanitizeCurrentSong(Song.songs[selectedSong] as TSong);
  }, [selectedSong]);

  const durationSec = Song.timestampToSeconds(
    songDuration ?? currentSong.end ?? 0
  );
  const durationTimestamp = Song.secondsToTimestamp(durationSec);
  const finalTimestampSec = scrubbedTimestampSec ?? currentTimestampSec;
  const finalSec = Math.floor(finalTimestampSec);
  const currentTimestamp = Song.secondsToTimestamp(finalSec);

  useEffect(() => {
    const CurrentLyric = currentSong.lyrics.find((lyric, index) => {
      const nextLyric = currentSong.lyrics[index + 1];
      return (
        currentTimestampSec >= lyric.timeStamp &&
        (!nextLyric || currentTimestampSec < nextLyric.timeStamp)
      );
    });

    if (CurrentLyric) {
      setCurrentLyric({
        text: CurrentLyric.text,
        timeStamp: CurrentLyric.timeStamp,
      });
    }
  }, [currentTimestampSec, currentSong]);

  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!currentLyric || !lyricsContianerRef.current || !isAutoScrolling)
      return;

    const sanitizedId = `#line-${Song.sanitizeTimeStamp(
      currentLyric.timeStamp as number
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

  // Keyboard supports
  const handleToggle = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [player, isPlaying]);

  const scrubBy = useCallback(
    (delta: number) => {
      if (!player) return;

      const base = Math.floor(
        player.getCurrentTime() ?? currentTimestampSec ?? 0
      );
      const max = durationSec || 0;
      const next = Math.max(0, Math.min(max, base + delta));

      isScrubbingRef.current = false;

      player.seekTo(next, true);
      setCurrentTimeStamp(next);
      setScrubbedTimestampSec(null);
    },
    [player, durationSec, currentTimestampSec]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handleToggle();
          break;
        case "ArrowLeft":
        case "KeyH":
        case "h":
        case "H":
          e.preventDefault();
          scrubBy(-1);
          break;
        case "ArrowRight":
        case "KeyL":
        case "l":
        case "L":
          e.preventDefault();
          scrubBy(1);
          break;

        default:
          return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleToggle, scrubBy]);

  // keep this console.log for adjust the time
  // console.log("time", currentTimeStamp);
  return (
    <main className="flex min-h-dvh min-w-dvw flex-col max-h-dvh items-center overflow-y-hidden">
      {!player && (
        <div className="fixed z-50 flex justify-center items-center top-0 w-full h-full bg-black/50 backdrop-blur-xs">
          <LoaderCircle className="h-9 w-9 animate-spin" />
        </div>
      )}

      {/* Header */}
      <section className="fixed z-20 top-0 w-full backdrop-blur-xs shadow-xl">
        <div
          className="flex items-center justify-center w-full py-1 gap-x-7 font-semibold"
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

      {/* YouTube Player */}
      <section className="fixed z-0 top-32">
        <Youtube
          onReady={(e: YT.PlayerEvent) => {
            const p = e.target;
            setPlayer(p);
            p.setPlaybackQuality("small");

            const duration = Math.floor(p.getDuration() ?? 0);
            if (duration) {
              setSongDuration(duration);
            }
          }}
          onPlay={() => {
            if (!player) {
              console.warn("player is not ready");
              return;
            }

            if (updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current);
              updateIntervalRef.current = null;
            }

            setIsPlaying(true);

            if (Youtube.PlayerState.PLAYING) {
              updateIntervalRef.current = setInterval(() => {
                if (isScrubbingRef.current) {
                  return;
                }

                const now = Math.floor(player?.getCurrentTime() ?? 0);
                setCurrentTimeStamp((prev) => (prev === now ? prev : now));
              }, 250);
            }
          }}
          onPause={() => {
            if (updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current);
              updateIntervalRef.current = null;
            }

            setIsPlaying(false);
          }}
          onEnd={() => {
            setIsPlaying(false);
            if (updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current);
              updateIntervalRef.current = null;
            }
            setCurrentTimeStamp(0);
            player?.seekTo(0, true);
          }}
          onStateChange={(e: { data: number; target: YT.Player }) => {
            const duration = Math.floor(e.target.getDuration() ?? 0);
            if (duration && duration !== songDuration)
              setSongDuration(duration);
          }}
          videoId={currentSong.youtubeId}
          opts={opts}
        />
      </section>

      {/* Lyrics */}
      <section
        className="overflow-y-auto py-24 h-full w-full flex flex-col px-5 xl:px-0 items-center z-10 min-w-dvw bg-black/70 backdrop-blur-sm"
        ref={lyricsContianerRef}
      >
        <ul className="flex flex-col gap-y-5">
          {currentSong.lyrics.map((line) => {
            return (
              <li
                key={line.timeStamp}
                id={`line-${Song.sanitizeTimeStamp(line.timeStamp)}`}
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
                {showZh && line.zh && <p className="text-xl">{line.zh}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Toolbar */}
      <section className="fixed z-20 bottom-0 w-full rounded-t-3xl border-t shadow-xl border-white/10 backdrop-blur-md font-mono">
        <nav className="w-full">
          <div className="w-full flex items-center px-5">
            <span>{currentTimestamp}</span>
            <div className="flex items-center justify-center w-full gap-x-7 pb-3">
              <button>
                <Link href="/">
                  <ListIcon className="size-7" />
                </Link>
              </button>

              <button onMouseDown={handleToggle}>
                {isPlaying ? (
                  <PauseIcon className="size-14" />
                ) : (
                  <PlayIcon className="size-14" />
                )}
              </button>

              <button onMouseDown={() => setShowZh(!showZh)}>
                {currentSong.lyrics[0].zh && showZh ? (
                  <LanguageIcon className="size-7 text-white" />
                ) : (
                  <LanguageIcon className="size-7 text-white/50" />
                )}
              </button>
            </div>
            <span>{songDuration && durationTimestamp}</span>
          </div>
          <div className="flex justify-center">
            <input
              style={
                {
                  "--fill": `${(finalSec / (durationSec || 1)) * 100}%`,
                } as React.CSSProperties
              }
              className="
              w-full select-none appearance-none bg-transparent
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
              transition-colors

              /* TRACK (WebKit: aurora gradient fill + dim base) */
              [&::-webkit-slider-runnable-track]:h-3

              /* Two-layer background: first is aurora, sized to --fill; second is the dim base */
              [&::-webkit-slider-runnable-track]:[background-image:linear-gradient(90deg,rgba(16,185,129,0.9),rgba(5,150,105,0.6)_50%,rgba(4,120,87,0.4)_100%),linear-gradient(90deg,rgba(16,185,129,0.25),rgba(16,185,129,0)_80%)]
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-webkit-slider-runnable-track]:[background-size:var(--fill)_100%,calc(var(--fill)+40px)_100%]
              [&::-webkit-slider-runnable-track]:[background-repeat:no-repeat]
              [&::-webkit-slider-runnable-track]:[filter:drop-shadow(0_0_10px_rgba(16,185,129,0.25))]

              /* TRACK (Firefox) */
              [&::-moz-range-track]:h-3

              [&::-moz-range-progress]:h-3
              [&::-moz-range-track]:bg-transparent
              [&::-moz-range-progress]:rounded-full
              [&::-moz-range-progress]:bg-[linear-gradient(90deg,rgba(16,185,129,0.85),rgba(5,150,105,0.55)_50%,rgba(4,120,87,0.35)_100%)]
              [&::-moz-range-progress]:[box-shadow:0_0_14px_rgba(16,185,129,0.25)]

              /* THUMB */
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-2

              [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:shadow

              /* Fallback color for other browsers */
              accent-emerald-500
            "
              type="range"
              min={0}
              max={durationSec}
              value={finalSec}
              step={1}
              onChange={(e) => setScrubbedTimestampSec(Number(e.target.value))}
              onPointerDown={() => (isScrubbingRef.current = true)}
              onPointerUp={() => {
                const timeStamp = finalSec || 0;

                if (!player) {
                  console.warn("Player is not ready yet");
                  return;
                }

                player.seekTo(timeStamp, true);

                setCurrentTimeStamp(timeStamp);
                isScrubbingRef.current = false;
                setScrubbedTimestampSec(null);
              }}
            />
          </div>
        </nav>
      </section>
    </main>
  );
}
