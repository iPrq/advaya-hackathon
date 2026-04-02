import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import CapacitorLoader from "@/components/CapacitorLoader";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ageis Medical Companion",
  description: "Your clinical assistant at your fingertips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-full flex flex-col bg-background text-on-surface">
        <CapacitorLoader />
        {children}
      </body>
    </html>
  );
}
