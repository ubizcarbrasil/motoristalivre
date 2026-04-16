import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import type { AfiliadoPerfil, StatsAfiliado, CorridaAfiliado } from "../types/tipos_afiliado";

export function useAfiliado() {
  const { usuario } = useAutenticacao();
  const [perfil, setPerfil] = useState<AfiliadoPerfil | null>(null);
  const [stats, setStats] = useState<StatsAfiliado>({ corridasGeradas: 0, ganhosTotal: 0, saldoAtual: 0 });
  const [corridas, setCorridas] = useState<CorridaAfiliado[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    try {
      const userId = usuario!.id;

      const { data: afiliado } = await supabase
        .from("affiliates")
        .select("id, slug, business_name, business_type, is_approved, tenant_id")
        .eq("id", userId)
        .single();

      if (!afiliado) return;

      const { data: tenant } = await supabase
        .from("tenants")
        .select("name, slug")
        .eq("id", afiliado.tenant_id)
        .single();

      setPerfil({
        id: afiliado.id,
        slug: afiliado.slug,
        nomeEstabelecimento: afiliado.business_name,
        tipo: afiliado.business_type,
        aprovado: afiliado.is_approved,
        tenantNome: tenant?.name || "",
        tenantSlug: tenant?.slug || "",
      });

      // Buscar corridas geradas pelo afiliado
      const { data: rides } = await supabase
        .from("rides")
        .select("id, driver_id, price_paid, created_at, ride_request_id")
        .eq("origin_affiliate_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      const corridasData = rides || [];

      // Buscar comissões
      const { data: comissoes } = await supabase
        .from("commissions")
        .select("ride_id, amount")
        .eq("tenant_id", afiliado.tenant_id)
        .eq("commission_type", "affiliate");

      const comissaoMap = new Map((comissoes || []).map((c) => [c.ride_id, c.amount]));

      // Buscar nomes de motoristas
      const driverIds = [...new Set(corridasData.map((r) => r.driver_id))];
      const { data: drivers } = driverIds.length > 0
        ? await supabase.from("users").select("id, full_name").in("id", driverIds)
        : { data: [] };

      // Buscar enderecos das corridas
      const requestIds = corridasData.map((r) => r.ride_request_id);
      const { data: requests } = requestIds.length > 0
        ? await supabase.from("ride_requests").select("id, origin_address, dest_address").in("id", requestIds)
        : { data: [] };

      const ganhosTotal = corridasData.reduce((acc, r) => acc + (comissaoMap.get(r.id) || 0), 0);

      setStats({
        corridasGeradas: corridasData.length,
        ganhosTotal,
        saldoAtual: 0,
      });

      setCorridas(
        corridasData.map((r) => {
          const driver = drivers?.find((d) => d.id === r.driver_id);
          const req = requests?.find((rr) => rr.id === r.ride_request_id);
          return {
            id: r.id,
            origemEndereco: req?.origin_address || null,
            destinoEndereco: req?.dest_address || null,
            motoristaNome: driver?.full_name || null,
            data: r.created_at,
            comissao: comissaoMap.get(r.id) || 0,
          };
        })
      );

      // Buscar saldo da carteira
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("owner_id", userId)
        .eq("owner_type", "affiliate")
        .single();

      if (wallet) {
        setSaldo(wallet.balance);
        setStats((prev) => ({ ...prev, saldoAtual: wallet.balance }));
      }
    } finally {
      setCarregando(false);
    }
  }

  return { perfil, stats, corridas, saldo, carregando };
}
