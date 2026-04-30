import { useState, useEffect, useMemo } from "react";
import { MemoryRouter } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, ShieldCheck, Eye, Loader2, RefreshCw, ExternalLink, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useHookPreviewVitrine } from "../hooks/hook_preview_vitrine";
import { SecaoCategoriasPortfolio } from "@/features/motorista/components/secao_categorias_portfolio";
import { ChipsCategorias } from "@/features/motorista/components/chips_categorias";
import { SecaoEquipePublica } from "@/features/motorista/components/secao_equipe_publica";

interface Props {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  driverId: string;
}

export function PreviewVitrine({ aberto, onAbertoChange, driverId }: Props) {
  const { dados, servicos, portfolio, equipe, carregando, recarregar } =
    useHookPreviewVitrine(driverId, aberto);

  const ofereceServico =
    dados?.professional_type === "service_provider" || dados?.professional_type === "both";

  // Estado de seleção de categorias do header (vazio = todas)
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const categoriasDisponiveis = useMemo(
    () => dados?.service_categories ?? [],
    [dados?.service_categories],
  );

  // Reset seleção quando categorias disponíveis mudam (ex: realtime)
  useEffect(() => {
    setSelecionadas((atual) => atual.filter((c) => categoriasDisponiveis.includes(c)));
  }, [categoriasDisponiveis]);

  const alternarCategoria = (categoria: string) => {
    setSelecionadas((atual) =>
      atual.includes(categoria)
        ? atual.filter((c) => c !== categoria)
        : [...atual, categoria],
    );
  };

  const urlPublica = dados ? `/${dados.tenant_slug}/${dados.slug}/perfil` : "#";

  const iniciais = dados?.nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";

  return (
    <Sheet open={aberto} onOpenChange={onAbertoChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-background border-border flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Vitrine ao vivo
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => recarregar()}
                aria-label="Atualizar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${carregando ? "animate-spin" : ""}`} />
              </Button>
              {dados && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(urlPublica, "_blank")}
                  aria-label="Abrir em nova aba"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground text-left">
            Como os clientes veem seu perfil. Atualiza automaticamente.
          </p>
        </SheetHeader>

        {carregando && !dados ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : !dados ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <p className="text-sm text-muted-foreground text-center">
              Não foi possível carregar a vitrine.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Frame de mockup mobile */}
            <div className="px-4 py-4">
              <div className="rounded-2xl border-2 border-border bg-card overflow-hidden shadow-lg">
                <div className="flex items-center justify-center gap-1 py-1.5 bg-muted/30 border-b border-border">
                  <Smartphone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Pré-visualização mobile
                  </span>
                </div>

                <MemoryRouter><div className="bg-background">
                  {/* Cabeçalho */}
                  <div className="px-5 py-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16 border-2 border-primary">
                        <AvatarImage src={dados.avatar_url ?? undefined} />
                        <AvatarFallback>{iniciais}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {dados.nome}
                          </h3>
                          {dados.is_verified && (
                            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                          )}
                          {dados.credential_verified && (
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{dados.tenant_slug}/{dados.slug}
                        </p>
                      </div>
                    </div>

                    {dados.bio && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {dados.bio}
                      </p>
                    )}

                    {/* Categorias visíveis (interativas no preview) */}
                    {ofereceServico && categoriasDisponiveis.length > 0 && (
                      <div className="-mx-5">
                        <ChipsCategorias
                          categorias={categoriasDisponiveis}
                          selecionadas={selecionadas}
                          onToggle={alternarCategoria}
                        />
                      </div>
                    )}
                  </div>

                  {ofereceServico && (
                    <>
                      {/* Portfólio */}
                      {portfolio.length > 0 ? (
                        <div className="-mx-1">
                          <SecaoCategoriasPortfolio
                            servicos={servicos}
                            portfolio={portfolio}
                            categoriasFiltradas={selecionadas}
                          />
                        </div>
                      ) : (
                        <BlocoVazio
                          titulo="Portfólio"
                          mensagem="Nenhum trabalho publicado ainda."
                        />
                      )}

                      {/* Serviços */}
                      <div className="px-5 py-4 border-t border-border space-y-2">
                        <h4 className="text-xs font-semibold text-foreground">
                          Serviços ({servicos.length})
                        </h4>
                        {servicos.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground">
                            Nenhum serviço cadastrado.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {servicos.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between rounded-lg bg-card border border-border px-3 py-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {s.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {s.duration_minutes} min
                                  </p>
                                </div>
                                <p className="text-xs font-semibold text-primary">
                                  R$ {Number(s.price).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Equipe (mesmo componente do perfil público) */}
                      {equipe.length > 0 ? (
                        <div className="pt-4 border-t border-border -mx-5">
                          <SecaoEquipePublica
                            membros={equipe}
                            tenantSlug={dados.tenant_slug}
                          />
                        </div>
                      ) : (
                        <BlocoVazio
                          titulo="Equipe"
                          mensagem="Nenhum profissional na equipe."
                        />
                      )}
                    </>
                  )}
                </div></MemoryRouter>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function BlocoVazio({ titulo, mensagem }: { titulo: string; mensagem: string }) {
  return (
    <div className="px-5 py-4 border-t border-border space-y-1">
      <h4 className="text-xs font-semibold text-foreground">{titulo}</h4>
      <p className="text-[11px] text-muted-foreground">{mensagem}</p>
    </div>
  );
}
