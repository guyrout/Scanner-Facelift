#!/usr/bin/env node
/**
 * Toolbar audit: captures 3 screenshots and inspects DOM.
 * 1. Collapsed toolbar
 * 2. Expanded toolbar
 * 3. Tool selected (first icon clicked)
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5173/';

const paths = {
  collapsed: join(__dirname, 'toolbar-collapsed.png'),
  expanded: join(__dirname, 'toolbar-expanded.png'),
  selected: join(__dirname, 'toolbar-selected.png'),
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });

    await page.getByRole('button', { name: 'Scan' }).click();
    await page.waitForTimeout(600);
    await page.getByRole('tab', { name: /Step 2: Scan/ }).click();
    await page.waitForTimeout(600);

    // Locate toolbar container for focused screenshots
    const toolbar = page.locator('[aria-label="Scan color"]').first().locator('..').locator('..').locator('..');

    // --- Screenshot 1: Collapsed toolbar ---
    await page.screenshot({ path: paths.collapsed, fullPage: false });
    console.log('1. Collapsed toolbar:', paths.collapsed);

    // DOM checks for collapsed state
    const toolButtons = page.locator('button[aria-label]').filter({ has: page.locator('svg') });
    const imgCount = await page.locator('.flex.items-stretch button img').count();
    const svgCount = await page.locator('.flex.items-stretch button svg').count();
    console.log('   Icons: img tags =', imgCount, '| inline SVGs =', svgCount);

    const firstBtn = page.getByRole('button', { name: 'Scan color' });
    const btnBorder = await firstBtn.evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.border, borderColor: s.borderColor, outline: s.outline };
    });
    console.log('   First icon button border/outline:', JSON.stringify(btnBorder, null, 2));

    const chevronBtn = page.getByRole('button', { name: 'Expand toolbar' });
    const dividerColor = await chevronBtn.evaluate((el) => {
      const svg = el.querySelector('svg');
      if (!svg) return null;
      const path = svg.querySelector('path[fill="#F0F0F0"], path[fill="#f0f0f0"]');
      return path ? path.getAttribute('fill') : 'not found';
    });
    console.log('   Divider color (#F0F0F0):', dividerColor || 'check SVG paths');

    // --- Expand toolbar ---
    await chevronBtn.click();
    await page.waitForTimeout(400);

    // --- Screenshot 2: Expanded toolbar ---
    await page.screenshot({ path: paths.expanded, fullPage: false });
    console.log('2. Expanded toolbar:', paths.expanded);

    const labels = await page.locator('.tp-body-01').allTextContents();
    console.log('   Labels visible:', labels);

    const chevronPath = await page.locator('button[aria-label="Collapse toolbar"] svg path').last();
    const chevronTransform = await chevronPath.getAttribute('style');
    console.log('   Chevron transform (should flip when expanded):', chevronTransform);

    // --- Click first tool (Scan color) ---
    await firstBtn.click();
    await page.waitForTimeout(400);

    // --- Screenshot 3: Selected state ---
    await page.screenshot({ path: paths.selected, fullPage: false });
    console.log('3. Selected (Scan color clicked):', paths.selected);

    const activeBg = await firstBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const activeLabel = await page.locator('button[aria-pressed="true"] span.tp-body-01').first();
    const activeLabelColor = await activeLabel.evaluate((el) => (el ? getComputedStyle(el).color : null));
    console.log('   Active button background:', activeBg);
    console.log('   Active label color:', activeLabelColor);
  } catch (e) {
    console.error(e);
    await page.screenshot({ path: join(__dirname, 'toolbar-audit-error.png') });
  } finally {
    await browser.close();
  }
})();
