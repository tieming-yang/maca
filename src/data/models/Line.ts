import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

export type LineRow = Database["public"]["Tables"]["song_base_lines"]["Row"];
export type LineInsert =
  Database["public"]["Tables"]["song_base_lines"]["Insert"];
export type LinesUpdate =
  Database["public"]["Tables"]["song_base_lines"]["Update"];

const db = createClient();

export const Line = {
  async get(songId: string): Promise<LineRow[]> {
    const { data, error } = await db
      .from("song_base_lines")
      .select()
      .eq("song_id", songId)
      .order("timestamp_sec", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async insert(input: LineInsert): Promise<LineRow> {
    const { data, error } = await db
      .from("song_base_lines")
      .insert(input)
      .select()
      .single<LineRow>();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async insertMany(lines: LineInsert[]): Promise<LineRow[]> {
    if (!lines.length) return [];
    const sanitizedLines = lines.map(({ id, ...rest }) => rest);

    const { data, error } = await db
      .from("song_base_lines")
      .insert(sanitizedLines)
      .select();

    if (error) {
      console.error(error);
      throw error;
    }

    return data as LineRow[];
  },

  async update(id: number, updates: LinesUpdate): Promise<LineRow> {
    const { data, error } = await db
      .from("song_base_lines")
      .update(updates)
      .eq("id", id)
      .select()
      .single<LineRow>();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async updateMany(
    updates: LinesUpdate[],
  ): Promise<LineRow[]> {
    if (!updates.length) return [];

    const results = await Promise.all(
      updates.map(({ id, ...data }) => Line.update(id!, data)),
    );

    return results;
  },

  async delete(id: number): Promise<void> {
    const { error } = await db
      .from("song_base_lines")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      throw error;
    }
  },

  async deleteAll(songId: string): Promise<void> {
    const { error } = await db
      .from("song_base_lines")
      .delete()
      .eq("song_id", songId);

    if (error) {
      console.error(error);
      throw error;
    }
  },
};
