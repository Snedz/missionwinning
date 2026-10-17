-- Garage author is the account's choice, not the payload and not the legal name.
--
-- profiles.call_sign is an owner-set handle. profiles.garage_name_mode defaults
-- to call_sign. full_name is copied onto a post only when that owner has set
-- real_name. Otherwise the post shows the call sign, or 'Mission ' plus the
-- two-digit mission id when the call sign is null.
--
-- social_messages insert policy checks auth.uid() = user_id and the channel.
-- author_call_sign, author_mission_id, and created_at were whatever the client
-- sent, and PostgREST is a second door in front of the Next route.
-- This trigger overwrites all three on every insert.
--
-- A second trigger refuses call_sign and garage_name_mode unless auth.uid()
-- is that profile. service_role updates of other columns keep the old values.
--
-- Founder apply. Do not run this from an agent lane.

do $$
begin
  create type public.garage_name_mode as enum ('call_sign', 'real_name');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists call_sign text,
  add column if not exists garage_name_mode public.garage_name_mode not null default 'call_sign';

alter table public.profiles
  drop constraint if exists profiles_call_sign_format;

alter table public.profiles
  add constraint profiles_call_sign_format
  check (call_sign is null or call_sign ~ '^[A-Za-z0-9_-]{3,20}$');

create unique index if not exists profiles_call_sign_unique
  on public.profiles (call_sign);

comment on column public.profiles.call_sign is
  'Owner-set Garage handle. Null until chosen. 3-20 of letters, numbers, hyphen, underscore. Not full_name.';

comment on column public.profiles.garage_name_mode is
  'call_sign (default) publishes the handle. real_name is an explicit opt-in to publish full_name.';

create or replace function public.profiles_owner_garage_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is distinct from NEW.id then
    if tg_op = 'INSERT' then
      NEW.call_sign := null;
      NEW.garage_name_mode := 'call_sign';
    else
      NEW.call_sign := OLD.call_sign;
      NEW.garage_name_mode := OLD.garage_name_mode;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists profiles_owner_garage_identity on public.profiles;
create trigger profiles_owner_garage_identity
  before insert or update on public.profiles
  for each row
  execute function public.profiles_owner_garage_identity();

comment on function public.profiles_owner_garage_identity() is
  'Only the profile owner (auth.uid() = id) may set call_sign or garage_name_mode. Other writers keep the previous values.';

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
      when p.garage_name_mode = 'real_name' then left(btrim(p.full_name), 24)
      else null
    end
  into chosen, mode, opted_name
  from public.profiles p
  where p.id = NEW.user_id;

  select mission_id
    into mid
  from public.mission_ids
  where user_id = NEW.user_id;

  if mode = 'real_name' and opted_name is not null and opted_name <> '' then
    NEW.author_call_sign := opted_name;
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
  'BEFORE INSERT: call_sign, or Mission plus the mission id. full_name only when garage_name_mode is real_name. created_at = now(). Ignores the payload.';
