import { TranslationActionPageParam } from "../../page";
import ClientTranslationUpdatePage from "./client-translation-update-page";

export default async function TranslationUpdatePage({
  params,
}: {
  params: TranslationActionPageParam;
}) {
  const { action, slug, translationVersionId } = await params;
  return (
    <ClientTranslationUpdatePage
      action={action}
      slug={slug}
      translationVersionId={translationVersionId}
    />
  );
}
