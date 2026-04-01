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
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.tailwind = window.tailwind || {};
          window.tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "on-error-container": "#93000a",
                  "outline": "#727783",
                  "surface-container-highest": "#e0e3e5",
                  "surface-container-low": "#f2f4f6",
                  "surface-container": "#eceef0",
                  "tertiary-fixed": "#ffdbcb",
                  "secondary-fixed": "#cee5ff",
                  "surface-tint": "#1d5fa8",
                  "on-surface-variant": "#424752",
                  "on-tertiary-container": "#ffcfb9",
                  "primary-fixed-dim": "#a6c8ff",
                  "on-tertiary-fixed": "#341100",
                  "secondary": "#4a6178",
                  "on-secondary": "#ffffff",
                  "on-primary": "#ffffff",
                  "surface-bright": "#f7f9fb",
                  "on-secondary-fixed": "#021d31",
                  "surface": "#f7f9fb",
                  "primary-container": "#1e60a9",
                  "tertiary": "#793100",
                  "primary": "#004889",
                  "on-secondary-container": "#4e657c",
                  "inverse-surface": "#2d3133",
                  "primary-fixed": "#d5e3ff",
                  "on-background": "#191c1e",
                  "on-tertiary": "#ffffff",
                  "on-primary-container": "#c7dbff",
                  "tertiary-container": "#9f4300",
                  "secondary-container": "#cae2fe",
                  "surface-dim": "#d8dadc",
                  "on-primary-fixed": "#001c3b",
                  "inverse-primary": "#a6c8ff",
                  "error-container": "#ffdad6",
                  "on-primary-fixed-variant": "#004787",
                  "on-secondary-fixed-variant": "#32495f",
                  "surface-container-lowest": "#ffffff",
                  "surface-container-high": "#e6e8ea",
                  "secondary-fixed-dim": "#b1c9e4",
                  "tertiary-fixed-dim": "#ffb691",
                  "surface-variant": "#e0e3e5",
                  "background": "#f7f9fb",
                  "inverse-on-surface": "#eff1f3",
                  "on-tertiary-fixed-variant": "#793100",
                  "error": "#ba1a1a",
                  "on-error": "#ffffff",
                  "outline-variant": "#c2c6d4",
                  "on-surface": "#191c1e"
                },
                fontFamily: {
                  "headline": ["var(--font-manrope)"],
                  "body": ["var(--font-inter)"],
                  "label": ["var(--font-inter)"]
                },
              },
            },
          };
        `}}></script>
      </head>
      <body className="font-body min-h-full flex flex-col bg-background text-on-surface">
        <CapacitorLoader />
        {children}
      </body>
    </html>
  );
}
