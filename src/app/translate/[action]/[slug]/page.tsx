import { TranslationActionPageParam } from "../page";
import ClientTranslatePage from "./client-translate-page";

export default async function TranslatePage({
  params,
}: {
  params: TranslationActionPageParam;
}) {
  const { action, slug, translationVersionId } = await params;
  return (
    <ClientTranslatePage
      action={action}
      slug={slug}
      translationVersionId={translationVersionId}
    />
  );
}
