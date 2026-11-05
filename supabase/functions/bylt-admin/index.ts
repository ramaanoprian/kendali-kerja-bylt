import { createClient } from 'npm:@supabase/supabase-js@2';
import { invitationRedirect } from './redirect.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return json({error:'Metode tidak didukung'},405);
 try{
 const auth=req.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return json({error:'Silakan masuk'},401);
 const url=Deno.env.get('SUPABASE_URL')!,secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 const service=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const{data:identity,error:identityError}=await service.auth.getUser(auth.slice(7));
 if(identityError||!identity.user)return json({error:'Sesi tidak valid'},401);
 const body=await req.json();const{organization_id,email,name,role,redirect_to}=body;
 const redirectTo=invitationRedirect(redirect_to);
 if(!redirectTo)return json({error:'Alamat pengalihan tidak diizinkan'},400);
 if(typeof email!=='string'||typeof name!=='string'||name.length>160||email.length>254)return json({error:'Identitas tidak valid'},400);
 const{data:existing,error}=await service.rpc('bylt_prepare_invite',{p_org:organization_id,p_actor:identity.user.id,p_email:email,p_name:name,p_role:role});
 if(error)return json({error:error.message},403);
 if(existing){
 const publicClient=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{auth:{persistSession:false}});
 const{error:mailError}=await publicClient.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:redirectTo}});
 return json({ok:true,existing:true,email_sent:!mailError,message:mailError?'Akses anggota ditambahkan. Email tidak terkirim; anggota dapat masuk memakai akun yang sudah ada.':'Akses ditambahkan dan tautan masuk diminta.'});
 }
 const{error:inviteError}=await service.auth.admin.inviteUserByEmail(email,{redirectTo});
 if(inviteError)return json({error:'Undangan tercatat, tetapi email gagal dikirim: '+inviteError.message},400);
 return json({ok:true,email_sent:true,message:'Undangan dikirim. Akses diaktifkan setelah email dikonfirmasi.'});
 }catch{return json({error:'Permintaan tidak dapat diproses. Periksa isian dan coba lagi.'},400);}
});
