"use client";

import { Home, User } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [url, setUrl] = useState("/");
  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    setUrl(url);
  }, [pathname, searchParams]);

  if (pathname.includes("/learn")) {
    return null;
  }

  return (
    <nav className="fixed bottom-5 mx-auto w-full">
      <div className="flex justify-center gap-x-5">
        <Button variant="icon">
          <Link href="/">
            <Home />
          </Link>
        </Button>
        <Button variant="icon">
          <Link href="/auth">
            <User />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
