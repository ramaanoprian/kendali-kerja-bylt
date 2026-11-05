-- One-use, short-lived bootstrap tickets. Never exposed to the client application.
create table bylt_private.setup_tickets (
 token_hash text primary key, organization_id uuid not null references public.bylt_organizations,
 actor_id uuid not null references public.bylt_profiles, email text not null, name text not null,
 role text not null check(role in ('admin','member','viewer')),
 expires_at timestamptz not null, used_at timestamptz
);
alter table bylt_private.setup_tickets enable row level security;
revoke all on bylt_private.setup_tickets from public,anon,authenticated;
create function public.bylt_consume_setup(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare ticket bylt_private.setup_tickets;
begin
 update bylt_private.setup_tickets set used_at=now() where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now() and used_at is null returning * into ticket;
 if not found then raise exception 'Ticket tidak valid atau sudah digunakan' using errcode='42501'; end if;
 return to_jsonb(ticket)-'token_hash';
end $$;
revoke all on function public.bylt_consume_setup(text) from public,anon,authenticated;
grant execute on function public.bylt_consume_setup(text) to service_role;
