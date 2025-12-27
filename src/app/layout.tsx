import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { CartProvider } from "@/context/CartContext";

import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mohan POS",
  description: "Retail Billing Software",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mohan POS"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport = {
  themeColor: "#1e293b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <CartProvider>
            <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
              <Sidebar />
              <main style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
                {children}
              </main>
            </div>
          </CartProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
