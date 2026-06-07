-- Mentis: Supabase Schema
-- Bu SQL'i Supabase Dashboard > SQL Editor'a yapıştırın.

-- Strateji geçmişi tablosu
create table if not exists public.consultations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  problem text not null,
  analysis text,
  target_weakness text,
  execution text,
  is_starred boolean default false not null,
  personal_notes text,
  character text default 'mentis' not null,
  mode text default 'standard' not null,
  target_name text,
  chat_history jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Her kullanıcı sadece kendi verilerini görsün
alter table public.consultations enable row level security;

create policy "Users can view own consultations" on public.consultations
  for select using (auth.uid() = user_id);

create policy "Users can insert own consultations" on public.consultations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own consultations" on public.consultations
  for update using (auth.uid() = user_id);

-- Kredi/Kullanım hakkı tablosu
create table if not exists public.user_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  credits integer default 3 not null, -- Yeni kullanıcıya 3 bedava kredi
  total_used integer default 0 not null,
  plan text default 'free' not null, -- 'free', 'pro', 'elite'
  has_book boolean default false not null, -- Kitap satın alma durumu
  has_secret_files boolean default false not null, -- Gizli Dosyalar satın alma durumu
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_credits enable row level security;

create policy "Users can view own credits" on public.user_credits
  for select using (auth.uid() = user_id);

-- Yeni kullanıcı kayıt olduğunda otomatik kredi ver
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_credits (user_id, credits, total_used, plan)
  values (new.id, 3, 0, 'free');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- İndeksler
create index if not exists idx_consultations_user_id on public.consultations(user_id);
create index if not exists idx_consultations_created_at on public.consultations(created_at desc);
create index if not exists idx_user_credits_user_id on public.user_credits(user_id);

-- Ödeme işlemleri tablosu
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null,
  credits_added integer not null,
  payment_id text not null unique,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_payment_id on public.transactions(payment_id);

-- Karargah Notları (Özel Notlar) tablosu
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notes enable row level security;

create policy "Users can view own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes" on public.notes
  for update using (auth.uid() = user_id);

create policy "Users can delete own notes" on public.notes
  for delete using (auth.uid() = user_id);

create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_created_at on public.notes(created_at desc);

-- Simülasyon Hedefleri Tablosu
create table if not exists public.simulation_targets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  transcript text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.simulation_targets enable row level security;

create policy "Users can view own simulation targets" on public.simulation_targets
  for select using (auth.uid() = user_id);

create policy "Users can insert own simulation targets" on public.simulation_targets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own simulation targets" on public.simulation_targets
  for update using (auth.uid() = user_id);

create policy "Users can delete own simulation targets" on public.simulation_targets
  for delete using (auth.uid() = user_id);

create index if not exists idx_simulation_targets_user_id on public.simulation_targets(user_id);
create index if not exists idx_simulation_targets_created_at on public.simulation_targets(created_at desc);

-- Kredileri güvenli ve eşzamanlı (atomic) olarak düşme fonksiyonu
create or replace function public.deduct_credits(target_user_id uuid, cost integer)
returns boolean as $$
declare
  updated_rows integer;
  user_plan text;
begin
  -- Kullanıcının planını kontrol et
  select plan into user_plan from public.user_credits where user_id = target_user_id;
  
  -- Eğer plan elite ise kredi düşme, doğrudan true dön
  if user_plan = 'elite' then
    return true;
  end if;

  -- Krediyi düşür (sadece yeterli kredi varsa)
  update public.user_credits
  set credits = credits - cost,
      total_used = total_used + cost,
      updated_at = timezone('utc'::text, now())
  where user_id = target_user_id
    and credits >= cost;
    
  get diagnostics updated_rows = row_count;
  
  return updated_rows > 0;
end;
$$ language plpgsql security definer;


