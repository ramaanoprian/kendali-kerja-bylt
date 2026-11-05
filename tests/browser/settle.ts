import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
/**
 * Audits must measure the settled UI, not a frame in the middle of an entrance fade.
 * Scrolls once through the page (so scroll-reveal content appears like it does for a reader),
 * then waits for every finite animation and transition to finish. Infinite ambient motion is ignored.
 */
export async function settled(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(200, innerHeight * 0.8);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }
    scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 50));
    const finite = document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.all(finite.map(a => a.finished.catch(() => undefined)));
  });
  return new AxeBuilder({ page });
}
