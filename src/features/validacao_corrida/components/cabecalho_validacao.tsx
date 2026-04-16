import type { BrandingValidacao } from "../types/tipos_validacao_corrida";

interface CabecalhoValidacaoProps {
  branding: BrandingValidacao | null;
}

export function CabecalhoValidacao({ branding }: CabecalhoValidacaoProps) {
  const cor = branding?.cor_primaria ?? "#1db865";
  const nome = branding?.nome_empresa ?? "TriboCar";

  return (
    <header
      className="w-full px-5 py-6 flex items-center gap-3 border-b border-border"
      style={{ backgroundColor: cor }}
    >
      {branding?.logo_url ? (
        <img
          src={branding.logo_url}
          alt={nome}
          className="w-10 h-10 rounded-md object-cover bg-white/10"
        />
      ) : (
        <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-lg">
          {nome.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <h1 className="text-base font-bold text-white leading-tight">{nome}</h1>
        <p className="text-xs text-white/80 leading-tight">
          Validação de comprovante
        </p>
      </div>
    </header>
  );
}
