import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inzario — Find the Perfect Interior Designer",
  description: "Discover verified interior designers, compare portfolios, and book free consultations — without the spam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}