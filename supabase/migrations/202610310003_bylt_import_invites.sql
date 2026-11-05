create function public.bylt_prepare_invite(p_org uuid,p_actor uuid,p_email text,p_name text,p_role text) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 if not exists(select 1 from public.bylt_memberships where organization_id=p_org and user_id=p_actor and role='admin' and active) then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if p_role not in ('admin','member','viewer') or trim(p_name)='' or p_email !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$' then raise exception 'Identitas undangan tidak valid'; end if;
 select id into target from auth.users where lower(email)=lower(p_email) and email_confirmed_at is not null;
 if target is not null then
 insert into public.bylt_profiles(id,name) values(target,trim(p_name)) on conflict(id) do nothing;
 insert into public.bylt_memberships(organization_id,user_id,role) values(p_org,target,p_role) on conflict do nothing;
 else
 insert into public.bylt_invitations(organization_id,email,name,role) values(p_org,lower(trim(p_email)),trim(p_name),p_role)
 on conflict(organization_id,email) do update set name=excluded.name,role=excluded.role;
 end if;
 return target;
end $$;
revoke all on function public.bylt_prepare_invite(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.bylt_prepare_invite(uuid,uuid,text,text,text) to service_role;

create function public.bylt_import_data(p_org uuid,p_source text,p_team uuid,p_owner uuid,p_tasks jsonb,p_contacts jsonb,p_history jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item jsonb; t public.bylt_tasks; idx integer:=0; imported integer:=0; skipped integer:=0; issues jsonb:='[]'; k text; c integer:=0;
begin
 if bylt_private.role_for(p_org) is distinct from 'admin' then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if length(p_source)<>64 or jsonb_array_length(p_tasks)>500 or jsonb_array_length(p_contacts)>500 then raise exception 'Impor dibatasi 500 tugas dan 500 kontak per berkas'; end if;
 if not exists(select 1 from public.bylt_memberships where organization_id=p_org and user_id=p_owner and active and role in ('admin','member')) then raise exception 'Pemilik tujuan tidak valid'; end if;
 if p_team is not null and not exists(select 1 from public.bylt_teams where organization_id=p_org and id=p_team) then raise exception 'Tim tujuan tidak valid'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_org::text||p_source,0));
 for item in select * from jsonb_array_elements(p_tasks) loop
 idx:=idx+1; k:=p_source||':task:'||coalesce(item->>'source_id',idx::text);
 if exists(select 1 from public.bylt_tasks where organization_id=p_org and import_key=k) then skipped:=skipped+1; continue; end if;
 begin
 t:=public.bylt_save_task(p_org,null,0,gen_random_uuid(),item||jsonb_build_object('team_id',p_team,'pic_id',p_owner),'{}');
 update public.bylt_tasks set import_key=k where id=t.id;
 insert into public.bylt_history(organization_id,task_id,actor_id,action,after_data,reason)
 values(p_org,t.id,auth.uid(),'legacy_import',jsonb_build_object('source_id',item->>'source_id','legacy_history',(select coalesce(jsonb_agg(h),'[]') from jsonb_array_elements(p_history) h where coalesce(h->>'task_id',h->>'tugas_id')=item->>'source_id')),'Riwayat dari berkas impor; bukan kejadian terverifikasi server');
 imported:=imported+1;
 exception when others then issues:=issues||jsonb_build_array(jsonb_build_object('row',idx,'type','task','message',sqlerrm)); end;
 end loop;
 idx:=0;
 for item in select * from jsonb_array_elements(p_contacts) loop
 idx:=idx+1;k:=p_source||':contact:'||coalesce(item->>'id',idx::text);
 if exists(select 1 from public.bylt_contacts where organization_id=p_org and import_key=k) then skipped:=skipped+1;continue;end if;
 begin
 insert into public.bylt_contacts(organization_id,name,position,phone,email,notes,import_key)
 values(p_org,coalesce(item->>'name',item->>'nama'),coalesce(item->>'position',item->>'jabatan',''),coalesce(item->>'phone',item->>'telepon',''),coalesce(item->>'email',''),coalesce(item->>'notes',item->>'catatan',''),k);c:=c+1;
 exception when others then issues:=issues||jsonb_build_array(jsonb_build_object('row',idx,'type','contact','message',sqlerrm));end;
 end loop;
 return jsonb_build_object('tasks',imported,'contacts',c,'skipped',skipped,'errors',issues);
end $$;
revoke all on function public.bylt_import_data(uuid,text,uuid,uuid,jsonb,jsonb,jsonb) from public,anon;
grant execute on function public.bylt_import_data(uuid,text,uuid,uuid,jsonb,jsonb,jsonb) to authenticated;
-- pg_cron is already enabled on the selected project. Run even with no browser connected.
select cron.schedule('bylt-deadline-reminders','*/15 * * * *','select public.bylt_run_reminders()');
