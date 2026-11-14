-- Upgrade an existing "brands" table to the structured Brand Library schema.
-- Safe to run once on a database created from the first version of 0001.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='brands' and column_name='name') then
    alter table public.brands rename column name to brand_name;
  end if;
end $$;

alter table public.brands
  add column if not exists tone_of_voice text not null default '',
  add column if not exists main_characters text not null default '',
  add column if not exists core_insights text not null default '',
  add column if not exists past_scripts text not null default '';

-- keep whatever was already written in the old single "background" field
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='brands' and column_name='background') then
    update public.brands set main_characters = background where main_characters = '' and background <> '';
    alter table public.brands drop column background;
  end if;
end $$;
