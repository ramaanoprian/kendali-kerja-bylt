import { z } from 'zod';
import type { Filters,Task,WorkspaceData } from './types';
export const taskSchema=z.object({title:z.string().trim().min(1,'Judul pekerjaan wajib diisi.').max(240,'Maksimal 240 karakter.'),kind:z.enum(['evp','routine']),status:z.enum(['todo','doing','waiting','done','cancelled']),progress:z.number().int().min(0).max(100),actual_result:z.string(),waiting_reason:z.string(),waiting_on:z.string(),change_reason:z.string()}).superRefine((t,ctx)=>{
 if(t.status==='done'&&!t.actual_result.trim())ctx.addIssue({code:'custom',path:['actual_result'],message:'Tuliskan hasil aktual sebelum menyelesaikan tugas.'});
 if(t.status==='waiting') for(const field of ['waiting_reason','waiting_on'] as const) if(!t[field].trim())ctx.addIssue({code:'custom',path:[field],message:'Isi alasan dan pihak yang ditunggu.'});
 if(t.status==='cancelled'&&!t.change_reason.trim())ctx.addIssue({code:'custom',path:['change_reason'],message:'Tuliskan alasan pembatalan.'});
});
export const dateKey=(value:string|Date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
export const dateLabel=(value:string|null,withTime=false)=>value?new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',year:'numeric',...(withTime?{hour:'2-digit',minute:'2-digit'}:{})}).format(new Date(value))+(withTime?' WIB':''):'Belum ditetapkan';
export const timeLabel=(v:string)=>new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'}).format(new Date(v));
export const toLocalInput=(v:string|null)=>v?new Date(new Date(v).getTime()+7*3600000).toISOString().slice(0,16):'';
export const fromLocalInput=(v:string)=>v?new Date(v+':00+07:00').toISOString():null;
export const active=(t:Task)=>!['done','cancelled'].includes(t.status)&&!t.archived_at;
export const overdue=(t:Task,now=Date.now())=>active(t)&&!!t.due_at&&new Date(t.due_at).getTime()<now;
export const soon=(t:Task,now=Date.now())=>active(t)&&!!t.due_at&&new Date(t.due_at).getTime()>=now&&new Date(t.due_at).getTime()<=now+7*86400000;
export const needsAttention=(t:Task)=>active(t)&&(overdue(t)||!t.pic_id||!t.due_at||t.status==='waiting'||!!t.decision_needed);
export function filterTasks(tasks:Task[],f:Filters,user:string,data:WorkspaceData,archived=false){
 const myTeams=data.teamMembers.filter(m=>m.user_id===user).map(m=>m.team_id);
 return tasks.filter(t=>!!t.archived_at===archived).filter(t=>{
 if(f.search&&!`${t.title} ${t.description} BYLT-${String(t.number).padStart(4,'0')}`.toLowerCase().includes(f.search.toLowerCase()))return false;
 if(f.preset==='mine'&&t.pic_id!==user&&!data.supporters.some(m=>m.task_id===t.id&&m.user_id===user))return false;
 if(f.preset==='team'&&!myTeams.includes(t.team_id||''))return false;
 if(f.preset==='attention'&&!needsAttention(t))return false;
 if(f.team&&t.team_id!==f.team||f.member&&t.pic_id!==f.member||f.department&&t.department_id!==f.department||f.kind&&t.kind!==f.kind||f.status&&t.status!==f.status||f.priority&&t.priority!==f.priority)return false;
 const periodDate=f.attention==='done'?t.completed_at:t.received_at;if((f.from||f.to)&&!periodDate)return false;if(periodDate&&(f.from&&dateKey(periodDate)<f.from||f.to&&dateKey(periodDate)>f.to))return false;
 switch(f.attention){case'active':return active(t);case'overdue':return overdue(t);case'soon':return soon(t);case'waiting':return t.status==='waiting';case'missing':return active(t)&&(!t.pic_id||!t.due_at);case'nodue':return active(t)&&!t.due_at;case'done':return t.status==='done';case'evp':return t.kind==='evp';case'routine':return t.kind==='routine';}return true;
 });
}
export function download(name:string,content:string,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:unknown[][]){return '\uFEFF'+rows.map(r=>r.map(v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export const fileSize=(n:number)=>n<1024*1024?`${Math.ceil(n/1024)} KB`:`${(n/1024/1024).toFixed(1)} MB`;
export const taskNumber=(n:number)=>`BYLT-${String(n).padStart(4,'0')}`;
export const initials=(name:string)=>name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
export const errorMessage=(e:unknown)=>{const m=e instanceof Error?e.message:typeof e==='object'&&e&&'message'in e?String(e.message):'Terjadi kesalahan.';if(m.includes('CONFLICT'))return m;if(m.includes('Failed to fetch')||m.includes('NetworkError'))return 'Koneksi terputus. Isian dipertahankan. Sambungkan kembali lalu coba simpan.';if(m.includes('Invalid login'))return 'Email atau kata sandi tidak sesuai. Periksa kembali atau pulihkan kata sandi.';if(m.includes('permission denied')||m.includes('Akses ditolak'))return 'Anda tidak memiliki izin untuk tindakan ini.';return m;};
/** Whole calendar days (WIB) from `now` to `value`: 0 today, 1 tomorrow, -1 yesterday. */
export const dayDiff=(value:string|Date,now:string|Date=new Date())=>Math.round((Date.parse(dateKey(value)+'T00:00:00Z')-Date.parse(dateKey(now)+'T00:00:00Z'))/86400000);
export type DueTone='late'|'today'|'soon'|'later'|'none';
/** Short, scannable deadline wording for lists: "Terlambat 2 hari", "Hari ini, 16.00", "Besok", "3 hari lagi". */
export function relativeDue(t:Pick<Task,'due_at'|'status'>,now:Date=new Date()):{label:string;tone:DueTone}{
 if(!t.due_at)return{label:'Tanpa tenggat',tone:'none'};
 if(t.status==='done'||t.status==='cancelled')return{label:dateLabel(t.due_at),tone:'none'};
 const d=dayDiff(t.due_at,now);
 if(new Date(t.due_at).getTime()<now.getTime())return{label:d>=0?'Lewat tenggat hari ini':`Terlambat ${-d} hari`,tone:'late'};
 if(d===0)return{label:`Hari ini, ${timeLabel(t.due_at)}`,tone:'today'};
 if(d===1)return{label:'Besok',tone:'soon'};
 if(d<=7)return{label:`${d} hari lagi`,tone:'soon'};
 return{label:dateLabel(t.due_at),tone:'later'};
}
/** Greeting by WIB clock hour. */
export const greeting=(now:Date=new Date())=>{const h=Number(new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hourCycle:'h23',timeZone:'Asia/Jakarta'}).format(now));return h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam';};
export const longDate=(now:Date=new Date())=>new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(now);
