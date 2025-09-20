import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "منصة الحرفيين المتميزين | ابحث عن أفضل الحرفيين",
  description: "منصة متكاملة لربط العملاء بالحرفيين لتقديم الخدمات المنزلية بسهولة وأمان. ابحث عن نجار، سباك، كهربائي وغيرهم من الحرفيين الموثوقين.",
  keywords: [
    "حرفيين", 
    "خدمات منزلية", 
    "نجار", 
    "سباك", 
    "كهربائي", 
    "حجز خدمات", 
    "تقييم حرفيين", 
    "خدمات صيانة",
    "منصة خدمات",
    "حرفيين موثوقين",
    "خدمات منزلية بالسعودية",
    "بحث عن حرفيين",
    "أسعار الخدمات"
  ],
  authors: [{ name: "فريق منصة الحرفيين", url: "https://craftsmen-platform.com" }],
  creator: "منصة الحرفيين",
  publisher: "منصة الحرفيين",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://craftsmen-platform.com",
    siteName: "منصة الحرفيين",
    title: "منصة الحرفيين المتميزين | ابحث عن أفضل الحرفيين",
    description: "منصة متكاملة لربط العملاء بالحرفيين لتقديم الخدمات المنزلية بسهولة وأمان",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "منصة الحرفيين المتميزين",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة الحرفيين المتميزين | ابحث عن أفضل الحرفيين",
    description: "منصة متكاملة لربط العملاء بالحرفيين لتقديم الخدمات المنزلية بسهولة وأمان",
    images: ["/twitter-image.jpg"],
    creator: "@craftsmen_platform",
  },
  alternates: {
    canonical: "https://craftsmen-platform.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
