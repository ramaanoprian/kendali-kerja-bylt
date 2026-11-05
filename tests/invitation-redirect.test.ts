import {describe,it,expect} from 'vitest';
import {invitationRedirect} from '../supabase/functions/bylt-admin/redirect';
describe('invitation redirect boundary',()=>{
  for(const origin of ['https://kendalibylt.my.id','https://kerja.dokumenbylt.my.id','https://kendali-kerja-bylt.ramanoprian73.chatgpt.site']){
    it(`accepts only the root of ${origin}`,()=>{
      expect(invitationRedirect(origin)).toBe(origin+'/');
      expect(invitationRedirect(origin+'/')).toBe(origin+'/');
    });
  }
  for(const value of [null,undefined,{},'http://kerja.dokumenbylt.my.id/','https://kerja.dokumenbylt.my.id.attacker.invalid/','https://kerja.dokumenbylt.my.id@attacker.invalid/','https://kerja.dokumenbylt.my.id/?redirect=https://attacker.invalid','https://kerja.dokumenbylt.my.id/other','https://dokumenbylt.my.id/']){
    it(`rejects ${String(value)}`,()=>expect(invitationRedirect(value)).toBeNull());
  }
  for(const value of ['http://kendalibylt.my.id/','https://kendalibylt.my.id.attacker.invalid/','https://kendalibylt.my.id@attacker.invalid/','https://kendalibylt.my.id/?redirect=https://attacker.invalid','https://kendalibylt.my.id/other']){
    it(`rejects an unsafe new-domain destination ${value}`,()=>expect(invitationRedirect(value)).toBeNull());
  }
});
