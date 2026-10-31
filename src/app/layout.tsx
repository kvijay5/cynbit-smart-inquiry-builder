import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cynbit Technologies — Project Inquiry Builder",
  description:
    "Service-aware project inquiry builder inspired by Cynbit Technologies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
