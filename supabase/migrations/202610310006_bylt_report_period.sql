-- Deterministic ordering and exact report period boundaries.
create or replace function public.bylt_report_data(p_org uuid,p_start date,p_end date,p_mode text,p_filters jsonb)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if bylt_private.role_for(p_org) is null then raise exception 'Akses ditolak' using errcode='42501'; end if;
 if p_end<p_start or p_mode not in ('current','historical') then raise exception 'Periode laporan tidak valid'; end if;
 with states as (
 select to_jsonb(t) d from public.bylt_tasks t where t.organization_id=p_org and p_mode='current'
 ), historical as (
 select distinct on (h.task_id) h.after_data d from public.bylt_history h where h.organization_id=p_org and h.action in ('created','updated')
 and h.created_at < ((p_end+1)::timestamp at time zone 'Asia/Jakarta') order by h.task_id,h.created_at desc,(h.after_data->>'version')::integer desc
 ), chosen as (select d from states where p_mode='current' union all select d from historical where p_mode='historical')
 select coalesce(jsonb_agg(d order by d->>'due_at',d->>'id'),'[]'::jsonb) into result from chosen where d->>'archived_at' is null
 and (d->>'received_at')::timestamptz < ((p_end+1)::timestamp at time zone 'Asia/Jakarta')
 and (d->>'status' not in ('done','cancelled') or ((d->>'completed_at')::timestamptz >= (p_start::timestamp at time zone 'Asia/Jakarta') and (d->>'completed_at')::timestamptz < ((p_end+1)::timestamp at time zone 'Asia/Jakarta')))
 and (coalesce(p_filters->>'team_id','')='' or d->>'team_id'=p_filters->>'team_id')
 and (coalesce(p_filters->>'pic_id','')='' or d->>'pic_id'=p_filters->>'pic_id')
 and (coalesce(p_filters->>'department_id','')='' or d->>'department_id'=p_filters->>'department_id')
 and (coalesce(p_filters->>'kind','')='' or d->>'kind'=p_filters->>'kind');
 return jsonb_build_object('tasks',result,'attachments',coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at,a.id) from public.bylt_attachments a where a.organization_id=p_org and a.task_id in(select (x->>'id')::uuid from jsonb_array_elements(result) x) and (p_mode='current' or a.created_at<((p_end+1)::timestamp at time zone 'Asia/Jakarta'))),'[]'::jsonb),'captured_at',now(),'mode',p_mode);
end $$;
