import { useEffect, useState } from "react";
import { Users, Plus, Trash2, Loader2, ShieldCheck, Search, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { MembroEquipe } from "@/features/motorista/types/tipos_vitrine";
import {
  listarEquipeAdmin,
  buscarCandidatosEquipe,
  adicionarMembroEquipe,
  removerMembroEquipe,
  type CandidatoEquipe,
} from "../services/servico_vitrine_admin";
import { DialogoEspelhamento } from "./dialogo_espelhamento";

interface Props {
  driverId: string;
  tenantId: string;
}

export function SecaoEquipeAdmin({ driverId, tenantId }: Props) {
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [candidatos, setCandidatos] = useState<CandidatoEquipe[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [headlineMap, setHeadlineMap] = useState<Record<string, string>>({});
  const [espelhamento, setEspelhamento] = useState<{ id: string; nome: string } | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    supabase
      .from("tenants")
      .select("slug")
      .eq("id", tenantId)
      .maybeSingle()
      .then(({ data }) => {
        if (ativo) setTenantSlug((data as any)?.slug ?? null);
      });
    return () => {
      ativo = false;
    };
  }, [tenantId]);

  const copiarLinkIndicacao = async (m: MembroEquipe) => {
    if (!tenantSlug) {
      toast.error("Aguarde, carregando dados do grupo...");
      return;
    }
    const url = `${window.location.origin}/s/${tenantSlug}/a/${m.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link de indicação copiado!", {
        description: `Compartilhe este link para indicar ${m.nome}.`,
      });
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const carregar = async () => {
    setCarregando(true);
    try {
      setMembros(await listarEquipeAdmin(driverId));
    } catch {
      toast.error("Erro ao carregar equipe");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  useEffect(() => {
    if (!aberto) return;
    let ativo = true;
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const lista = await buscarCandidatosEquipe(tenantId, driverId, termo);
        if (ativo) setCandidatos(lista);
      } finally {
        if (ativo) setBuscando(false);
      }
    }, 250);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
  }, [aberto, termo, tenantId, driverId]);

  const adicionar = async (cand: CandidatoEquipe) => {
    try {
      await adicionarMembroEquipe({
        owner_driver_id: driverId,
        member_driver_id: cand.id,
        tenant_id: tenantId,
        headline: headlineMap[cand.id]?.trim() || null,
        ordem: membros.length,
      });
      toast.success("Membro adicionado");
      setAberto(false);
      setTermo("");
      setHeadlineMap({});
      await carregar();
      // Após adicionar, oferece envio do convite de espelhamento
      setEspelhamento({ id: cand.id, nome: cand.nome });
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao adicionar");
    }
  };

  const remover = async (m: MembroEquipe) => {
    if (!confirm(`Remover ${m.nome} da equipe?`)) return;
    try {
      await removerMembroEquipe(m.id);
      setMembros((lista) => lista.filter((x) => x.id !== m.id));
      toast.success("Removido");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Minha equipe</h3>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAberto(true)}>
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Indique outros profissionais do seu grupo. Eles aparecem na sua vitrine pública.
      </p>

      {carregando ? (
        <div className="rounded-xl bg-card border border-border p-4 flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : membros.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Nenhum membro adicionado ainda.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {membros.map((m) => (
            <div
              key={m.id}
              className="rounded-xl bg-card border border-border p-3 flex items-center gap-3"
            >
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-secondary">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.nome} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                    {m.nome.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{m.nome}</p>
                  {m.credential_verified && (
                    <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {m.headline ?? `/${m.slug}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copiarLinkIndicacao(m)}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Copiar link de indicação"
                title="Copiar link de indicação"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => remover(m)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou slug"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {buscando ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : candidatos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Nenhum profissional disponível.
                </p>
              ) : (
                candidatos.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg bg-card border border-border p-2.5 space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden bg-secondary">
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.nome} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                            {c.nome.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">/{c.slug}</p>
                      </div>
                      <Button size="sm" onClick={() => adicionar(c)}>
                        Adicionar
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`hl_${c.id}`} className="text-[10px] text-muted-foreground">
                        Função (opcional)
                      </Label>
                      <Input
                        id={`hl_${c.id}`}
                        value={headlineMap[c.id] ?? ""}
                        onChange={(e) =>
                          setHeadlineMap((m) => ({ ...m, [c.id]: e.target.value }))
                        }
                        placeholder="Ex: Manicure, Eletricista..."
                        maxLength={60}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {espelhamento && (
        <DialogoEspelhamento
          aberto={!!espelhamento}
          onFechar={() => setEspelhamento(null)}
          tenantId={tenantId}
          ownerDriverId={driverId}
          membroId={espelhamento.id}
          membroNome={espelhamento.nome}
        />
      )}
    </div>
  );
}
