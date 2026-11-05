import {test,expect} from '@playwright/test';
import { settled } from './settle';
const axe=async(page:import('@playwright/test').Page)=>(await (await settled(page)).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));

test('login copy, password toggle and single preview entry',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.reference-access-intro h2')).toHaveText('Masuk ke ruang kerja.');
 await page.setViewportSize({width:390,height:844});
 // The line break is hidden on phones; the words must still be separated.
 expect(await page.locator('.reference-access-intro h2').evaluate(e=>(e as HTMLElement).innerText.replace(/\s+/g,' ').trim())).toBe('Masuk ke ruang kerja.');
 const password=page.getByLabel('Kata sandi',{exact:true});
 await expect(password).toHaveAttribute('type','password');
 await page.getByRole('button',{name:'Tampilkan kata sandi'}).click();
 await expect(password).toHaveAttribute('type','text');
 await page.getByRole('button',{name:'Sembunyikan kata sandi'}).click();
 await expect(password).toHaveAttribute('type','password');
 await expect(page.getByLabel('Email',{exact:true})).toHaveAttribute('placeholder','nama@email.com');
 await expect(page.getByRole('button',{name:/pratinjau|data contoh/i})).toHaveCount(1);
});

test('count-up settles on the real values',async({page})=>{
 await page.goto('/?preview=1');
 const active=page.getByRole('button',{name:/Pekerjaan aktif/});
 await expect(active.locator('.count-up [aria-hidden]')).toHaveText('5');
 await expect(active).toHaveAccessibleName(/^5 Pekerjaan aktif/);
});

test('activity shows concrete changes and can be filtered',async({page})=>{
 await page.goto('/?preview=1');
 await page.locator('.main-nav').getByRole('button',{name:'Aktivitas',exact:true}).click();
 await expect(page.getByText('Status: Berjalan → Menunggu',{exact:true})).toBeVisible();
 await page.getByLabel('Filter jenis aktivitas').selectOption('status');
 await expect(page.locator('.activity-timeline .timeline-item')).toHaveCount(2);
 await page.getByLabel('Cari aktivitas').fill('tidak ada yang cocok');
 await expect(page.getByRole('heading',{name:'Tidak ada aktivitas yang cocok'})).toBeVisible();
 await page.getByLabel('Cari aktivitas').fill('');
 await page.getByLabel('Filter jenis aktivitas').selectOption('');
 expect(await axe(page)).toEqual([]);
});

test('admin can schedule recurring work in preview',async({page})=>{
 await page.goto('/?preview=1');
 await page.locator('.sidebar-bottom-nav').getByRole('button',{name:'Pengaturan'}).click();
 await page.locator('.settings-nav').getByRole('button',{name:'Pekerjaan berulang',exact:true}).click();
 await expect(page.getByText('Rekap pekerjaan mingguan',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Tambah jadwal',exact:true}).click();
 const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Judul pekerjaan *').fill('Laporan akhir bulan');
 await dialog.getByLabel('Frekuensi').selectOption('monthly');
 await dialog.getByLabel('Tanggal').fill('31');
 await expect(dialog.getByText('Setiap tanggal 31 · tenggat hari yang sama, 16:00 WIB')).toBeVisible();
 await dialog.getByRole('button',{name:'Simpan jadwal'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.getByText('Laporan akhir bulan',{exact:true})).toBeVisible();
 await page.getByRole('switch',{name:'Aktifkan jadwal Laporan akhir bulan'}).uncheck();
 await expect(page.locator('.recurrence-row.inactive')).toHaveCount(1);
 expect(await axe(page)).toEqual([]);
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:'Hapus jadwal Laporan akhir bulan'}).click();
 await expect(page.getByText('Laporan akhir bulan',{exact:true})).toHaveCount(0);
});

test('calendar days align and stay usable on phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/?preview=1');
 await page.locator('.mobile-tabbar').getByRole('button',{name:'Agenda',exact:true}).click();
 const tops=await page.locator('.calendar-day').evaluateAll(days=>days.slice(0,14).map(d=>{const n=d.querySelector('span')!.getBoundingClientRect(),c=d.getBoundingClientRect();return Math.round(n.top-c.top);}));
 expect(new Set(tops).size).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
