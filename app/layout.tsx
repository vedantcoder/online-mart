import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthInitializer } from "@/components/providers/AuthInitializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Online-MART - Multi-Tier Marketplace",
  description:
    "E-commerce platform connecting Customers, Retailers, Wholesalers, and Delivery Partners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <ToastProvider />
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
