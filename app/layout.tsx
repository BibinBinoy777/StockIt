import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'StockIt — Market Qualification & Walk-Forward Research Workbench',
  description:
    'Indian equity research, Phase 12 market data qualification, 46-feature causal pipeline, and expanding walk-forward evaluation workbench.',
  openGraph: {
    title: 'StockIt — Market Qualification & Walk-Forward Research Workbench',
    description:
      'Indian equity research, Phase 12 market data qualification, 46-feature causal pipeline, and expanding walk-forward evaluation workbench.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockIt — Market Qualification & Walk-Forward Research Workbench',
    description:
      'Indian equity research, Phase 12 market data qualification, 46-feature causal pipeline, and expanding walk-forward evaluation workbench.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${publicSans.variable} ${ibmPlexMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#0B1120] text-slate-100 font-sans antialiased selection:bg-sky-500/30 selection:text-sky-200 min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}
