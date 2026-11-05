import type { Task,WorkspaceData } from './types';
export const DEMO_USER='demo-rama';
export const blankData=():WorkspaceData=>({tasks:[],profiles:[],memberships:[],teams:[],departments:[],teamMembers:[],supporters:[],subtasks:[],comments:[],attachments:[],history:[],notifications:[],contacts:[],reports:[],invitations:[],recurrences:[]});
export function demoData():WorkspaceData{
 const d=blankData(),now=new Date(),day=(offset:number)=>new Date(now.getTime()+offset*86400000).toISOString();
 d.profiles=[{id:DEMO_USER,name:'Pengguna contoh',reminders:true},{id:'demo-b',name:'Anggota contoh',reminders:true}];
 d.memberships=d.profiles.map(p=>({user_id:p.id,organization_id:'demo',role:'admin',active:true}));
 d.teams=[{id:'demo-team-1',organization_id:'demo',name:'Tim Kerja 1'},{id:'demo-team-2',organization_id:'demo',name:'Tim Kerja 2'}];
 d.teamMembers=[{user_id:DEMO_USER,team_id:'demo-team-1',organization_id:'demo'}];
 const rows:[string,Task['status'],number,number,Task['kind'],Task['priority']][]=[
 ['Koordinasi tindak lanjut arahan pimpinan','doing',65,1,'evp','high'],
 ['Penyusunan rekap pekerjaan bulanan','doing',40,3,'routine','normal'],
 ['Konfirmasi kebutuhan data lintas bagian','waiting',30,-1,'evp','urgent'],
 ['Peninjauan kelengkapan dokumen pekerjaan','todo',0,5,'routine','normal'],
 ['Penyusunan rencana kerja berikutnya','todo',0,7,'evp','high'],
 ['Dokumentasi hasil koordinasi tim','done',100,-2,'routine','normal']];
 d.tasks=rows.map(([title,status,progress,due,kind,priority],i)=>({id:`demo-task-${i}`,organization_id:'demo',number:i+1,title,description:'Data contoh untuk meninjau alur aplikasi. Bukan catatan operasional UPT Balai Yasa Lahat.',kind,status,progress,priority,due_at:day(due),received_at:day(-5),team_id:i%2?'demo-team-2':'demo-team-1',department_id:null,pic_id:i===4?null:i%2?'demo-b':DEMO_USER,assigned_by:'',expected_result:'Dokumen dan tindak lanjut yang telah ditinjau bersama.',actual_result:status==='done'?'Dokumentasi contoh telah dilengkapi.':'',obstacles:status==='waiting'?'Data pendukung belum diterima.':'',decision_needed:status==='waiting'?'Konfirmasi prioritas tindak lanjut.':'',next_action:'Koordinasikan pembaruan dengan anggota tim.',waiting_reason:status==='waiting'?'Menunggu kelengkapan data.':'',waiting_on:status==='waiting'?'Bagian terkait':'',change_reason:'',created_by:DEMO_USER,updated_by:DEMO_USER,created_at:day(-5),updated_at:day(-i/24),completed_at:status==='done'?day(-1):null,archived_at:null,version:1,request_id:`demo-${i}`}));
 // Earlier snapshots let the activity page demonstrate concrete changes (status, progress, PIC).
 const before=(t:Task,i:number):Task|null=>i===5?null:{...t,status:i===2?'doing':i===0?'todo':t.status,progress:Math.max(0,t.progress-25),pic_id:i===1?DEMO_USER:t.pic_id};
 d.history=d.tasks.map((t,i)=>({id:`history-${i}`,organization_id:'demo',task_id:t.id,actor_id:i===3?'demo-b':DEMO_USER,action:i===5?'created':'updated',before_data:before(t,i),after_data:t,reason:'Pembaruan contoh',created_at:t.updated_at}));
 d.recurrences=[{id:'demo-recur-1',organization_id:'demo',title:'Rekap pekerjaan mingguan',description:'Data contoh pengulangan.',kind:'routine',priority:'normal',assigned_by:'',expected_result:'Rekap mingguan tersusun.',team_id:'demo-team-1',department_id:null,pic_id:DEMO_USER,supporters:[],freq:'weekly',weekday:5,month_day:null,due_days:0,due_time:'16:00:00',active:true,next_run:day(1).slice(0,10),last_run:null,created_by:DEMO_USER,created_at:day(-10),updated_at:day(-10)}];
 return d;
}
