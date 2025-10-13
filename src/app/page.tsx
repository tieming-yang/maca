import Link from "next/link";
import SongList from "./components/song-list";

type SearchParams = Promise<{ isStaging: string }>;

export default async function Home(props: { searchParams: SearchParams }) {
  return (
    <main className="px-3 w-full">
      <header className="flex justify-between items-center w-full">
        <Link className="font-mono text-xl font-semibold" href="/">
          maca
        </Link>
        <h1 className="text-3xl md:text-3xl xl:text-5xl">
          Learn Japanese by{" "}
          <span className="underline underline-offset-4 text-teal-500">
            singing
          </span>
        </h1>
      </header>

      <SongList />
    </main>
  );
}
