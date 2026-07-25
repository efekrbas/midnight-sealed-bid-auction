"use client";

import dynamic from 'next/dynamic';
import LoadingScreen from '../src/components/LoadingScreen';

const AppContent = dynamic(() => import('../src/AppContent'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Page() {
  return <AppContent />;
}
