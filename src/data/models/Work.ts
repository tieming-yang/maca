import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

export type WorkRow = Database["public"]["Tables"]["works"]["Row"];
export type WorkInsert = Database["public"]["Tables"]["works"]["Insert"];
export type WorkUpdate = Database["public"]["Tables"]["works"]["Update"];
export type WorkKind = Database["public"]["Enums"]["work_kind"];

const db = createClient();

export const Work = {
  async getById(id: string): Promise<WorkRow> {
    const { data, error } = await db
      .from("works")
      .select("*")
      .eq("id", id)
      .single<WorkRow>();

    if (error) {
      console.error(error);
      throw Error("getById Error:", error);
    }

    return data;
  },

  async create(input: WorkInsert): Promise<WorkRow> {
    const { data, error } = await db
      .from("works")
      .insert(input)
      .select()
      .single<WorkRow>();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: WorkUpdate): Promise<WorkRow> {
    const { data, error } = await db
      .from("works")
      .update(updates)
      .eq("id", id)
      .select()
      .single<WorkRow>();

    if (error) throw error;
    return data;
  },
};

export type { WorkRow as WorkTableRow };
