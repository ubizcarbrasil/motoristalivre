import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PaginaVitrineTenantServicos from "./pagina_vitrine_tenant_servicos";
import { TemaServicos } from "../components/tema_servicos";

type EstadoCarregamento = "carregando" | "ok" | "modulo_incorreto" | "nao_encontrado";

/**
 * Rota /s/:slug — EXCLUSIVA do módulo de Serviços.
 *
 * Se a tribo não tem 'services' em active_modules, mostra mensagem clara
 * indicando que o link público dela é o de Mobilidade (/{slug}).
 */
export default function PaginaPublicaTenant() {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<EstadoCarregamento>("carregando");

  useEffect(() => {
    if (!slug) {
      setEstado("nao_encontrado");
      return;
    }
    let cancelado = false;
    async function resolverModulo() {
      const { data, error } = await supabase
        .from("tenants")
        .select("active_modules")
        .eq("slug", slug!)
        .maybeSingle();

      if (cancelado) return;

      if (error || !data) {
        setEstado("nao_encontrado");
        return;
      }

      const modulos = (data.active_modules ?? []) as string[];
      if (modulos.includes("services")) {
        setEstado("ok");
      } else {
        setEstado("modulo_incorreto");
      }
    }
    resolverModulo();
    return () => {
      cancelado = true;
    };
  }, [slug]);

  if (estado === "carregando") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (estado === "nao_encontrado") {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-3 max-w-sm">
            <p className="text-base font-medium text-foreground">Tribo não encontrada</p>
            <p className="text-sm text-muted-foreground">
              Não existe nenhuma tribo com o endereço{" "}
              <span className="font-mono text-foreground">/s/{slug ?? ""}</span>.
            </p>
            <a
              href="/"
              className="inline-block text-sm font-medium text-primary underline"
            >
              Voltar para a página inicial
            </a>
          </div>
        </div>
      </TemaServicos>
    );
  }

  if (estado === "modulo_incorreto") {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-3 max-w-sm">
            <p className="text-base font-medium text-foreground">
              Esta tribo não oferece serviços agendáveis
            </p>
            <p className="text-sm text-muted-foreground">
              O link público desta tribo é o de mobilidade. Acesse:
            </p>
            <a
              href={`/m/${slug}`}
              className="inline-block text-sm font-medium text-primary underline"
            >
              /m/{slug}
            </a>
          </div>
        </div>
      </TemaServicos>
    );
  }

  return <PaginaVitrineTenantServicos />;
}
