#!/usr/bin/env node
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mainScreenshotPath = join(__dirname, 'main-page-screenshot.png');
const ordersScreenshotPath = join(__dirname, 'patient-orders-screenshot.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: mainScreenshotPath });
    console.log('Main page screenshot saved to:', mainScreenshotPath);

    await page.waitForSelector('[role="button"], .cursor-pointer', { timeout: 5000 });
    const patientRow = page.locator('div[role="button"]').first();
    await patientRow.click();
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=Patient Orders', { timeout: 5000 });
    const tableCard = page.locator('div.bg-surface.rounded-lg').filter({ hasText: 'Patient Orders' }).first();
    await tableCard.waitFor({ state: 'visible', timeout: 3000 });
    await tableCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await tableCard.screenshot({ path: ordersScreenshotPath });
    console.log('PatientOrders view screenshot saved to:', ordersScreenshotPath);
  } catch (e) {
    console.error(e);
    await page.screenshot({ path: join(__dirname, 'error-screenshot.png') });
    console.log('Error - full page screenshot saved');
  } finally {
    await browser.close();
  }
})();
