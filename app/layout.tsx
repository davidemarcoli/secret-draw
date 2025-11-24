import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret Draw | Free Secret Santa Generator & Wichteln Organizer",
  description: "Free online Secret Santa generator and Wichteln organizer. Create your gift exchange in seconds - no registration, no emails required. Perfect for Christmas, office parties, and family gatherings.",
  keywords: [
    // English keywords
    "secret santa",
    "secret santa generator",
    "secret santa organizer",
    "online secret santa",
    "free secret santa",
    "secret santa app",
    "secret santa website",
    "gift exchange",
    "gift exchange generator",
    "christmas gift exchange",
    "white elephant",
    "yankee swap",
    "gift swap",
    "present exchange",
    "holiday gift exchange",
    "office secret santa",
    "family secret santa",
    "virtual secret santa",
    "online gift exchange",
    "random gift exchange",
    "secret santa draw",
    "secret santa picker",
    "secret santa name generator",
    "secret santa randomizer",
    // German keywords
    "wichteln",
    "wichteln online",
    "wichteln generator",
    "wichteln organisieren",
    "online wichteln",
    "wichtel generator",
    "wichteln app",
    "wichteln tool",
    "wichteln planen",
    "weihnachtswichteln",
    "wichteln kostenlos",
    "wichteln ohne anmeldung",
    "wichtelpartner ziehen",
    "wichteln auslosen",
    // Additional related terms
    "christmas party",
    "holiday party organizer",
    "gift giving",
    "anonymous gift exchange",
    "draw names",
    "name picker",
    "random name generator",
    "group gift exchange",
  ],
  authors: [
    {
      name: "David Emarcoli",
      url: "https://davidemarcoli.dev",
    },
    {
      name: "Stefan Laux",
      url: "https://stefan-laux.dev",
    },
  ],
  openGraph: {
    title: "Secret Draw | Free Secret Santa & Wichteln Generator",
    description: "Free online Secret Santa generator and Wichteln organizer. Create your gift exchange in seconds - no registration, no emails required.",
    type: "website",
    locale: "en_US",
    siteName: "Secret Draw",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Secret Draw - Secret Santa Generator',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Secret Draw | Free Secret Santa & Wichteln Generator",
    description: "Create your Secret Santa gift exchange in seconds. No registration, no emails required.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://secret-draw.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
            <div className="container mx-auto px-4 space-y-2">
              <div>
                &copy; {new Date().getFullYear()} Secret Draw. Built for fun.
              </div>
              <div>
                Developed by{' '}
                <a
                  href="https://stefan-laux.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  Stefan Laux
                </a>
                {' '}and{' '}
                <a
                  href="https://davidemarcoli.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  Davide Marcoli
                </a>
              </div>
            </div>
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
