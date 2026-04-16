import { LayoutBase } from "@/compartilhados/components/layout_base";

export default function PaginaRoot() {
  return (
    <LayoutBase>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Painel root admin</p>
      </div>
    </LayoutBase>
  );
}
