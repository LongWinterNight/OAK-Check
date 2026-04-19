'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { dark, accent, radius, applyToDOM } = useThemeStore();

  useEffect(() => {
    applyToDOM();
    document.documentElement.style.setProperty('--radius', radius + 'px');
  }, [dark, accent, radius, applyToDOM]);

  return <>{children}</>;
}
