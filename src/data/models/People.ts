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
      .order("display_name", { ascending: true });

    if (error) {
      console.error(error);
      throw error;
    }

    return data ?? [];
  },

  async create(input: PeopleInsert): Promise<PeopleRow> {
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
};

export type { PeopleRow as Person };
