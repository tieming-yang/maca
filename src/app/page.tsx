"use client";

import { useEffect, useRef, useState } from "react";
import Youtube from "react-youtube";
import { Line, lyric } from "./osaka-lover";

const opts = {
  height: "300",
  width: "440",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

export default function Home() {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentTimeStamp, setCurrentTimeStamp] = useState<number>(0);
  const [currentLine, setCurrentLine] = useState<Line>();

  const lyricsContianerRef = useRef<HTMLUListElement>(null);

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
      activeLine.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [currentLine]);

  const handleToggle = () => {
    if (!player) return;

    if (player.getPlayerState() === 1) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };
  console.log(player.getPlayerState());
  // keep this console.log for adjust the time
  // console.log("time", currentTimeStamp);
  return (
    <main className="flex min-h-screen min-w-dvw flex-col max-h-dvh items-center p-3 md:p-0 overflow-y-hidden">
      <Youtube
        onReady={(e: YT.PlayerEvent) => {
          setPlayer(e.target);
        }}
        onPlay={() => {
          if (!player) return;
          const id = setInterval(() => {
            setCurrentTimeStamp(player?.getCurrentTime());
          }, 100);

          setIntervalId(id);
        }}
        onPause={() => {
          if (!intervalId) {
            console.warn("intervalId is null");
            return;
          }

          clearInterval(intervalId);
        }}
        onEnd={() => {
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

      <section className="" id="metadata">
        <h1>{lyric.title}</h1>
        <p>{lyric.artist}</p>
        <p>作詞家: {lyric.lyricist}</p>
        <p>作曲家: {lyric.composer}</p>
      </section>

      <div className="overflow-y-auto min-w-dvw">
        <ul ref={lyricsContianerRef} className="">
          {lyric.lines.map((line) => {
            return (
              <li
                id={`line-${line.timeStamp}`}
                className={`transition-all leading-[3.5rem] duration-300 ${
                  currentLine?.timeStamp === line.timeStamp
                    ? "text-white font-bold text-2xl"
                    : "text-white/70 text-xl"
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
      </div>

      <section className="fixed bottom-3 w-full px-3 md:px-0 flex justify-center items-center">
        <nav className="flex items-center justify-center w-full px-16 py-2 border rounded-full shadow-xl gap-x-7 border-primary/70 backdrop-blur-md bg-white/30">
          <button onMouseDown={handleToggle}>play</button>
        </nav>
      </section>
    </main>
  );
}
