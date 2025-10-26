import ClientTranslatePage from "./client-translate-page";

export type TranslatePageParams = Promise<{ slug: string }>;

export default async function TranslatePage({
  params,
}: {
  params: TranslatePageParams;
}) {
  const { slug } = await params;
  return <ClientTranslatePage slug={slug} />;
}
