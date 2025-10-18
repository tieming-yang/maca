"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function usePreviousPath() {
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedPreviousPath = sessionStorage.getItem("currentPath");

    setPreviousPath(storedPreviousPath);
    if (storedPreviousPath && storedPreviousPath !== pathname) {
      sessionStorage.setItem("previousPath", storedPreviousPath);
    }

    sessionStorage.setItem("currentPath", pathname);
  }, [pathname]);

  return previousPath;
}
