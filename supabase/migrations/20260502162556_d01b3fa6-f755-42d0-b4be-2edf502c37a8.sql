CREATE OR REPLACE FUNCTION public.trg_audit_commission_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _action text;
  _payload jsonb;
  _entity_id uuid;
  _tenant_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _action := 'commission_rule_created';
    _entity_id := NEW.id;
    _tenant_id := NEW.tenant_id;
    _payload := jsonb_build_object(
      'category_id', NEW.category_id,
      'comissao_cobertura_pct', NEW.comissao_cobertura_pct,
      'comissao_indicacao_pct', NEW.comissao_indicacao_pct,
      'comissao_fixa_brl', NEW.comissao_fixa_brl,
      'ativo', NEW.ativo
    );
  ELSIF TG_OP = 'UPDATE' THEN
    _action := 'commission_rule_updated';
    _entity_id := NEW.id;
    _tenant_id := NEW.tenant_id;
    _payload := jsonb_build_object(
      'category_id', NEW.category_id,
      'before', jsonb_build_object(
        'comissao_cobertura_pct', OLD.comissao_cobertura_pct,
        'comissao_indicacao_pct', OLD.comissao_indicacao_pct,
        'comissao_fixa_brl', OLD.comissao_fixa_brl,
        'ativo', OLD.ativo
      ),
      'after', jsonb_build_object(
        'comissao_cobertura_pct', NEW.comissao_cobertura_pct,
        'comissao_indicacao_pct', NEW.comissao_indicacao_pct,
        'comissao_fixa_brl', NEW.comissao_fixa_brl,
        'ativo', NEW.ativo
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    _action := 'commission_rule_deleted';
    _entity_id := OLD.id;
    _tenant_id := OLD.tenant_id;
    _payload := jsonb_build_object(
      'category_id', OLD.category_id,
      'comissao_cobertura_pct', OLD.comissao_cobertura_pct,
      'comissao_indicacao_pct', OLD.comissao_indicacao_pct,
      'comissao_fixa_brl', OLD.comissao_fixa_brl,
      'ativo', OLD.ativo
    );
  END IF;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, tenant_id, user_id, payload)
  VALUES (_action, 'commission_rule', _entity_id, _tenant_id, auth.uid(), _payload);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_audit_commission_rules_ins ON public.commission_rules;
DROP TRIGGER IF EXISTS trg_audit_commission_rules_upd ON public.commission_rules;
DROP TRIGGER IF EXISTS trg_audit_commission_rules_del ON public.commission_rules;

CREATE TRIGGER trg_audit_commission_rules_ins
AFTER INSERT ON public.commission_rules
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_commission_rules();

CREATE TRIGGER trg_audit_commission_rules_upd
AFTER UPDATE ON public.commission_rules
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_commission_rules();

CREATE TRIGGER trg_audit_commission_rules_del
AFTER DELETE ON public.commission_rules
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_commission_rules();

-- Garante unicidade de regra por categoria/tenant para evitar duplicação
CREATE UNIQUE INDEX IF NOT EXISTS uq_commission_rules_tenant_category
ON public.commission_rules (tenant_id, category_id);