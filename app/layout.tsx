import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Quantum² — Your company's AI operating system.",
  description:
    "Quantum² connects your tools, routes work through a company org chart of AI agents, and keeps every action auditable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">{children}</body>
    </html>
  );
}
