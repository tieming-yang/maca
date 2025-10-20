"use client";

import { Home, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { usePreviousPath } from "@/hooks/use-previous-path";
import { MdOutlineHowToVote } from "react-icons/md";

export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const previousPath = usePreviousPath();

  const [url, setUrl] = useState("/");
  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    setUrl(url);
  }, [pathname, searchParams]);

  if (pathname.includes("/learn")) {
    return null;
  }
  const hasPreviousPath = previousPath && pathname !== "/";

  return (
    <nav className="fixed bottom-5 mx-auto w-full">
      <div className="flex justify-center md:gap-x-20 gap-x-10">
        {hasPreviousPath && (
          <Button variant="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
        )}

        <div className="flex justify-center gap-x-3">
          {pathname !== "/" && (
            <Link href="/">
              <Button variant="icon">
                <Home />
              </Button>
            </Link>
          )}

          {pathname !== "/auth" && (
            <Link href="/auth">
              <Button variant="icon">
                <User />
              </Button>
            </Link>
          )}

          {/* {pathname !== "/vote" && (
            <Link href="/vote">
              <Button variant="icon">
                <MdOutlineHowToVote size="25" />
              </Button>
            </Link>
          )} */}
        </div>
      </div>
    </nav>
  );
}
