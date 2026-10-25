import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "گردونه عملیات ریاضی",
  description:
    "بازی گروهی گردونه شانسی: در هر گردش، عمل اصلی ریاضی (جمع، تفریق، ضرب، تقسیم) تیم مشخص می‌شود — بدون طرح سوال.",
  applicationName: "گردونه ریاضی",
  manifest: "/math-ops-wheel/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/math-ops-wheel/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/math-ops-wheel/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/math-ops-wheel/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "گردونه ریاضی",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fbbf24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
