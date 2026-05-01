import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock filhos para isolar a lógica de roteamento por active_modules
vi.mock("./pagina_vitrine_tenant_servicos", () => ({
  default: () => <div data-testid="vitrine-servicos">VITRINE_SERVICOS</div>,
}));

vi.mock("@/features/passageiro/pages/pagina_passageiro", () => ({
  default: () => <div data-testid="pagina-passageiro">PAGINA_PASSAGEIRO</div>,
}));

vi.mock("@/features/tenant/contexts/contexto_tenant", () => ({
  ProvedorTenant: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="provedor-tenant">{children}</div>
  ),
}));

vi.mock("../components/tema_servicos", () => ({
  TemaServicos: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock do supabase client
const maybeSingleMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => maybeSingleMock(),
        }),
      }),
    }),
  },
}));

import PaginaPublicaTenant from "./pagina_publica_tenant";

function renderizarComSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/s/${slug}`]}>
      <Routes>
        <Route path="/s/:slug" element={<PaginaPublicaTenant />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PaginaPublicaTenant — roteamento por active_modules", () => {
  beforeEach(() => {
    maybeSingleMock.mockReset();
  });

  it("renderiza vitrine de serviços quando active_modules contém 'services'", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: ["services"] },
      error: null,
    });

    renderizarComSlug("gina");

    await waitFor(() => {
      expect(screen.getByTestId("vitrine-servicos")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("pagina-passageiro")).not.toBeInTheDocument();
  });

  it("renderiza Passageiro quando active_modules não contém 'services'", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: ["mobility"] },
      error: null,
    });

    renderizarComSlug("tribo-mobility");

    await waitFor(() => {
      expect(screen.getByTestId("pagina-passageiro")).toBeInTheDocument();
    });
    expect(screen.getByTestId("provedor-tenant")).toBeInTheDocument();
    expect(screen.queryByTestId("vitrine-servicos")).not.toBeInTheDocument();
  });

  it("renderiza Passageiro quando active_modules é vazio (fallback mobility)", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: [] },
      error: null,
    });

    renderizarComSlug("tribo-vazia");

    await waitFor(() => {
      expect(screen.getByTestId("pagina-passageiro")).toBeInTheDocument();
    });
  });

  it("mostra 'Tribo não encontrada' quando o slug não existe", async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null });

    renderizarComSlug("inexistente");

    await waitFor(() => {
      expect(screen.getByText(/tribo não encontrada/i)).toBeInTheDocument();
    });
  });
});
