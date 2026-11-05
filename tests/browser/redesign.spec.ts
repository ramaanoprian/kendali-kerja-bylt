import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('status chart opens matching tasks and report shortcut preserves navigation',async({page})=>{
 await page.goto('/?preview=1');
 const status=page.getByRole('button',{name:/^Berjalan: \d+ pekerjaan$/});
 const count=Number((await status.getAttribute('aria-label'))?.match(/\d+/)?.[0]);
 await status.click();
 await expect(page.getByRole('heading',{name:'Pekerjaan tim',exact:true})).toBeVisible();
 await expect(page.locator('tbody tr')).toHaveCount(count);
 await page.locator('.main-nav').getByRole('button',{name:'Ringkasan',exact:true}).click();
 await page.getByRole('button',{name:'Tinjau laporan',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Laporan EVP',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Gunakan tampilan gelap'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('login is responsive and accessible',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await expect(page.getByRole('heading',{name:'Selamat datang kembali.'})).toBeVisible();
 await page.screenshot({path:'screenshots/stripe-login-desktop.png',fullPage:true});
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.failureSummary)}))).toEqual([]);
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'screenshots/stripe-login-hp.png',fullPage:true});
});
for(const mode of ['light','dark'])test(`supporting work pages retain accessible contrast: ${mode}`,async({page})=>{
 await page.addInitScript(m=>localStorage.setItem('bylt-theme',m),mode);
 await page.goto('/?preview=1');
 for(const label of ['Pekerjaan','Agenda','Laporan EVP','Kontak bagian']){
  await page.locator('.main-nav').getByRole('button',{name:label,exact:true}).click();
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),label).toEqual([]);
 }
});
