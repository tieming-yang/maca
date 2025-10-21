import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

import Nav from "./components/nav";
import { Suspense } from "react";
import Loading from "./components/loading";
import Toaster from "./components/ui/sonner";

import { Analytics } from "@vercel/analytics/next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  description: "Learn Japanese by singing",
  metadataBase: new URL("https://maca.club/"),
  manifest: "/manifest.json",
  title: {
    default: "Maca",
    template: "%s | Maca",
  },
  openGraph: {
    title: "Maca",
    description: "Learn Japanese by singing",
    url: "https://maca.club/",
    siteName: "Maca",
    locale: "en",
    type: "website",
    images: [
      {
        url: "/favicons/web-app-manifest-512x512.png",
        width: 1200,
        height: 630,
        alt: "Maca",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Maca",
    card: "summary_large_image",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Maca",
    startupImage: [
      {
        media:
          "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
        url: "/splashes/apple-splash-2048-2732.png",
      },
      // {
      //   media:
      //     "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      //   url: "/splashes/apple-splash-2732-2048.jpg",
      // },
    ],
  },
  other: { "apple-mobile-web-app-capable": "yes" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Maca" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-serif antialiased md:px-0 overflow-x-hidden`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              // unstyled: true,
              // classNames: {
              //   default: `${topGlowBorder} inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition gap-x-2 border border-white/20 backdrop-blur-2xl`,
              // },
              style: {
                borderRadius: 100,
              },
            }}
          />
          <Suspense fallback={<Loading isFullScreen />}>
            <Nav />
          </Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
