import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ChevronRight, BadgeCheck, ShieldCheck, Briefcase, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listarProfissionaisServicoPorTenant,
  buscarTenantPorSlug,
  type ProfissionalServicoListado,
} from "../services/servico_listagem_publica";

export default function PaginaServicosTenant() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState<ProfissionalServicoListado[]>([]);
  const [tenantNome, setTenantNome] = useState<string>("");
  const [carregando, setCarregando] = useState(true);
  const [tenantExiste, setTenantExiste] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelado = false;
    async function carregar() {
      const tenant = await buscarTenantPorSlug(slug!);
      if (cancelado) return;
      if (!tenant) {
        setTenantExiste(false);
        setCarregando(false);
        return;
      }
      setTenantNome(tenant.name);
      const lista = await listarProfissionaisServicoPorTenant(slug!);
      if (cancelado) return;
      setProfissionais(lista);
      setCarregando(false);
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [slug]);

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!tenantExiste) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Grupo não encontrado</p>
          <p className="text-sm text-muted-foreground">Verifique se o endereço está correto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
        <button
          onClick={() => navigate(`/${slug}`)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Serviços</span>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            Profissionais disponíveis
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha um profissional do grupo <strong>{tenantNome}</strong> para agendar.
          </p>
        </div>

        {profissionais.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum profissional com serviços ativos neste grupo ainda.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {profissionais.map((p) => (
              <Card
                key={p.id}
                onClick={() => navigate(`/${slug}/servicos/${p.slug}`)}
                className="p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/40 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={p.avatar_url ?? undefined} />
                  <AvatarFallback>{p.nome.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-foreground truncate">{p.nome}</p>
                    {p.is_verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                    {p.credential_verified && (
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs">
                      {p.total_servicos} {p.total_servicos === 1 ? "serviço" : "serviços"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">@{p.slug}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
