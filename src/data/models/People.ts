import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

export type PeopleRow = Database["public"]["Tables"]["people"]["Row"];
export type PeopleInsert = Database["public"]["Tables"]["people"]["Insert"];
export type PeopleUpdate = Database["public"]["Tables"]["people"]["Update"];

const db = createClient();

export const People = {
  async getAll(): Promise<PeopleRow[]> {
    const { data, error } = await db
      .from("people")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      throw error;
    }

    return data ?? [];
  },

  async insert(input: PeopleInsert): Promise<PeopleRow> {
    const existing = await this.findByDisplayName(input.display_name);
    if (existing) {
      console.warn("exist");
      return existing;
    }

    const { data, error } = await db
      .from("people")
      .insert(input)
      .select()
      .single<PeopleRow>();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: PeopleUpdate): Promise<PeopleRow> {
    const { data, error } = await db
      .from("people")
      .update(updates)
      .eq("id", id)
      .select()
      .single<PeopleRow>();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async findByDisplayName(displayName: string): Promise<PeopleRow | null> {
    const { data, error } = await db
      .from("people")
      .select("*")
      .eq("display_name", displayName)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  },
};

export type { PeopleRow as Person };
