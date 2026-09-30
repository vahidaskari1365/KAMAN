import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "بایگانی",
  description:
    "سامانه مدیریت و بایگانی قراردادهای سازمانی - جستجو، فیلتر، آپلود فایل‌های اسکن شده و گزارش‌گیری هوشمند",
  keywords: [
    "بایگانی",
    "قرارداد",
    "مدیریت قرارداد",
    "سامانه قراردادها",
  ],
  authors: [{ name: "بایگانی" }],
  icons: {
    icon: "/logo.svg",
  },
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-center" dir="rtl" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
