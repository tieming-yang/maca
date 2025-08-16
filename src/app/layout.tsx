import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";

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
  metadataBase: new URL("https://maca-maca.vercel.app/"),
  title: {
    default: "maca",
    template: "%s | maca",
  },
  openGraph: {
    title: "maca",
    description: "Learn Japanese by singing",
    url: "https://maca-maca.vercel.app/",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
