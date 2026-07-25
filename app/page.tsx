"use client";

import { useEffect, useState } from 'react';
import AppContent from '../src/AppContent';
import LoadingScreen from '../src/components/LoadingScreen';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return <AppContent />;
}
