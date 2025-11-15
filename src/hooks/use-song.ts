import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/data/query-keys";
import { Song } from "@/data/models/Song";

//TODO: let it determine if use id or slug
export default function useSong(id: string) {
  const {
    data: song,
    isLoading: isSongLoading,
    isError: isSongError,
    error: songError,
  } = useQuery({
    queryKey: QueryKey.song(id),
    queryFn: () => Song.getBundleById(id),
    placeholderData: (prev) => prev,
  });

  if (isSongError) {
    throw new Error(songError.message)
  }

  return {
    song,
    isSongLoading,
    songError
  };
}
