import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Event Voting",
  description:
    "Secure one-time-code voting platform for live events. Built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
