import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastContextProvider } from "@/lib/useToast";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { Header } from '@/components/layout/header';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Choice Talent - Empower Your Talent Acquisition",
  description: "Choice Talent provides innovative solutions to streamline your hiring process, connect with top talent, and build exceptional teams.",
  authors: [{ name: "Choice Talent Team" }],
  keywords: "talent acquisition,hiring,recruitment,HR,Choice Talent",
  creator: "Choice Talent",
  publisher: "Choice Talent",
  robots: "index, follow",
  openGraph: {
    title: "Choice Talent - Empower Your Talent Acquisition",
    description: "Choice Talent provides innovative solutions to streamline your hiring process, connect with top talent, and build exceptional teams.",
    url: "https://choicetalent.com",
    siteName: "Choice Talent",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@choicetalent",
    title: "Choice Talent - Empower Your Talent Acquisition",
    description: "Choice Talent provides innovative solutions to streamline your hiring process, connect with top talent, and build exceptional teams.",
  },
  icons: {
    icon: "/favicon.ico"
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
            <Header />
            {children}
            <AuthDebug />
          </ToastContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
