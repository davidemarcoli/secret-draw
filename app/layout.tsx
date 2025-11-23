import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret Draw | Organize Secret Santa Easily",
  description: "The easiest way to organize your Secret Santa gift exchange. No accounts, no emails, just a link.",
  keywords: ["secret santa", "gift exchange", "christmas", "holiday", "organizer"],
  authors: [
    {
      name: "David Emarcoli",
      url: "https://davidemarcoli.dev",
    }
  ],
  openGraph: {
    title: "Secret Draw | Organize Secret Santa Easily",
    description: "The easiest way to organize your Secret Santa gift exchange. No accounts, no emails, just a link.",
    type: "website",
    locale: "en_US",
    siteName: "Secret Draw",
  },
  twitter: {
    card: "summary_large_image",
    title: "Secret Draw",
    description: "The easiest way to organize your Secret Santa gift exchange.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Logo />
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <div className="container mx-auto px-4">
              &copy; {new Date().getFullYear()} Secret Draw. Built for fun.
            </div>
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
