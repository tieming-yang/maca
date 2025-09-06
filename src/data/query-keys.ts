export const QueryKey = {
  // songs
  song: (slug: string, lang?: string) => ["song", slug, lang ?? "none"] as const,

  // auth/session & profile
  authSession: ["auth", "session"] as const,
  profile: (id: string) => ["profile", id] as const,
};
