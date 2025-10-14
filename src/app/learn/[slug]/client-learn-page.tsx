"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import Youtube from "react-youtube";
import { Home, LoaderCircle } from "lucide-react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/data/query-keys";
import { Song, SongBundle } from "@/data/models/Song";
import { Button, topGlowBorder } from "@/app/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { addFurigana } from "@/utils/furigana/addFurigana";
import { FuriganaType } from "@/utils/furigana/constants";
import Loading from "@/app/components/loading";

const opts = { height: "780", width: "1280" };

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
  if (!slug) {
    console.error("No Slug!");
    redirect("/not-found");
  }
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

  const [isFuriganaReady, setIsFuriganaReady] = useState(false);
  const containerRef = useRef<HTMLUListElement>(null);

  const activeLineIndex = useMemo(() => {
    if (!data) return -1;
    const lines = data.lines;
    for (let i = 0; i < lines.length; i++) {
      const here = lines[i].timestamp_sec ?? 0;
      const next = lines[i + 1]?.timestamp_sec ?? Number.POSITIVE_INFINITY;
      if (currentSec >= here && currentSec < next) return i;
    }
    return -1;
  }, [data, currentSec]);

  const translationLine = useMemo(() => {
    if (!data?.translation) return (idx: number) => undefined;
    const map = data.translation.lines;
    return (idx: number) => map[idx];
  }, [data?.translation]);

  //TODO: toggle off / romaji
  useEffect(() => {
    if (!data) return;

    const root = containerRef.current;
    if (!root) return;

    async function _addFurigana(root: HTMLUListElement) {
      try {
        const elements = Array.from(root.querySelectorAll("li, span, h1"));

        if (elements.length)
          await addFurigana(FuriganaType.Hiragana, ...elements);
      } catch (err) {
        console.error("Add furigana effect error", err);
      } finally {
        setIsFuriganaReady(true);
      }
    }

    _addFurigana(root);
  }, [data]);

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
  if (isLoading || !data) return <Loading isFullScreen />;

  return (
    <main className="flex flex-col items-center" ref={containerRef}>
      {/* Header */}
      <section className="fixed z-20 top-0 w-full backdrop-blur-xs shadow-xl">
        <div
          className="flex items-center justify-center w-full py-1 gap-x-7 font-semibold"
          style={{ filter: "drop-shadow(0 0 7px)" }}
        >
          <div>
            <ruby className="text-xl">
              <h1>{data.name}</h1>
            </ruby>
            {/* Artists */}
            <div className="text-center">
              {data.credit?.primary_artist?.length && (
                <span>
                  {data.credit.primary_artist.map((p) => {
                    return (
                      <ruby key={p.id}>
                        <span>{p.display_name}</span>
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
          opts={{
            ...opts,
            playerVars: { autoplay: isFuriganaReady ? 1 : 0 },
          }}
        />
      </section>

      {/* Lines */}
      <section
        className="overflow-y-auto py-24 flex flex-col px-5 items-center z-10 min-w-dvw h-full bg-black/70 backdrop-blur-sm"
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
                className={`transition-all duration-300 text-xl font-bold ${
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
      <section className="fixed z-20 bottom-0 w-full font-mono">
        <div className="w-full">
          <div className="w-full flex items-center px-5">
            <span
              className={`${topGlowBorder} bg-black/20 backdrop-blur-3xl px-2 py-1 rounded-full`}
            >
              {secToTs(finalSec)}
            </span>

            {/* Funtions */}
            <div className="flex items-center justify-center w-full gap-x-7 pb-3">
              {/* <Button variant="icon" className="bg-black/20 backdrop-blur-3xl">
                <Link href="/">
                  <Home />
                </Link>
              </Button> */}
              <Button
                variant="icon"
                className="bg-black/20 backdrop-blur-3xl"
                onMouseDown={handleToggle}
              >
                {isPlaying ? (
                  <PauseIcon className="size-12" />
                ) : (
                  <PlayIcon className="size-12" />
                )}
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
            <span
              className={`${topGlowBorder} bg-black/20 backdrop-blur-3xl px-2 py-1 rounded-full`}
            >
              {secToTs(durationSec)}
            </span>
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
        </div>
      </section>
    </main>
  );
}
