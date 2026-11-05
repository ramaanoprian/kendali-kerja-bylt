import {test,expect} from '@playwright/test';
// Requests are intercepted: no account is created and no test email is sent.
for(const flow of ['magic','recovery'])test(`${flow} requests a root redirect with trailing slash`,async({page})=>{
 let requested='';
 await page.route('**/auth/v1/**',async route=>{requested=route.request().url();await route.fulfill({status:200,contentType:'application/json',body:'{}'});});
 await page.goto('/');
 await page.getByRole('button',{name:flow==='magic'?'Masuk melalui tautan email':'Lupa kata sandi?',exact:true}).click();
 await page.getByLabel('Email',{exact:true}).fill('redirect-test@example.invalid');
 await page.getByRole('button',{name:'Kirim tautan',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('tautan telah dikirim');
 expect(new URL(requested).searchParams.get('redirect_to')).toBe('http://localhost:5173/');
});
test('expired callback explains how to request a new link',async({page})=>{
 await page.goto('/#error=access_denied&error_code=otp_expired');
 await expect(page.getByRole('alert')).toContainText('Minta tautan masuk baru');
});
test('a recovery return opens password settings after workspace access',async({page})=>{
 await page.goto('/?preview=1#type=recovery');
 await expect(page.getByRole('heading',{name:'Pengaturan',exact:true})).toBeVisible();
 await expect(page.getByLabel('Kata sandi baru (minimal 12 karakter)',{exact:true})).toBeVisible();
});
