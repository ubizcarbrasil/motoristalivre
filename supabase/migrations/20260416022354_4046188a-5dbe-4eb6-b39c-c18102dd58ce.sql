
-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.dispatch_mode AS ENUM ('auto', 'manual', 'hybrid');
CREATE TYPE public.app_role AS ENUM ('root_admin', 'tenant_admin', 'manager', 'driver', 'affiliate', 'passenger');
CREATE TYPE public.ride_origin_type AS ENUM ('driver_link', 'affiliate_link', 'group_link');
CREATE TYPE public.ride_status AS ENUM ('pending', 'dispatching', 'accepted', 'in_progress', 'completed', 'expired', 'cancelled');
CREATE TYPE public.dispatch_response AS ENUM ('pending', 'accepted', 'rejected', 'timeout');
CREATE TYPE public.wallet_owner_type AS ENUM ('driver', 'affiliate', 'group');
CREATE TYPE public.wallet_transaction_type AS ENUM ('ride_earning', 'commission_transbordo', 'commission_affiliate', 'commission_referral', 'pix_topup', 'withdrawal', 'subscription_fee');
CREATE TYPE public.commission_type AS ENUM ('transbordo', 'affiliate', 'referral', 'platform');
CREATE TYPE public.commission_status AS ENUM ('pending', 'processed', 'failed');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.cashback_type AS ENUM ('credit', 'debit');
CREATE TYPE public.referral_type AS ENUM ('driver', 'affiliate');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
CREATE TYPE public.tenant_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'banned');

-- =============================================
-- PLANS
-- =============================================
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_signup NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_drivers INT NOT NULL DEFAULT 10,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON public.plans FOR SELECT USING (true);

-- =============================================
-- TENANTS
-- =============================================
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status tenant_status NOT NULL DEFAULT 'active',
  plan_id UUID REFERENCES public.plans(id),
  owner_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TENANT_SETTINGS
-- =============================================
CREATE TABLE public.tenant_settings (
  tenant_id UUID NOT NULL PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  dispatch_mode dispatch_mode NOT NULL DEFAULT 'auto',
  dispatch_radius_km NUMERIC(6,2) NOT NULL DEFAULT 10,
  dispatch_timeout_sec INT NOT NULL DEFAULT 60,
  dispatch_max_attempts INT NOT NULL DEFAULT 3,
  allow_driver_pricing BOOLEAN NOT NULL DEFAULT false,
  allow_offers BOOLEAN NOT NULL DEFAULT false,
  base_fare NUMERIC(10,2) NOT NULL DEFAULT 5,
  price_per_km NUMERIC(10,2) NOT NULL DEFAULT 2,
  price_per_min NUMERIC(10,2) NOT NULL DEFAULT 0.5,
  min_fare NUMERIC(10,2) NOT NULL DEFAULT 7,
  transbordo_commission NUMERIC(5,2) NOT NULL DEFAULT 10,
  affiliate_commission NUMERIC(5,2) NOT NULL DEFAULT 5,
  cashback_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TENANT_BRANDING
-- =============================================
CREATE TABLE public.tenant_branding (
  tenant_id UUID NOT NULL PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  logo_url TEXT,
  cover_url TEXT,
  description TEXT,
  city TEXT,
  whatsapp TEXT,
  primary_color TEXT DEFAULT '#1db865',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status subscription_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_billing_at TIMESTAMPTZ,
  referred_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS
-- =============================================
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'passenger',
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Now add FK on tenants.owner_user_id
ALTER TABLE public.tenants ADD CONSTRAINT tenants_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id);

-- =============================================
-- SECURITY DEFINER FUNCTIONS (avoid RLS recursion)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_root_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = _user_id AND role = 'root_admin');
$$;

-- =============================================
-- RLS: TENANTS
-- =============================================
CREATE POLICY "Root admins can view all tenants" ON public.tenants FOR SELECT USING (public.is_root_admin(auth.uid()));
CREATE POLICY "Users can view their own tenant" ON public.tenants FOR SELECT USING (id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "Public can view tenant by slug" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Root admins can manage tenants" ON public.tenants FOR ALL USING (public.is_root_admin(auth.uid()));

-- =============================================
-- RLS: TENANT_SETTINGS
-- =============================================
CREATE POLICY "Users can view own tenant settings" ON public.tenant_settings FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "Tenant admins can update settings" ON public.tenant_settings FOR UPDATE USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);
CREATE POLICY "Root admins full access to settings" ON public.tenant_settings FOR ALL USING (public.is_root_admin(auth.uid()));

-- =============================================
-- RLS: TENANT_BRANDING
-- =============================================
CREATE POLICY "Anyone can view branding" ON public.tenant_branding FOR SELECT USING (true);
CREATE POLICY "Tenant admins can update branding" ON public.tenant_branding FOR UPDATE USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);
CREATE POLICY "Root admins full access to branding" ON public.tenant_branding FOR ALL USING (public.is_root_admin(auth.uid()));

-- =============================================
-- RLS: SUBSCRIPTIONS
-- =============================================
CREATE POLICY "Users can view own tenant subscriptions" ON public.subscriptions FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "Root admins full access to subscriptions" ON public.subscriptions FOR ALL USING (public.is_root_admin(auth.uid()));

-- =============================================
-- RLS: USERS
-- =============================================
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can view same tenant users" ON public.users FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Root admins full access to users" ON public.users FOR ALL USING (public.is_root_admin(auth.uid()));

-- =============================================
-- DRIVERS
-- =============================================
CREATE TABLE public.drivers (
  id UUID NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  bio TEXT,
  cover_url TEXT,
  vehicle_model TEXT,
  vehicle_year INT,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_online BOOLEAN NOT NULL DEFAULT false,
  dispatch_mode dispatch_mode,
  custom_base_fare NUMERIC(10,2),
  custom_price_per_km NUMERIC(10,2),
  custom_price_per_min NUMERIC(10,2),
  cashback_pct NUMERIC(5,2) DEFAULT 0,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Drivers can update own profile" ON public.drivers FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Tenant admins can manage drivers" ON public.drivers FOR ALL USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager')
);

-- =============================================
-- AFFILIATES
-- =============================================
CREATE TABLE public.affiliates (
  id UUID NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  business_name TEXT,
  business_type TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved affiliates" ON public.affiliates FOR SELECT USING (is_approved = true);
CREATE POLICY "Affiliates can view own profile" ON public.affiliates FOR SELECT USING (id = auth.uid());
CREATE POLICY "Affiliates can update own profile" ON public.affiliates FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Tenant admins can manage affiliates" ON public.affiliates FOR ALL USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager')
);

-- =============================================
-- PASSENGERS
-- =============================================
CREATE TABLE public.passengers (
  id UUID NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  total_rides INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  cashback_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  first_ride_at TIMESTAMPTZ,
  last_ride_at TIMESTAMPTZ,
  origin_source TEXT,
  origin_driver_id UUID REFERENCES public.drivers(id),
  origin_affiliate_id UUID REFERENCES public.affiliates(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passengers can view own data" ON public.passengers FOR SELECT USING (id = auth.uid());
CREATE POLICY "Passengers can update own data" ON public.passengers FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Tenant admins can view passengers" ON public.passengers FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager', 'driver')
);

-- =============================================
-- RIDE_REQUESTS
-- =============================================
CREATE TABLE public.ride_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.passengers(id),
  origin_type ride_origin_type,
  origin_driver_id UUID REFERENCES public.drivers(id),
  origin_affiliate_id UUID REFERENCES public.affiliates(id),
  origin_lat NUMERIC(10,7),
  origin_lng NUMERIC(10,7),
  origin_address TEXT,
  dest_lat NUMERIC(10,7),
  dest_lng NUMERIC(10,7),
  dest_address TEXT,
  distance_km NUMERIC(8,2),
  estimated_min INT,
  suggested_price NUMERIC(10,2),
  offered_price NUMERIC(10,2),
  final_price NUMERIC(10,2),
  status ride_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passengers can view own requests" ON public.ride_requests FOR SELECT USING (passenger_id = auth.uid());
CREATE POLICY "Passengers can create requests" ON public.ride_requests FOR INSERT WITH CHECK (passenger_id = auth.uid());
CREATE POLICY "Tenant staff can view requests" ON public.ride_requests FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager', 'driver')
);

-- =============================================
-- RIDE_DISPATCHES
-- =============================================
CREATE TABLE public.ride_dispatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_request_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id),
  attempt_number INT NOT NULL DEFAULT 1,
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  response dispatch_response NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ
);
ALTER TABLE public.ride_dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers can view own dispatches" ON public.ride_dispatches FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Drivers can update own dispatches" ON public.ride_dispatches FOR UPDATE USING (driver_id = auth.uid());
CREATE POLICY "Tenant staff can view dispatches" ON public.ride_dispatches FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager')
);

-- =============================================
-- RIDES
-- =============================================
CREATE TABLE public.rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_request_id UUID NOT NULL REFERENCES public.ride_requests(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id),
  passenger_id UUID NOT NULL REFERENCES public.passengers(id),
  origin_driver_id UUID REFERENCES public.drivers(id),
  origin_affiliate_id UUID REFERENCES public.affiliates(id),
  is_transbordo BOOLEAN NOT NULL DEFAULT false,
  price_paid NUMERIC(10,2),
  cashback_amount NUMERIC(10,2) DEFAULT 0,
  driver_rating INT CHECK (driver_rating BETWEEN 1 AND 5),
  driver_comment TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passengers can view own rides" ON public.rides FOR SELECT USING (passenger_id = auth.uid());
CREATE POLICY "Drivers can view own rides" ON public.rides FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Tenant staff can view rides" ON public.rides FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin', 'manager')
);

-- =============================================
-- WALLETS
-- =============================================
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  owner_type wallet_owner_type NOT NULL,
  owner_id UUID NOT NULL,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  blocked_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, owner_type, owner_id)
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Tenant admins can view wallets" ON public.wallets FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);

-- =============================================
-- WALLET_TRANSACTIONS
-- =============================================
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type wallet_transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (
  wallet_id IN (SELECT id FROM public.wallets WHERE owner_id = auth.uid())
);
CREATE POLICY "Tenant admins can view transactions" ON public.wallet_transactions FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);

-- =============================================
-- COMMISSIONS
-- =============================================
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id),
  commission_type commission_type NOT NULL,
  from_wallet_id UUID REFERENCES public.wallets(id),
  to_wallet_id UUID REFERENCES public.wallets(id),
  amount NUMERIC(10,2) NOT NULL,
  status commission_status NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant admins can view commissions" ON public.commissions FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);

-- =============================================
-- PAYOUTS
-- =============================================
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  amount NUMERIC(10,2) NOT NULL,
  pix_key TEXT,
  status payout_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payouts" ON public.payouts FOR SELECT USING (
  wallet_id IN (SELECT id FROM public.wallets WHERE owner_id = auth.uid())
);
CREATE POLICY "Tenant admins can manage payouts" ON public.payouts FOR ALL USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);

-- =============================================
-- CASHBACK_TRANSACTIONS
-- =============================================
CREATE TABLE public.cashback_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.passengers(id),
  ride_id UUID REFERENCES public.rides(id),
  type cashback_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passengers can view own cashback" ON public.cashback_transactions FOR SELECT USING (passenger_id = auth.uid());
CREATE POLICY "Tenant admins can view cashback" ON public.cashback_transactions FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id),
  driver_id UUID NOT NULL REFERENCES public.drivers(id),
  passenger_id UUID NOT NULL REFERENCES public.passengers(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Passengers can create reviews" ON public.reviews FOR INSERT WITH CHECK (passenger_id = auth.uid());

-- =============================================
-- REFERRALS
-- =============================================
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.users(id),
  referred_id UUID NOT NULL REFERENCES public.users(id),
  referral_type referral_type NOT NULL,
  signup_commission_paid BOOLEAN NOT NULL DEFAULT false,
  signup_commission_amount NUMERIC(10,2) DEFAULT 0,
  monthly_commission_active BOOLEAN NOT NULL DEFAULT false,
  total_monthly_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Tenant admins can view referrals" ON public.referrals FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);

-- =============================================
-- AUDIT_LOGS
-- =============================================
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  payload JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('root_admin', 'tenant_admin')
);
CREATE POLICY "Root admins can view all audit logs" ON public.audit_logs FOR SELECT USING (public.is_root_admin(auth.uid()));

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON public.tenant_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenant_branding_updated_at BEFORE UPDATE ON public.tenant_branding FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_passengers_updated_at BEFORE UPDATE ON public.passengers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ride_requests_updated_at BEFORE UPDATE ON public.ride_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_drivers_tenant_id ON public.drivers(tenant_id);
CREATE INDEX idx_drivers_referral_code ON public.drivers(referral_code);
CREATE INDEX idx_affiliates_tenant_id ON public.affiliates(tenant_id);
CREATE INDEX idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX idx_passengers_tenant_id ON public.passengers(tenant_id);
CREATE INDEX idx_ride_requests_tenant_id ON public.ride_requests(tenant_id);
CREATE INDEX idx_ride_requests_status ON public.ride_requests(status);
CREATE INDEX idx_ride_requests_passenger_id ON public.ride_requests(passenger_id);
CREATE INDEX idx_ride_dispatches_ride_request_id ON public.ride_dispatches(ride_request_id);
CREATE INDEX idx_ride_dispatches_driver_id ON public.ride_dispatches(driver_id);
CREATE INDEX idx_rides_tenant_id ON public.rides(tenant_id);
CREATE INDEX idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX idx_wallets_owner_id ON public.wallets(owner_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_commissions_ride_id ON public.commissions(ride_id);
CREATE INDEX idx_payouts_wallet_id ON public.payouts(wallet_id);
CREATE INDEX idx_cashback_transactions_passenger_id ON public.cashback_transactions(passenger_id);
CREATE INDEX idx_reviews_driver_id ON public.reviews(driver_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
