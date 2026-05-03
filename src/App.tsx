import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProvedorAutenticacao } from "@/features/autenticacao/contexts/contexto_autenticacao";
import { ProvedorTenant } from "@/features/tenant/contexts/contexto_tenant";
import { RotaProtegida } from "@/compartilhados/components/rota_protegida";

import PaginaEntrar from "@/features/autenticacao/pages/pagina_entrar";
import PaginaCadastro from "@/features/autenticacao/pages/pagina_cadastro";
import { RedirectCadastroPorTipo } from "@/features/autenticacao/components/redirect_cadastro_por_tipo";
import PaginaOnboarding from "@/features/onboarding/pages/pagina_onboarding";
import PaginaPainel from "@/features/painel/pages/pagina_painel";
// PaginaAdmin removido — admin agora é acessado via /painel?aba=tribo
import PaginaAfiliado from "@/features/afiliado/pages/pagina_afiliado";
import PaginaRoot from "@/features/root/pages/pagina_root";
import { RotaProtegidaRoot } from "@/features/root/components/rota_protegida_root";
import PaginaPassageiro from "@/features/passageiro/pages/pagina_passageiro";
import PaginaPerfilMotorista from "@/features/motorista/pages/pagina_perfil_motorista";
import PaginaLanding from "@/features/landing/pages/pagina_landing";
import PaginaValidacaoCorrida from "@/features/validacao_corrida/pages/pagina_validacao_corrida";
import PaginaPersonas from "@/features/dev_personas/pages/pagina_personas";
import PaginaDevLinks from "@/features/dev_links/pages/pagina_dev_links";
import PaginaInstalar from "@/features/instalacao/pages/pagina_instalar";
import PaginaAcesso from "@/features/acesso_publico/pages/pagina_acesso";
import PaginaSimuladorDispatch from "@/features/dev_simulador/pages/pagina_simulador_dispatch";
import {
  RedirectVitrineTenantLegado,
  RedirectVitrineProfissionalLegado,
} from "@/features/triboservicos/components/redirects_legados";
import PaginaLandingServicos from "@/features/triboservicos/pages/pagina_landing_servicos";
import PaginaEntrarServicos from "@/features/triboservicos/pages/pagina_entrar_servicos";
import PaginaCadastroTribo from "@/features/triboservicos/pages/pagina_cadastro_tribo";
import PaginaCadastroProfissional from "@/features/triboservicos/pages/pagina_cadastro_profissional";
import PaginaVitrineTenantServicos from "@/features/triboservicos/pages/pagina_vitrine_tenant_servicos";
import PaginaPublicaTenant from "@/features/triboservicos/pages/pagina_publica_tenant";
import PaginaPublicaMobilidade from "@/features/passageiro/pages/pagina_publica_mobilidade";
import { ResolverPublicoTenant } from "@/features/passageiro/components/resolver_publico_tenant";
import PaginaPerfilProfissionalServicos from "@/features/triboservicos/pages/pagina_perfil_profissional_servicos";
import PaginaAgendamentoServicos from "@/features/triboservicos/pages/pagina_agendamento_servicos";
import PaginaIndicacaoServicos from "@/features/triboservicos/pages/pagina_indicacao_servicos";
import PaginaRedePublica from "@/features/rede_publica/pages/pagina_rede_publica";
import PaginaSolicitarOrcamento from "@/features/orcamentos/pages/pagina_solicitar_orcamento";
import PaginaAcompanharOrcamento from "@/features/orcamentos/pages/pagina_acompanhar_orcamento";
// PaginaResolverHandle é renderizado dentro do ResolverPublicoTenant (rota /:slug)
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProvedorAutenticacao>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<PaginaLanding />} />
            <Route path="/entrar" element={<PaginaEntrar />} />
            <Route path="/cadastro" element={<RedirectCadastroPorTipo />} />
            <Route path="/cadastrar" element={<RedirectCadastroPorTipo />} />

            {/* Links dedicados por perfil — acesso (login) */}
            <Route path="/motorista/acesso" element={<Navigate to="/entrar?modo=motorista" replace />} />
            <Route path="/profissional/acesso" element={<Navigate to="/entrar?modo=profissional" replace />} />
            <Route path="/admin/acesso" element={<Navigate to="/entrar?modo=admin" replace />} />

            {/* Links dedicados por perfil — cadastro */}
            <Route path="/motorista/cadastro" element={<Navigate to="/cadastro?tipo=motorista" replace />} />
            {/* Profissional autônomo SEMPRE vai pro cadastro dedicado de serviços (sem opções de motorista/passageiro) */}
            <Route path="/profissional/cadastro" element={<Navigate to="/s/cadastro/profissional" replace />} />
            <Route path="/cadastro/profissional" element={<Navigate to="/s/cadastro/profissional" replace />} />

            {/* Aliases legados — mantidos por compatibilidade */}
            <Route path="/profissional/login" element={<Navigate to="/profissional/acesso" replace />} />
            <Route path="/profissional/entrar" element={<Navigate to="/profissional/acesso" replace />} />
            <Route path="/profissional/criar-conta" element={<Navigate to="/profissional/cadastro" replace />} />
            <Route path="/validar-corrida/:id" element={<PaginaValidacaoCorrida />} />
            <Route path="/dev/personas" element={<PaginaPersonas />} />
            <Route path="/dev/links" element={<PaginaDevLinks />} />
            <Route path="/instalar" element={<PaginaInstalar />} />
            <Route path="/acesso" element={<PaginaAcesso />} />

            {/* Orçamentos — wizard de solicitação e acompanhamento */}
            <Route path="/solicitar-orcamento" element={<PaginaSolicitarOrcamento />} />
            <Route path="/orcamento/novo" element={<PaginaSolicitarOrcamento />} />
            <Route path="/orcamento/:id" element={<PaginaAcompanharOrcamento />} />
            <Route path="/dev/simular-dispatch" element={<RotaProtegida><PaginaSimuladorDispatch /></RotaProtegida>} />

            {/* TriboServiços — landing, cadastro dual e login */}
            <Route path="/s" element={<PaginaLandingServicos />} />
            <Route path="/s/entrar" element={<PaginaEntrarServicos />} />
            <Route path="/s/cadastro/tribo" element={<PaginaCadastroTribo />} />
            <Route path="/s/cadastro/profissional" element={<PaginaCadastroProfissional />} />

            {/* TriboServiços — vitrine pública e perfil do profissional */}
            <Route path="/s/:slug" element={<PaginaPublicaTenant />} />

            {/* Mobilidade — link público exclusivo */}
            <Route path="/m/:slug" element={<PaginaPublicaMobilidade />} />

            {/* Friendly URL via @handle — captura é feita pela rota /:slug abaixo,
                que detecta o prefixo "@" e delega para PaginaResolverHandle.
                React Router v6 não suporta segmentos dinâmicos parciais (ex: /@:handle). */}


            <Route path="/s/:slug/a/:driver_slug" element={<PaginaIndicacaoServicos />} />
            <Route path="/s/:slug/:driver_slug/rede" element={<PaginaRedePublica />} />
            <Route path="/s/:slug/:driver_slug" element={<PaginaPerfilProfissionalServicos />} />
            <Route path="/s/:slug/:driver_slug/agendar" element={<PaginaAgendamentoServicos />} />

            {/* Rotas protegidas */}
            <Route path="/onboarding" element={<RotaProtegida><PaginaOnboarding /></RotaProtegida>} />
            <Route path="/painel" element={<RotaProtegida><PaginaPainel /></RotaProtegida>} />
            <Route path="/links" element={<Navigate to="/painel?aba=meus_links" replace />} />
            <Route path="/admin" element={<Navigate to="/painel?aba=tribo" replace />} />
            {/* /afiliado removido — afiliados usam /painel unificado */}
            <Route path="/afiliado" element={<Navigate to="/painel" replace />} />
            <Route path="/root" element={<RotaProtegidaRoot><PaginaRoot /></RotaProtegidaRoot>} />

            {/* Rotas com tenant (slug) — wrapper bifurca para vitrine de serviços quando tribo é só services */}
            <Route path="/:slug" element={<ResolverPublicoTenant><ProvedorTenant><PaginaPassageiro /></ProvedorTenant></ResolverPublicoTenant>} />
            <Route path="/:slug/a/:affiliate_slug" element={<ResolverPublicoTenant><ProvedorTenant><PaginaPassageiro /></ProvedorTenant></ResolverPublicoTenant>} />
            <Route path="/:slug/perfil/:driver_slug" element={<PaginaPerfilMotorista />} />
            <Route path="/:slug/servicos" element={<RedirectVitrineTenantLegado />} />
            <Route
              path="/:slug/servicos/:driver_slug"
              element={<RedirectVitrineProfissionalLegado />}
            />
            <Route path="/:slug/:driver_slug" element={<ResolverPublicoTenant><ProvedorTenant><PaginaPassageiro /></ProvedorTenant></ResolverPublicoTenant>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProvedorAutenticacao>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
