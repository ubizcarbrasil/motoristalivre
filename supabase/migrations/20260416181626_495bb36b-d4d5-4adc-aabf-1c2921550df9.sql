-- 1. Adicionar valores 'approved' e 'rejected' ao enum payout_status
ALTER TYPE public.payout_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.payout_status ADD VALUE IF NOT EXISTS 'rejected';

-- 2. Criar enum para tipo de chave PIX
DO $$ BEGIN
  CREATE TYPE public.pix_key_type AS ENUM ('cpf', 'email', 'telefone', 'aleatoria');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Adicionar coluna pix_key_type em payouts
ALTER TABLE public.payouts
  ADD COLUMN IF NOT EXISTS pix_key_type public.pix_key_type;

-- 4. Função: garantir wallet (cria se não existe, retorna o id)
CREATE OR REPLACE FUNCTION public.ensure_wallet(_owner_type public.wallet_owner_type)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _tenant_id uuid;
  _wallet_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT tenant_id INTO _tenant_id FROM public.users WHERE id = _user_id;
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'User has no tenant';
  END IF;

  SELECT id INTO _wallet_id
  FROM public.wallets
  WHERE owner_id = _user_id AND owner_type = _owner_type
  LIMIT 1;

  IF _wallet_id IS NULL THEN
    INSERT INTO public.wallets (owner_id, owner_type, tenant_id, balance, blocked_balance)
    VALUES (_user_id, _owner_type, _tenant_id, 0, 0)
    RETURNING id INTO _wallet_id;
  END IF;

  RETURN _wallet_id;
END;
$$;

-- 5. Função: solicitar saque (debita do balance, joga em blocked_balance, cria payout)
CREATE OR REPLACE FUNCTION public.request_payout(
  _owner_type public.wallet_owner_type,
  _amount numeric,
  _pix_key text,
  _pix_key_type public.pix_key_type
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _wallet record;
  _payout_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _amount IS NULL OR _amount < 10 THEN
    RAISE EXCEPTION 'Valor mínimo de R$ 10,00';
  END IF;

  IF _pix_key IS NULL OR length(trim(_pix_key)) = 0 THEN
    RAISE EXCEPTION 'Chave PIX é obrigatória';
  END IF;

  -- Lock the wallet row to prevent double-spending
  SELECT * INTO _wallet FROM public.wallets
  WHERE owner_id = _user_id AND owner_type = _owner_type
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Carteira não encontrada';
  END IF;

  IF _wallet.balance < _amount THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;

  -- Move balance -> blocked_balance
  UPDATE public.wallets
  SET balance = balance - _amount,
      blocked_balance = blocked_balance + _amount,
      updated_at = now()
  WHERE id = _wallet.id;

  -- Create payout
  INSERT INTO public.payouts (
    wallet_id, tenant_id, amount, pix_key, pix_key_type, status, requested_at
  ) VALUES (
    _wallet.id, _wallet.tenant_id, _amount, trim(_pix_key), _pix_key_type, 'pending', now()
  ) RETURNING id INTO _payout_id;

  RETURN _payout_id;
END;
$$;

-- 6. Função: aprovar saque (apenas root_admin) — libera o blocked_balance
CREATE OR REPLACE FUNCTION public.approve_payout(_payout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _payout record;
BEGIN
  IF NOT public.is_root_admin(_user_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO _payout FROM public.payouts WHERE id = _payout_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found';
  END IF;

  IF _payout.status <> 'pending' THEN
    RAISE EXCEPTION 'Payout já processado';
  END IF;

  UPDATE public.payouts
  SET status = 'approved',
      processed_at = now(),
      processed_by = _user_id
  WHERE id = _payout_id;

  -- Apenas remove do blocked (saiu da carteira de fato)
  UPDATE public.wallets
  SET blocked_balance = blocked_balance - _payout.amount,
      total_withdrawn = total_withdrawn + _payout.amount,
      updated_at = now()
  WHERE id = _payout.wallet_id;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, tenant_id, payload)
  VALUES (
    'payout_approved', 'payout', _payout_id, _user_id, _payout.tenant_id,
    jsonb_build_object('amount', _payout.amount, 'pix_key', _payout.pix_key)
  );
END;
$$;

-- 7. Função: rejeitar saque (apenas root_admin) — devolve para balance
CREATE OR REPLACE FUNCTION public.reject_payout(_payout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _payout record;
BEGIN
  IF NOT public.is_root_admin(_user_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO _payout FROM public.payouts WHERE id = _payout_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payout not found';
  END IF;

  IF _payout.status <> 'pending' THEN
    RAISE EXCEPTION 'Payout já processado';
  END IF;

  UPDATE public.payouts
  SET status = 'rejected',
      processed_at = now(),
      processed_by = _user_id
  WHERE id = _payout_id;

  -- Devolve do blocked para o balance
  UPDATE public.wallets
  SET blocked_balance = blocked_balance - _payout.amount,
      balance = balance + _payout.amount,
      updated_at = now()
  WHERE id = _payout.wallet_id;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, tenant_id, payload)
  VALUES (
    'payout_rejected', 'payout', _payout_id, _user_id, _payout.tenant_id,
    jsonb_build_object('amount', _payout.amount, 'pix_key', _payout.pix_key)
  );
END;
$$;

-- 8. Política para root_admin ver todos os payouts (já existe policy "Tenant admins can manage payouts" mas filtra por tenant)
DROP POLICY IF EXISTS "Root admins can view all payouts" ON public.payouts;
CREATE POLICY "Root admins can view all payouts"
  ON public.payouts FOR SELECT
  USING (public.is_root_admin(auth.uid()));