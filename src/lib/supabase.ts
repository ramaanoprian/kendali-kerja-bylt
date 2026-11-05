import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { readAuthReturn } from './authRedirect';
// Capture flow/error before the Auth SDK consumes and removes the URL fragment.
export const authReturn = readAuthReturn(location.href);
export const supabase=createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:sessionStorage},realtime:{params:{eventsPerSecond:10}}});
export async function rpc<T=unknown>(name:string,args:Record<string,unknown>):Promise<T>{const{data,error}=await supabase.rpc('bylt_'+name,args);if(error)throw error;return (['save_task','finalize_report'].includes(name)&&Array.isArray(data)?data[0]:data) as T;}
export async function getAll<T>(table:string,org?:string):Promise<T[]>{const all:T[]=[];for(let offset=0;;offset+=1000){let q=supabase.from('bylt_'+table).select('*').order(table==='memberships'?'user_id':table==='team_members'?'team_id':table==='task_members'?'task_id':'id').range(offset,offset+999);if(org)q=q.eq('organization_id',org);const{data,error}=await q;if(error)throw error;all.push(...data as T[]);if(data.length<1000)break;}return all;}
