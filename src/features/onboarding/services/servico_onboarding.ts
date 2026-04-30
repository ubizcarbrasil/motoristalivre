import { supabase } from "@/integrations/supabase/client";
import type {
  DadosIdentidade,
  DadosConfiguracao,
  DadosServico,
  ModuloPlataforma,
} from "../types/tipos_onboarding";

interface CriarGrupoParams {
  identidade: DadosIdentidade;
  modulos: ModuloPlataforma[];
  planoId: string;
  configuracao: DadosConfiguracao;
  servicos: DadosServico[];
}

function duracaoEmMinutos(servico: DadosServico): number {
  switch (servico.modoCobranca) {
    case "fixed":
      return Math.max(1, Math.round(servico.duracao));
    case "hourly":
      return Math.max(1, Math.round(servico.duracao * 60));
    case "daily":
      return Math.max(1, Math.round(servico.duracao * 1440));
  }
}

export async function criarGrupo({
  identidade,
  modulos,
  planoId,
  configuracao,
  servicos,
}: CriarGrupoParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario nao autenticado");

  // Criar tenant + user atomicamente via RPC
  const { data: tenantId, error: erroTenant } = await supabase.rpc(
    "create_tenant_with_owner" as any,
    {
      _name: identidade.nome,
      _slug: identidade.subdominio,
      _plan_id: planoId || null,
    }
  );

  if (erroTenant || !tenantId) throw erroTenant || new Error("Erro ao criar grupo");

  // Atualizar módulos ativos
  const modulosFinais = modulos.length > 0 ? modulos : (["mobility"] as ModuloPlataforma[]);
  await supabase
    .from("tenants")
    .update({ active_modules: modulosFinais } as any)
    .eq("id", tenantId);

  // Criar branding
  await supabase.from("tenant_branding").insert({
    tenant_id: tenantId,
    city: identidade.cidade || null,
    description: identidade.descricao || null,
    whatsapp: identidade.whatsapp || null,
    logo_url: identidade.logoUrl || null,
    cover_url: identidade.capaUrl || null,
  });

  // Criar settings (mantém defaults de mobilidade quando módulo não está ativo)
  await supabase.from("tenant_settings").insert({
    tenant_id: tenantId,
    dispatch_mode: configuracao.modoDespacho,
    base_fare: configuracao.bandeira,
    price_per_km: configuracao.precoPorKm,
    price_per_min: configuracao.precoPorMin,
    transbordo_commission: configuracao.comissaoTransbordo,
    cashback_pct: configuracao.cashbackPadrao,
  });

  // Criar subscription
  if (planoId) {
    await supabase.from("subscriptions").insert({
      tenant_id: tenantId,
      plan_id: planoId,
      status: "active",
    });
  }

  // Criar service_types se módulo Serviços ativo
  if (modulosFinais.includes("services") && servicos.length > 0) {
    const linhas = servicos
      .filter((s) => s.nome.trim().length > 0 && s.preco > 0)
      .map((s) => {
        const depositoEnabled = s.depositoAtivo;
        const depositoPercent =
          depositoEnabled && s.depositoTipo === "percent" ? s.depositoPct : null;
        const depositoAmount =
          depositoEnabled && s.depositoTipo === "value" ? s.depositoValor : null;
        return {
          tenant_id: tenantId,
          driver_id: user.id,
          name: s.nome.trim(),
          description: s.descricao.trim() || null,
          price: s.preco,
          duration_minutes: duracaoEmMinutos(s),
          pricing_mode: s.modoCobranca,
          deposit_enabled: depositoEnabled,
          deposit_percent: depositoPercent,
          deposit_amount: depositoAmount,
          is_active: true,
          is_immediate: false,
        };
      });

    if (linhas.length > 0) {
      const { error: erroServicos } = await supabase
        .from("service_types")
        .insert(linhas as any);
      if (erroServicos) {
        console.error("[onboarding] erro ao criar service_types:", erroServicos);
        // não bloqueia o onboarding
      }
    }
  }

  return tenantId;
}
