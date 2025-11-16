export const QueryKey = {
  // songs
  song: (slug?: string, id?: string, lang?: string) =>
    ["song", slug ?? "none", id ?? "none", lang ?? "none"] as const,
  songs: () => ["songs"] as const,
  work: (id: string) => ["work", id] as const,
  songCredits: (songId: string) => ["song", songId, "credits"] as const,
  translation: (versionId: string | null) =>
    ["translation", versionId ?? "none"] as const,
  people: () => ["people"] as const,
  person: (id: string) => ["person", id] as const,

  // auth/session & profile
  authUser: ["auth", "user"] as const,
  profile: (id: string) => ["profile", id] as const,
  userTranslations: (userId: string) => ["userTranslation", userId] as const,
};
