import { describe,it,expect } from 'vitest';
import { dateKey,toLocalInput,fromLocalInput,csv,filterTasks,taskSchema,relativeDue,greeting,dayDiff } from '../src/lib/domain';
import { demoData,DEMO_USER } from '../src/lib/demo';
import { emptyFilters } from '../src/lib/types';
describe('Domain invariants',()=>{
 it('uses Jakarta dates and roundtrips time consistently',()=>{expect(dateKey('2026-10-30T18:00:00Z')).toBe('2026-10-31');expect(toLocalInput('2026-10-30T18:00:00Z')).toBe('2026-10-31T01:00');expect(fromLocalInput('2026-10-31T01:00')).toBe('2026-10-30T18:00:00.000Z');});
 it('neutralizes spreadsheet formula injection and escapes quotes',()=>{expect(csv([['=HYPERLINK("x")','a,b']])).toContain('"\'=HYPERLINK(""x"")"');});
 it('filters archived data, PIC, teams, type and keyword together',()=>{const d=demoData();const list=filterTasks(d.tasks,{...emptyFilters,preset:'mine',kind:'evp',search:'Koordinasi'},DEMO_USER,d);expect(list).toHaveLength(1);expect(list[0].pic_id).toBe(DEMO_USER);});
 it('validates completion and waiting prerequisites',()=>{const t=demoData().tasks[0];expect(taskSchema.safeParse({...t,status:'done',actual_result:''}).success).toBe(false);expect(taskSchema.safeParse({...t,status:'waiting',waiting_reason:'',waiting_on:''}).success).toBe(false);});
 it('describes deadlines relative to the WIB calendar day',()=>{const now=new Date('2026-11-05T05:00:00Z');/* 12.00 WIB Thursday */
  expect(dayDiff('2026-11-05T16:59:00Z',now)).toBe(0);expect(dayDiff('2026-11-05T17:01:00Z',now)).toBe(1);
  expect(relativeDue({due_at:'2026-11-05T09:00:00Z',status:'doing'},now)).toEqual({label:'Hari ini, 16.00',tone:'today'});
  expect(relativeDue({due_at:'2026-11-05T02:00:00Z',status:'doing'},now)).toEqual({label:'Lewat tenggat hari ini',tone:'late'});
  expect(relativeDue({due_at:'2026-11-03T09:00:00Z',status:'waiting'},now)).toEqual({label:'Terlambat 2 hari',tone:'late'});
  expect(relativeDue({due_at:'2026-11-06T09:00:00Z',status:'todo'},now).label).toBe('Besok');
  expect(relativeDue({due_at:'2026-11-09T09:00:00Z',status:'todo'},now).label).toBe('4 hari lagi');
  expect(relativeDue({due_at:'2026-12-01T09:00:00Z',status:'todo'},now).tone).toBe('later');
  expect(relativeDue({due_at:'2026-11-01T09:00:00Z',status:'done'},now).tone).toBe('none');
  expect(relativeDue({due_at:null,status:'todo'},now)).toEqual({label:'Tanpa tenggat',tone:'none'});
 });
 it('greets by WIB time of day',()=>{expect(greeting(new Date('2026-11-05T00:30:00Z'))).toBe('Selamat pagi');expect(greeting(new Date('2026-11-05T06:00:00Z'))).toBe('Selamat siang');expect(greeting(new Date('2026-11-05T09:30:00Z'))).toBe('Selamat sore');expect(greeting(new Date('2026-11-05T13:00:00Z'))).toBe('Selamat malam');});
});
