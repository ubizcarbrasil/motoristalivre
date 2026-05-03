import { useState } from "react";
import { Crown, Users, Copy, Check, ExternalLink, LogOut, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { TriboMotorista } from "../types/tipos_tribos";
import { montarLinkRecrutamento, sairDaTribo } from "../services/servico_minhas_tribos";

interface SecaoMinhasTribosProps {
  tribos: TriboMotorista[];
  onAtualizar: () => void;
}

export function SecaoMinhasTribos({ tribos, onAtualizar }: SecaoMinhasTribosProps) {
  if (!tribos.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Você ainda não pertence a nenhuma tribo.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Minhas tribos</h3>
      </div>
      <div className="space-y-2">
        {tribos.map((t) => (
          <CardTribo key={t.id} tribo={t} onAtualizar={onAtualizar} />
        ))}
      </div>
    </div>
  );
}

function CardTribo({ tribo, onAtualizar }: { tribo: TriboMotorista; onAtualizar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const ehDono = tribo.papel === "dono";
  const link = tribo.signupSlug ? montarLinkRecrutamento(tribo.signupSlug) : null;

  async function copiar() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    toast.success("Link copiado");
    setTimeout(() => setCopiado(false), 1800);
  }

  async function handleSair() {
    setSaindo(true);
    try {
      await sairDaTribo(tribo.id);
      toast.success(`Você saiu de "${tribo.nome}"`);
      onAtualizar();
    } catch (err: any) {
      const msg = err?.message?.includes("owner_cannot_leave")
        ? "Donos não podem sair da própria tribo."
        : "Não foi possível sair desta tribo.";
      toast.error(msg);
    } finally {
      setSaindo(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
      <div className="flex items-start gap-2">
        {ehDono ? (
          <Crown className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        ) : (
          <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate">{tribo.nome}</span>
            {tribo.ehPrincipal && (
              <span className="text-[9px] uppercase tracking-wide bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                Principal
              </span>
            )}
            <span
              className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                ehDono
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {ehDono ? "Dono" : "Membro"}
            </span>
          </div>
          {tribo.categoriaNome && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{tribo.categoriaNome}</p>
          )}
        </div>
      </div>

      {ehDono && link && (
        <div className="rounded-md border border-border/60 bg-background/40 p-2 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Link2 className="w-3 h-3" />
            Link de recrutamento
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] text-foreground/90 truncate bg-secondary/60 rounded px-2 py-1.5">
              {link}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copiar}
              className="h-8 px-2 shrink-0"
            >
              {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => window.open(link, "_blank")}
              className="h-8 px-2 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {ehDono && !link && (
        <p className="text-[11px] text-muted-foreground">
          Configure a categoria principal da tribo para gerar o link de recrutamento.
        </p>
      )}

      {!ehDono && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              disabled={saindo}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sair desta tribo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sair de "{tribo.nome}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Você deixará de receber agendamentos e indicações desta tribo. Pode entrar
                novamente pelo link do dono a qualquer momento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSair}>Sair</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
