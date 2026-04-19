'use client';

import { create } from 'zustand';
import type { Project, Shot } from '@/types';

interface AppStore {
  currentProject: Project | null;
  currentShot: Shot | null;
  setCurrentProject: (project: Project | null) => void;
  setCurrentShot: (shot: Shot | null) => void;
}

export const useAppStore = create<AppStore>()((set) => ({
  currentProject: null,
  currentShot: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  setCurrentShot: (shot) => set({ currentShot: shot }),
}));
