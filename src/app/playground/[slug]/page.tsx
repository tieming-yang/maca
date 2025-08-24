import ClientPlaygroundPage from "./client-playground-page";

async function PlaygroundPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  return <ClientPlaygroundPage slug={decodeURIComponent(slug)} />;
}

export default PlaygroundPage;
