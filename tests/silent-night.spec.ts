import { expect, test } from '@playwright/test';

test('player loses if house burns down', async ({ page }) => {
  await page.goto('/chapters/silent-night');

  // Ignite candle
  await page.getByRole('button', { name: 'Ignite' }).click();
  await expect(page.getByText('Standing 🕯️')).toBeVisible();

  // Wobble until it falls
  const shake = page.getByRole('button', { name: 'Shake' });
  await shake.click();
  await shake.click();
  await shake.click();
  await shake.click();
  await shake.click();
  await expect(page.getByText('Fallen 🕯️')).toBeVisible();
  await expect(page.getByText('Burning 🕯️')).toBeVisible();

  // Mission failed, poltergeist is homeless
  await expect(page.getByText('Mission failed')).toBeVisible();
  await expect(page.getByText('Homeless', { exact: true })).toBeVisible();
});

test('player wins if human chokes on its food', async ({ page }) => {
  await page.clock.install();
  await page.goto('/chapters/silent-night');

  // Open window
  await page.getByRole('button', { name: 'Open', exact: true }).click();

  // Wait for food to be delivered
  await page.clock.runFor(20_000);
  await expect(page.getByText('Delivering', { exact: true })).toBeVisible();

  // Knock out delivery person by toppling plant
  await page.getByRole('button', { name: 'Topple' }).click();
  await expect(page.getByText('Stargazing', { exact: true })).toBeVisible();

  // Close window (so human don't get rescued by neighbor)
  await page.getByRole('button', { name: 'Close' }).click();

  // Wait for human to prepare food
  await page.clock.runFor(10_000);
  await expect(page.getByText('Preparing Meal')).toBeVisible();

  // Wait for human to eat
  await page.clock.runFor(5_000);
  await expect(page.getByText('Eating', { exact: true })).toBeVisible();

  // Wait for human to choke
  await page.clock.runFor(2_000);
  await expect(page.getByText('Choking', { exact: true })).toBeVisible();

  // Mission accomplished
  await expect(page.getByText('Chapter complete')).toBeVisible();
  await expect(page.getByText('Dead', { exact: true })).toBeVisible();
});

test('player wins if human slips', async ({ page }) => {
  await page.goto('/chapters/silent-night');

  // Wake up cat
  await page.getByRole('button', { name: 'Nudge' }).click();
  await expect(page.getByText('Awake', { exact: true })).toHaveCount(2); // Cat and human

  // Topple plant -> Robot mop is cleaning and cat is riding it
  await page.getByRole('button', { name: 'Topple' }).click();
  await expect(page.getByText('Cleaning', { exact: true })).toBeVisible();
  await expect(page.getByText('Riding', { exact: true })).toBeVisible();

  // Open window
  await page.getByRole('button', { name: 'Open', exact: true }).click();

  // Shake christmas tree until it falls
  const shake = page.getByRole('button', { name: 'Shake' });
  await shake.click();
  await shake.click();
  await shake.click();
  await shake.click();
  await shake.click();

  // Mission accomplished
  await expect(page.getByText('Chapter complete')).toBeVisible();
  await expect(page.getByText('Escaped', { exact: true })).toBeVisible();
  await expect(page.getByText('Dead', { exact: true })).toBeVisible();
});
