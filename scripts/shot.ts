/**
 * Screenshot helper for design review.
 * Usage: npx tsx scripts/shot.ts [outDir]
 * Set VIEWPORT_H to capture a taller window when a page runs past the fold.
 * Requires the dev server running (npm run dev).
 */

import puppeteer, { type Page } from 'puppeteer';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/build-entry.html';
const OUT = process.argv[2] ?? '.review/current';

// Identity name -> routes worth reviewing under that role.
const PLAN: { name: string; routes: [string, string][] }[] = [
  {
    name: '王振华',
    routes: [
      ['/', 'admin-workbench'],
      ['/seats', 'admin-seats'],
      ['/members', 'admin-members'],
      ['/orders', 'admin-orders'],
      ['/statistics', 'admin-statistics'],
      ['/approvals', 'admin-approvals'],
      ['/audit', 'admin-audit'],
    ],
  },
  {
    name: '张思远',
    routes: [
      ['/', 'member-workbench'],
      ['/modules', 'member-modules'],
      ['/module/1', 'member-module-detail'],
      ['/my-modules', 'member-my-modules'],
      ['/applications', 'member-applications'],
      ['/profile', 'member-profile'],
    ],
  },
  {
    name: '沈涛',
    routes: [
      ['/', 'vendor-workbench'],
      ['/vendor/orgs', 'vendor-orgs'],
      ['/vendor/catalog', 'vendor-catalog'],
    ],
  },
];

/**
 * Assume a seeded identity through the header's demo identity switcher.
 *
 * The store lives in memory only, so the switch has to happen through the UI
 * and must survive the hash navigations that follow. Each step is polled rather
 * than slept through, because a fixed delay silently left every admin route
 * rendering the member's "no permission" screen.
 */
async function switchTo(page: Page, name: string): Promise<void> {
  await page.goto(`${BASE}#/`, { waitUntil: 'load' });
  await page.waitForSelector('[aria-label="账号与身份"]');
  await page.click('[aria-label="账号与身份"]');

  // Wait for the switcher group, then click the row for the target account.
  await page.waitForSelector('[aria-label="演示用身份切换"]');
  const switched = await page.evaluate((target) => {
    const group = document.querySelector('[aria-label="演示用身份切换"]');
    const row = Array.from(group?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes(target),
    );
    (row as HTMLButtonElement | undefined)?.click();
    return Boolean(row);
  }, name);

  if (!switched) throw new Error(`identity not found in switcher: ${name}`);

  // The header re-renders with the new account; confirm before navigating away.
  await page.waitForFunction(
    (target) => document.querySelector('header')?.textContent?.includes(target) ?? false,
    {},
    name,
  );
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ??
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage();
  /* The shell owns its own scroll regions, so a full-page capture would still
     stop at the fold — a taller viewport is the only way to see past it. */
  const height = Number(process.env.VIEWPORT_H) || 1000;
  await page.setViewport({ width: 1600, height, deviceScaleFactor: 2 });

  for (const { name, routes } of PLAN) {
    await switchTo(page, name);
    for (const [route, file] of routes) {
      await page.goto(`${BASE}#${route}`, { waitUntil: 'load' });
      // Let route-entry animations settle before capturing.
      await new Promise((r) => setTimeout(r, 700));
      await page.screenshot({ path: `${OUT}/${file}.png` as `${string}.png` });
      console.log(`${OUT}/${file}.png`);
    }
  }

  await browser.close();
}

main();
