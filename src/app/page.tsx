import { Song } from "./Song";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ul>
        {Object.values(Song.songs).map((song) => {
          return (
            <li key={song.name}>
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
