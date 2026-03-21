import type { Metadata } from "next";
import { Nunito, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Math Paws",
  description: "Інтерактивне вивчення математики для дітей",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={cn("dark font-sans", geist.variable)}>
      <body className={`${nunito.variable} antialiased`}>{children}</body>
    </html>
  );
}
