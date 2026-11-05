import {describe,it,expect} from 'vitest';
import {authRedirectUrl,readAuthReturn} from '../src/lib/authRedirect';
const origin='https://kendali-kerja-bylt.ramanoprian73.chatgpt.site';
describe('Email authentication return URL',()=>{
 it('always matches the allowlisted root, even when origin has no slash',()=>{
  expect(authRedirectUrl(origin)).toBe(origin+'/');
  expect(authRedirectUrl(origin+'/')).toBe(origin+'/');
  expect(authRedirectUrl(origin+'/?recovery=1')).toBe(origin+'/');
 });
 it('keeps password setup intent from verified recovery/invite callbacks without a redirect query',()=>{
  expect(readAuthReturn(origin+'/#type=recovery').requiresPassword).toBe(true);
  expect(readAuthReturn(origin+'/#type=invite').requiresPassword).toBe(true);
  expect(readAuthReturn(origin+'/#type=magiclink').requiresPassword).toBe(false);
 });
 it('shows a useful expired-link message without displaying provider error payloads',()=>{
  const r=readAuthReturn(origin+'/#error=access_denied&error_code=otp_expired&error_description=untrusted');
  expect(r.error).toContain('Minta tautan masuk baru');
  expect(r.error).not.toContain('untrusted');
 });
});
