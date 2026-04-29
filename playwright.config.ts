import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — отвечает за responsive-тесты и smoke-проверки.
 *
 * Запускается локально против работающего `pnpm dev` (port 3000) — это
 * быстрее чем поднимать prod-сборку перед каждым прогоном. Если dev-сервер
 * не запущен, Playwright стартует его сам через webServer.
 *
 * Auth: для защищённых страниц используется storage-state из
 * setup-проекта (e2e/setup/auth.setup.ts), который логинится dev-юзером.
 */

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Игнорируем самоподписанные ssl сертификаты в dev (на всякий случай)
    ignoreHTTPSErrors: true,
  },

  projects: [
    // Setup project — логинится dev-юзером и сохраняет storageState
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
    },

    // Responsive viewports — основные тесты горизонтального scroll'а и
    // touch-targets. Запускаются на 4 ширинах.
    {
      name: 'mobile-xs',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 320, height: 700 },
        isMobile: true,
        hasTouch: true,
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad (gen 7)'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'desktop',
      use: {
        viewport: { width: 1440, height: 900 },
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
