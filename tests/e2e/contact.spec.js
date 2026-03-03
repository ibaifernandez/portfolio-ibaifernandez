const { test, expect } = require('@playwright/test');

async function fillContactForm(page, suffix = '') {
  await page.locator('input[name="first_name"]').fill(`Test${suffix}`);
  await page.locator('input[name="last_name"]').fill('User');
  await page.locator('input[name="email"]').fill(`test${suffix}@example.com`);
  await page.locator('input[name="subject"]').fill('Portfolio Contact Test');
  await page.locator('textarea[name="message"]').fill('Automated test submission.');
}

test('contact form exposes accessible validation feedback when empty', async ({ page }) => {
  await page.goto('/index.html');

  await page.locator('button.submitForm').click();

  const response = page.locator('.response');
  await expect(response).toHaveAttribute('role', 'alert');
  await expect(response).toContainText(/Please complete the required fields\./i);

  const firstName = page.locator('input[name="first_name"]');
  await expect(firstName).toHaveAttribute('aria-invalid', 'true');
});

test('contact form validates invalid email format accessibly', async ({ page }) => {
  await page.goto('/index.html');

  await page.locator('input[name="first_name"]').fill('Test');
  await page.locator('input[name="last_name"]').fill('User');
  await page.locator('input[name="email"]').fill('invalid-email');
  await page.locator('input[name="subject"]').fill('Hello');
  await page.locator('textarea[name="message"]').fill('Body');
  await page.waitForTimeout(1300);
  await page.locator('button.submitForm').click();

  const response = page.locator('.response');
  await expect(response).toHaveAttribute('role', 'alert');
  await expect(response).toContainText(/Email should be valid\./i);
  await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-invalid', 'true');
});

test('contact form accepts a valid submission', async ({ page }) => {
  await page.goto('/index.html');

  await fillContactForm(page, '1');
  await page.waitForTimeout(1300);
  await page.locator('button.submitForm').click();

  await expect(page.locator('.response')).toContainText(/Your message has been sent successfully\./i);
});

test('contact function rejects too-fast payloads', async ({ request }) => {
  const response = await request.post('/.netlify/functions/contact', {
    data: {
      form_type: 'contact',
      first_name: 'Test',
      last_name: 'User',
      email: 'test-fast@example.com',
      subject: 'Portfolio Contact Test',
      message: 'Automated test submission.',
      website: '',
      form_started_at: Date.now()
    }
  });

  expect(response.ok()).toBeTruthy();
  await expect(response.text()).resolves.toBe('0');
});
