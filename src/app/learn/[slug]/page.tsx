import ClientLearnPage from "./client-learn-page";

type Params = Promise<{ slug: string }>;

export default async function LearnPage(props: { params: Params }) {
  const { slug } = await props.params;

  return <ClientLearnPage slug={slug} />;
}
