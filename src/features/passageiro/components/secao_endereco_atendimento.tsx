import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import type { EnderecoAtendimento } from "@/features/servicos/types/tipos_servicos";

interface Props {
  valor: EnderecoAtendimento;
  onChange: (proximo: EnderecoAtendimento) => void;
}

async function buscarCep(cep: string): Promise<Partial<EnderecoAtendimento> | null> {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    const d = await r.json();
    if (d?.erro) return null;
    return {
      logradouro: d.logradouro ?? "",
      bairro: d.bairro ?? "",
      cidade: d.localidade ?? "",
      uf: d.uf ?? "",
    };
  } catch {
    return null;
  }
}

export function SecaoEnderecoAtendimento({ valor, onChange }: Props) {
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    const limpo = (valor.cep ?? "").replace(/\D/g, "");
    if (limpo.length !== 8) return;
    let cancelado = false;
    setBuscandoCep(true);
    buscarCep(limpo).then((dados) => {
      if (cancelado) return;
      setBuscandoCep(false);
      if (dados) {
        onChange({ ...valor, ...dados, cep: limpo });
      }
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor.cep]);

  const atualizar = (campo: keyof EnderecoAtendimento, v: string) => {
    onChange({ ...valor, [campo]: v });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Endereço do atendimento</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1 space-y-1.5">
          <Label htmlFor="end_cep">CEP</Label>
          <div className="relative">
            <Input
              id="end_cep"
              value={valor.cep ?? ""}
              onChange={(e) => atualizar("cep", e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
            />
            {buscandoCep && (
              <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="end_log">Rua / logradouro</Label>
          <Input
            id="end_log"
            value={valor.logradouro ?? ""}
            onChange={(e) => atualizar("logradouro", e.target.value)}
            placeholder="Rua, avenida…"
            maxLength={120}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="end_num">Número</Label>
          <Input
            id="end_num"
            value={valor.numero ?? ""}
            onChange={(e) => atualizar("numero", e.target.value)}
            placeholder="123"
            maxLength={10}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="end_compl">Complemento</Label>
          <Input
            id="end_compl"
            value={valor.complemento ?? ""}
            onChange={(e) => atualizar("complemento", e.target.value)}
            placeholder="Apto, bloco…"
            maxLength={60}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="end_bairro">Bairro</Label>
        <Input
          id="end_bairro"
          value={valor.bairro ?? ""}
          onChange={(e) => atualizar("bairro", e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="end_cidade">Cidade</Label>
          <Input
            id="end_cidade"
            value={valor.cidade ?? ""}
            onChange={(e) => atualizar("cidade", e.target.value)}
            maxLength={80}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_uf">UF</Label>
          <Input
            id="end_uf"
            value={valor.uf ?? ""}
            onChange={(e) => atualizar("uf", e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="end_ref">Ponto de referência (opcional)</Label>
        <Input
          id="end_ref"
          value={valor.referencia ?? ""}
          onChange={(e) => atualizar("referencia", e.target.value)}
          placeholder="Próximo ao mercado X"
          maxLength={120}
        />
      </div>
    </div>
  );
}
