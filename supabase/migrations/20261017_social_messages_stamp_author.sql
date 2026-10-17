-- Garage author is the account, not the payload.
--
-- social_messages insert policy checks auth.uid() = user_id and the channel.
-- author_call_sign, author_mission_id, and created_at were whatever the client
-- sent, and PostgREST is a second door in front of the Next route.
-- This trigger overwrites all three on every insert.
--
-- Founder apply. Do not run this from an agent lane.

create or replace function public.social_messages_stamp_author()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  label text;
  mid integer;
begin
  select left(btrim(full_name), 24)
    into label
  from public.profiles
  where id = NEW.user_id;

  if label is null or label = '' then
    label := 'Athlete';
  end if;

  NEW.author_call_sign := label;

  select mission_id
    into mid
  from public.mission_ids
  where user_id = NEW.user_id;

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
  'BEFORE INSERT: call sign from profiles.full_name, mission number from mission_ids, created_at = now(). Ignores the payload.';
