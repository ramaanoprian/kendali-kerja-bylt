import { createClient } from 'npm:@supabase/supabase-js@2';
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Metode tidak diizinkan',{status:405});
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
 try{
 const body=await req.json();if(typeof body.token!=='string'||body.token.length<40)return reply({error:'Unauthorized'},401);
 const service=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const{data:ticket,error}=await service.rpc('bylt_consume_setup',{p_token:body.token});if(error)return reply({error:'Unauthorized'},401);
 const{data:existing,error:prepareError}=await service.rpc('bylt_prepare_invite',{p_org:ticket.organization_id,p_actor:ticket.actor_id,p_email:ticket.email,p_name:ticket.name,p_role:ticket.role});if(prepareError)return reply({error:prepareError.message},403);
 if(existing)return reply({ok:true,existing:true,message:'Akses akun yang sudah ada ditambahkan.'});
 const{error:inviteError}=await service.auth.admin.inviteUserByEmail(ticket.email,{redirectTo:'https://kendali-kerja-bylt.ramanoprian73.chatgpt.site/'});
 if(inviteError)return reply({error:inviteError.message},400);
 return reply({ok:true,message:'Undangan dikirim; menunggu konfirmasi email.'});
 }catch{return reply({error:'Permintaan tidak valid'},400);}
});
