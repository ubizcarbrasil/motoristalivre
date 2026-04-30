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
import PaginaOnboarding from "@/features/onboarding/pages/pagina_onboarding";
import PaginaPainel from "@/features/painel/pages/pagina_painel";
// PaginaAdmin removido — admin agora é acessado via /painel?aba=tribo
import PaginaAfiliado from "@/features/afiliado/pages/pagina_afiliado";
import PaginaRoot from "@/features/root/pages/pagina_root";
import PaginaPassageiro from "@/features/passageiro/pages/pagina_passageiro";
import PaginaPerfilMotorista from "@/features/motorista/pages/pagina_perfil_motorista";
import PaginaLanding from "@/features/landing/pages/pagina_landing";
import PaginaValidacaoCorrida from "@/features/validacao_corrida/pages/pagina_validacao_corrida";
import PaginaPersonas from "@/features/dev_personas/pages/pagina_personas";
import PaginaInstalar from "@/features/instalacao/pages/pagina_instalar";
import PaginaAcesso from "@/features/acesso_publico/pages/pagina_acesso";
import PaginaSimuladorDispatch from "@/features/dev_simulador/pages/pagina_simulador_dispatch";
import PaginaServicosTenant from "@/features/servicos/pages/pagina_servicos_tenant";
import PaginaServicosMotorista from "@/features/servicos/pages/pagina_servicos_motorista";
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
            <Route path="/profissional/login" element={<Navigate to="/entrar?modo=profissional" replace />} />
            <Route path="/profissional/entrar" element={<Navigate to="/entrar?modo=profissional" replace />} />
            <Route path="/cadastro" element={<PaginaCadastro />} />
            <Route path="/validar-corrida/:id" element={<PaginaValidacaoCorrida />} />
            <Route path="/dev/personas" element={<PaginaPersonas />} />
            <Route path="/instalar" element={<PaginaInstalar />} />
            <Route path="/acesso" element={<PaginaAcesso />} />
            <Route path="/dev/simular-dispatch" element={<RotaProtegida><PaginaSimuladorDispatch /></RotaProtegida>} />

            {/* Rotas protegidas */}
            <Route path="/onboarding" element={<RotaProtegida><PaginaOnboarding /></RotaProtegida>} />
            <Route path="/painel" element={<RotaProtegida><PaginaPainel /></RotaProtegida>} />
            <Route path="/links" element={<Navigate to="/painel?aba=meus_links" replace />} />
            <Route path="/admin" element={<Navigate to="/painel?aba=tribo" replace />} />
            {/* /afiliado removido — afiliados usam /painel unificado */}
            <Route path="/afiliado" element={<Navigate to="/painel" replace />} />
            <Route path="/root" element={<RotaProtegida><PaginaRoot /></RotaProtegida>} />

            {/* Rotas com tenant (slug) */}
            <Route path="/:slug" element={<ProvedorTenant><PaginaPassageiro /></ProvedorTenant>} />
            <Route path="/:slug/a/:affiliate_slug" element={<ProvedorTenant><PaginaPassageiro /></ProvedorTenant>} />
            <Route path="/:slug/perfil/:driver_slug" element={<PaginaPerfilMotorista />} />
            <Route path="/:slug/servicos" element={<ProvedorTenant><PaginaServicosTenant /></ProvedorTenant>} />
            <Route path="/:slug/servicos/:driver_slug" element={<ProvedorTenant><PaginaServicosMotorista /></ProvedorTenant>} />
            <Route path="/:slug/:driver_slug" element={<ProvedorTenant><PaginaPassageiro /></ProvedorTenant>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProvedorAutenticacao>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
