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

export type DraftTranslationLine =
  & Omit<TranslationLinesInsert, "version_id">
  & {
    version_id?: string;
  };
export type DraftTranslationLineMap = Record<string, DraftTranslationLine>;

export type DraftTranslation =
  & Pick<
    TranslationVersionInsert,
    "song_id" | "status" | "title" | "language_code"
  >
  & { lines: DraftTranslationLineMap };

const db = createClient();

export const LanguageCode = {
  En: "en",
} as const;
export type LanguageCode = (typeof LanguageCode)[keyof typeof LanguageCode];

export const Translation = {
  async getDefaultVersion(
    songId: string,
    lang: string,
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
    language: LanguageCode,
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

  async insertVersion(
    input: TranslationVersionInsert,
  ): Promise<TranslationVersionInsert> {
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
    update: TranslationVersionUpdate,
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
    const { error } = await db.from("translation_versions").delete().eq(
      "id",
      id,
    );

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
    lines: TranslationLinesInsert[],
  ): Promise<TranslationLinesRow[]> {
    if (!lines.length) return [];
    const sanitizedTranslations = lines.map(({ id, ...rest }) => rest);

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
    update: TranslationsLinesUpdate,
  ): Promise<TranslationLinesRow> {
    const { data, error } = await db.from("translation_lines").update(update)
      .eq("id", id).select().single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async updateLines(
    updates: TranslationsLinesUpdate[],
  ): Promise<TranslationLinesRow[]> {
    if (!updates.length) return [];

    const results = await Promise.all(
      updates.map(({ id, ...data }) => Translation.updateLine(id!, data)),
    );

    return results;
  },

  async deleteLine(id: number): Promise<void> {
    const { error } = await db
      .from("translation_lines")
      .delete()
      .eq("id", id);

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
}; //
