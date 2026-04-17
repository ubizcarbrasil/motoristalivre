import { Check, ChevronDown, Crown, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TriboMotorista } from "../types/tipos_tribos";

interface SeletorTriboProps {
  tribos: TriboMotorista[];
  triboAtivaId: string | null;
  onSelecionar: (id: string) => void;
}

export function SeletorTribo({ tribos, triboAtivaId, onSelecionar }: SeletorTriboProps) {
  const ativa = tribos.find((t) => t.id === triboAtivaId) ?? tribos[0];
  if (!ativa) return null;

  // Se só tem uma tribo, mostra como label estático (sem dropdown)
  if (tribos.length === 1) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs">
        {ativa.papel === "dono" ? (
          <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
        ) : (
          <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="font-medium text-foreground truncate">{ativa.nome}</span>
        {ativa.papel === "dono" && (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-primary font-semibold">
            Admin
          </span>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:border-primary/40 transition-colors"
        >
          {ativa.papel === "dono" ? (
            <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
          ) : (
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="font-medium text-foreground truncate">{ativa.nome}</span>
          {ativa.papel === "dono" && (
            <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">
              Admin
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        {tribos.map((t) => {
          const ativo = t.id === ativa.id;
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => onSelecionar(t.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {t.papel === "dono" ? (
                <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="flex-1 truncate">{t.nome}</span>
              {t.papel === "dono" && (
                <span className="text-[9px] uppercase tracking-wide text-primary font-semibold">
                  Admin
                </span>
              )}
              {ativo && <Check className="w-3.5 h-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
