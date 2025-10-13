import { Suspense } from "react";
import ClientAuthPage from "./client-auth-page";
import Loading from "../components/loading";

export default function AuthPage({}) {
  return (
    <Suspense fallback={<Loading isFullScreen />}>
      <ClientAuthPage />
    </Suspense>
  );
}
