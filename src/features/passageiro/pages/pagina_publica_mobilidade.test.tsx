import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/features/passageiro/pages/pagina_passageiro", () => ({
  default: () => <div data-testid="pagina-passageiro">PAGINA_PASSAGEIRO</div>,
}));

vi.mock("@/features/tenant/contexts/contexto_tenant", () => ({
  ProvedorTenant: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="provedor-tenant">{children}</div>
  ),
}));

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

import PaginaPublicaMobilidade from "./pagina_publica_mobilidade";

function renderizarComSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/m/${slug}`]}>
      <Routes>
        <Route path="/m/:slug" element={<PaginaPublicaMobilidade />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PaginaPublicaMobilidade — /m/:slug exclusiva de Mobilidade", () => {
  beforeEach(() => {
    maybeSingleMock.mockReset();
  });

  it("renderiza Passageiro quando active_modules contém 'mobility'", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: ["mobility"] },
      error: null,
    });

    renderizarComSlug("tribo-mobility");

    await waitFor(() => {
      expect(screen.getByTestId("pagina-passageiro")).toBeInTheDocument();
    });
    expect(screen.getByTestId("provedor-tenant")).toBeInTheDocument();
  });

  it("renderiza Passageiro quando active_modules é vazio (default mobility)", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: [] },
      error: null,
    });

    renderizarComSlug("tribo-vazia");

    await waitFor(() => {
      expect(screen.getByTestId("pagina-passageiro")).toBeInTheDocument();
    });
  });

  it("mostra aviso de módulo incorreto quando tribo é só de serviços", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: ["services"] },
      error: null,
    });

    renderizarComSlug("gina");

    await waitFor(() => {
      expect(screen.getByText(/não oferece corridas/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId("pagina-passageiro")).not.toBeInTheDocument();
    expect(screen.getByText("/s/gina")).toBeInTheDocument();
  });

  it("mostra 'Tribo não encontrada' quando o slug não existe", async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null });

    renderizarComSlug("inexistente");

    await waitFor(() => {
      expect(screen.getByText(/tribo não encontrada/i)).toBeInTheDocument();
    });
  });
});
