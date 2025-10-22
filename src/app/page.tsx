import Link from "next/link";
import Image from "next/image";
import SongList from "./components/song-list";
import InstallPWAPrompt from "./components/install-pwa-prompt";

type SearchParams = Promise<{ isStaging: string }>;

export default async function Home(props: { searchParams: SearchParams }) {
  return (
    <main className="px-1 w-full py-3 sm:px-3">
      <header className="flex md:px-3 justify-between pb-7 items-center w-full">
        <Link
          className="font-mono text-xl size-10 relative font-semibold"
          href="/"
        >
          <Image
            className="rounded-full"
            src="/favicons/web-app-manifest-192x192.png"
            alt="Maca logo"
            fill
            priority
          />
        </Link>
        <h1 className="text-md md:text-3xl xl:text-5xl">
          Learn Japanese by{" "}
          <span className="underline underline-offset-4 text-teal-500">
            singing
          </span>
        </h1>
      </header>

      <SongList />
      <InstallPWAPrompt />
    </main>
  );
}
