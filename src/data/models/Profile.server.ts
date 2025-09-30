import type { Database } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

async function serverDB(): Promise<SupabaseClient<Database>> {
  if (typeof window !== "undefined") {
    throw new Error("serverDB must only run on the server");
  }

  const { createServerSideClient } = await import("@/utils/supabase/server");
  return createServerSideClient() as unknown as SupabaseClient<Database>;
}

export const Profile = {
  /** Fetch the current caller's profile, or null if not signed in. */
  async getMy(): Promise<ProfileRow | null> {
    const supabase = await serverDB();

    const { data, error } = await supabase.rpc("get_my_profile");

    if (error) {
      console.error(error);
      throw error;
    }

    const row = Array.isArray(data)
      ? (data[0] ?? null)
      : (data as ProfileRow | null);
    return row ?? null;
  },

  async isAdmain(): Promise<boolean> {
    const currentUser = await Profile.getMy();

    return currentUser?.role === "admin";
  },
};
