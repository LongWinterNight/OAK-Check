'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AccentColor = 'blue' | 'oak' | 'amber' | 'green' | 'lime';

interface ThemeStore {
  dark: boolean;
  accent: AccentColor;
  radius: number;
  toggle: () => void;
  setAccent: (accent: AccentColor) => void;
  setRadius: (radius: number) => void;
  applyToDOM: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      dark: false,
      accent: 'blue',
      radius: 8,

      toggle: () => {
        set((s) => ({ dark: !s.dark }));
        get().applyToDOM();
      },

      setAccent: (accent) => {
        set({ accent });
        get().applyToDOM();
      },

      setRadius: (radius) => {
        set({ radius });
        document.documentElement.style.setProperty('--radius', radius + 'px');
      },

      applyToDOM: () => {
        const { dark, accent } = get();
        const html = document.documentElement;
        if (dark) {
          html.setAttribute('data-theme', 'dark');
        } else {
          html.removeAttribute('data-theme');
        }
        if (accent === 'blue') {
          html.removeAttribute('data-accent');
        } else {
          html.setAttribute('data-accent', accent);
        }
      },
    }),
    {
      name: 'oak-check-theme',
    }
  )
);
