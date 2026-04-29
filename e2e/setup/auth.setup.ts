import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'e2e/.auth/user.json';

const DEV_LOGIN = process.env.DEV_USER_LOGIN ?? 'safanch6230i';
const DEV_PASSWORD = process.env.DEV_USER_PASSWORD ?? 'Safanch_6230i';

/**
 * Логинимся dev-аккаунтом (роль ADMIN — есть доступ ко всем экранам)
 * и сохраняем storage-state для остальных тестов.
 */
setup('authenticate as dev-admin', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Inputs определены с id="identifier" и id="password" в LoginForm
  await page.locator('#identifier').fill(DEV_LOGIN);
  await page.locator('#password').fill(DEV_PASSWORD);

  // Submit form
  await page.getByRole('button', { name: /войти|sign in|login/i }).first().click();

  // Ждём редирект на dashboard (или любой защищённый URL)
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 });
  await expect(page).not.toHaveURL(/\/login/);

  await page.context().storageState({ path: AUTH_FILE });
});
