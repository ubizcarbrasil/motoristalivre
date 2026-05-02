
-- 1. Campos em service_types
alter table public.service_types
  add column if not exists requires_address boolean not null default false,
  add column if not exists service_radius_km numeric,
  add column if not exists travel_fee_base numeric not null default 0,
  add column if not exists travel_fee_per_km numeric not null default 0;

-- 2. Fatores de preço dinâmicos
create table if not exists public.service_pricing_factors (
  id uuid primary key default gen_random_uuid(),
  service_type_id uuid not null,
  tenant_id uuid not null,
  driver_id uuid not null,
  key text not null,
  label text not null,
  input_type text not null check (input_type in ('number','select')),
  unit text,
  options jsonb,
  unit_price numeric not null default 0,
  min_value numeric,
  max_value numeric,
  step numeric not null default 1,
  default_value numeric,
  required boolean not null default false,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pricing_factors_service on public.service_pricing_factors(service_type_id);

alter table public.service_pricing_factors enable row level security;

create policy "Public can view pricing factors"
  on public.service_pricing_factors for select using (true);

create policy "Driver manages own pricing factors"
  on public.service_pricing_factors for all
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

create policy "Tenant admins manage pricing factors"
  on public.service_pricing_factors for all
  using (
    tenant_id = get_user_tenant_id(auth.uid())
    and get_user_role(auth.uid()) = any (array['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role])
  )
  with check (
    tenant_id = get_user_tenant_id(auth.uid())
    and get_user_role(auth.uid()) = any (array['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role])
  );

create trigger trg_pricing_factors_updated
  before update on public.service_pricing_factors
  for each row execute function public.update_updated_at_column();

-- 3. Endereço do atendimento
create table if not exists public.service_booking_addresses (
  booking_id uuid primary key,
  tenant_id uuid not null,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  latitude numeric,
  longitude numeric,
  referencia text,
  created_at timestamptz not null default now()
);

alter table public.service_booking_addresses enable row level security;

create policy "Booking parties view address"
  on public.service_booking_addresses for select
  using (
    exists (
      select 1 from public.service_bookings sb
      where sb.id = service_booking_addresses.booking_id
        and (
          sb.client_id = auth.uid()
          or sb.driver_id = auth.uid()
          or sb.guest_passenger_id is not null
          or (
            sb.tenant_id = get_user_tenant_id(auth.uid())
            and get_user_role(auth.uid()) = any (array['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role])
          )
        )
    )
  );

-- 4. Snapshot do cálculo em service_bookings
alter table public.service_bookings
  add column if not exists travel_fee numeric not null default 0,
  add column if not exists factors_snapshot jsonb,
  add column if not exists total_price numeric;
