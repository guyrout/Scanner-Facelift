#!/usr/bin/env node
/**
 * Captures the scan page: (1) collapsed toolbar, (2) expanded toolbar with labels.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshot1Path = join(__dirname, 'scan-page-collapsed.png');
const screenshot2Path = join(__dirname, 'scan-page-expanded.png');
const BASE_URL = 'http://localhost:5173/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Loaded home page');

    // 1. Click Scan button to enter scan flow
    await page.getByRole('button', { name: 'Scan' }).click();
    await page.waitForTimeout(800);

    // 2. Click Scan tab in wizard
    await page.getByRole('tab', { name: /Step 2: Scan/ }).click();
    await page.waitForTimeout(800);

    // 3. Screenshot with collapsed toolbar
    await page.screenshot({ path: screenshot1Path, fullPage: false });
    console.log('Screenshot 1 (collapsed toolbar) saved to:', screenshot1Path);

    // 4. Click chevron to expand toolbar (aria-label "Expand toolbar")
    await page.getByRole('button', { name: 'Expand toolbar' }).click();
    await page.waitForTimeout(400);

    // 5. Screenshot with expanded toolbar
    await page.screenshot({ path: screenshot2Path, fullPage: false });
    console.log('Screenshot 2 (expanded toolbar) saved to:', screenshot2Path);
  } catch (e) {
    console.error(e);
    await page.screenshot({ path: join(__dirname, 'scan-toolbar-error.png') });
    console.log('Error - screenshot saved to scan-toolbar-error.png');
  } finally {
    await browser.close();
  }
})();
