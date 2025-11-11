//? https://github.com/tieming-yang/bm/blob/main/src/hooks/use-profile.tsx#L1-L24

import { useQuery } from "@tanstack/react-query";
import useAuthUser from "./use-auth-user";
import { Profile } from "@/data/models/Profile";
import { QueryKey } from "@/data/query-keys";


export default function useProfile() {
  const { authUser, isAuthUserLoading } = useAuthUser();
  const uid = authUser?.id;

  const profileQuery = useQuery({
    queryKey: uid ? QueryKey.profile(uid) : ["profile", "guest"],
    queryFn: async () => {
      if (!uid) throw new Error("No authenticated user");
      return Profile.getById(uid);
    },
    enabled: !!uid,
  });

  return {
    profile: profileQuery.data,
    isProfileLoading: isAuthUserLoading || profileQuery.isLoading,
    profileError: profileQuery.error,
  };
}
