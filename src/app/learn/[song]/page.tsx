import ClientLearnPage from "./client-learn-page";

type Params = Promise<{ song: string }>;

export default async function LearnPage(props: { params: Params }) {
  const params = await props.params;

  return <ClientLearnPage params={params} />;
}
