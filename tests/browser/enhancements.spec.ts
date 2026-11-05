import {test,expect} from '@playwright/test';
import { settled } from './settle';
const axe=async(page:import('@playwright/test').Page)=>(await (await settled(page)).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));

test('login copy, password toggle and single preview entry',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Pengelolaan pekerjaan Tim Kerja BYLT.');
 await expect(page.getByRole('heading',{name:'Selamat datang kembali.'})).toBeVisible();
 await expect(page.locator('.login-clock')).toContainText('WIB');
 const password=page.getByLabel('Kata sandi',{exact:true});
 await expect(password).toHaveAttribute('type','password');
 await page.getByRole('button',{name:'Tampilkan kata sandi'}).click();
 await expect(password).toHaveAttribute('type','text');
 await page.getByRole('button',{name:'Sembunyikan kata sandi'}).click();
 await expect(password).toHaveAttribute('type','password');
 await expect(page.getByLabel('Email',{exact:true})).toHaveAttribute('placeholder','nama@email.com');
 await expect(page.getByRole('button',{name:/pratinjau|data contoh/i})).toHaveCount(1);
});

test('sign-in fills a laptop screen with the form fully visible',async({page})=>{
 for(const [width,height] of [[1366,768],[1440,900],[1280,720]]){
  await page.setViewportSize({width,height});
  await page.goto('/');
  await page.locator('.login-card').waitFor();
  const layout=await page.evaluate(()=>{const hero=document.querySelector('.login-hero')!.getBoundingClientRect(),form=document.querySelector('.login-card')!.getBoundingClientRect(),scene=document.querySelector('.login-scene')!.getBoundingClientRect();return{hero:Math.round(hero.height),form:Math.round(form.bottom),scene:Math.round(scene.bottom),vh:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth};});
  expect(layout.hero,`${width}x${height}`).toBe(height);
  expect(layout.form,`${width}x${height}`).toBeLessThanOrEqual(height);
  expect(layout.scene,`${width}x${height}`).toBeLessThanOrEqual(height);
  expect(layout.overflow).toBe(false);
 }
 // The decorative locomotive stays out of the accessibility tree.
 await expect(page.locator('.login-scene svg')).toHaveAttribute('aria-hidden','true');
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('.login-card').waitFor();
 expect(await page.getByLabel('Email',{exact:true}).evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight)).toBe(true);
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

test('command palette finds tasks, pages and actions from the keyboard',async({page})=>{
 await page.setViewportSize({width:1366,height:900});
 await page.goto('/?preview=1');
 await expect(page.getByRole('heading',{name:/Ringkasan pekerjaan/})).toBeVisible();
 await page.keyboard.press('Control+k');
 const input=page.getByRole('combobox',{name:'Cari pekerjaan, halaman, atau tindakan'});
 await expect(input).toBeFocused();
 expect(await axe(page)).toEqual([]);
 await input.fill('rekap');
 await expect(page.getByRole('option',{name:/Penyusunan rekap pekerjaan bulanan/})).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('Enter');
 await expect(page.getByRole('dialog').getByText('Penyusunan rekap pekerjaan bulanan',{exact:true}).first()).toBeVisible();
 await page.keyboard.press('Escape');
 await page.keyboard.press('Control+k');
 await input.fill('agenda');
 await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'Agenda pekerjaan'})).toBeVisible();
 await page.keyboard.press('Control+k');
 await input.fill('zzz tidak ada');
 await expect(page.getByText('Tidak ada hasil untuk “zzz tidak ada”.')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.command-palette[open]')).toHaveCount(0);
});

test('phone search button opens the palette; scrolling tabs show an edge hint',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/?preview=1');
 await page.getByRole('button',{name:'Pencarian cepat'}).click();
 await expect(page.getByRole('combobox',{name:'Cari pekerjaan, halaman, atau tindakan'})).toBeFocused();
 await page.keyboard.press('Escape');
 await page.locator('.mobile-tabbar').getByRole('button',{name:'Tugas',exact:true}).click();
 await expect(page.locator('.presets')).toHaveAttribute('data-more-end','');
 await page.locator('.presets').evaluate(e=>{e.style.scrollBehavior='auto';e.scrollLeft=e.scrollWidth;});
 await expect(page.locator('.presets')).not.toHaveAttribute('data-more-end','');
 await expect(page.locator('.presets')).toHaveAttribute('data-more-start','');
});

test('kanban fits five columns on a laptop screen and rows skip empty department',async({page})=>{
 await page.setViewportSize({width:1366,height:900});
 await page.goto('/?preview=1');
 await page.locator('.main-nav').getByRole('button',{name:/Pekerjaan/}).click();
 await expect(page.getByText('Bagian belum ditetapkan')).toHaveCount(0);
 await expect(page.getByText('Bagian contoh 1',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Tampilan Kanban'}).click();
 expect(await page.locator('.kanban').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
});

test('dashboard greets, shows the week of deadlines and the user focus list',async({page})=>{
 await page.setViewportSize({width:1366,height:768});
 await page.goto('/?preview=1');
 await expect(page.locator('.dashboard-greeting')).toHaveText(/^Selamat (pagi|siang|sore|malam), Pengguna\./);
 // "Perlu perhatian" must start on the first laptop screen.
 expect(await page.getByRole('heading',{name:/Perlu perhatian/}).evaluate(e=>e.getBoundingClientRect().top<innerHeight)).toBe(true);
 await expect(page.locator('.week-day')).toHaveCount(7);
 await expect(page.locator('.focus-row')).toHaveCount(2);
 await expect(page.locator('.focus-row .due-label.late')).toHaveText('Terlambat 1 hari');
 await expect(page.locator('.main-nav .nav-alert')).toHaveText('1');
 await page.getByRole('button',{name:'Buka agenda'}).click();
 await expect(page.getByRole('heading',{name:'Agenda pekerjaan'})).toBeVisible();
 await page.locator('.main-nav').getByRole('button',{name:/Pekerjaan/}).click();
 await expect(page.locator('td small.due-label.late')).toHaveText('Terlambat 1 hari');
});
