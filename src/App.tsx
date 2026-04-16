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
import PaginaAdmin from "@/features/admin/pages/pagina_admin";
import PaginaAfiliado from "@/features/afiliado/pages/pagina_afiliado";
import PaginaRoot from "@/features/root/pages/pagina_root";
import PaginaPassageiro from "@/features/passageiro/pages/pagina_passageiro";
import PaginaPerfilMotorista from "@/features/motorista/pages/pagina_perfil_motorista";
import PaginaLanding from "@/features/landing/pages/pagina_landing";
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
            <Route path="/cadastro" element={<PaginaCadastro />} />

            {/* Rotas protegidas */}
            <Route path="/onboarding" element={<RotaProtegida><PaginaOnboarding /></RotaProtegida>} />
            <Route path="/painel" element={<RotaProtegida><PaginaPainel /></RotaProtegida>} />
            <Route path="/admin" element={<RotaProtegida><PaginaAdmin /></RotaProtegida>} />
            <Route path="/afiliado" element={<RotaProtegida><PaginaAfiliado /></RotaProtegida>} />
            <Route path="/root" element={<RotaProtegida><PaginaRoot /></RotaProtegida>} />

            {/* Rotas com tenant (slug) */}
            <Route path="/:slug" element={<ProvedorTenant><PaginaPassageiro /></ProvedorTenant>} />
            <Route path="/:slug/a/:affiliate_slug" element={<ProvedorTenant><PaginaPassageiro /></ProvedorTenant>} />
            <Route path="/:slug/perfil/:driver_slug" element={<PaginaPerfilMotorista />} />
            <Route path="/:slug/:driver_slug" element={<ProvedorTenant><PaginaPassageiro /></ProvedorTenant>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProvedorAutenticacao>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
