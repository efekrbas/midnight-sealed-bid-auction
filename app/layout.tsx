import '../app/globals.css';
import React from 'react';

export const metadata = {
  title: 'SilentBid • Zero-Knowledge Sealed-Bid Auction on Midnight',
  description: 'Bid with 100% financial privacy. Zero-knowledge cryptographic proofs verify your bid eligibility without exposing your price on-chain.',
  keywords: ['Midnight Network', 'Zero Knowledge', 'ZK-SNARK', 'Sealed-Bid Auction', 'Cardano', 'Privacy Preserving dApp'],
  authors: [{ name: 'SilentBid ZK Team' }],
  openGraph: {
    title: 'SilentBid • Zero-Knowledge Sealed-Bid Auction on Midnight',
    description: '100% Financial Privacy Powered by Midnight Compact ZK-SNARK Circuits.',
    url: 'https://midnight-sealed-bid-auction-self.vercel.app/',
    siteName: 'SilentBid',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'SilentBid Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SilentBid • Zero-Knowledge Sealed-Bid Auction',
    description: 'Privacy-first sealed-bid auctions built on Midnight Network.',
    creator: '@SilentBidZK',
    images: ['/favicon.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="bg-obsidian text-gray-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
