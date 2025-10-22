import { QueryKey } from "@/data/query-keys";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useAuthUser() {
  const query = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      query.setQueryData(QueryKey.authUser, session?.user ?? null);
    });
    return () => sub.subscription?.unsubscribe();
  }, [query, supabase]);

  const {
    data: authUser,
    isLoading: isAuthUserLoading,
    error: isAuthUserError,
  } = useQuery({
    queryKey: QueryKey.authUser,
    queryFn: async () => (await supabase.auth.getUser()).data.user,
    staleTime: 0,
    refetchOnMount: "always",
  });

  return { authUser, isAuthUserLoading, isAuthUserError };
}
