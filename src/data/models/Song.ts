// src/data/Song.ts
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

export type TableRow = Database["public"]["Tables"]["songs"]["Row"];
export type ViewRow = Database["public"]["Views"]["song_with_base_json"]["Row"];
export type VersionRow =
  Database["public"]["Tables"]["translation_versions"]["Row"];
export type LineRow = Database["public"]["Tables"]["translation_lines"]["Row"];

export type JaToken = string | { kanji: string; furigana?: string };
export type BaseLine = {
  line_index: number;
  timestamp_sec: number;
  ja_tokens: JaToken[];
  romaji?: string;
};

export type Translation = {
  language_code: string;
  version_id: string;
  lines: Record<number, string>;
};

export type SongBundle = {
  credit: Credits;
  id: string;
  slug: string;
  name: string; // view column is `name`
  youtube_id: string | null;
  romaji: string;
  end_seconds: number | null; // view column is `end_seconds`
  furigana: string | null;
  base_lines: BaseLine[];
  translation?: Translation;
};

export type CreditPerson = {
  id: string;
  display_name: string | null;
  romaji: string | null;
  furigana: string | null;
};

export type Credits = {
  primary_artist: CreditPerson[];
  featured_artist: CreditPerson[];
  composer: CreditPerson[];
  lyricist: CreditPerson[];
};

const db = createClient();

export const Song = {
  async getAll(): Promise<TableRow[]> {
    const { data, error } = await db
      .from("songs")
      .select("*");

    if (error) {
      console.error(error);
      throw Error("getAll Error:", error);
    }

    return data as TableRow[];
  },

  async getViewBySlug(slug: string): Promise<ViewRow> {
    const { data, error } = await db
      .from("song_with_base_json")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) {
      console.error(error);
      throw Error("getViewBySlug Error:", error);
    }
    return data as ViewRow;
  },

  async getDefaultVersion(songId: string, lang: string) {
    const { data, error } = await db
      .from("translation_versions")
      .select("*")
      .eq("song_id", songId)
      .eq("language_code", lang)
      // .order("is_default", { ascending: false })
      // supabase-js doesn't support `nullsLast`; use `nullsFirst: false`
      // .order("vote_score", { ascending: false, nullsFirst: false })
      .order("version_number", { ascending: true })
      .limit(1)
      .maybeSingle<VersionRow>();
    if (error) throw error;
    return data ?? null;
  },

  async getTranslationLines(versionId: string) {
    const { data, error } = await db
      .from("translation_lines")
      .select("line_index, text_json")
      .eq("version_id", versionId)
      .order("line_index", { ascending: true });
    if (error) throw error;
    return Object.fromEntries(
      (data ?? []).map(
        (l) => [l.line_index!, (l.text_json as unknown as string) ?? ""],
      ), // jsonb -> string
    ) as Record<number, string>;
  },

  async getBundle(slug: string, lang: string = "en"): Promise<SongBundle> {
    const view = await Song.getViewBySlug(slug);

    const credit = await Song.getCredits(view.id!);

    // jsonb → narrow for UI
    const base = (view.base_lines ?? []) as unknown as BaseLine[];

    let translation: Translation | undefined;
    const version = await Song.getDefaultVersion(view.id!, lang);

    if (version) {
      const lines = await Song.getTranslationLines(version.id);
      translation = { language_code: lang, version_id: version.id, lines };
    }

    return {
      credit: credit,
      id: view.id!,
      slug: view.slug!,
      name: view.name ?? "",
      youtube_id: view.youtube_id ?? null,
      romaji: view.romaji ?? "",
      end_seconds: view.end_seconds ?? null,
      furigana: view.furigana ?? null,
      base_lines: base,
      translation,
    };
  },

  async getCredits(songId: string): Promise<Credits> {
    const { data, error } = await db
      .from("song_credits")
      .select("role, person:people(id, display_name, romaji, furigana)")
      .eq("song_id", songId);
    if (error) throw error;

    const credits: Credits = {
      primary_artist: [],
      featured_artist: [],
      composer: [],
      lyricist: [],
    };
    for (const row of data ?? []) {
      const role = row.role as keyof Credits;
      const p = row.person as CreditPerson | null;
      if (!p || !role) continue;
      if (credits[role]) credits[role].push(p);
    }
    return credits;
  },

  async insertSong(input: Database["public"]["Tables"]["songs"]["Insert"]) {
    const { data, error } = await db
      .from("songs")
      .insert(input)
      .select()
      .single<TableRow>();
    if (error) throw error;
    return data;
  },

  //? Utils
  toSlug(input: string): string {
    if (!input) return "";
    return input
      .normalize("NFKD") // split accents from letters
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ") // common readability tweak
      .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
      .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
  },
} as const;
