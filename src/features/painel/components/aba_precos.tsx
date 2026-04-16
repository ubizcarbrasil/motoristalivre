import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { buscarConfigPrecoTenant } from "../services/servico_painel";
import type { PerfilMotorista } from "../types/tipos_painel";

interface AbaPrecosProps {
  perfil: PerfilMotorista;
  tenantId: string;
  onVoltar: () => void;
  onAtualizar: (p: PerfilMotorista) => void;
}

export function AbaPrecos({ perfil, tenantId, onVoltar, onAtualizar }: AbaPrecosProps) {
  const [bandeira, setBandeira] = useState(perfil.custom_base_fare ?? 5);
  const [km, setKm] = useState(perfil.custom_price_per_km ?? 2);
  const [min, setMin] = useState(perfil.custom_price_per_min ?? 0.5);
  const [cashback, setCashback] = useState(perfil.cashback_pct);
  const [permitido, setPermitido] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarConfigPrecoTenant(tenantId).then((config) => {
      if (config) {
        setPermitido(config.allow_driver_pricing);
        if (!perfil.custom_base_fare) setBandeira(config.base_fare);
        if (!perfil.custom_price_per_km) setKm(config.price_per_km);
        if (!perfil.custom_price_per_min) setMin(config.price_per_min);
      }
    });
  }, [tenantId, perfil]);

  // Simulação ao vivo
  const simulacao = useMemo(() => {
    const distancias = [3, 5, 10, 20];
    return distancias.map((d) => {
      const tempo = Math.ceil(d * 2.5);
      const preco = bandeira + d * km + tempo * min;
      const cashbackVal = preco * (cashback / 100);
      return { km: d, min: tempo, preco, cashback: cashbackVal };
    });
  }, [bandeira, km, min, cashback]);

  const salvar = async () => {
    setSalvando(true);
    try {
      await supabase.from("drivers").update({
        custom_base_fare: bandeira,
        custom_price_per_km: km,
        custom_price_per_min: min,
        cashback_pct: cashback,
      }).eq("id", perfil.id);

      onAtualizar({
        ...perfil,
        custom_base_fare: bandeira,
        custom_price_per_km: km,
        custom_price_per_min: min,
        cashback_pct: cashback,
      });
      toast.success("Preços atualizados");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pt-12 pb-20 px-5 space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onVoltar} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">Preços</h2>
      </div>

      {!permitido && (
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">
            Preços personalizados estão desativados pelo administrador do grupo. Os valores abaixo são os padrões aplicados.
          </p>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bandeira (R$)</Label>
            <span className="text-sm font-semibold text-foreground">R${bandeira.toFixed(2).replace(".", ",")}</span>
          </div>
          <Slider
            value={[bandeira]}
            onValueChange={([v]) => setBandeira(v)}
            min={0}
            max={20}
            step={0.5}
            disabled={!permitido}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Preço por km (R$)</Label>
            <span className="text-sm font-semibold text-foreground">R${km.toFixed(2).replace(".", ",")}</span>
          </div>
          <Slider
            value={[km]}
            onValueChange={([v]) => setKm(v)}
            min={0.5}
            max={10}
            step={0.1}
            disabled={!permitido}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Preço por minuto (R$)</Label>
            <span className="text-sm font-semibold text-foreground">R${min.toFixed(2).replace(".", ",")}</span>
          </div>
          <Slider
            value={[min]}
            onValueChange={([v]) => setMin(v)}
            min={0.1}
            max={5}
            step={0.1}
            disabled={!permitido}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cashback">Cashback para passageiro (%)</Label>
          <Input
            id="cashback"
            type="number"
            min={0}
            max={30}
            value={cashback}
            onChange={(e) => setCashback(Number(e.target.value))}
            disabled={!permitido}
          />
        </div>
      </div>

      {/* Simulação */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Simulação</p>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-4 text-[10px] font-semibold text-muted-foreground px-3 py-2 border-b border-border">
            <span>Dist.</span>
            <span>Tempo</span>
            <span>Preço</span>
            <span>Cashback</span>
          </div>
          {simulacao.map((s) => (
            <div key={s.km} className="grid grid-cols-4 text-xs text-foreground px-3 py-2 border-b border-border last:border-0">
              <span>{s.km}km</span>
              <span>{s.min}min</span>
              <span className="font-semibold">R${s.preco.toFixed(2).replace(".", ",")}</span>
              <span className="text-primary">R${s.cashback.toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
        </div>
      </div>

      {permitido && (
        <Button onClick={salvar} disabled={salvando} className="w-full h-11">
          {salvando ? "Salvando..." : "Salvar preços"}
        </Button>
      )}
    </div>
  );
}
