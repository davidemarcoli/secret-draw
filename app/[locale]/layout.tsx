import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value as string;
  };

  return {
    title: t('Layout.title'),
    description: t('Layout.description'),
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
        name: "Davide Marcoli",
        url: "https://davidemarcoli.dev",
      },
      {
        name: "Stefan Laux",
        url: "https://stefan-laux.dev",
      },
    ],
    openGraph: {
      title: t('Layout.title'),
      description: t('Layout.description'),
      type: "website",
      locale: locale === 'de' ? "de_DE" : "en_US",
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
      title: t('Layout.title'),
      description: t('Layout.description'),
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
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!['en', 'de'].includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="border-b">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <ModeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
              <div className="container mx-auto px-4 space-y-2">
                <div>
                  &copy; {new Date().getFullYear()} Secret Draw. {messages.Layout.footer.builtForFun}
                </div>
                <div>
                  {messages.Layout.footer.developedBy}{' '}
                  <a
                    href="https://stefan-laux.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                  >
                    Stefan Laux
                  </a>
                  {' '}{messages.Layout.footer.and}{' '}
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
