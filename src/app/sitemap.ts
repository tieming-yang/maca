import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const DEFAULT_BASE_URL = "https://maca.club";
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL).replace(
  /\/$/,
  "",
);

type SongSlug = {
  slug: string;
  created_at: string | null;
};

async function getSongSlugs(): Promise<SongSlug[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env vars for sitemap");
    return [];
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase
      .from("songs")
      .select("slug, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load song slugs for sitemap", error);
      return [];
    }

    return (data ?? []).reduce<SongSlug[]>((acc, song) => {
      const slug = song?.slug;
      if (!slug) return acc;

      acc.push({
        slug,
        created_at: song.created_at ?? null,
      });

      return acc;
    }, []);
  } catch (error) {
    console.error("Unexpected error creating sitemap song entries", error);
    return [];
  }
}

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: MetadataRoute.Sitemap[number]["priority"];
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  // { path: "/vote", changeFrequency: "weekly", priority: 0.8 },
  // { path: "/contribute", changeFrequency: "monthly", priority: 0.6 },
  // { path: "/playground", changeFrequency: "monthly", priority: 0.6 },
  { path: "/auth", changeFrequency: "yearly", priority: 0.3 },
  // { path: "/edit", changeFrequency: "weekly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${baseUrl}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const songs = await getSongSlugs();

  for (const song of songs) {
    const lastModified = song.created_at ? new Date(song.created_at) : now;

    entries.push(
      {
        url: `${baseUrl}/learn/${song.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/edit/${song.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      },
    );
  }

  return entries;
}

export const revalidate = 60;
