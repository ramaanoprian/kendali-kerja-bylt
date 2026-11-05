create function public.bylt_export_org(p_org uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb:='{}';t text;rows jsonb;
begin
 if bylt_private.role_for(p_org) is distinct from 'admin' then raise exception 'Akses ditolak' using errcode='42501';end if;
 foreach t in array array['teams','departments','memberships','team_members','contacts','tasks','task_members','subtasks','comments','attachments','history','notifications','reports','invitations'] loop
 execute format('select coalesce(jsonb_agg(to_jsonb(r)),''[]'') from public.bylt_%I r where organization_id=$1',t) into rows using p_org;
 result:=result||jsonb_build_object(t,rows);
 end loop;
 select coalesce(jsonb_agg(to_jsonb(p)),'[]') into rows from public.bylt_profiles p join public.bylt_memberships m on p.id=m.user_id where m.organization_id=p_org;
 return result||jsonb_build_object('profiles',rows);
end $$;
revoke all on function public.bylt_export_org(uuid) from public,anon;
grant execute on function public.bylt_export_org(uuid) to authenticated;
