import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FaceIq Labs",
  description: "Brutally honest facial metrics for angularity and dimorphism.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
