import { test, expect } from '@playwright/test';

test('home page renders hero content', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: 'A sovereign reading experience for on-chain literature.',
    }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Reader' })).toBeVisible();
});

test('reader dashboard shows placeholder modules', async ({ page }) => {
  await page.goto('/reader/demo');
  await expect(
    page.getByRole('heading', { name: 'Fragments of a Decentralized Library' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /governance$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Treasury analytics' })).toBeVisible();
});
