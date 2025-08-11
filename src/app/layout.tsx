import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastContextProvider } from "@/lib/useToast";
import { HeaderWithAuth } from '@/components/layout/HeaderWithAuth';

import React from 'react';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "MyJobHunting - Find Jobs Faster",
  description: "MyJobHunting helps professionals discover opportunities, manage applications, and get hired faster.",
  authors: [{ name: "MyJobHunting Team" }],
  keywords: "myjobhunting,job hunting,jobs,careers,recruitment,employment,MyJobHunting",
  creator: "MyJobHunting",
  publisher: "MyJobHunting",
  robots: "index, follow",
  openGraph: {
    title: "MyJobHunting - Find Jobs Faster",
    description: "MyJobHunting helps professionals discover opportunities, manage applications, and get hired faster.",
    url: "https://myjobhunting.com",
    siteName: "MyJobHunting",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@myjobhunting",
    title: "MyJobHunting - Find Jobs Faster",
    description: "MyJobHunting helps professionals discover opportunities, manage applications, and get hired faster.",
  },
  icons: {
    icon: [
      { url: "/company%20logo.png", rel: "icon" },
      { url: "/company%20logo.png", rel: "shortcut icon" }
    ],
    apple: "/company%20logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ToastContextProvider>
            <HeaderWithAuth />
            {children}
          </ToastContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
