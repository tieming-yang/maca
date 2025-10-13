import Link from "next/link";
import SongList from "./components/song-list";

type SearchParams = Promise<{ isStaging: string }>;

export default async function Home(props: { searchParams: SearchParams }) {
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
        <SongList />
      </ul>
    </main>
  );
}
