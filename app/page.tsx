"use client";

import dynamic from 'next/dynamic';

const AppContent = dynamic(() => import('../src/AppContent'), { ssr: false });

export default function Page() {
  return <AppContent />;
}
