import { notFound, redirect } from "next/navigation";

export type FormAction = "create" | "update";

export type TranslationActionPageParam = Promise<{
  action: FormAction;
  slug: string;
  translationVersionId?: string;
}>;

export default async function TranslationActionPage({
  params,
}: {
  params: TranslationActionPageParam;
}) {
  const { action, slug, translationVersionId } = await params;

  switch (action) {
    case "create":
      redirect(`/translate/create/${slug}`);
    case "update":
      redirect(`/translate/update/${slug}/${translationVersionId}`);

    default:
      notFound();
  }
}
