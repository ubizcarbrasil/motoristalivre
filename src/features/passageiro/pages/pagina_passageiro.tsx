import { useParams } from "react-router-dom";
import { LayoutBase } from "@/compartilhados/components/layout_base";

export default function PaginaPassageiro() {
  const { slug } = useParams();
  return (
    <LayoutBase>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Página do passageiro — Grupo: {slug}</p>
      </div>
    </LayoutBase>
  );
}
