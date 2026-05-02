import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  resolverCamposBriefing,
  resolverSchemaBriefing,
  type DefinicaoCampoBriefing,
} from "../schemas/schema_briefing";

interface FormularioBriefingProps {
  slugCategoria: string | null;
  valor: Record<string, unknown>;
  onChange: (proximo: Record<string, unknown>) => void;
}

/**
 * Renderiza um formulário dinâmico baseado no slug da categoria do
 * service_type selecionado. Os dados ficam num objeto livre que será
 * persistido em `service_bookings.briefing` (jsonb).
 *
 * Validação Zod é aplicada antes do envio (via `validarBriefing`).
 */
export function FormularioBriefing({ slugCategoria, valor, onChange }: FormularioBriefingProps) {
  const campos = resolverCamposBriefing(slugCategoria);
  if (!campos || campos.length === 0) return null;

  const atualizar = (nome: string, novo: unknown) => {
    onChange({ ...valor, [nome]: novo });
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card/50 p-3">
      <div>
        <p className="text-xs font-medium text-foreground">Conte um pouco mais</p>
        <p className="text-[11px] text-muted-foreground">
          Essas informações ajudam o profissional a se preparar para o atendimento.
        </p>
      </div>
      <div className="space-y-3">
        {campos.map((campo) => (
          <CampoBriefing
            key={campo.nome}
            campo={campo}
            valor={valor[campo.nome]}
            onChange={(v) => atualizar(campo.nome, v)}
          />
        ))}
      </div>
    </div>
  );
}

interface CampoBriefingProps {
  campo: DefinicaoCampoBriefing;
  valor: unknown;
  onChange: (v: unknown) => void;
}

function CampoBriefing({ campo, valor, onChange }: CampoBriefingProps) {
  const id = `briefing_${campo.nome}`;

  if (campo.tipo === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-xs text-foreground">
          {campo.rotulo}
        </Label>
        <Switch
          id={id}
          checked={Boolean(valor)}
          onCheckedChange={(v) => onChange(v)}
        />
      </div>
    );
  }

  if (campo.tipo === "select" && campo.opcoes) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs text-foreground">
          {campo.rotulo}
        </Label>
        <Select value={(valor as string) ?? ""} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={id} className="h-9 text-xs">
            <SelectValue placeholder="Selecione…" />
          </SelectTrigger>
          <SelectContent>
            {campo.opcoes.map((op) => (
              <SelectItem key={op.valor} value={op.valor} className="text-xs">
                {op.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (campo.tipo === "textarea") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs text-foreground">
          {campo.rotulo}
        </Label>
        <Textarea
          id={id}
          value={(valor as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder}
          rows={2}
          maxLength={campo.maxLength}
          className="text-xs"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-foreground">
        {campo.rotulo}
      </Label>
      <Input
        id={id}
        value={(valor as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={campo.placeholder}
        maxLength={campo.maxLength}
        className="h-9 text-xs"
      />
    </div>
  );
}

/**
 * Valida e sanitiza um briefing antes do envio. Retorna o objeto
 * limpo (sem chaves vazias) ou lança erro de validação.
 */
export function validarBriefing(
  slugCategoria: string | null,
  valor: Record<string, unknown>,
): Record<string, unknown> | null {
  const schema = resolverSchemaBriefing(slugCategoria);
  if (!schema) return null;

  // Remove strings vazias antes de validar para que campos opcionais não
  // travem a validação ao serem deixados em branco.
  const limpo: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(valor)) {
    if (v === "" || v === null || v === undefined) continue;
    limpo[k] = v;
  }

  const resultado = schema.safeParse(limpo);
  if (!resultado.success) {
    const primeiro = resultado.error.issues[0];
    throw new Error(primeiro?.message ?? "Briefing inválido");
  }
  return Object.keys(resultado.data).length > 0 ? resultado.data : null;
}
