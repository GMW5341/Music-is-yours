import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import MobileTabBar from "@/components/MobileTabBar";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Music is Yours - AI 음악 창작 플랫폼",
  description: "AI로 누구나 쉽게 음악을 만들고, 공유하고, 경쟁하는 플랫폼",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Music is Yours",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-dark-300">
        <AuthProvider>
          <ServiceWorkerRegistrar />
          <Navigation />
          <main className="pt-16 pb-20 md:pb-0">{children}</main>
          <MobileTabBar />
        </AuthProvider>
      </body>
    </html>
  );
}
