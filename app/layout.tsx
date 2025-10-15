import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Aviva Insurance",
  description: "Easily View & Manage Your Policy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Aviva" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#fbd800" />
      </head>
      <body>
        <Header />
        <main className="min-h-[72vh] pb-24">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}