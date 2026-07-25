import '../app/globals.css';
import React from 'react';

export const metadata = {
  title: 'SilentBid - Sealed-Bid Auction',
  description: 'ZK-Powered Sealed-Bid Auction on Midnight Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-obsidian text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
