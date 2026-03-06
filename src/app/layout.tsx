import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Music is Yours - AI 음악 창작 플랫폼",
  description: "AI로 누구나 쉽게 음악을 만들고, 공유하고, 경쟁하는 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-dark-300">
        <Navigation />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
