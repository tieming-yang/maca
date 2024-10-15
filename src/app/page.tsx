"use client";

import { useEffect, useState } from "react";
import Youtube from "react-youtube";
import { Line, lyric } from "./osaka-lover";

const opts = {
  height: "390",
  width: "640",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

export default function Home() {
  const [player, setPlayer] = useState(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentTimeStamp, setCurrentTimeStamp] = useState(0);
  const [currentLine, setCurrentLine] = useState<Line>();

  useEffect(() => {
    const currentLine = lyric.lines.find((line, index) => {
      const nextLyric = lyric.lines[index + 1];
      return (
        currentTimeStamp >= line.timeStamp &&
        (!nextLyric || currentTimeStamp < nextLyric.timeStamp)
      );
    });

    if (currentLine) {
      setCurrentLine({ text: currentLine.text, timeStamp: currentLine.timeStamp });
    }
  }, [currentTimeStamp]);

  console.log("time", currentTimeStamp);
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
        {lyric.lines.map((line) => {
          return (
            <li
              className={`text-center leading-10 transition-all duration-300 ${
                currentLine?.timeStamp === line.timeStamp
                  ? "text-white font-bold text-xl"
                  : "text-white/70"
              }`}
              key={line.timeStamp}
            >
              {line.text}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
