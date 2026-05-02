ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_context_check;
ALTER TABLE public.commissions
  ADD CONSTRAINT commissions_context_check
  CHECK (commission_context = ANY (ARRAY[
    'transbordo'::text,
    'affiliate'::text,
    'service_coverage'::text,
    'referral'::text,
    'servico'::text,
    'recrutamento'::text
  ]));