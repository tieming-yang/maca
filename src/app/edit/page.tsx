import { Profile } from "@/data/models/Profile.server";
import ClientEditPage from "./client-edit-page";
import { redirect } from "next/navigation";

export default async function EditPage() {
  const isAdmain = await Profile.isAdmain();
  if (!isAdmain) {
    redirect("/");
  }

  return <ClientEditPage />;
}
