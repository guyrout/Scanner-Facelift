#!/usr/bin/env node
/**
 * Captures the scan flow page (Scan tab) for layout verification.
 * 1. Navigate to home page
 * 2. Click Scan button to enter scan flow
 * 3. Click Scan tab in wizard (default is Info)
 * 4. Screenshot the scan page
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, 'scan-page-screenshot.png');
const BASE_URL = 'http://localhost:5173/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Loaded home page');

    // Click Scan button to enter scan flow
    await page.getByRole('button', { name: 'Scan' }).click();
    await page.waitForTimeout(800);

    // Click Scan tab in wizard (Info | Scan | View | Send) - aria-label is "Step 2: Scan"
    await page.getByRole('tab', { name: /Step 2: Scan/ }).click();
    await page.waitForTimeout(800);

    await page.screenshot({ path: outputPath, fullPage: false });
    console.log('Scan page screenshot saved to:', outputPath);
  } catch (e) {
    console.error(e);
    await page.screenshot({ path: join(__dirname, 'scan-page-error.png') });
    console.log('Error - screenshot saved to scan-page-error.png');
  } finally {
    await browser.close();
  }
})();
