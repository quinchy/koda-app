import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "KodaTrack",
  description: "Task Management application that allows users to create, update, view, and delete tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", oxanium.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
