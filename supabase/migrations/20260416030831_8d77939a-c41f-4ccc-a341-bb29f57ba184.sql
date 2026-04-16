
-- Enable pg_net for HTTP calls from DB
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to call the edge function via pg_net
CREATE OR REPLACE FUNCTION public.notify_dispatch_ride()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  IF NEW.status = 'pending' THEN
    _url := current_setting('app.settings.supabase_url', true) || '/functions/v1/dispatch-ride';
    _anon_key := current_setting('app.settings.supabase_anon_key', true);

    -- If settings not available, use hardcoded project URL
    IF _url IS NULL OR _url = '' THEN
      _url := 'https://sulhoaufaifqgnrvstez.supabase.co/functions/v1/dispatch-ride';
    END IF;

    PERFORM extensions.http_post(
      url := _url,
      body := jsonb_build_object(
        'action', 'trigger',
        'record', jsonb_build_object(
          'id', NEW.id,
          'tenant_id', NEW.tenant_id,
          'passenger_id', NEW.passenger_id,
          'origin_driver_id', NEW.origin_driver_id,
          'origin_affiliate_id', NEW.origin_affiliate_id,
          'status', NEW.status
        )
      )::text,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(_anon_key, '')
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on ride_requests
DROP TRIGGER IF EXISTS trigger_dispatch_ride ON public.ride_requests;
CREATE TRIGGER trigger_dispatch_ride
  AFTER INSERT ON public.ride_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_dispatch_ride();

-- Allow service role operations needed by the edge function
-- ride_dispatches: allow insert
CREATE POLICY "Service can insert dispatches"
  ON public.ride_dispatches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- rides: allow insert from service
CREATE POLICY "Service can insert rides"
  ON public.rides
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- wallet_transactions: allow insert
CREATE POLICY "Service can insert wallet_transactions"
  ON public.wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- commissions: allow insert
CREATE POLICY "Service can insert commissions"
  ON public.commissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- cashback_transactions: allow insert
CREATE POLICY "Service can insert cashback_transactions"
  ON public.cashback_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- wallets: allow update for commission processing
CREATE POLICY "Service can update wallets"
  ON public.wallets
  FOR UPDATE
  TO authenticated
  USING (true);

-- rides: allow update for completion
CREATE POLICY "Service can update rides"
  ON public.rides
  FOR UPDATE
  TO authenticated
  USING (true);

-- ride_requests: allow update for status changes
CREATE POLICY "Service can update ride_requests"
  ON public.ride_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- passengers: allow update for stats
CREATE POLICY "Service can update passengers"
  ON public.passengers
  FOR UPDATE
  TO authenticated
  USING (true);

-- audit_logs: allow insert
CREATE POLICY "Service can insert audit_logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime for ride_dispatches so drivers get notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_dispatches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;
