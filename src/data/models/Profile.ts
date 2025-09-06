import { createClient } from "@/utils/supabase/client";
import type {
  AuthError,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  SupabaseClient,
} from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function db(): SupabaseClient<Database> {
  return createClient() as unknown as SupabaseClient<Database>;
}

export const Profile = {
  /** Fetch the current caller's profile, or null if not signed in. */
  async getMy(): Promise<ProfileRow | null> {
    const supabase = db();
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

  /**
   * (Optional) Fetch any profile by id. Useful for public profile pages.
   */
  async getById(id: string): Promise<ProfileRow | null> {
    const supabase = db();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single<ProfileRow>();
    if (error) throw error;
    return data ?? null;
  },

  // --- service fns (throw on error) ---
  async signUp(input: {
    email: string;
    password: string;
    username: string;
  }) {
    const supabase = db();
    const creds: SignUpWithPasswordCredentials = {
      email: input.email,
      password: input.password,
      options: { data: { username: input.username } },
    };
    const { data, error } = await supabase.auth.signUp(creds);
    if (error) throw error as AuthError;
    return data; // note: session may be null if email confirmation is required
  },

  async signIn(input: { email: string; password: string }) {
    const creds: SignInWithPasswordCredentials = {
      email: input.email,
      password: input.password,
    };
    const supabase = db();
    const { data, error } = await supabase.auth.signInWithPassword(creds);
    if (error) throw error as AuthError;
    return data; // { user, session }
  },

  async signOut(): Promise<void> {
    const supabase = db();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },
};
