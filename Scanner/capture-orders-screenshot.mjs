#!/usr/bin/env node
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, 'patient-orders-table-screenshot.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="button"], .cursor-pointer', { timeout: 5000 });
    // Click first patient row
    const patientRow = page.locator('div[role="button"]').first();
    await patientRow.click();
    await page.waitForTimeout(1500);
    // Wait for Patient Orders heading
    await page.waitForSelector('text=Patient Orders', { timeout: 5000 });
    // Target the table (header + body) for alignment verification
    const tableCard = page.locator('div.bg-surface.rounded-lg').filter({ hasText: 'Patient Orders' }).first();
    await tableCard.waitFor({ state: 'visible', timeout: 3000 });
    // Scroll table into view and screenshot the table area
    await tableCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await tableCard.screenshot({ path: outputPath });
    console.log('Screenshot saved to:', outputPath);
  } catch (e) {
    console.error(e);
    await page.screenshot({ path: outputPath });
    console.log('Full page screenshot saved to:', outputPath);
  } finally {
    await browser.close();
  }
})();
