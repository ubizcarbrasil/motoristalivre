import { useEffect } from "react";

interface TemaServicosProps {
  children: React.ReactNode;
}

/**
 * Aplica a classe .tema-servicos no <html> enquanto o componente está montado.
 * Isola o tema dourado nas rotas /s/* sem vazar para o resto da app.
 */
export function TemaServicos({ children }: TemaServicosProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("tema-servicos");
    return () => {
      root.classList.remove("tema-servicos");
    };
  }, []);

  return <>{children}</>;
}
