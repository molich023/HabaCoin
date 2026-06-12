import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Ensure your Tailwind or standard CSS points here

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HabaCoin Global",
  description: "Universal Move-to-Earn Platform & Multi-Fiat Settlement Utility Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className={`${inter.variable} font-sans antialiased bg-black`}>
        {children}
      </body>
    </html>
  );
}
