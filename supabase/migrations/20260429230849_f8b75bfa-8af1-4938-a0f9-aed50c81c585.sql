-- =====================================================
-- MÓDULO SERVIÇOS (TriboServ)
-- =====================================================

-- 1) Alterações em tabelas existentes
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS active_modules text[] NOT NULL DEFAULT ARRAY['mobility'];

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS professional_type text NOT NULL DEFAULT 'driver',
  ADD COLUMN IF NOT EXISTS service_categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS credential_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS credential_type text,
  ADD COLUMN IF NOT EXISTS credential_number text;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'drivers_professional_type_check'
  ) THEN
    ALTER TABLE public.drivers
      ADD CONSTRAINT drivers_professional_type_check
      CHECK (professional_type IN ('driver','service_provider','both'));
  END IF;
END $$;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT 'mobility';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_module_check') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_module_check
      CHECK (module IN ('mobility','services'));
  END IF;
END $$;

ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT 'mobility';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallet_transactions_module_check') THEN
    ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_transactions_module_check
      CHECK (module IN ('mobility','services'));
  END IF;
END $$;

ALTER TABLE public.commissions
  ADD COLUMN IF NOT EXISTS commission_context text NOT NULL DEFAULT 'transbordo';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commissions_context_check') THEN
    ALTER TABLE public.commissions ADD CONSTRAINT commissions_context_check
      CHECK (commission_context IN ('transbordo','affiliate','service_coverage','referral'));
  END IF;
END $$;

-- 2) Tabela: service_types
CREATE TABLE IF NOT EXISTS public.service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 60,
  price numeric(10,2) NOT NULL,
  is_immediate boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active service types"
  ON public.service_types FOR SELECT USING (true);

CREATE POLICY "Driver can manage own service types"
  ON public.service_types FOR ALL
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Tenant admins can manage service types"
  ON public.service_types FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid())
         AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid())
         AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]));

-- 3) Tabela: professional_availability
CREATE TABLE IF NOT EXISTS public.professional_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_duration_minutes integer NOT NULL DEFAULT 60,
  buffer_minutes integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view availability"
  ON public.professional_availability FOR SELECT USING (true);

CREATE POLICY "Driver manages own availability"
  ON public.professional_availability FOR ALL
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Tenant admins manage availability"
  ON public.professional_availability FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid())
         AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid())
         AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]));

-- 4) Tabela: service_bookings
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  client_id uuid REFERENCES public.passengers(id),
  guest_passenger_id uuid REFERENCES public.guest_passengers(id),
  service_type_id uuid NOT NULL REFERENCES public.service_types(id),
  origin_driver_id uuid REFERENCES public.drivers(id),
  origin_affiliate_id uuid REFERENCES public.affiliates(id),
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  price_agreed numeric(10,2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','pix','card','balance')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled','no_show')),
  notes text,
  reminder_sent_24h boolean NOT NULL DEFAULT false,
  reminder_sent_1h boolean NOT NULL DEFAULT false,
  return_reminder_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_bookings_client_or_guest CHECK (
    (client_id IS NOT NULL AND guest_passenger_id IS NULL)
    OR (client_id IS NULL AND guest_passenger_id IS NOT NULL)
  )
);
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Driver views own bookings"
  ON public.service_bookings FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Client views own bookings"
  ON public.service_bookings FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Public can view guest bookings by id"
  ON public.service_bookings FOR SELECT
  USING (guest_passenger_id IS NOT NULL);

CREATE POLICY "Tenant admins view bookings"
  ON public.service_bookings FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid())
         AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role,'tenant_admin'::app_role,'manager'::app_role]));

CREATE POLICY "Driver updates own booking status"
  ON public.service_bookings FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Client cancels own pending booking"
  ON public.service_bookings FOR UPDATE
  USING (client_id = auth.uid() AND status IN ('pending','confirmed'))
  WITH CHECK (client_id = auth.uid() AND status = 'cancelled');

-- 5) Tabela: service_reminders
CREATE TABLE IF NOT EXISTS public.service_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.passengers(id),
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  remind_at date NOT NULL,
  message text,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','booked','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Driver manages own reminders"
  ON public.service_reminders FOR ALL
  USING (driver_id = auth.uid() OR public.is_root_admin(auth.uid()))
  WITH CHECK (driver_id = auth.uid() OR public.is_root_admin(auth.uid()));

-- 6) Tabela: professional_credentials
CREATE TABLE IF NOT EXISTS public.professional_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  credential_type text NOT NULL CHECK (credential_type IN ('crm','oab','crea','cro','crn','cref','other')),
  credential_number text NOT NULL,
  issuing_body text,
  uf char(2),
  verified_at timestamptz,
  verified_by uuid REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','expired')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.professional_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views own credentials"
  ON public.professional_credentials FOR SELECT
  USING (driver_id = auth.uid() OR public.is_root_admin(auth.uid()));

CREATE POLICY "Owner inserts own credentials"
  ON public.professional_credentials FOR INSERT
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Root verifies credentials"
  ON public.professional_credentials FOR UPDATE
  USING (public.is_root_admin(auth.uid()))
  WITH CHECK (public.is_root_admin(auth.uid()));

-- 7) Indexes
CREATE INDEX IF NOT EXISTS idx_service_bookings_driver_scheduled ON public.service_bookings(driver_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_service_bookings_client ON public.service_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_tenant_status ON public.service_bookings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_professional_availability_driver_dow ON public.professional_availability(driver_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_service_types_driver_active ON public.service_types(driver_id, is_active);
CREATE INDEX IF NOT EXISTS idx_service_reminders_remind_status ON public.service_reminders(remind_at, status);

-- 8) Triggers de updated_at
DROP TRIGGER IF EXISTS trg_service_types_updated ON public.service_types;
CREATE TRIGGER trg_service_types_updated
  BEFORE UPDATE ON public.service_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_bookings_updated ON public.service_bookings;
CREATE TRIGGER trg_service_bookings_updated
  BEFORE UPDATE ON public.service_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_bookings;