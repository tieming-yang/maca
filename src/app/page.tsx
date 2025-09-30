import { Song } from "@/songs/Song";
import Link from "next/link";
import SongList from "./components/song-list";

type SearchParams = Promise<{ isStaging: string }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const isStaging = searchParams.isStaging === "true";

  return (
    <main className="px-3">
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
        {isStaging ? (
          <SongList />
        ) : (
          Object.values(Song.songs).map((song) => {
            return (
              <li
                className="text-xl leading-relaxed font-semibold"
                style={{ filter: "drop-shadow(0 0 15px)" }}
                key={song.name}
              >
                <Link href={`learn/${decodeURIComponent(song.name)}`} prefetch>
                  {song.name}
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </main>
  );
}
