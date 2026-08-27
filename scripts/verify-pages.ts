/**
 * Browser smoke check: renders every route under every role and fails on any
 * console error, page error, or blank main region.
 *
 * Requires the dev server: npm run dev, then npm run verify:pages
 */

import puppeteer, { type ConsoleMessage, type Page } from 'puppeteer';
import { navItems } from '../src/domain/navigation';
import { can } from '../src/domain/permissions';
import type { Role } from '../src/domain/types';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/build-entry.html';

/** One representative member per role, matching the header's identity switcher. */
const ROLES: { role: Role; name: string }[] = [
  { role: 'ORG_ADMIN', name: '王振华' },
  { role: 'DEPT_ADMIN', name: '李明' },
  { role: 'MEMBER', name: '张思远' },
  { role: 'VENDOR_OPS', name: '沈涛' },
];

const problems: string[] = [];
let checks = 0;

/**
 * Vite HMR chatter and the browser's implicit favicon request are not
 * application faults. Resource-load failures carry the URL in the message
 * location rather than the text, so both are checked.
 */
function isRealError(text: string, url: string): boolean {
  const noise = /favicon|\[vite\]|Download the React DevTools/i;
  return !noise.test(text) && !noise.test(url);
}

/** Vite keeps an HMR socket open, so `networkidle0` can hang forever. */
const WAIT = 'load' as const;

async function switchTo(page: Page, name: string): Promise<void> {
  await page.goto(`${BASE}#/`, { waitUntil: WAIT });
  // Open the identity dropdown, then pick the member by displayed name.
  const buttons = await page.$$('header button');
  await buttons[buttons.length - 1].click();
  await new Promise((r) => setTimeout(r, 120));
  const picked = await page.evaluate((target) => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(target),
    );
    if (!btn) return false;
    (btn as HTMLButtonElement).click();
    return true;
  }, name);
  if (!picked) problems.push(`无法切换到身份「${name}」`);
  await new Promise((r) => setTimeout(r, 150));
}

async function main(): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    // The sandbox cache often has no downloaded Chrome; fall back to the local install.
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ??
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(20_000);
  await page.setViewport({ width: 1440, height: 900 });

  let current = '';
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' && isRealError(msg.text(), msg.location().url ?? '')) {
      errors.push(`[${current}] console: ${msg.text().slice(0, 200)}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(`[${current}] pageerror: ${err.message.slice(0, 200)}`);
  });

  for (const { role, name } of ROLES) {
    console.log(`\n${name}（${role}）`);
    await switchTo(page, name);

    for (const item of navItems) {
      const allowed = item.permissions.length === 0 || item.permissions.some((p) => can(role, p));
      current = `${role} ${item.path}`;
      await page.goto(`${BASE}#${item.path}`, { waitUntil: WAIT });
      await new Promise((r) => setTimeout(r, 120));

      const body = await page.evaluate(() => {
        const main = document.querySelector('main') ?? document.body;
        return { text: (main.textContent ?? '').trim(), length: (main.textContent ?? '').trim().length };
      });

      checks += 1;
      const refused = body.text.includes('没有访问权限') || body.text.includes('无权');

      if (!allowed) {
        // Menus hide these, but direct URL access must be explicitly refused.
        if (!refused) problems.push(`${role} 直达 ${item.path} 未被拒绝`);
        console.log(`  ${refused ? '✓' : '✗'} ${item.path} → 越权拒绝`);
      } else if (body.length < 40) {
        problems.push(`${role} ${item.path} 渲染内容过少（${body.length} 字符），疑似空白页`);
        console.log(`  ✗ ${item.path} → 疑似空白`);
      } else {
        console.log(`  ✓ ${item.path} (${item.label})`);
      }
    }
  }

  await browser.close();

  const all = [...problems, ...errors];
  console.log(`\n${'─'.repeat(52)}`);
  if (all.length === 0) {
    console.log(`全部通过：${checks} 个页面渲染无报错`);
    process.exit(0);
  }
  console.log(`检查 ${checks} 个页面，发现 ${all.length} 个问题：`);
  all.forEach((p) => console.log(`  · ${p}`));
  process.exit(1);
}

main();
