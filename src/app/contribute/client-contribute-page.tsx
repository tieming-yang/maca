"use client";

import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";
import { useQuery } from "@tanstack/react-query";

type Person = Database["public"]["Tables"]["people"]["Row"];

export default function ClientContributePage() {
  const db = createClient();

  function getPeople() {
    return db.from("people").select("*");
  }

  const { data: people, error } = useQuery({
    queryKey: ["people"],
    queryFn: getPeople,
  });

  if (error) return <div className="text-red-400">Error: {error.name}</div>;
  if (!people) return <div>Loading…</div>;

  return <pre className="text-xs">{JSON.stringify(people, null, 2)}</pre>;
}
