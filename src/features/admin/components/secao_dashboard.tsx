import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Car, Percent, Users, Wifi, Calendar, Briefcase } from "lucide-react";

interface Stat {
  label: string;
  valor: string;
  icone: React.ElementType;
}

export function SecaoDashboard() {
  const { usuario } = useAutenticacao();
  const [stats, setStats] = useState<Stat[]>([]);
  const [motoristasOnline, setMotoristasOnline] = useState<{ nome: string; corridas: number; faturamento: number }[]>([]);
  const [afiliadosAtivos, setAfiliadosAtivos] = useState<{ nome: string; corridasHoje: number }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoServicos, setModoServicos] = useState(false);
  const [agendamentosHoje, setAgendamentosHoje] = useState(0);
  const [profissionaisAtivos, setProfissionaisAtivos] = useState(0);

  useEffect(() => {
    if (!usuario) return;
    carregarDados();
  }, [usuario]);

  async function carregarDados() {
    try {
      const { data: perfil } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", usuario!.id)
        .single();

      if (!perfil) return;
      const tenantId = perfil.tenant_id;

      // Detecta módulo dominante da tribo
      const { data: tenant } = await supabase
        .from("tenants")
        .select("active_modules")
        .eq("id", tenantId)
        .maybeSingle();
      const modulos = (tenant?.active_modules ?? ["mobility"]) as string[];
      const ehServicos = modulos.includes("services") && !modulos.includes("mobility");
      setModoServicos(ehServicos);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const inicioHoje = hoje.toISOString();
      const fimHoje = new Date(hoje);
      fimHoje.setDate(fimHoje.getDate() + 1);

      const [corridasRes, motoristasRes, afiliadosRes, bookingsRes, servicosRes] = await Promise.all([
        ehServicos
          ? Promise.resolve({ data: [] as any[] })
          : supabase.from("rides").select("price_paid, driver_id").eq("tenant_id", tenantId).gte("created_at", inicioHoje),
        supabase.from("drivers").select("id, slug, is_online").eq("tenant_id", tenantId),
        supabase.from("affiliates").select("id, slug, business_name, is_approved").eq("tenant_id", tenantId).eq("is_approved", true),
        ehServicos
          ? supabase
              .from("service_bookings" as any)
              .select("id, driver_id, price_agreed, status")
              .eq("tenant_id", tenantId)
              .gte("scheduled_at", inicioHoje)
              .lt("scheduled_at", fimHoje.toISOString())
          : Promise.resolve({ data: [] as any[] }),
        ehServicos
          ? supabase
              .from("service_types" as any)
              .select("id, driver_id, is_active")
              .eq("tenant_id", tenantId)
              .eq("is_active", true)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const corridas = (corridasRes.data || []) as any[];
      const motoristas = (motoristasRes.data || []) as any[];
      const afiliados = (afiliadosRes.data || []) as any[];
      const bookings = (bookingsRes.data || []) as any[];
      const servicos = (servicosRes.data || []) as any[];

      const onlineCount = motoristas.filter((m) => m.is_online).length;

      if (ehServicos) {
        const receitaHoje = bookings.reduce((acc, b) => acc + Number(b.price_agreed || 0), 0);
        setAgendamentosHoje(bookings.length);
        setProfissionaisAtivos(servicos.length);
        setStats([
          { label: "Receita hoje", valor: `R$ ${receitaHoje.toFixed(2)}`, icone: DollarSign },
          { label: "Agendamentos hoje", valor: String(bookings.length), icone: Calendar },
          { label: "Serviços ativos", valor: String(servicos.length), icone: Briefcase },
          { label: "Tribo (membros)", valor: String(afiliados.length + motoristas.length), icone: Users },
          { label: "Profissionais online", valor: String(onlineCount), icone: Wifi },
        ]);

        const profissionaisData = motoristas
          .filter((m) => m.is_online)
          .map((m) => {
            const meusBookings = bookings.filter((b) => b.driver_id === m.id);
            return {
              nome: m.slug,
              corridas: meusBookings.length,
              faturamento: meusBookings.reduce((a, b) => a + Number(b.price_agreed || 0), 0),
            };
          });
        setMotoristasOnline(profissionaisData);
      } else {
        const receitaHoje = corridas.reduce((acc, c) => acc + (c.price_paid || 0), 0);
        setStats([
          { label: "Receita hoje", valor: `R$ ${receitaHoje.toFixed(2)}`, icone: DollarSign },
          { label: "Corridas hoje", valor: String(corridas.length), icone: Car },
          { label: "Comissoes hoje", valor: "R$ 0,00", icone: Percent },
          { label: "Afiliados ativos", valor: String(afiliados.length), icone: Users },
          { label: "Motoristas online", valor: String(onlineCount), icone: Wifi },
        ]);

        const motoristasOnlineData = motoristas
          .filter((m) => m.is_online)
          .map((m) => {
            const corridasMotorista = corridas.filter((c) => c.driver_id === m.id);
            return {
              nome: m.slug,
              corridas: corridasMotorista.length,
              faturamento: corridasMotorista.reduce((a, c) => a + (c.price_paid || 0), 0),
            };
          });
        setMotoristasOnline(motoristasOnlineData);
      }

      setAfiliadosAtivos(
        afiliados.map((a) => ({
          nome: a.business_name || a.slug,
          corridasHoje: 0,
        }))
      );
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border bg-card animate-pulse">
              <CardContent className="p-4">
                <div className="h-3 w-20 rounded bg-muted mb-2" />
                <div className="h-6 w-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold text-foreground">{s.valor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-medium text-foreground">Motoristas online</h3>
            {motoristasOnline.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Wifi className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhum motorista online no momento</p>
                <p className="text-xs text-muted-foreground/60">Motoristas aparecem aqui quando ficam online</p>
              </div>
            ) : (
              <div className="space-y-2">
                {motoristasOnline.map((m) => (
                  <div key={m.nome} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                    <span className="text-sm text-foreground">{m.nome}</span>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{m.corridas} corridas</span>
                      <span>R$ {m.faturamento.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-medium text-foreground">Afiliados ativos hoje</h3>
            {afiliadosAtivos.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhum afiliado cadastrado</p>
                <p className="text-xs text-muted-foreground/60">Convide estabelecimentos para gerar corridas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {afiliadosAtivos.map((a) => (
                  <div key={a.nome} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                    <span className="text-sm text-foreground">{a.nome}</span>
                    <span className="text-xs text-muted-foreground">{a.corridasHoje} corridas</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
