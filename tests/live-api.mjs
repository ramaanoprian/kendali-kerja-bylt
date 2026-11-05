import assert from 'node:assert/strict';
const url='https://mvxceyvbiehxeolfxslw.supabase.co',key='sb_publishable_tZYUU32Z6a5VcSRxhBGnPg_ch5cnEfH';
const results=[];
for(const table of ['bylt_tasks','bylt_memberships','bylt_history','bylt_reports','bylt_contacts']){const r=await fetch(`${url}/rest/v1/${table}?select=*`,{headers:{apikey:key}});assert.ok([401,403].includes(r.status),`${table} ${r.status}`);results.push({check:`Anonymous SELECT ${table}`,status:r.status,passed:true});}
for(const fn of ['bylt-admin','bylt-bootstrap']){const r=await fetch(`${url}/functions/v1/${fn}`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({token:'invalid'})});assert.equal(r.status,401);results.push({check:`Unauthenticated ${fn}`,status:r.status,passed:true});}
const r=await fetch(`${url}/storage/v1/object/public/bylt-evidence/unauthorized.pdf`,{headers:{apikey:key}});assert.ok(r.status>=400);results.push({check:'Private bucket has no public download',status:r.status,passed:true});
console.log(JSON.stringify({at:new Date().toISOString(),results},null,2));
