import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173/?preview=1');await page.getByRole('heading',{name:/Selamat bekerja/}).waitFor();await page.screenshot({path:'screenshots/desktop-ringkasan.png',fullPage:true});
await page.getByRole('button',{name:'Pekerjaan',exact:false}).filter({has:page.locator('span')}).first().click().catch(()=>{});
await page.goto('http://localhost:5173/');await page.getByRole('heading',{name:'Selamat datang kembali.'}).waitFor();await page.screenshot({path:'screenshots/desktop-login.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:5173/?preview=1');await page.getByRole('heading',{name:/Selamat bekerja/}).waitFor();await page.screenshot({path:'screenshots/hp-ringkasan.png',fullPage:true});
console.log(JSON.stringify({errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));await browser.close();
