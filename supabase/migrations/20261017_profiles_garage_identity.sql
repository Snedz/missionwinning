-- Garage identity on profiles. Apply BEFORE the app merge, and before
-- 20261017_social_messages_stamp_author.sql.
--
-- profiles.call_sign is an owner-set handle, stored lowercase, unique on
-- lower(call_sign). profiles.garage_name_mode defaults to call_sign.
-- garage_real_name_reserved compares lower(call_sign) to the compare key.
-- The owner trigger normalizes the handle. service_role may set call_sign
-- to null and may set garage_name_mode back to call_sign. A real_name write
-- raises garage_real_name_reserved (23514) only when full_name or
-- garage_name_mode changed, so reminders and other profile updates still land.
--
-- Ops / founder apply. Do not run this from an agent lane.

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

drop index if exists public.profiles_call_sign_unique;
create unique index profiles_call_sign_unique
  on public.profiles (lower(call_sign));

comment on column public.profiles.call_sign is
  'Owner-set Garage handle. Null until chosen. 3-20 of letters, numbers, hyphen, underscore. Not full_name.';

comment on column public.profiles.garage_name_mode is
  'call_sign (default) publishes the handle. real_name is an explicit opt-in to publish full_name, and only when that name is not a handle.';

-- Display form: strip zero-width and bidi marks, NFKC, fold the JS \s set to
-- ASCII space, trim, collapse whitespace. The comparison key is that form,
-- lowercased. chr() lists are closed: soft hyphen, U+180E, U+200B–U+200F,
-- bidi overrides and isolates, word joiner, BOM, then the spaces JS trim
-- removes that btrim would leave in place (tab through CR, NBSP, U+1680,
-- U+2000–U+200A, U+2028, U+2029, U+202F, U+205F, U+3000).
create or replace function public.garage_display_name(raw text)
returns text
language sql
immutable
parallel safe
set search_path = public
as $$
  select btrim(
    regexp_replace(
      pg_catalog.translate(
        pg_catalog.translate(
          pg_catalog.normalize(
            pg_catalog.translate(
              coalesce(raw, ''),
              chr(173) || chr(6158) || chr(8203) || chr(8204) || chr(8205)
                || chr(8206) || chr(8207) || chr(8234) || chr(8235) || chr(8236)
                || chr(8237) || chr(8238) || chr(8288) || chr(8294) || chr(8295)
                || chr(8296) || chr(8297) || chr(65279),
              ''
            ),
            NFKC
          ),
          chr(173) || chr(6158) || chr(8203) || chr(8204) || chr(8205)
            || chr(8206) || chr(8207) || chr(8234) || chr(8235) || chr(8236)
            || chr(8237) || chr(8238) || chr(8288) || chr(8294) || chr(8295)
            || chr(8296) || chr(8297) || chr(65279),
          ''
        ),
        chr(9) || chr(10) || chr(11) || chr(12) || chr(13) || chr(160) || chr(5760)
          || chr(8192) || chr(8193) || chr(8194) || chr(8195) || chr(8196)
          || chr(8197) || chr(8198) || chr(8199) || chr(8200) || chr(8201)
          || chr(8202) || chr(8232) || chr(8233) || chr(8239) || chr(8287)
          || chr(12288),
        '                       '
      ),
      '[[:space:]]+',
      ' ',
      'g'
    )
  );
$$;

create or replace function public.garage_compare_key(raw text)
returns text
language sql
immutable
parallel safe
set search_path = public
as $$
  select lower(public.garage_display_name(raw));
$$;

revoke all on function public.garage_display_name(text) from public, anon;
grant execute on function public.garage_display_name(text) to authenticated, service_role;

revoke all on function public.garage_compare_key(text) from public, anon;
grant execute on function public.garage_compare_key(text) to authenticated, service_role;

-- True when a real name would read as a call sign or as a Mission fallback.
-- security definer: the inserting user cannot select other profiles, and this
-- returns only a boolean. The handle compare is lower(call_sign) so the
-- unique index is usable; call signs are stored already normalized.
create or replace function public.garage_real_name_reserved(raw text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select key <> ''
    and (
      starts_with(key, 'mission')
      or exists (
        select 1
        from public.profiles h
        where lower(h.call_sign) = key
      )
    )
  from (select public.garage_compare_key(raw) as key) compared;
$$;

revoke all on function public.garage_real_name_reserved(text) from public, anon;
grant execute on function public.garage_real_name_reserved(text) to authenticated, service_role;

create or replace function public.profiles_owner_garage_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if NEW.call_sign is not null then
    NEW.call_sign := public.garage_compare_key(NEW.call_sign);
    if NEW.call_sign = '' then
      NEW.call_sign := null;
    end if;
  end if;

  if coalesce(auth.role(), '') = 'service_role' and tg_op = 'UPDATE' then
    -- Reset only. A non-null handle, or turning real_name on, stays the owner's.
    -- Return before the reserved-name check so clearing a handle cannot raise.
    if NEW.call_sign is not null then
      NEW.call_sign := OLD.call_sign;
    end if;
    if NEW.garage_name_mode is distinct from 'call_sign' then
      NEW.garage_name_mode := OLD.garage_name_mode;
    end if;
    return NEW;
  elsif auth.uid() is distinct from NEW.id then
    if tg_op = 'INSERT' then
      NEW.call_sign := null;
      NEW.garage_name_mode := 'call_sign';
    else
      NEW.call_sign := OLD.call_sign;
      NEW.garage_name_mode := OLD.garage_name_mode;
    end if;
  end if;

  -- Only when this write is the one that would publish the name. A later
  -- call sign that collides with an existing real name must not fail
  -- reminders, coach, journey, or open-session updates. CASE so INSERT
  -- never reads OLD. The post stamp re-checks on every insert.
  -- Gate: tg_op = 'INSERT' or NEW.full_name is distinct from OLD.full_name
  -- or NEW.garage_name_mode is distinct from OLD.garage_name_mode.
  if case
       when tg_op = 'INSERT' then true
       else NEW.full_name is distinct from OLD.full_name
         or NEW.garage_name_mode is distinct from OLD.garage_name_mode
     end
     and NEW.garage_name_mode = 'real_name'
     and public.garage_real_name_reserved(NEW.full_name) then
    raise exception 'garage_real_name_reserved'
      using errcode = '23514';
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
  'Normalizes call_sign. Only the owner may set it. service_role may set it to null and may set garage_name_mode back to call_sign. real_name plus a reserved full_name raises garage_real_name_reserved only when full_name or garage_name_mode changed.';

