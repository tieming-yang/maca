// src/data/Song.ts
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";
import { Work, type WorkRow } from "./Work";
import { Credit, FormattedCredit } from "./Credit";
import { Line, LineRow } from "./Line";

export type TableRow = Database["public"]["Tables"]["songs"]["Row"];
export type ViewRow = Database["public"]["Tables"]["songs"]["Row"];
export type VersionRow =
  Database["public"]["Tables"]["translation_versions"]["Row"];
export type TranslationLineRow =
  Database["public"]["Tables"]["translation_lines"]["Row"];
export type InsertRow = Database["public"]["Tables"]["songs"]["Insert"];
export type UpdateRow = Database["public"]["Tables"]["songs"]["Update"];
export type SongWithWorkRow = TableRow & { work: WorkRow | null };

export type JaToken = string | { kanji: string; furigana?: string };

export type Translation = {
  language_code: string;
  version_id: string;
  lines: Record<number, string>;
};

export type SongBundle = {
  credit: FormattedCredit;
  id: string;
  slug: string;
  name: string; // view column is `name`
  youtube_id: string | null;
  romaji: string;
  end_seconds: number | null; // view column is `end_seconds`
  furigana: string | null;
  lines: LineRow[];
  translation?: Translation;
  work: WorkRow | null;
  created_at: string | null;
  created_by: string | null;
};

const db = createClient();

export const Song = {
  secondsToTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  },

  timestampToSeconds(
    timestamp: string | number,
    option?: { srt: boolean },
  ): number {
    if (!timestamp) return 0;
    if (typeof timestamp === "number") return Math.round(timestamp);

    if (option?.srt) {
      const [rawStart, rawEnd] = timestamp.split(/\s*-->\s*/);
      if (!rawStart) {
        console.error("No match SRT format");
        return 0;
      }

      const match = rawStart?.match(
        /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/,
      );
      if (!match) {
        console.error("No capture matched");
        return 0;
      }

      const [, hours, minutes, seconds, millis] = match;
      const totalSeconds = Number(hours) * 3600 +
        Number(minutes) * 60 +
        Number(seconds) +
        Number(millis) / 1000;

      return Math.round(totalSeconds);
    }

    const [minutes, seconds] = timestamp.split(":");

    return Math.round(Number(minutes) * 60 + Number(seconds));
  },

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

  async getBySlug(slug: string): Promise<SongWithWorkRow> {
    const { data, error } = await db
      .from("songs")
      .select(
        "*, work:works(id, title, romaji, furigana, kind, notes, year, created_at)",
      )
      .eq("slug", slug)
      .single<SongWithWorkRow>();

    if (error) {
      console.error(error);
      throw Error("getBySlug Error:", error);
    }

    return data;
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
    const song = await Song.getBySlug(slug);

    const credit = await Credit.get(song.id!);
    const lines = await Line.get(song.id);

    let work = null;
    if (song.work_id) {
      work = await Work.getById(song.work_id);
    }

    let translation: Translation | undefined;
    const version = await Song.getDefaultVersion(song.id!, lang);

    if (version) {
      const lines = await Song.getTranslationLines(version.id);
      translation = { language_code: lang, version_id: version.id, lines };
    }

    return {
      id: song.id!,
      slug: song.slug!,
      name: song.name ?? "",
      youtube_id: song.youtube_id ?? null,
      romaji: song.romaji ?? "",
      end_seconds: song.end_seconds ?? null,
      furigana: song.furigana ?? null,
      created_at: song.created_at,
      created_by: song.created_by,
      credit,
      lines,
      translation,
      work,
    };
  },

  async insert(input: InsertRow) {
    const { data, error } = await db
      .from("songs")
      .insert(input)
      .select()
      .single<TableRow>();
    if (error) throw error;
    return data;
  },

  async update(id: string, update: UpdateRow) {
    const { data, error } = await db
      .from("songs")
      .update(update)
      .eq("id", id)
      .select()
      .single<TableRow>();

    if (error) throw error;

    return data;
  },

  async deleteSong(id: string) {
    const { error } = await db.from("songs").delete().eq("id", id);

    if (error) throw error;
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
