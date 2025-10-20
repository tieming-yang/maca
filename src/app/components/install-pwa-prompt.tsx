"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function InstallPWAPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIosUA = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasMsStream = typeof window !== "undefined" && "MSStream" in window;

    setIsIOS(isIosUA && !hasMsStream);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  if (isIOS) {
    toast("To install this app on your iOS device, tap the share button", {
      description: 'and then "Add to Home Screen"',
      action: {
        label: "Got it",
        onClick: (e) => {
          e.preventDefault();
          toast.dismiss();
        },
      },
    });
  }
}
