import { Profile } from "@/data/models/Profile.server";
import ClientSongEditPage from "./client-song-edit-page";
import { redirect } from "next/navigation";

type EditSongPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditSongPage({ params }: EditSongPageProps) {
  const isAdmain = await Profile.isAdmain();
  if (!isAdmain) {
    redirect("/");
  }

  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return <ClientSongEditPage slug={decodedSlug} />;
}
