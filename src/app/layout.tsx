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
            <LayoutWrapper>{children}</LayoutWrapper>
          </CartProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

// Separate component to use usePathname
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // Since this is a server component by default, we need a client component or a wrapper.
  // Actually, layout.tsx can't easily use usePathname if it's a server component.
  // But RootLayout in Next.js 13+ can be a client component if we add 'use client'.
  // However, metadata requires it to be a server component.
  // Better approach: Move the layout logic into a client component.
  return <ClientLayout>{children}</ClientLayout>;
}

import { ClientLayout } from "@/components/layout/ClientLayout";
