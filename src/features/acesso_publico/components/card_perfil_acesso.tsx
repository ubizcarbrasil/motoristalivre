import { Link } from "react-router-dom";
import { ArrowRight, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CardPerfilAcesso } from "../types/tipos_acesso_perfil";

interface Props {
  perfil: CardPerfilAcesso;
}

export function CardPerfilAcesso({ perfil }: Props) {
  const { titulo, descricao, Icone, acessoCaminho, cadastroCaminho, observacao } = perfil;

  return (
    <article className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:gap-5 sm:p-6">
      <header className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:h-12 sm:w-12">
          <Icone className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">{titulo}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>
        </div>
      </header>

      <div className="mt-auto flex flex-col gap-2">
        <Button asChild className="w-full justify-between">
          <Link to={acessoCaminho}>
            Entrar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        {cadastroCaminho ? (
          <Button asChild variant="outline" className="w-full justify-between">
            <Link to={cadastroCaminho}>
              Criar conta
              <UserPlus className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Acesso restrito — não há cadastro público.</span>
          </div>
        )}

        {observacao && cadastroCaminho && (
          <p className="text-xs text-muted-foreground">{observacao}</p>
        )}
      </div>
    </article>
  );
}
