insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values(
 'bylt-evidence','bylt-evidence',false,20971520,
 array['application/pdf','image/jpeg','image/png','image/webp','text/csv','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);
create function bylt_private.storage_read(path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.bylt_tasks where organization_id::text=split_part(path,'/',1) and id::text=split_part(path,'/',2) and bylt_private.role_for(organization_id) is not null)
$$;
create function bylt_private.storage_write(path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.bylt_tasks where organization_id::text=split_part(path,'/',1) and id::text=split_part(path,'/',2) and bylt_private.can_edit(id))
$$;
revoke all on function bylt_private.storage_read(text),bylt_private.storage_write(text) from public;
grant execute on function bylt_private.storage_read(text),bylt_private.storage_write(text) to authenticated,service_role;
create policy bylt_evidence_read on storage.objects for select to authenticated using(bucket_id='bylt-evidence' and bylt_private.storage_read(name));
create policy bylt_evidence_insert on storage.objects for insert to authenticated with check(bucket_id='bylt-evidence' and bylt_private.storage_write(name));
-- No UPDATE or DELETE for files: evidence cannot be silently overwritten.

create function public.bylt_manage_member(p_org uuid,p_user uuid,p_role text,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.bylt_organizations where id=p_org for update;
 if bylt_private.role_for(p_org) is distinct from 'admin' then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if exists(select 1 from public.bylt_memberships where organization_id=p_org and user_id=p_user and role='admin' and active) and (p_role<>'admin' or not p_active)
 and (select count(*) from public.bylt_memberships where organization_id=p_org and role='admin' and active)<=1 then raise exception 'Organisasi harus memiliki minimal satu admin aktif'; end if;
 update public.bylt_memberships set role=p_role,active=p_active where organization_id=p_org and user_id=p_user;
end $$;
revoke all on function public.bylt_manage_member(uuid,uuid,text,boolean) from public,anon;
grant execute on function public.bylt_manage_member(uuid,uuid,text,boolean) to authenticated;

create function bylt_private.accept_invitation() returns trigger language plpgsql security definer set search_path='' as $$
declare invitation record;
begin
 if new.email_confirmed_at is null then return new; end if;
 for invitation in select * from public.bylt_invitations where lower(email)=lower(new.email) loop
 insert into public.bylt_profiles(id,name) values(new.id,invitation.name) on conflict(id) do nothing;
 insert into public.bylt_memberships(organization_id,user_id,role) values(invitation.organization_id,new.id,invitation.role) on conflict do nothing;
 delete from public.bylt_invitations where id=invitation.id;
 end loop;
 return new;
end $$;
create trigger bylt_accept_invitation after insert or update of email_confirmed_at on auth.users for each row execute function bylt_private.accept_invitation();

create function public.bylt_run_reminders() returns integer language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 insert into public.bylt_notifications(organization_id,user_id,task_id,title,dedupe_key)
 select t.organization_id,t.pic_id,t.id,case when t.due_at<now() then 'Tenggat terlewati: ' else 'Tenggat mendekat: ' end || t.title,
 'reminder:'||t.id||':'||t.due_at::text||':'||case when t.due_at<now() then 'overdue' else 'soon' end
 from public.bylt_tasks t join public.bylt_memberships m on m.organization_id=t.organization_id and m.user_id=t.pic_id
 join public.bylt_profiles p on p.id=t.pic_id where t.archived_at is null and t.status not in ('done','cancelled') and t.due_at<=now()+interval '24 hours' and m.active and p.reminders
 on conflict(dedupe_key) do nothing;
 get diagnostics affected=row_count; return affected;
end $$;
revoke all on function public.bylt_run_reminders() from public,anon,authenticated;
grant execute on function public.bylt_run_reminders() to service_role;

-- Realtime delivers only rows the subscriber can SELECT via RLS.
alter publication supabase_realtime add table public.bylt_tasks,public.bylt_comments,public.bylt_subtasks,public.bylt_task_members,public.bylt_attachments,public.bylt_notifications,public.bylt_memberships,public.bylt_teams,public.bylt_team_members,public.bylt_reports;
