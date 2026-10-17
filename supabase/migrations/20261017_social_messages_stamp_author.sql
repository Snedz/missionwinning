-- Garage post stamp. Apply AFTER the app merge, and only after
-- 20261017_profiles_garage_identity.sql. That file owns the columns, the
-- lower(call_sign) unique index, the compare functions, and the
-- reserved-name trigger.
--
-- BEFORE INSERT overwrites author_call_sign, author_mission_id,
-- author_name_kind, and created_at. full_name is copied only when
-- garage_name_mode is real_name and garage_real_name_reserved is false.
-- Until this file is applied, a signed-in PostgREST insert can still publish
-- a client call sign, and the route insert of author_name_kind has no column.
--
-- Ops / founder apply. Do not run this from an agent lane.

alter table public.social_messages
  add column if not exists author_name_kind text not null default 'call_sign';

alter table public.social_messages
  drop constraint if exists social_messages_author_name_kind_check;

alter table public.social_messages
  add constraint social_messages_author_name_kind_check
  check (author_name_kind in ('call_sign', 'real_name'));

create or replace function public.social_messages_stamp_author()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  chosen text;
  mode public.garage_name_mode;
  opted_name text;
  mid integer;
begin
  select
    p.call_sign,
    p.garage_name_mode,
    case
      when p.garage_name_mode = 'real_name' then p.full_name
      else null
    end
  into chosen, mode, opted_name
  from public.profiles p
  where p.id = NEW.user_id;

  select mission_id
    into mid
  from public.mission_ids
  where user_id = NEW.user_id;

  NEW.author_name_kind := 'call_sign';

  if mode = 'real_name'
     and public.garage_display_name(opted_name) <> ''
     and not public.garage_real_name_reserved(opted_name) then
    NEW.author_call_sign := left(public.garage_display_name(opted_name), 24);
    NEW.author_name_kind := 'real_name';
  elsif chosen is not null and chosen <> '' then
    NEW.author_call_sign := chosen;
  elsif mid is not null and mid >= 0 and mid <= 99 then
    NEW.author_call_sign := 'Mission ' || lpad(mid::text, 2, '0');
  elsif mid is not null and mid >= 0 and char_length('Mission ' || mid::text) <= 24 then
    NEW.author_call_sign := 'Mission ' || mid::text;
  else
    NEW.author_call_sign := 'Mission';
  end if;

  if mid is not null and mid >= 0 and mid <= 99 then
    NEW.author_mission_id := lpad(mid::text, 2, '0');
  else
    NEW.author_mission_id := null;
  end if;

  NEW.created_at := now();
  return NEW;
end;
$$;

drop trigger if exists social_messages_stamp_author on public.social_messages;
create trigger social_messages_stamp_author
  before insert on public.social_messages
  for each row
  execute function public.social_messages_stamp_author();

revoke all on function public.social_messages_stamp_author() from public, anon;
grant execute on function public.social_messages_stamp_author() to authenticated;

comment on function public.social_messages_stamp_author() is
  'BEFORE INSERT: call_sign, or Mission plus the mission id. full_name only when garage_name_mode is real_name and garage_real_name_reserved is false. author_name_kind marks that case. created_at = now(). Ignores the payload.';
