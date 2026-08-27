import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadLens — AI Lead Qualification",
  description: "A focused AI-powered inbound lead qualification tool."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}