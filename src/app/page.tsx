"use client";

import { useEffect, useState } from "react";
import Youtube from "react-youtube";
import { lyrics } from "./osaka-lover";

export default function Home() {
  const [player, setPlayer] = useState(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentTimeStamp, setCurrentTimeStamp] = useState(0);
  const [currentLine, setCurrentLine] = useState("");

  useEffect(() => {
    const currentLyric = lyrics.find((lyric, index) => {
      const nextLyric = lyrics[index + 1];
      return (
        currentTimeStamp >= lyric.timeStamp &&
        (!nextLyric || currentTimeStamp < nextLyric.timeStamp)
      );
    });

    if (currentLyric) {
      setCurrentLine(currentLyric.lyric);
    }
  }, [currentTimeStamp]);

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Youtube
        // @ts-expect-error as I dont want to handle Youtube player event
        onReady={(e) => {
          setPlayer(e.target);
        }}
        onPlay={() => {
          const id = setInterval(() => {
            // @ts-expect-error as I dont want to handle Youtube player event
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

      <ul>
        {lyrics.map((lyric) => {
          return (
            <li
              className={`text-center leading-10 transition-all duration-300 ${
                currentLine === lyric.lyric
                  ? "text-white font-bold text-3xl"
                  : "text-white/70"
              }`}
              key={lyric.timeStamp}
            >
              {lyric.lyric}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
