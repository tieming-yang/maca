import { useEffect, useState } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    // Set once on mount (in case SSR gave 0)
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
