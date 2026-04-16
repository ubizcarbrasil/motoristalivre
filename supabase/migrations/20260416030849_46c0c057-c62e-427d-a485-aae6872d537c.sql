
-- Drop overly permissive policies and recreate for service_role only
DROP POLICY IF EXISTS "Service can insert dispatches" ON public.ride_dispatches;
DROP POLICY IF EXISTS "Service can insert rides" ON public.rides;
DROP POLICY IF EXISTS "Service can insert wallet_transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Service can insert commissions" ON public.commissions;
DROP POLICY IF EXISTS "Service can insert cashback_transactions" ON public.cashback_transactions;
DROP POLICY IF EXISTS "Service can update wallets" ON public.wallets;
DROP POLICY IF EXISTS "Service can update rides" ON public.rides;
DROP POLICY IF EXISTS "Service can update ride_requests" ON public.ride_requests;
DROP POLICY IF EXISTS "Service can update passengers" ON public.passengers;
DROP POLICY IF EXISTS "Service can insert audit_logs" ON public.audit_logs;

-- The edge function uses the service_role key which bypasses RLS entirely,
-- so these explicit policies are not needed. The service_role key has full access.
-- For authenticated users, we keep the existing scoped policies.
