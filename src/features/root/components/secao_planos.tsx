import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PlanoEditavel } from "../types/tipos_root";

export function SecaoPlanos() {
  const [planos, setPlanos] = useState<PlanoEditavel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const { data } = await supabase.from("plans").select("*").order("price_monthly");
      setPlanos((data || []).map((p) => ({
        id: p.id, nome: p.name, precoMensal: p.price_monthly,
        precoSignup: p.price_signup, maxMotoristas: p.max_drivers,
        features: Array.isArray(p.features) ? (p.features as string[]) : [],
      })));
    } finally { setCarregando(false); }
  }

  function atualizar(id: string, campo: keyof PlanoEditavel, valor: string | number) {
    setPlanos((prev) => prev.map((p) => p.id === id ? { ...p, [campo]: valor } : p));
  }

  async function salvar(plano: PlanoEditavel) {
    setSalvando(plano.id);
    const { error } = await supabase.from("plans").update({
      name: plano.nome, price_monthly: plano.precoMensal,
      price_signup: plano.precoSignup, max_drivers: plano.maxMotoristas,
      features: plano.features,
    }).eq("id", plano.id);
    setSalvando(null);
    if (error) { toast.error("Erro ao salvar plano"); return; }
    toast.success("Plano atualizado");
  }

  if (carregando) return <p className="p-6 text-muted-foreground">Carregando...</p>;

  return (
    <div className="grid gap-6 p-6 md:grid-cols-3">
      {planos.map((p) => (
        <Card key={p.id} className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">{p.nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preco mensal (R$)</Label>
              <Input type="number" value={p.precoMensal} onChange={(e) => atualizar(p.id, "precoMensal", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Taxa de adesao (R$)</Label>
              <Input type="number" value={p.precoSignup} onChange={(e) => atualizar(p.id, "precoSignup", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Max motoristas</Label>
              <Input type="number" value={p.maxMotoristas} onChange={(e) => atualizar(p.id, "maxMotoristas", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Features (uma por linha)</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                rows={4}
                value={p.features.join("\n")}
                onChange={(e) => atualizar(p.id, "features", e.target.value.split("\n") as unknown as string)}
              />
            </div>
            <Button className="w-full" onClick={() => salvar(p)} disabled={salvando === p.id}>
              {salvando === p.id ? "Salvando..." : "Salvar"}
            </Button>
          </CardContent>
        </Card>
      ))}
      {planos.length === 0 && <p className="text-muted-foreground">Nenhum plano cadastrado</p>}
    </div>
  );
}
