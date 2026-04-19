import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => string;
  remove: (id: string) => void;
}

let nextId = 1;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = String(nextId++);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, duration = 4000) =>
    useToastStore.getState().add({ kind: 'success', message, duration }),
  error: (message: string, duration = 6000) =>
    useToastStore.getState().add({ kind: 'error', message, duration }),
  info: (message: string, duration = 4000) =>
    useToastStore.getState().add({ kind: 'info', message, duration }),
  warning: (message: string, duration = 5000) =>
    useToastStore.getState().add({ kind: 'warning', message, duration }),
};
