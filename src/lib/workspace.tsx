import { createContext,useContext,useEffect,useRef,useState,useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase,getAll,rpc } from './supabase';
import { blankData,demoData,DEMO_USER } from './demo';
import { errorMessage } from './domain';
import type { WorkspaceData,Task,TaskInput,Membership,Role } from './types';
interface Toast {text:string;error?:boolean;action?:()=>void;actionLabel?:string}
interface Workspace {
 data:WorkspaceData;setData:React.Dispatch<React.SetStateAction<WorkspaceData>>;session:Session|null;userId:string;orgId:string;role:Role|null;
 demo:boolean;enterDemo:()=>void;logout:()=>Promise<void>;loading:boolean;error:string;online:boolean;sync:string;
 refresh:()=>Promise<void>;notify:(t:Toast)=>void;toast:Toast|null;
 saveTask:(input:TaskInput,task:Task|null,supporters:string[],request:string)=>Promise<Task>;
 archiveTask:(task:Task,archive:boolean)=>Promise<void>;
 run:<T>(fn:()=>Promise<T>)=>Promise<T>;
}
const Context=createContext<Workspace|null>(null);
export function WorkspaceProvider({children}:{children:ReactNode}){
 const[session,setSession]=useState<Session|null>(null),[demo,setDemo]=useState(new URLSearchParams(location.search).get('preview')==='1');
 const[data,setData]=useState<WorkspaceData>(()=>new URLSearchParams(location.search).get('preview')==='1'?demoData():blankData());
 const[orgId,setOrgId]=useState(''),[role,setRole]=useState<Role|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const[online,setOnline]=useState(navigator.onLine),[sync,setSync]=useState(''),[toast,setToast]=useState<Toast|null>(null);
 const generation=useRef(0),sessionRef=useRef<Session|null>(null),toastTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const notify=useCallback((t:Toast)=>{clearTimeout(toastTimer.current);setToast(t);toastTimer.current=setTimeout(()=>setToast(null),t.error?10000:6000);},[]);
 const refresh=useCallback(async()=>{
 if(demo)return;const current=sessionRef.current;if(!current){setLoading(false);return;}const gen=++generation.current;
 try{
 const{data:members,error:err}=await supabase.from('bylt_memberships').select('*').eq('user_id',current.user.id).eq('active',true);if(err)throw err;
 if(gen!==generation.current)return;
 const membership=members?.[0] as Membership|undefined;
 if(!membership){setData(blankData());setOrgId('');setRole(null);setLoading(false);return;}
 const org=membership.organization_id;
 const tableMap={tasks:'tasks',profiles:'profiles',memberships:'memberships',teams:'teams',departments:'departments',teamMembers:'team_members',supporters:'task_members',subtasks:'subtasks',comments:'comments',attachments:'attachments',history:'history',notifications:'notifications',contacts:'contacts',reports:'reports',invitations:'invitations',recurrences:'recurrences'};
 const entries=await Promise.all(Object.entries(tableMap).map(async([key,table])=>[key,await getAll(table,table==='profiles'?undefined:org)]));
 if(gen!==generation.current)return;setData(Object.fromEntries(entries) as unknown as WorkspaceData);setOrgId(org);setRole(membership.role);setError('');
 }catch(e){if(gen===generation.current)setError(errorMessage(e));}finally{if(gen===generation.current)setLoading(false);}
 },[demo]);
 useEffect(()=>{
 let alive=true;supabase.auth.getSession().then(({data})=>{if(alive){sessionRef.current=data.session;setSession(data.session);if(!data.session)setLoading(false);}});
 const{data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{if(!alive)return;if(sessionRef.current?.user.id!==next?.user.id){generation.current++;setData(blankData());setOrgId('');setRole(null);}sessionRef.current=next;setSession(next);if(!next)setLoading(false);});
 return()=>{alive=false;listener.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{if(demo){setLoading(false);return;}void refresh();},[session,refresh,demo]);
 useEffect(()=>{
 const on=()=>{setOnline(true);void refresh();},off=()=>setOnline(false),focus=()=>void refresh();window.addEventListener('online',on);window.addEventListener('offline',off);window.addEventListener('focus',focus);
 if(demo||!session)return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);window.removeEventListener('focus',focus);};
 let timer:ReturnType<typeof setTimeout>;const channel=supabase.channel('bylt-workspace-'+session.user.id);for(const table of ['tasks','comments','subtasks','task_members','attachments','notifications','memberships','teams','team_members','reports'])channel.on('postgres_changes',{event:'*',schema:'public',table:'bylt_'+table},()=>{clearTimeout(timer);timer=setTimeout(()=>void refresh(),250);});channel.subscribe();
 // Polling also clears inaccessible cached rows after a membership is revoked, even if RLS suppresses its event.
 const interval=setInterval(()=>void refresh(),30000);
 return()=>{clearInterval(interval);clearTimeout(timer);void supabase.removeChannel(channel);window.removeEventListener('online',on);window.removeEventListener('offline',off);window.removeEventListener('focus',focus);};
 },[session,refresh,demo]);
 const run=async<T,>(fn:()=>Promise<T>)=>{if(!navigator.onLine&&!demo){setSync('Perubahan belum terkirim');throw new Error('Koneksi terputus. Draft tetap tersedia; coba lagi setelah terhubung.');}setSync('Menyimpan…');try{const result=await fn();setSync(demo?'Perubahan pratinjau':'Tersimpan di cloud');await refresh();return result;}catch(e){setSync('Gagal menyimpan');throw e;}};
 const userId=demo?DEMO_USER:session?.user.id||'';
 const saveTask=async(input:TaskInput,task:Task|null,supporters:string[],request:string)=>run(async()=>{
 if(!demo)return rpc<Task>('save_task',{p_org:orgId,p_id:task?.id||null,p_version:task?.version||0,p_request:request,p_data:input,p_supporters:supporters});
 const t:Task={...input,id:task?.id||crypto.randomUUID(),organization_id:'demo',number:task?.number||Math.max(0,...data.tasks.map(t=>t.number))+1,created_by:task?.created_by||userId,updated_by:userId,created_at:task?.created_at||new Date().toISOString(),updated_at:new Date().toISOString(),version:(task?.version||0)+1,request_id:request,archived_at:task?.archived_at||null,completed_at:input.status==='done'?new Date().toISOString():null,progress:input.status==='done'?100:input.progress};
 setData(d=>({...d,tasks:task?d.tasks.map(x=>x.id===task.id?t:x):[t,...d.tasks],supporters:[...d.supporters.filter(s=>s.task_id!==t.id),...supporters.map(user_id=>({organization_id:'demo',task_id:t.id,user_id}))],history:[{id:crypto.randomUUID(),organization_id:'demo',task_id:t.id,actor_id:userId,action:task?'updated':'created',before_data:task,after_data:t,reason:input.change_reason,created_at:t.updated_at},...d.history]}));return t;
 });
 const archiveTask=async(task:Task,archive:boolean)=>{await run(async()=>{if(!demo)await rpc('archive_task',{p_id:task.id,p_version:task.version,p_archive:archive});else setData(d=>({...d,tasks:d.tasks.map(t=>t.id===task.id?{...t,archived_at:archive?new Date().toISOString():null,version:t.version+1}:t)}));});notify({text:archive?'Tugas diarsipkan.':'Tugas dipulihkan.',...(archive?{actionLabel:'Urungkan',action:()=>{void archiveTask({...task,version:task.version+1},false).catch(e=>notify({text:errorMessage(e),error:true}));}}:{})});};
 const logout=async()=>{generation.current++;for(const key of Object.keys(sessionStorage))if(key.startsWith('bylt-draft:'))sessionStorage.removeItem(key);if(!demo)await supabase.auth.signOut();setDemo(false);setData(blankData());setOrgId('');setRole(null);setSync('');history.replaceState({},'',location.pathname);};
 return <Context.Provider value={{data,setData,session,userId,orgId:demo?'demo':orgId,role:demo?'admin':role,demo,enterDemo:()=>{generation.current++;setDemo(true);setData(demoData());setLoading(false);},logout,loading,error,online,sync,refresh,notify,toast,saveTask,archiveTask,run}}>{children}</Context.Provider>;
}
export function useWorkspace(){const value=useContext(Context);if(!value)throw new Error('Workspace tidak tersedia');return value;}
export function useCanEdit(task:Task|null){const{data,role,userId}=useWorkspace();return role==='admin'||role==='member'&&(!task||task.created_by===userId||task.pic_id===userId||data.supporters.some(s=>s.task_id===task.id&&s.user_id===userId));}
