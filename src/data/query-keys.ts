export const QueryKey = {
  // songs
  song: (slug: string, lang?: string) =>
    ["song", slug, lang ?? "none"] as const,
  songs: () => ["songs"] as const,
  work: (id: string) => ["work", id] as const,
  songCredits: (songId: string) => ["song", songId, "credits"] as const,
  people: () => ["people"] as const,
  person: (id: string) => ["person", id] as const,

  // auth/session & profile
  authUser: ["auth", "user"] as const,
  profile: (id: string) => ["profile", id] as const,
};
