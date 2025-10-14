// src/utils/supabase/admin.ts (server-only)
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase service-role credentials");
}

export const createServiceClient = () =>
  createClient<Database>(url, serviceKey);
