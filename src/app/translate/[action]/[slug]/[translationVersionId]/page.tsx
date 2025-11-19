import { redirect } from "next/navigation";
import { TranslationActionPageParam } from "../../page";
import ClientTranslationUpdatePage from "./client-translation-update-page";

export default async function TranslationUpdatePage({
  params,
}: {
  params: TranslationActionPageParam;
}) {
  const { action, slug, translationVersionId } = await params;
  if (!translationVersionId) {
    redirect(`/translate/create/${slug}`);
  }

  return (
    <ClientTranslationUpdatePage
      action={action}
      slug={slug}
      translationVersionId={translationVersionId}
    />
  );
}
