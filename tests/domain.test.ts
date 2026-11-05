import { describe,it,expect } from 'vitest';
import { dateKey,toLocalInput,fromLocalInput,csv,filterTasks,taskSchema } from '../src/lib/domain';
import { demoData,DEMO_USER } from '../src/lib/demo';
import { emptyFilters } from '../src/lib/types';
describe('Domain invariants',()=>{
 it('uses Jakarta dates and roundtrips time consistently',()=>{expect(dateKey('2026-10-30T18:00:00Z')).toBe('2026-10-31');expect(toLocalInput('2026-10-30T18:00:00Z')).toBe('2026-10-31T01:00');expect(fromLocalInput('2026-10-31T01:00')).toBe('2026-10-30T18:00:00.000Z');});
 it('neutralizes spreadsheet formula injection and escapes quotes',()=>{expect(csv([['=HYPERLINK("x")','a,b']])).toContain('"\'=HYPERLINK(""x"")"');});
 it('filters archived data, PIC, teams, type and keyword together',()=>{const d=demoData();const list=filterTasks(d.tasks,{...emptyFilters,preset:'mine',kind:'evp',search:'Koordinasi'},DEMO_USER,d);expect(list).toHaveLength(1);expect(list[0].pic_id).toBe(DEMO_USER);});
 it('validates completion and waiting prerequisites',()=>{const t=demoData().tasks[0];expect(taskSchema.safeParse({...t,status:'done',actual_result:''}).success).toBe(false);expect(taskSchema.safeParse({...t,status:'waiting',waiting_reason:'',waiting_on:''}).success).toBe(false);});
});
