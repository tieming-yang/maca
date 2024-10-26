import { Song } from "./Song";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center py-24 space-y-12 px-5 md:px-0">
      <Link
        className="fixed z-30 top-4 left-7 font-mono text-xl font-semibold"
        href="/"
      >
        maca
      </Link>
      <h1 className="text-3xl md:text-5xl xl:text-7xl">
        Learn Japanese by{" "}
        <span className="underline underline-offset-4 text-teal-500">
          singing
        </span>
      </h1>
      <ul className="flex flex-col">
        {Object.values(Song.songs).map((song) => {
          return (
            <li
              className="text-xl leading-relaxed font-semibold"
              style={{ filter: "drop-shadow(0 0 15px)" }}
              key={song.name}
            >
              <Link href={`learn/${decodeURIComponent(song.name)}`}>
                {song.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
