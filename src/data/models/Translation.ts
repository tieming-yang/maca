import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

export type TranslationVersionRow =
  Database["public"]["Tables"]["translation_versions"]["Row"];
export type TranslationVersionInsert =
  Database["public"]["Tables"]["translation_versions"]["Insert"];
export type TranslationVersionUpdate =
  Database["public"]["Tables"]["translation_versions"]["Update"];

export type TranslationLinesRow =
  Database["public"]["Tables"]["translation_lines"]["Row"];
export type TranslationLinesInsert =
  Database["public"]["Tables"]["translation_lines"]["Insert"];
export type TranslationsLinesUpdate =
  Database["public"]["Tables"]["translation_lines"]["Update"];

export type Translation = TranslationVersionRow & {
  lines: TranslationLinesRow[];
};

export type TranslationInsert = TranslationVersionInsert & {
  lines: TranslationLinesInsert[];
};

export type DraftTranslationLine = Omit<
  TranslationLinesInsert,
  "version_id"
> & {
  version_id?: string;
};
export type DraftTranslationLineMap = Record<string, DraftTranslationLine>;

export type DraftTranslation = Pick<
  TranslationVersionInsert,
  "song_id" | "status" | "title" | "language_code"
> & { lines: DraftTranslationLineMap };

const db = createClient();

export const LanguageCode = {
  En: "en",
  ZhTw: "zh-TW",
  ZhCn: "zh-CN",
  Es: "es",
  Fr: "fr",
  De: "de",
  Ja: "ja",
  Ko: "ko",
  Ru: "ru",
  Pt: "pt",
  It: "it",
  Hi: "hi",
} as const;
export type LanguageCode = (typeof LanguageCode)[keyof typeof LanguageCode];
export const LanguageCodeArray = Object.entries(LanguageCode).map(
  ([key, value]) => [key, value]
);

export type TranslationStatus =
  Database["public"]["Tables"]["translation_versions"]["Row"]["status"];
export const TranslationStatusMap = {
  Draft: "draft",
  Pending: "pending",
  Publish: "published",
} as const;
export type TranslationStatusMap =
  (typeof TranslationStatusMap)[keyof typeof TranslationStatusMap];
export const PublicTranslationStatus = Object.entries(TranslationStatusMap)
  .filter(([_, value]) => value !== "pending")
  .map(([key, value]) => [key, value]);

export const Translation = {
  async getDefaultVersion(
    songId: string,
    lang: string
  ): Promise<TranslationVersionRow | null> {
    const { data, error } = await db
      .from("translation_versions")
      .select("*")
      .eq("song_id", songId)
      .eq("language_code", lang)
      .order("is_pinned_default", { ascending: false })
      .order("vote_score", { ascending: false, nullsFirst: false })
      .order("version_number", { ascending: true })
      .limit(1)
      .maybeSingle<TranslationVersionRow>();
    if (error) throw error;
    return data ?? null;
  },

  async getVersions(
    songId: string,
    language: LanguageCode
  ): Promise<TranslationVersionRow[]> {
    const { data, error } = await db
      .from("translation_versions")
      .select("*")
      .eq("song_id", songId)
      .eq("language_code", language);

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async get(versionId: string): Promise<Translation | null> {
    const { data, error } = await db
      .from("translation_versions")
      .select(
        `
        *,
        lines:translation_lines(*)
      `
      )
      .eq("id", versionId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return data;
      
  },

  async getByUser(userId: string): Promise<TranslationVersionRow[]> {
    const { data, error } = await db
      .from("translation_versions")
      .select("*")
      .eq("created_by", userId);

    if (error) throw error;

    return data;
  },

  async insertVersion(
    input: TranslationVersionInsert
  ): Promise<TranslationVersionRow> {
    const { data, error } = await db
      .from("translation_versions")
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async updateVersion(
    id: string,
    update: TranslationVersionUpdate
  ): Promise<TranslationVersionRow> {
    const { data, error } = await db
      .from("translation_versions")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async deleteVersion(id: string): Promise<void> {
    const { error } = await db
      .from("translation_versions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      throw error;
    }
  },

  // Translation Lines
  async getTranslationLines(versionId: string) {
    const { data, error } = await db
      .from("translation_lines")
      .select("*")
      .eq("version_id", versionId)
      .order("timestamp_sec", { ascending: true });

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async insertLines(
    lines: TranslationLinesInsert[]
  ): Promise<TranslationLinesRow[]> {
    if (!lines.length) throw new Error("Empty lines");

    const { data, error } = await db
      .from("translation_lines")
      .insert(lines)
      .select();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async updateLine(
    id: number,
    update: TranslationsLinesUpdate
  ): Promise<TranslationLinesRow> {
    const { data, error } = await db
      .from("translation_lines")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async updateLines(
    updates: TranslationsLinesUpdate[]
  ): Promise<TranslationLinesRow[]> {
    if (!updates.length) return [];

    const results = await Promise.all(
      updates.map(({ id, ...data }) => Translation.updateLine(id!, data))
    );

    return results;
  },

  async deleteLine(id: number): Promise<void> {
    const { error } = await db.from("translation_lines").delete().eq("id", id);

    if (error) {
      console.error(error);
      throw error;
    }
  },

  async deleteLines(songId: string): Promise<void> {
    const { error } = await db
      .from("translation_lines")
      .delete()
      .eq("song_id", songId);

    if (error) {
      console.error(error);
      throw error;
    }
  },

  async insert(translation: TranslationInsert): Promise<Translation> {
    const { lines, ...versionInput } = translation;
    const version = await Translation.insertVersion(versionInput);

    const linesWithVersion = lines.map((line, index) => ({
      line_index: line.line_index ?? index,
      ...line,
      version_id: version.id,
    }));

    const insertedLines = await Translation.insertLines(linesWithVersion);
    return { ...version, lines: insertedLines };
  },
};
