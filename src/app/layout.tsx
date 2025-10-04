import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restaurant Daily Operations Management | Cash, Payments & Team Tracking",
  description: "Simplify restaurant operations with daily cash reconciliation, payment tracking, and team management. WhatsApp OTP login. Mobile-first. Built for Indian restaurants.",
  keywords: ["restaurant management software", "daily operations", "cash tracking", "payment management", "restaurant POS", "team management", "WhatsApp OTP"],
  authors: [{ name: "Mindweave Technologies" }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Restaurant Daily - Simplify Your Restaurant Operations",
    description: "Stop chasing receipts. Track cash, payments & team in real-time. Mobile-first restaurant management for India.",
    url: "https://restaurant-daily.mindweave.tech",
    siteName: "Restaurant Daily",
    locale: "en_IN",
    type: "website",
    images: ['/logo.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant Daily - Simplify Restaurant Operations",
    description: "Track cash, payments & team in real-time. Mobile-first management for restaurants.",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
