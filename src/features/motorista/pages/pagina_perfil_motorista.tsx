import { useParams } from "react-router-dom";
import { LayoutBase } from "@/compartilhados/components/layout_base";

export default function PaginaPerfilMotorista() {
  const { slug, driver_slug } = useParams();
  return (
    <LayoutBase>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Perfil do motorista: {driver_slug} — Grupo: {slug}
        </p>
      </div>
    </LayoutBase>
  );
}
