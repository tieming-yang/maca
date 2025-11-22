import { OG_IMAGE_URL, SITE_URL } from "@/utils/furigana/constants";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InstallPWAPrompt from "./components/install-pwa-prompt";
import SongList from "./components/song-list";

type SearchParams = Promise<{ isStaging: string }>;

export function generateMetadata(): Metadata {
  const title = "Learn Japanese by Singing Anime & J-Pop Lyrics | Maca";
  const description =
    "Maca is a lyric-first Japanese learning companion that pairs anime, J-Pop, and game soundtracks with romaji, furigana, timestamps, and community translations so you can memorize vocabulary and pitch accent while singing along.";

  return {
    title,
    description,
    applicationName: "Maca",
    category: "education",
    keywords: [
      "learn Japanese",
      "Japanese lyrics",
      "anime songs",
      "J-Pop romaji",
      "furigana practice",
      "Japanese karaoke",
      "language learning app",
      "music based learning",
    ],
    alternates: {
      canonical: SITE_URL,
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "Maca",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Screenshot of the Maca interface highlighting synced lyrics and translations",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_URL],
    },
    other: {
      "msapplication-TileColor": "#020617",
    },
  };
}

export default async function Home(props: { searchParams: SearchParams }) {
  return (
    <main className="space-y-10 px-1 w-full py-3 sm:px-3 pb-32">
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

      <SongList pageTitle="Recently Added" workTitle={null} />
      <SongList pageTitle="Naruto OPs" workTitle="ナルト" sorting="ascending" />
      <InstallPWAPrompt />
    </main>
  );
}
