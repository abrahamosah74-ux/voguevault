import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import ServiceWorkerRegistry from "@/components/ServiceWorkerRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VogueVault - Fashion AI Co-Pilot",
  description: "Your personal AI fashion consultant for styled outfit recommendations",
  metadataBase: new URL("https://voguevault-cyan.vercel.app"),
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VogueVault",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://voguevault-cyan.vercel.app",
    title: "VogueVault - Your Personal AI Fashion Co-Pilot",
    description: "Get personalized outfit recommendations powered by Aurora AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VogueVault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VogueVault",
    description: "Your personal AI fashion co-pilot",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VogueVault" />
        <meta name="theme-color" content="#a855f7" />
        <meta name="msapplication-TileColor" content="#a855f7" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white`}
      >
        <ServiceWorkerRegistry />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
