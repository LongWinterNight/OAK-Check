import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    // setup-файл подключается во ВСЕХ тестах (lib + UI). jest-dom matchers
    // безопасны на node-окружении — просто не активируются без DOM.
    setupFiles: ['./__tests__/setup.ts'],
    // e2e/ — это Playwright, не vitest. Не пытаемся выполнить.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
