-- Kendali Kerja BYLT. Independent namespace; no changes to existing application tables.
create schema if not exists bylt_private;
revoke all on schema bylt_private from public;
grant usage on schema bylt_private to authenticated, service_role;

create table public.bylt_organizations (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 160),
 created_at timestamptz not null default now()
);
create table public.bylt_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(length(name) between 1 and 160),
 reminders boolean not null default true, updated_at timestamptz not null default now()
);
create table public.bylt_teams (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.bylt_organizations,
 name text not null check(length(name) between 1 and 100), unique(organization_id,name), unique(organization_id,id)
);
create table public.bylt_departments (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.bylt_organizations,
 name text not null check(length(name) between 1 and 100), unique(organization_id,name), unique(organization_id,id)
);
create table public.bylt_memberships (
 organization_id uuid not null references public.bylt_organizations, user_id uuid not null references public.bylt_profiles,
 role text not null check(role in ('admin','member','viewer')), active boolean not null default true,
 created_at timestamptz not null default now(), primary key(organization_id,user_id)
);
create table public.bylt_team_members (
 organization_id uuid not null, team_id uuid not null, user_id uuid not null,
 primary key(team_id,user_id),
 foreign key(organization_id,team_id) references public.bylt_teams(organization_id,id),
 foreign key(organization_id,user_id) references public.bylt_memberships(organization_id,user_id)
);
create table public.bylt_contacts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.bylt_organizations,
 name text not null check(length(name)>0), position text not null default '', department_id uuid,
 phone text not null default '', email text not null default '', notes text not null default '', import_key text,
 unique(organization_id,id), unique(organization_id,import_key),
 foreign key(organization_id,department_id) references public.bylt_departments(organization_id,id)
);
create sequence public.bylt_task_number;
create table public.bylt_tasks (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.bylt_organizations,
 number bigint not null default nextval('public.bylt_task_number') unique,
 title text not null check(length(trim(title)) between 1 and 240), description text not null default '',
 kind text not null check(kind in ('evp','routine')), assigned_by text not null default '',
 received_at timestamptz not null default now(), due_at timestamptz,
 team_id uuid, department_id uuid, pic_id uuid,
 priority text not null default 'normal' check(priority in ('normal','high','urgent')),
 status text not null default 'todo' check(status in ('todo','doing','waiting','done','cancelled')),
 progress integer not null default 0 check(progress between 0 and 100),
 expected_result text not null default '', actual_result text not null default '',
 obstacles text not null default '', decision_needed text not null default '', next_action text not null default '',
 waiting_reason text not null default '', waiting_on text not null default '',
 change_reason text not null default '',
 created_by uuid not null, updated_by uuid not null, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), completed_at timestamptz, archived_at timestamptz,
 version integer not null default 1, request_id uuid not null, import_key text,
 unique(organization_id,id), unique(organization_id,request_id), unique(organization_id,import_key),
 foreign key(organization_id,team_id) references public.bylt_teams(organization_id,id),
 foreign key(organization_id,department_id) references public.bylt_departments(organization_id,id),
 foreign key(organization_id,pic_id) references public.bylt_memberships(organization_id,user_id),
 foreign key(organization_id,created_by) references public.bylt_memberships(organization_id,user_id),
 foreign key(organization_id,updated_by) references public.bylt_memberships(organization_id,user_id),
 check(status <> 'done' or (progress=100 and length(trim(actual_result))>0 and completed_at is not null)),
 check(status <> 'waiting' or (length(trim(waiting_reason))>0 and length(trim(waiting_on))>0)),
 check(status <> 'cancelled' or length(trim(change_reason))>0)
);
create table public.bylt_task_members (
 organization_id uuid not null, task_id uuid not null, user_id uuid not null,
 primary key(task_id,user_id),
 foreign key(organization_id,task_id) references public.bylt_tasks(organization_id,id),
 foreign key(organization_id,user_id) references public.bylt_memberships(organization_id,user_id)
);
create table public.bylt_subtasks (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, task_id uuid not null,
 title text not null check(length(trim(title)) between 1 and 240), done boolean not null default false,
 created_at timestamptz not null default now(),
 foreign key(organization_id,task_id) references public.bylt_tasks(organization_id,id)
);
create table public.bylt_comments (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, task_id uuid not null,
 author_id uuid not null, body text not null check(length(trim(body)) between 1 and 10000),
 mentions uuid[] not null default '{}', request_id uuid not null, created_at timestamptz not null default now(),
 unique(organization_id,request_id),
 foreign key(organization_id,task_id) references public.bylt_tasks(organization_id,id),
 foreign key(organization_id,author_id) references public.bylt_memberships(organization_id,user_id)
);
create table public.bylt_attachments (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, task_id uuid not null,
 name text not null, path text not null unique, size bigint not null check(size between 1 and 20971520),
 mime text not null, caption text not null default '', uploaded_by uuid not null,
 created_at timestamptz not null default now(),
 foreign key(organization_id,task_id) references public.bylt_tasks(organization_id,id),
 foreign key(organization_id,uploaded_by) references public.bylt_memberships(organization_id,user_id)
);
create table public.bylt_history (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, task_id uuid not null,
 actor_id uuid, action text not null, before_data jsonb, after_data jsonb,
 reason text not null default '', created_at timestamptz not null default now(),
 foreign key(organization_id,task_id) references public.bylt_tasks(organization_id,id)
);
create table public.bylt_notifications (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, user_id uuid not null,
 task_id uuid, title text not null, dedupe_key text not null unique,
 read_at timestamptz, created_at timestamptz not null default now(),
 foreign key(organization_id,user_id) references public.bylt_memberships(organization_id,user_id),
 foreign key(organization_id,task_id) references public.bylt_tasks(organization_id,id)
);
create table public.bylt_reports (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.bylt_organizations,
 title text not null, start_date date not null, end_date date not null, version integer not null,
 mode text not null check(mode in ('current','historical')), filters jsonb not null default '{}',
 snapshot jsonb not null, narrative text not null default '', created_by uuid not null,
 created_at timestamptz not null default now(), request_id uuid not null,
 unique(organization_id,request_id), check(end_date>=start_date),
 foreign key(organization_id,created_by) references public.bylt_memberships(organization_id,user_id)
);
create table public.bylt_invitations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.bylt_organizations,
 email text not null, name text not null, role text not null check(role in ('admin','member','viewer')),
 created_at timestamptz not null default now(), unique(organization_id,email)
);
create index bylt_members_user on public.bylt_memberships(user_id,active);
create index bylt_tasks_org_due on public.bylt_tasks(organization_id,due_at) where archived_at is null;
create index bylt_tasks_org_status on public.bylt_tasks(organization_id,status);
create index bylt_tasks_pic on public.bylt_tasks(pic_id);
create index bylt_tasks_team on public.bylt_tasks(team_id);
create index bylt_history_task on public.bylt_history(task_id,created_at desc);
create index bylt_comments_task on public.bylt_comments(task_id,created_at);
create index bylt_notifications_user on public.bylt_notifications(user_id,created_at desc);
create index bylt_reports_org on public.bylt_reports(organization_id,created_at desc);

create function bylt_private.role_for(org uuid) returns text language sql stable security definer set search_path='' as $$
 select role from public.bylt_memberships where organization_id=org and user_id=(select auth.uid()) and active
$$;
create function bylt_private.can_edit(task uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.bylt_tasks t where t.id=task and
 (bylt_private.role_for(t.organization_id)='admin' or
 (bylt_private.role_for(t.organization_id)='member' and (t.created_by=auth.uid() or t.pic_id=auth.uid() or exists
 (select 1 from public.bylt_task_members s where s.task_id=t.id and s.user_id=auth.uid())))))
$$;
create function bylt_private.same_workspace(other_user uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.bylt_memberships m where m.user_id=other_user and bylt_private.role_for(m.organization_id) is not null)
$$;
revoke all on all functions in schema bylt_private from public;
grant execute on all functions in schema bylt_private to authenticated,service_role;

-- No blanket write grants: immutable server-owned records are SELECT-only.
do $$ declare t text; begin
 foreach t in array array['organizations','profiles','teams','departments','memberships','team_members','contacts','tasks','task_members','subtasks','comments','attachments','history','notifications','reports','invitations'] loop
 execute format('alter table public.bylt_%I enable row level security',t);
 execute format('revoke all on public.bylt_%I from anon, authenticated',t);
 execute format('grant select on public.bylt_%I to authenticated',t);
 end loop;
 foreach t in array array['teams','departments','memberships','team_members','contacts','tasks','task_members','subtasks','comments','attachments','history','reports'] loop
 execute format('create policy member_read on public.bylt_%I for select to authenticated using (bylt_private.role_for(organization_id) is not null)',t);
 end loop;
 foreach t in array array['teams','departments','contacts','team_members'] loop
 execute format('grant insert,update,delete on public.bylt_%I to authenticated',t);
 execute format('create policy admin_insert on public.bylt_%I for insert to authenticated with check (bylt_private.role_for(organization_id)=''admin'')',t);
 execute format('create policy admin_update on public.bylt_%I for update to authenticated using (bylt_private.role_for(organization_id)=''admin'') with check (bylt_private.role_for(organization_id)=''admin'')',t);
 execute format('create policy admin_delete on public.bylt_%I for delete to authenticated using (bylt_private.role_for(organization_id)=''admin'')',t);
 end loop;
end $$;
create policy organization_read on public.bylt_organizations for select to authenticated using(bylt_private.role_for(id) is not null);
create policy profile_read on public.bylt_profiles for select to authenticated using(id=auth.uid() or bylt_private.same_workspace(id));
grant update(name,reminders) on public.bylt_profiles to authenticated;
create policy profile_update on public.bylt_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy invitation_read on public.bylt_invitations for select to authenticated using(bylt_private.role_for(organization_id)='admin');
create policy notification_read on public.bylt_notifications for select to authenticated using(user_id=auth.uid() and bylt_private.role_for(organization_id) is not null);
grant update(read_at) on public.bylt_notifications to authenticated;
create policy notification_update on public.bylt_notifications for update to authenticated using(user_id=auth.uid() and bylt_private.role_for(organization_id) is not null) with check(user_id=auth.uid() and bylt_private.role_for(organization_id) is not null);

create function bylt_private.audit_task() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.bylt_history(organization_id,task_id,actor_id,action,before_data,after_data,reason)
 values(new.organization_id,new.id,auth.uid(),case when TG_OP='INSERT' then 'created' else 'updated' end,
 case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new),new.change_reason);
 if new.pic_id is not null and (TG_OP='INSERT' or new.pic_id is distinct from old.pic_id or new.due_at is distinct from old.due_at) then
 insert into public.bylt_notifications(organization_id,user_id,task_id,title,dedupe_key)
 values(new.organization_id,new.pic_id,new.id,case when TG_OP='INSERT' then 'Penugasan baru: ' when new.pic_id is distinct from old.pic_id then 'Anda ditetapkan sebagai PIC: ' else 'Tenggat berubah: ' end || new.title,
 'task:'||new.id||':'||new.version) on conflict(dedupe_key) do nothing;
 end if;
 return new;
end $$;
create trigger bylt_task_audit after insert or update on public.bylt_tasks for each row execute function bylt_private.audit_task();

create function public.bylt_save_task(p_org uuid,p_id uuid,p_version integer,p_request uuid,p_data jsonb,p_supporters uuid[] default '{}')
returns public.bylt_tasks language plpgsql security definer set search_path='' as $$
declare oldrow public.bylt_tasks; n public.bylt_tasks; role_name text; supporter uuid;
begin
 role_name:=bylt_private.role_for(p_org);
 if role_name is null or role_name not in ('admin','member') then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if p_id is null then
 select * into n from public.bylt_tasks where organization_id=p_org and request_id=p_request;
 if found then return n; end if;
 n.id:=gen_random_uuid(); n.organization_id:=p_org; n.created_by:=auth.uid(); n.created_at:=now(); n.received_at:=now();
 n.number:=nextval('public.bylt_task_number'); n.version:=1; n.request_id:=p_request;
 else
 select * into oldrow from public.bylt_tasks where id=p_id and organization_id=p_org for update;
 if not found or not bylt_private.can_edit(p_id) then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if oldrow.version<>p_version then raise exception 'CONFLICT: pekerjaan telah diperbarui pengguna lain' using errcode='40001'; end if;
 n:=oldrow; n.version:=oldrow.version+1;
 end if;
 n.title:=trim(p_data->>'title'); n.description:=coalesce(p_data->>'description',''); n.kind:=p_data->>'kind';
 n.assigned_by:=coalesce(p_data->>'assigned_by',''); n.received_at:=coalesce((p_data->>'received_at')::timestamptz,n.received_at);
 n.due_at:=nullif(p_data->>'due_at','')::timestamptz;
 n.team_id:=nullif(p_data->>'team_id','')::uuid; n.department_id:=nullif(p_data->>'department_id','')::uuid;
 n.pic_id:=nullif(p_data->>'pic_id','')::uuid; n.priority:=coalesce(p_data->>'priority','normal');
 n.status:=coalesce(p_data->>'status','todo'); n.progress:=coalesce((p_data->>'progress')::integer,0);
 n.expected_result:=coalesce(p_data->>'expected_result',''); n.actual_result:=coalesce(p_data->>'actual_result','');
 n.obstacles:=coalesce(p_data->>'obstacles',''); n.decision_needed:=coalesce(p_data->>'decision_needed','');
 n.next_action:=coalesce(p_data->>'next_action',''); n.waiting_reason:=coalesce(p_data->>'waiting_reason','');
 n.waiting_on:=coalesce(p_data->>'waiting_on',''); n.change_reason:=coalesce(p_data->>'change_reason','');
 if p_id is not null and oldrow.status='done' and n.status<>'done' and length(trim(n.change_reason))=0 then raise exception 'Alasan membuka kembali wajib diisi'; end if;
 if n.status='done' then n.progress:=100; n.completed_at:=coalesce(oldrow.completed_at,now()); else n.completed_at:=null; end if;
 if n.pic_id is not null and not exists(select 1 from public.bylt_memberships where organization_id=p_org and user_id=n.pic_id and active and role in ('admin','member')) then raise exception 'PIC harus anggota aktif organisasi'; end if;
 foreach supporter in array p_supporters loop
 if not exists(select 1 from public.bylt_memberships where organization_id=p_org and user_id=supporter and active and role in ('admin','member')) then raise exception 'Pendukung harus anggota aktif organisasi'; end if;
 end loop;
 n.updated_at:=now(); n.updated_by:=auth.uid();
 if p_id is null then insert into public.bylt_tasks select (n).*;
 else update public.bylt_tasks set title=n.title,description=n.description,kind=n.kind,assigned_by=n.assigned_by,received_at=n.received_at,due_at=n.due_at,
 team_id=n.team_id,department_id=n.department_id,pic_id=n.pic_id,priority=n.priority,status=n.status,progress=n.progress,expected_result=n.expected_result,
 actual_result=n.actual_result,obstacles=n.obstacles,decision_needed=n.decision_needed,next_action=n.next_action,waiting_reason=n.waiting_reason,
 waiting_on=n.waiting_on,change_reason=n.change_reason,updated_at=n.updated_at,updated_by=n.updated_by,completed_at=n.completed_at,version=n.version where id=p_id;
 end if;
 delete from public.bylt_task_members where task_id=n.id;
 insert into public.bylt_task_members(organization_id,task_id,user_id) select p_org,n.id,x from (select distinct unnest(p_supporters) x) s;
 if p_id is not null then
 insert into public.bylt_history(organization_id,task_id,actor_id,action,after_data) values(p_org,n.id,auth.uid(),'supporters',jsonb_build_object('supporters',p_supporters));
 end if;
 return n;
end $$;

create function public.bylt_archive_task(p_id uuid,p_version integer,p_archive boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not bylt_private.can_edit(p_id) then raise exception 'Akses ditolak' using errcode='42501'; end if;
 update public.bylt_tasks set archived_at=case when p_archive then now() else null end,updated_at=now(),updated_by=auth.uid(),version=version+1,change_reason=case when p_archive then 'Diarsipkan' else 'Dipulihkan dari arsip' end where id=p_id and version=p_version;
 if not found then raise exception 'CONFLICT: muat versi terbaru' using errcode='40001'; end if;
end $$;

create function public.bylt_add_comment(p_org uuid,p_task uuid,p_body text,p_mentions uuid[],p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; person uuid;
begin
 if bylt_private.role_for(p_org) is null or bylt_private.role_for(p_org) not in ('admin','member') then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if not exists(select 1 from public.bylt_tasks where id=p_task and organization_id=p_org and archived_at is null) then raise exception 'Tugas tidak ditemukan'; end if;
 foreach person in array p_mentions loop
 if not exists(select 1 from public.bylt_memberships where organization_id=p_org and user_id=person and active) then raise exception 'Mention di luar organisasi'; end if;
 end loop;
 insert into public.bylt_comments(organization_id,task_id,author_id,body,mentions,request_id) values(p_org,p_task,auth.uid(),p_body,p_mentions,p_request)
 on conflict(organization_id,request_id) do nothing returning id into result;
 if result is null then select id into result from public.bylt_comments where organization_id=p_org and request_id=p_request; return result; end if;
 foreach person in array p_mentions loop
 insert into public.bylt_notifications(organization_id,user_id,task_id,title,dedupe_key) values(p_org,person,p_task,'Anda disebut dalam diskusi pekerjaan','mention:'||result||':'||person) on conflict do nothing;
 end loop;
 return result;
end $$;
create function public.bylt_set_subtask(p_task uuid,p_id uuid,p_title text,p_done boolean) returns void language plpgsql security definer set search_path='' as $$
declare org uuid;
begin
 if not bylt_private.can_edit(p_task) then raise exception 'Akses ditolak' using errcode='42501'; end if;
 select organization_id into org from public.bylt_tasks where id=p_task;
 if p_id is null then insert into public.bylt_subtasks(organization_id,task_id,title) values(org,p_task,p_title);
 else update public.bylt_subtasks set done=p_done where id=p_id and task_id=p_task; end if;
 insert into public.bylt_history(organization_id,task_id,actor_id,action,after_data) values(org,p_task,auth.uid(),'checklist',jsonb_build_object('title',p_title,'done',p_done));
end $$;

create function public.bylt_register_attachment(p_org uuid,p_task uuid,p_name text,p_path text,p_size bigint,p_mime text,p_caption text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not bylt_private.can_edit(p_task) or not exists(select 1 from public.bylt_tasks where id=p_task and organization_id=p_org) then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if split_part(p_path,'/',1)<>p_org::text or split_part(p_path,'/',2)<>p_task::text then raise exception 'Lokasi berkas tidak valid'; end if;
 if not exists(select 1 from storage.objects where bucket_id='bylt-evidence' and name=p_path) then raise exception 'Unggahan belum tersedia'; end if;
 insert into public.bylt_attachments(organization_id,task_id,name,path,size,mime,caption,uploaded_by) values(p_org,p_task,p_name,p_path,p_size,p_mime,p_caption,auth.uid()) on conflict(path) do nothing;
end $$;

-- Resolve report data on the server at preview/finalization; historical uses recorded state.
create function public.bylt_report_data(p_org uuid,p_start date,p_end date,p_mode text,p_filters jsonb)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if bylt_private.role_for(p_org) is null then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if p_end<p_start or p_mode not in ('current','historical') then raise exception 'Periode laporan tidak valid'; end if;
 with states as (
 select to_jsonb(t) d from public.bylt_tasks t where t.organization_id=p_org and p_mode='current'
 ), historical as (
 select distinct on (h.task_id) h.after_data d from public.bylt_history h where h.organization_id=p_org and h.action in ('created','updated')
 and h.created_at < ((p_end+1)::timestamp at time zone 'Asia/Jakarta') order by h.task_id,h.created_at desc,h.after_data->>'version' desc
 ), chosen as (select d from states where p_mode='current' union all select d from historical where p_mode='historical')
 select coalesce(jsonb_agg(d order by d->>'due_at'),'[]'::jsonb) into result from chosen where d->>'archived_at' is null
 and (d->>'received_at')::timestamptz < ((p_end+1)::timestamp at time zone 'Asia/Jakarta')
 and (d->>'status' not in ('done','cancelled') or (d->>'completed_at')::timestamptz >= (p_start::timestamp at time zone 'Asia/Jakarta'))
 and (coalesce(p_filters->>'team_id','')='' or d->>'team_id'=p_filters->>'team_id')
 and (coalesce(p_filters->>'pic_id','')='' or d->>'pic_id'=p_filters->>'pic_id')
 and (coalesce(p_filters->>'department_id','')='' or d->>'department_id'=p_filters->>'department_id')
 and (coalesce(p_filters->>'kind','')='' or d->>'kind'=p_filters->>'kind');
 return jsonb_build_object('tasks',result,'attachments',coalesce((select jsonb_agg(to_jsonb(a)) from public.bylt_attachments a where a.organization_id=p_org and a.task_id in(select (x->>'id')::uuid from jsonb_array_elements(result) x) and (p_mode='current' or a.created_at<((p_end+1)::timestamp at time zone 'Asia/Jakarta'))),'[]'::jsonb),'captured_at',now(),'mode',p_mode);
end $$;
create function public.bylt_finalize_report(p_org uuid,p_title text,p_start date,p_end date,p_mode text,p_filters jsonb,p_narrative text,p_request uuid,p_expected jsonb) returns public.bylt_reports language plpgsql security definer set search_path='' as $$
declare snap jsonb; r public.bylt_reports; v integer;
begin
 if bylt_private.role_for(p_org) is null or bylt_private.role_for(p_org) not in ('admin','member') then raise exception 'Akses ditolak' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_org::text,0));
 select * into r from public.bylt_reports where organization_id=p_org and request_id=p_request; if found then return r; end if;
 snap:=public.bylt_report_data(p_org,p_start,p_end,p_mode,p_filters);
 if (snap-'captured_at') is distinct from (p_expected-'captured_at') then raise exception 'CONFLICT: data berubah, tinjau laporan terbaru' using errcode='40001'; end if;
 select coalesce(max(version),0)+1 into v from public.bylt_reports where organization_id=p_org and start_date=p_start and end_date=p_end;
 insert into public.bylt_reports(organization_id,title,start_date,end_date,version,mode,filters,snapshot,narrative,created_by,request_id)
 values(p_org,p_title,p_start,p_end,v,p_mode,p_filters,snap,p_narrative,auth.uid(),p_request) returning * into r; return r;
end $$;

-- Every exposed RPC requires explicit authentication, including security definer functions.
do $$ declare f record; begin
 for f in select oid::regprocedure signature from pg_proc where pronamespace='public'::regnamespace and proname like 'bylt_%' loop
 execute 'revoke all on function '||f.signature||' from public,anon';
 execute 'grant execute on function '||f.signature||' to authenticated,service_role';
 end loop;
end $$;
