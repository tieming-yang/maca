"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import Youtube from "react-youtube";
import { LoaderCircle } from "lucide-react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/data/query-keys";
import { Song, SongBundle } from "@/data/models/Song";
import { Button } from "@/app/components/ui/button";

const opts = { height: "780", width: "1280", playerVars: { autoplay: 1 } };

function secToTs(total?: number | null) {
  if (!total || total <= 0) return "0:00";
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function idFor(sec: number) {
  return `line-${Math.max(0, Math.floor(sec))}`;
}

export default function ClientLearnPage(props: { slug: string }) {
  const { slug } = props;

  // language overlay toggle (start with zh-TW to match your old UI)
  const [lang, setLang] = useState<string | undefined>("zh-TW");
  // song bundle from DB
  const { data, isLoading, error } = useQuery<SongBundle>({
    queryKey: QueryKey.song(slug, lang),
    queryFn: () => Song.getBundle(slug, lang),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const updateRef = useRef<NodeJS.Timeout | null>(null);
  const isScrubbingRef = useRef(false);

  // auto-scroll state
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const durationSec = data?.end_seconds ?? 0;
  const finalSec = Math.floor(scrub ?? currentSec);

  const activeLineIndex = useMemo(() => {
    if (!data) return -1;
    const lines = data.lines;
    for (let i = 0; i < lines.length; i++) {
      const here = lines[i].timestamp_sec ?? 0;
      console.log({ here });
      const next = lines[i + 1]?.timestamp_sec ?? Number.POSITIVE_INFINITY;
      console.log({ next });
      if (currentSec >= here && currentSec < next) return i;
    }
    return -1;
  }, [data, currentSec]);

  const translationLine = useMemo(() => {
    if (!data?.translation) return (idx: number) => undefined;
    const map = data.translation.lines;
    return (idx: number) => map[idx];
  }, [data?.translation]);

  // cleanup timer
  useEffect(() => {
    return () => {
      if (updateRef.current) clearInterval(updateRef.current);
    };
  }, []);

  // keyboard support (Space)
  const handleToggle = useCallback(() => {
    if (!player) return;
    return isPlaying ? player.pauseVideo() : player.playVideo();
  }, [player, isPlaying]);

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
      if (e.code === "Space") {
        e.preventDefault();
        handleToggle();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        player?.seekTo(Math.max(0, (player?.getCurrentTime() ?? 0) - 1), true);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        player?.seekTo((player?.getCurrentTime() ?? 0) + 1, true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleToggle, player]);

  // auto-scroll to active line
  useEffect(() => {
    if (
      !data ||
      activeLineIndex < 0 ||
      !lyricsContainerRef.current ||
      !isAutoScrolling
    )
      return;
    const sec = data.lines[activeLineIndex].timestamp_sec ?? 0;
    const el = document.getElementById(idFor(sec)) as HTMLLIElement | null;
    if (el) {
      isProgrammaticScroll.current = true;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(() => (isProgrammaticScroll.current = false), 800);
    }
  }, [data, activeLineIndex, isAutoScrolling]);

  // toggle auto-scroll when user scrolls manually
  useEffect(() => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (isProgrammaticScroll.current) return;
      setIsAutoScrolling(false);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(
        () => setIsAutoScrolling(true),
        2500
      );
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // TODO: better handling
  if (error)
    return <div className="p-10 text-red-400">Error: {error.message}</div>;
  if (!data)
    return (
      <div className="flex min-h-dvh min-w-dvw flex-col max-h-dvh items-center justify-center overflow-y-hidden">
        <LoaderCircle className="h-9 w-9 animate-spin" />
      </div>
    );

  return (
    <main className="flex min-h-dvh min-w-dvw flex-col max-h-dvh items-center overflow-y-hidden">
      {(!player || isLoading) && (
        <div className="fixed z-50 flex justify-center items-center top-0 w-full h-full bg-black/50 backdrop-blur-xs">
          <LoaderCircle className="h-9 w-9 animate-spin" />
        </div>
      )}

      {/* Header */}
      <section className="fixed z-20 top-0 w-full backdrop-blur-xs shadow-xl">
        <div
          className="flex items-center justify-center w-full py-1 gap-x-7 font-semibold"
          style={{ filter: "drop-shadow(0 0 7px)" }}
        >
          <div>
            <ruby className="text-xl">
              <h1>{data.name}</h1>
              <rt>{data.furigana}</rt>
            </ruby>
            {/* Artists */}
            <div className="text-center">
              {data.credit?.primary_artist?.length && (
                <span>
                  {data.credit.primary_artist.map((p) => {
                    return (
                      <ruby key={p.id}>
                        <span>{p.display_name}</span>
                        <rt>{p.furigana}</rt>
                      </ruby>
                    );
                  })}
                </span>
              )}

              {data.credit.featured_artist.length > 0 && <span> x </span>}

              {data.credit.featured_artist?.length > 0 && (
                <span>
                  {data.credit.featured_artist.map((f) => {
                    return (
                      <ruby key={f.id}>
                        <span>{f.display_name}</span>
                        <rt>{f.furigana}</rt>
                      </ruby>
                    );
                  })}
                </span>
              )}
            </div>
          </div>
          <div>
            {/* Lyricist / Composer */}
            {data.credit.lyricist?.length && (
              <div>
                作詞家:{" "}
                {data.credit.lyricist.map((l) => {
                  return (
                    <ruby key={l.id}>
                      <span>{l.display_name}</span>
                      <rt>{l.furigana}</rt>
                    </ruby>
                  );
                })}
              </div>
            )}
            {data.credit?.composer?.length && (
              <div>
                作曲家:{" "}
                {data.credit.composer.map((c) => {
                  return (
                    <ruby key={c.id}>
                      <span>{c.display_name}</span>
                      <rt>{c.furigana}</rt>
                    </ruby>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* YouTube */}
      <section className="fixed z-0 top-32">
        <Youtube
          onReady={(e: YT.PlayerEvent) => {
            const p = e.target;
            setPlayer(p);
            p.setPlaybackQuality("small");
          }}
          onPlay={() => {
            if (!player) return;
            if (updateRef.current) clearInterval(updateRef.current);
            setIsPlaying(true);
            updateRef.current = setInterval(() => {
              if (isScrubbingRef.current) return;
              setCurrentSec(Math.floor(player?.getCurrentTime() ?? 0));
            }, 250);
          }}
          onPause={() => {
            if (updateRef.current) clearInterval(updateRef.current);
            setIsPlaying(false);
          }}
          onEnd={() => {
            setIsPlaying(false);
            if (updateRef.current) clearInterval(updateRef.current);
            setCurrentSec(0);
            player?.seekTo(0, true);
          }}
          videoId={data.youtube_id ?? undefined}
          opts={opts}
        />
      </section>

      {/* Lines */}
      <section
        className="overflow-y-auto py-24 flex flex-col px-5 xl:px-0 items-center z-10 min-w-dvw h-full bg-black/70 backdrop-blur-sm"
        ref={lyricsContainerRef}
      >
        <ul className="flex flex-col gap-y-5">
          {data.lines.map((line, i) => {
            const { timestamp_sec, lyric } = line;
            const isActive = i === activeLineIndex;

            return (
              <li
                key={timestamp_sec}
                id={idFor(timestamp_sec ?? 0)}
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
      </section>

      {/* Toolbar */}
      <section className="fixed z-20 bottom-0 w-full rounded-t-3xl font-mono">
        <nav className="w-full">
          <div className="w-full flex items-center px-5">
            <span>{secToTs(finalSec)}</span>

            {/* Funtions */}
            <div className="flex items-center justify-center w-full gap-x-7 pb-3">
              <Button
                variant="icon"
                className="size-15 bg-black/20 backdrop-blur-3xl"
                onMouseDown={handleToggle}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </Button>
              {/* <div className="flex items-center gap-3">
                <button
                  onClick={() => setLang((l) => (l ? undefined : "zh-TW"))}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                  title={lang ? `Hide ${lang}` : "Show zh-TW"}
                >
                  <LanguageIcon
                    className={`size-5 ${
                      lang ? "text-white" : "text-white/50"
                    }`}
                  />
                  <span className="text-sm">{lang ?? "none"}</span>
                </button>
              </div> */}
            </div>
            <span>{secToTs(durationSec)}</span>
          </div>

          {/* Slider */}
          <div className="flex justify-center">
            <input
              style={
                {
                  "--fill": `${(finalSec / Math.max(1, durationSec)) * 100}%`,
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
              max={durationSec ?? 0}
              value={finalSec}
              step={1}
              onChange={(e) => setScrub(parseInt(e.target.value, 10))}
              onPointerDown={() => (isScrubbingRef.current = true)}
              onPointerUp={() => {
                const ts = finalSec || 0;
                player?.seekTo(ts, true);
                setCurrentSec(ts);
                isScrubbingRef.current = false;
                setScrub(null);
              }}
            />
          </div>
        </nav>
      </section>
    </main>
  );
}
