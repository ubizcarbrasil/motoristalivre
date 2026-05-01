import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("./pagina_vitrine_tenant_servicos", () => ({
  default: () => <div data-testid="vitrine-servicos">VITRINE_SERVICOS</div>,
}));

vi.mock("../components/tema_servicos", () => ({
  TemaServicos: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

describe("PaginaPublicaTenant — /s/:slug exclusiva de Serviços", () => {
  beforeEach(() => {
    maybeSingleMock.mockReset();
  });

  it("renderiza vitrine quando active_modules contém 'services'", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: ["services"] },
      error: null,
    });

    renderizarComSlug("gina");

    await waitFor(() => {
      expect(screen.getByTestId("vitrine-servicos")).toBeInTheDocument();
    });
  });

  it("mostra aviso de módulo incorreto quando tribo é só de mobilidade", async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { active_modules: ["mobility"] },
      error: null,
    });

    renderizarComSlug("tribo-mobility");

    await waitFor(() => {
      expect(
        screen.getByText(/não oferece serviços agendáveis/i),
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId("vitrine-servicos")).not.toBeInTheDocument();
    // Aponta para a URL correta de mobilidade
    expect(screen.getByText("/m/tribo-mobility")).toBeInTheDocument();
  });

  it("mostra 'Tribo não encontrada' quando o slug não existe", async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null });

    renderizarComSlug("inexistente");

    await waitFor(() => {
      expect(screen.getByText(/tribo não encontrada/i)).toBeInTheDocument();
    });
  });
});
