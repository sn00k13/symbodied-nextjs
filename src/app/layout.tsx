import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://symbodied.com"),
  title: {
    default: "Symbodied — Social Network Marketplace",
    template: "%s | Symbodied",
  },
  description:
    "An enterprise-grade Agritech Social Network Marketplace rooted in African cultural heritage. Buy, sell, create, and support community projects.",
  keywords: ["marketplace", "agritech", "Nigeria", "African heritage", "social network", "community"],
  authors: [{ name: "Symbodied LLC" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Symbodied",
    images: [
      {
        url: "/images/logo.png",
        width: 499,
        height: 500,
        alt: "Symbodied Logo",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="h-full font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
