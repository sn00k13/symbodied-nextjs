-- Add username column to profiles
alter table public.profiles
  add column if not exists username text unique;

-- Allow users to insert their own profile row (needed when trigger is not present)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'own profile: insert'
  ) then
    execute $p$
      create policy "own profile: insert"
        on public.profiles for insert
        with check (auth.uid() = id)
    $p$;
  end if;
end $$;

-- Update the trigger to also propagate role and username from signup metadata
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, role, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    new.raw_user_meta_data ->> 'username'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
