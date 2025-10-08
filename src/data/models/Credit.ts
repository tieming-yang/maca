import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

export type CreditRow = Database["public"]["Tables"]["song_credits"]["Row"];
export type CreditInsert =
  Database["public"]["Tables"]["song_credits"]["Insert"];
export type CreditUpdate =
  Database["public"]["Tables"]["song_credits"]["Update"];

export type CreditRole = Database["public"]["Enums"]["credit_role"];

const CREDIT_ROLE_VALUES = [
  "primary_artist",
  "featured_artist",
  "composer",
  "lyricist",
] as const satisfies ReadonlyArray<CreditRole>;

const CREDIT_ROLE_LABELS: Record<CreditRole, string> = {
  primary_artist: "primary_artist",
  featured_artist: "featured_artist",
  composer: "composer",
  lyricist: "lyricist",
};

export type CreditPerson = {
  id: string;
  display_name: string | null;
  romaji: string | null;
  furigana: string | null;
  creditId?: number;
};

export type FormattedCredit = {
  primary_artist: CreditPerson[];
  featured_artist: CreditPerson[];
  composer: CreditPerson[];
  lyricist: CreditPerson[];
};

const db = createClient();

export const Credit = {
  CREDIT_ROLE_VALUES,
  CREDIT_ROLE_LABELS,

  async getAll(): Promise<CreditRow[]> {
    const { data, error } = await db
      .from("song_credits")
      .select("*")
      .order("display_name", { ascending: true });

    if (error) {
      console.error(error);
      throw error;
    }

    return data ?? [];
  },

  async get(songId: string): Promise<FormattedCredit> {
    const { data, error } = await db
      .from("song_credits")
      .select("id, role, person:people(id, display_name, romaji, furigana)")
      .eq("song_id", songId);
    if (error) throw error;

    const credits: FormattedCredit = {
      primary_artist: [],
      featured_artist: [],
      composer: [],
      lyricist: [],
    };
    for (const row of data ?? []) {
      const role = row.role as keyof FormattedCredit;
      const p = row.person as CreditPerson | null;
      if (!p || !role) continue;

      if (credits[role]) {
        credits[role].push({
          ...p,
          creditId: row.id,
        });
      }
    }
    return credits;
  },

  async create(input: CreditInsert): Promise<CreditRow> {
    const { data, error } = await db
      .from("song_credits")
      .insert(input)
      .select()
      .single<CreditRow>();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async insert(
    songId: string,
    credits: FormattedCredit,
  ): Promise<void> {
    if (!songId) return;

    const entries: CreditInsert[] = [];

    Object.entries(credits).forEach(([role, people]) => {
      people?.forEach((person, index) => {
        if (!person) return;

        entries.push({
          song_id: songId,
          person_id: person.id,
          role: role as CreditRole,
          position: index,
        });
      });
    });

    if (entries.length === 0) return;

    const { error: insertError } = await db
      .from("song_credits")
      .insert(entries)
      .eq("song_id", songId);

    if (insertError) {
      console.error(insertError);
      throw insertError;
    }
  },
  async update(
    updates: CreditUpdate[],
  ): Promise<CreditRow[]> {
    console.log("updates", updates);
    const updated = [];
    for (const update of updates) {
      const { data, error } = await db
        .from("song_credits")
        .update(update)
        .eq("id", update.id!)
        .select()
        .single<CreditRow>();

      if (error) throw error;

      updated.push(data);
    }

    return updated;
  },
};

export type { CreditRow as Person };
