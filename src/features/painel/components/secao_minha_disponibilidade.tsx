import { useEffect, useState } from "react";
import { Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { atualizarAceitandoAgendamentos } from "@/features/servicos/services/servico_servicos";
import type { DisponibilidadeProfissional } from "@/features/servicos/types/tipos_servicos";
import { EditorDisponibilidadeSemanal } from "./editor_disponibilidade_semanal";
import { BloqueiosAgenda } from "./bloqueios_agenda";

interface Props {
  driverId: string;
  tenantId: string;
  blocos: DisponibilidadeProfissional[];
  onAtualizar: () => void;
}

export function SecaoMinhaDisponibilidade({
  driverId,
  tenantId,
  blocos,
  onAtualizar,
}: Props) {
  const [aceitando, setAceitando] = useState(true);
  const [carregandoToggle, setCarregandoToggle] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const { data } = await supabase
        .from("drivers")
        .select("accepting_bookings")
        .eq("id", driverId)
        .maybeSingle();
      if (!cancelado) {
        setAceitando(((data as any)?.accepting_bookings ?? true) as boolean);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [driverId]);

  const alternarAceitando = async (valor: boolean) => {
    setCarregandoToggle(true);
    try {
      await atualizarAceitandoAgendamentos(driverId, valor);
      setAceitando(valor);
      toast.success(valor ? "Agenda ativada" : "Agenda pausada");
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setCarregandoToggle(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Kill switch */}
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
          aceitando ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5"
        }`}
      >
        <div className="flex items-center gap-2">
          <Power className={`w-4 h-4 ${aceitando ? "text-primary" : "text-destructive"}`} />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {aceitando ? "Aceitando agendamentos" : "Agenda pausada"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {aceitando
                ? "Clientes podem agendar nos seus horários."
                : "Ninguém consegue agendar até você reativar."}
            </p>
          </div>
        </div>
        <Switch
          checked={aceitando}
          disabled={carregandoToggle}
          onCheckedChange={alternarAceitando}
        />
      </div>

      <EditorDisponibilidadeSemanal
        driverId={driverId}
        tenantId={tenantId}
        blocosIniciais={blocos}
        onSalvo={onAtualizar}
      />

      <BloqueiosAgenda driverId={driverId} tenantId={tenantId} />
    </div>
  );
}
