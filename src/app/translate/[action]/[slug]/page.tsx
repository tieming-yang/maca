import { TranslationActionPageParam } from "../page";
import ClientTranslationCreatePage from "./client-translation-create-page";

export default async function TranslatePage({
  params,
}: {
  params: TranslationActionPageParam;
}) {
  const { action, slug, translationVersionId } = await params;
  return (
    <ClientTranslationCreatePage
      action={action}
      slug={slug}
      translationVersionId={translationVersionId}
    />
  );
}
