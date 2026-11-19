create table if not exists public.event_registrations (
    id uuid primary key default gen_random_uuid(),
    full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
    phone_number text not null check (
        char_length(phone_number) between 7 and 25
        and phone_number ~ '^[+0-9() -]+$'
        and char_length(regexp_replace(phone_number, '[^0-9]', '', 'g')) between 7 and 15
    ),
    team_name text check (team_name is null or char_length(team_name) <= 100),
    presentation_type text not null check (
        presentation_type in ('Special Song', 'Drama', 'Dance', 'Poetry', 'Worship Presentation', 'Other')
    ),
    group_size integer not null check (group_size between 1 and 100),
    presentation_description text not null check (
        char_length(btrim(presentation_description)) between 1 and 1000
    ),
    additional_information text check (
        additional_information is null or char_length(additional_information) <= 1000
    ),
    event_name text not null check (event_name = 'Christmas Celebration'),
    event_date date not null check (event_date = date '2026-12-25'),
    created_at timestamptz not null default now()
);

alter table public.event_registrations enable row level security;

grant insert on table public.event_registrations to anon, authenticated;

drop policy if exists event_registrations_public_insert on public.event_registrations;
create policy event_registrations_public_insert
    on public.event_registrations
    for insert
    to anon, authenticated
    with check (true);

notify pgrst, 'reload schema';
