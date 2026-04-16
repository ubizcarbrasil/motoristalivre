import { Star } from "lucide-react";
import type { AvaliacaoEnviada } from "../types/tipos_perfil_passageiro";

interface ListaAvaliacoesEnviadasProps {
  avaliacoes: AvaliacaoEnviada[];
}

function ItemAvaliacao({ avaliacao }: { avaliacao: AvaliacaoEnviada }) {
  const inicial = avaliacao.motorista_nome.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="rounded-xl bg-card border border-border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0">
          {avaliacao.motorista_avatar ? (
            <img
              src={avaliacao.motorista_avatar}
              alt={avaliacao.motorista_nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-foreground">{inicial}</span>
          )}
        </div>
        <p className="text-xs font-medium text-foreground truncate flex-1">
          {avaliacao.motorista_nome}
        </p>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {new Date(avaliacao.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < avaliacao.rating ? "text-primary fill-primary" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>

      {avaliacao.comment && (
        <p className="text-xs text-muted-foreground leading-snug">{avaliacao.comment}</p>
      )}
    </div>
  );
}

export function ListaAvaliacoesEnviadas({ avaliacoes }: ListaAvaliacoesEnviadasProps) {
  if (avaliacoes.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-6 text-center">
        Você ainda não enviou avaliações
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {avaliacoes.map((a) => (
        <ItemAvaliacao key={a.id} avaliacao={a} />
      ))}
    </div>
  );
}
