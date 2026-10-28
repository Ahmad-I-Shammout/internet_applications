import type { Metadata } from 'next';
import { Geist, Geist_Mono, Cairo, Noto_Naskh_Arabic, IBM_Plex_Sans_Arabic, Poppins, Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const noto = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto',
  display: 'swap',
});

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--ibm-font',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Next.js Base Project",
  description: "A professional base project for Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${noto.variable} ${ibmPlex.variable} ${poppins.variable} ${inter.variable} font-[family-name:var(--font-cairo)] antialiased bg-background text-text-main transition-colors duration-200`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">{children}</main>
            <Toaster position="bottom-left" dir="rtl" richColors />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
