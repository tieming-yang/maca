import ClientLearnPage from "./client-learn-page";

export type LearnPageParams = Promise<{ slug: string }>;

export default async function LearnPage({
  params,
}: {
  params: LearnPageParams;
}) {
  const { slug } = await params;

  return <ClientLearnPage slug={slug} />;
}
