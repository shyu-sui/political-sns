import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const APP_NAME = "PoliDebate";
const APP_DESCRIPTION = "社会問題・政治テーマについて賛成・反対に分かれて討論しよう";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  ),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  openGraph: {
    siteName: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.svg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    description: APP_DESCRIPTION,
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
          <p className="mb-1 font-medium text-gray-500">PoliDebate</p>
          <nav className="flex justify-center gap-4">
            <Link href="/terms" className="hover:text-gray-600 transition">
              利用規約
            </Link>
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
