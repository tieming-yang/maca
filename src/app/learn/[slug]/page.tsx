import { Song } from "@/data/models/Song";
import ClientLearnPage from "./client-learn-page";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;

  const song = await Song.getBySlug(slug);

  const title = song?.name ? `${song.name} | Maca` : "Maca";
  const description = song?.romaji ?? "Learn Japanese lyrics on Maca.";
  const image = "https://maca.club/favicons/web-app-manifest-512x512.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://maca.club/learn/${slug}`,
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: song?.name ?? "Maca",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export type LearnPageParams = Promise<{ slug: string }>;

export default async function LearnPage({
  params,
}: {
  params: LearnPageParams;
}) {
  const { slug } = await params;

  return <ClientLearnPage slug={slug} />;
}
