import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TIMEZONES_DISPONIVEIS } from "../constants/constantes_timezones";

export function SecaoRegras() {
  const { usuario } = useAutenticacao();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [modoDespacho, setModoDespacho] = useState("auto");
  const [raio, setRaio] = useState(10);
  const [timeout, setTimeout_] = useState(60);
  const [tentativas, setTentativas] = useState(3);
  const [permitirPrecos, setPermitirPrecos] = useState(false);
  const [permitirOfertas, setPermitirOfertas] = useState(false);
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    carregar();
  }, [usuario]);

  async function carregar() {
    const { data: perfil } = await supabase.from("users").select("tenant_id").eq("id", usuario!.id).single();
    if (!perfil) return;
    setTenantId(perfil.tenant_id);

    const { data } = await supabase.from("tenant_settings").select("*").eq("tenant_id", perfil.tenant_id).single();
    if (data) {
      setModoDespacho(data.dispatch_mode);
      setRaio(data.dispatch_radius_km);
      setTimeout_(data.dispatch_timeout_sec);
      setTentativas(data.dispatch_max_attempts);
      setPermitirPrecos(data.allow_driver_pricing);
      setPermitirOfertas(data.allow_offers);
      setTimezone(data.timezone ?? "America/Sao_Paulo");
    }
  }

  async function salvar() {
    if (!tenantId) return;
    setSalvando(true);
    try {
      await supabase.from("tenant_settings").update({
        dispatch_mode: modoDespacho as "auto" | "manual" | "hybrid",
        dispatch_radius_km: raio,
        dispatch_timeout_sec: timeout,
        dispatch_max_attempts: tentativas,
        allow_driver_pricing: permitirPrecos,
        allow_offers: permitirOfertas,
        timezone,
      }).eq("tenant_id", tenantId);
      toast.success("Regras atualizadas");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <Label>Modo de despacho</Label>
        <Select value={modoDespacho} onValueChange={setModoDespacho}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Prioridade ao dono do link</SelectItem>
            <SelectItem value="manual">Por proximidade</SelectItem>
            <SelectItem value="hybrid">Para todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Raio de despacho: {raio} km</Label>
        <Slider value={[raio]} onValueChange={([v]) => setRaio(v)} min={1} max={50} step={1} />
      </div>

      <div className="space-y-2">
        <Label>Tempo para o motorista responder: {timeout}s (recomendado 60-180s)</Label>
        <Slider value={[timeout]} onValueChange={([v]) => setTimeout_(v)} min={30} max={180} step={5} />
      </div>

      <div className="space-y-2">
        <Label>Tentativas maximas: {tentativas}</Label>
        <Slider value={[tentativas]} onValueChange={([v]) => setTentativas(v)} min={1} max={10} step={1} />
      </div>

      <div className="flex items-center justify-between">
        <Label>Permitir precos personalizados por motorista</Label>
        <Switch checked={permitirPrecos} onCheckedChange={setPermitirPrecos} />
      </div>

      <div className="flex items-center justify-between">
        <Label>Permitir ofertas de passageiros</Label>
        <Switch checked={permitirOfertas} onCheckedChange={setPermitirOfertas} />
      </div>

      <Button onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar regras"}
      </Button>
    </div>
  );
}
