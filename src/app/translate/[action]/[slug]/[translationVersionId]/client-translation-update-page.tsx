"use client";
import { FormAction } from "../../page";

export default function ClientTranslationUpdatePage(props: {
  action: FormAction;
  slug: string;
  translationVersionId?: string;
}) {
  const { action, slug, translationVersionId } = props;
  return (
    <main>
      <h1>Transaltion Update Page</h1>
      <p>{action}</p>
      <p>{slug}</p>
      <p>{translationVersionId}</p>
    </main>
  )
}
