CREATE TYPE public.payment_method AS ENUM ('dinheiro', 'pix', 'cartao', 'saldo');

ALTER TABLE public.ride_requests
ADD COLUMN payment_method public.payment_method NOT NULL DEFAULT 'dinheiro';

ALTER TABLE public.rides
ADD COLUMN payment_method public.payment_method NOT NULL DEFAULT 'dinheiro';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rides'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
  END IF;
END $$;