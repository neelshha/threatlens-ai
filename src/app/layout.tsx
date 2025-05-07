import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ThreatLens AI',
  description: 'AI-powered threat report summarization and analysis tool.',
  icons: {
    icon: '/tLens.jpg',
    shortcut: '/tLens.jpg',
    apple: '/tLens.jpg',
  },
  openGraph: {
    title: 'ThreatLens AI',
    description: 'AI-powered threat report summarization and analysis tool.',
    url: 'https://www.neelshha.com/threatlens', // Update to your real domain
    siteName: 'ThreatLens AI',
    images: [
      {
        url: '/preview.jpg',
        width: 1200,
        height: 630,
        alt: 'ThreatLens AI Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreatLens AI',
    description: 'AI-powered threat report summarization and analysis tool.',
    images: ['/preview.jpg'],
    creator: '@neelshha', // optional, add only if you have a Twitter handle
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}