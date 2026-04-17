import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import type { TenantOpcao, MotoristaOpcao } from "../types/tipos_simulador";

interface Props {
  tenants: TenantOpcao[];
  motoristas: MotoristaOpcao[];
  tenantId: string;
  setTenantId: (v: string) => void;
  motoristaId: string;
  setMotoristaId: (v: string) => void;
  origem: string;
  setOrigem: (v: string) => void;
  destino: string;
  setDestino: (v: string) => void;
  valor: number;
  setValor: (v: number) => void;
  distanciaKm: number;
  setDistanciaKm: (v: number) => void;
  duracaoMin: number;
  setDuracaoMin: (v: number) => void;
  enviando: boolean;
  carregandoTenants: boolean;
  onDisparar: () => void;
}

export function FormularioSimulacao({
  tenants,
  motoristas,
  tenantId,
  setTenantId,
  motoristaId,
  setMotoristaId,
  origem,
  setOrigem,
  destino,
  setDestino,
  valor,
  setValor,
  distanciaKm,
  setDistanciaKm,
  duracaoMin,
  setDuracaoMin,
  enviando,
  carregandoTenants,
  onDisparar,
}: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-2">
        <Label>Grupo (tenant)</Label>
        <Select value={tenantId} onValueChange={setTenantId} disabled={carregandoTenants}>
          <SelectTrigger>
            <SelectValue placeholder={carregandoTenants ? "Carregando..." : "Selecione um grupo"} />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} <span className="text-muted-foreground">/{t.slug}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Motorista alvo</Label>
        <Select value={motoristaId} onValueChange={setMotoristaId} disabled={!motoristas.length}>
          <SelectTrigger>
            <SelectValue placeholder={motoristas.length ? "Selecione" : "Sem motoristas no grupo"} />
          </SelectTrigger>
          <SelectContent>
            {motoristas.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <span className={m.is_online ? "" : "text-muted-foreground"}>
                  {m.is_online ? "🟢" : "⚪"} {m.nome}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Apenas motoristas online recebem o card visualmente.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <Label htmlFor="origem">Origem</Label>
          <Input id="origem" value={origem} onChange={(e) => setOrigem(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destino">Destino</Label>
          <Input id="destino" value={destino} onChange={(e) => setDestino(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input id="valor" type="number" step="0.5" value={valor} onChange={(e) => setValor(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dist">Distância (km)</Label>
          <Input id="dist" type="number" step="0.1" value={distanciaKm} onChange={(e) => setDistanciaKm(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dur">Duração (min)</Label>
          <Input id="dur" type="number" step="1" value={duracaoMin} onChange={(e) => setDuracaoMin(Number(e.target.value))} />
        </div>
      </div>

      <Button onClick={onDisparar} disabled={enviando || !tenantId || !motoristaId} className="w-full h-11 gap-2">
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Disparar corrida fake
      </Button>
    </div>
  );
}
