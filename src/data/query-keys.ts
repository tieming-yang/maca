export const QueryKey = {
  // songs
  song: (slug: string, lang?: string) => ["song", slug, lang ?? "none"] as const,

  // auth/session & profile
  authUser: ["auth", "user"] as const,
  profile: (id: string) => ["profile", id] as const,
};
