import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PolicyApp — The audit packet that builds itself.",
  description:
    "Drop your credentialing and compliance documents. PolicyApp hashes every file, tracks every change, and assembles a signed audit packet on demand. Longitudinal compliance, not scramble-day compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Script src="https://harnesshealth.ai/footer.js?v=8" data-brand="policyapp" data-theme="light" strategy="lazyOnload" />
      </body>
    </html>
  );
}
