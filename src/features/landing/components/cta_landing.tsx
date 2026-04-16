import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaLanding() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto text-center space-y-6 rounded-2xl border border-border bg-card p-10 sm:p-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Pronto para lancar seu grupo?
        </h2>
        <p className="text-muted-foreground">
          Crie sua conta, escolha um plano e tenha seu app de corridas funcionando em minutos.
        </p>
        <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
          <Link to="/cadastro">
            Criar minha conta
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
