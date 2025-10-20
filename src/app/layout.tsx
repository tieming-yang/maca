import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

import Nav from "./components/nav";
import { Suspense } from "react";
import Loading from "./components/loading";
import Toaster from "./components/ui/sonner";
import { topGlowBorder } from "./components/ui/button";

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
  title: {
    default: "maca",
    template: "%s | maca",
  },
  openGraph: {
    title: "maca",
    description: "Learn Japanese by singing",
    url: "https://maca.club/",
    siteName: "maca",
    locale: "en",
    type: "website",
    images: [
      {
        url: "/public/favicons/android-chrome-512x512.png",
        width: 1200,
        height: 630,
        alt: "maca",
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
    title: "maca",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased px-5 md:px-0 overflow-x-hidden`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              unstyled: true,
              classNames: {
                default: `${topGlowBorder} inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition gap-x-2 border border-white/20 backdrop-blur-2xl`,
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
