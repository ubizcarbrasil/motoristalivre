import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Shield, Award, Clock, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PerfilMotorista, ReputacaoMotorista, AvaliacaoRecente } from "../types/tipos_painel";
import { buscarReputacao, buscarAvaliacoesRecentes } from "../services/servico_painel";
import { SELOS_MOTORISTA } from "../constants/constantes_painel";
import { CampoUploadImagem } from "@/features/onboarding/components/campo_upload_imagem";
import { EditorHandleProfissional } from "@/features/triboservicos/components/editor_handle_profissional";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { ChecklistPublicacao } from "./checklist_publicacao";
import type { AbaPainel } from "../types/tipos_painel";

interface AbaPerfilProps {
  perfil: PerfilMotorista;
  onAtualizar: (p: PerfilMotorista) => void;
  onMudarAba?: (aba: AbaPainel) => void;
}

function BarraDistribuicao({ distribuicao, total }: { distribuicao: number[]; total: number }) {
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((estrela) => {
        const qtd = distribuicao[estrela - 1];
        const pct = total > 0 ? (qtd / total) * 100 : 0;
        return (
          <div key={estrela} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-3">{estrela}</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground w-6 text-right">{qtd}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AbaPerfil({ perfil, onAtualizar, onMudarAba }: AbaPerfilProps) {
  const { usuario } = useAutenticacao();
  const [avatar, setAvatar] = useState(perfil.avatar_url ?? "");
  const [cover, setCover] = useState(perfil.cover_url ?? "");
  const [bio, setBio] = useState(perfil.bio ?? "");
  const [modelo, setModelo] = useState(perfil.vehicle_model ?? "");
  const [ano, setAno] = useState(perfil.vehicle_year?.toString() ?? "");
  const [cor, setCor] = useState(perfil.vehicle_color ?? "");
  const [placa, setPlaca] = useState(perfil.vehicle_plate ?? "");
  const [salvando, setSalvando] = useState(false);

  const [reputacao, setReputacao] = useState<ReputacaoMotorista | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRecente[]>([]);

  useEffect(() => {
    buscarReputacao(perfil.id).then(setReputacao);
    buscarAvaliacoesRecentes(perfil.id).then(setAvaliacoes);
  }, [perfil.id]);

  const salvar = async () => {
    setSalvando(true);
    try {
      await Promise.all([
        supabase
          .from("drivers")
          .update({
            bio: bio || null,
            cover_url: cover || null,
            vehicle_model: modelo || null,
            vehicle_year: ano ? parseInt(ano) : null,
            vehicle_color: cor || null,
            vehicle_plate: placa || null,
          })
          .eq("id", perfil.id),
        usuario?.id
          ? supabase.from("users").update({ avatar_url: avatar || null }).eq("id", usuario.id)
          : Promise.resolve(),
      ]);

      onAtualizar({
        ...perfil,
        avatar_url: avatar,
        cover_url: cover,
        bio,
        vehicle_model: modelo,
        vehicle_year: ano ? parseInt(ano) : null,
        vehicle_color: cor,
        vehicle_plate: placa,
      });
      toast.success("Perfil atualizado");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const selos = SELOS_MOTORISTA.filter((s) => {
    if (s.id === "verificado") return perfil.is_verified;
    if (s.id === "5estrelas") return reputacao && reputacao.notaMedia >= 4.8;
    if (s.id === "veterano") return reputacao && reputacao.mesesAtuacao >= 6;
    return false;
  });

  return (
    <div className="pt-12 pb-20 px-5 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Meu perfil</h2>

      {perfil.professional_type !== "driver" && (
        <ChecklistPublicacao
          driverId={perfil.id}
          bio={bio}
          avatarUrl={avatar || null}
          coverUrl={cover || null}
          serviceCategories={(perfil as any).service_categories ?? []}
          onIrParaServicos={() => onMudarAba?.("configuracoes")}
          onIrParaPortfolio={() => onMudarAba?.("configuracoes")}
        />
      )}

      {/* Formulário */}
      <div className="space-y-4">
        <CampoUploadImagem
          label="Foto de perfil"
          valor={avatar}
          pasta="avatars"
          aspecto="square"
          onChange={setAvatar}
        />
        <CampoUploadImagem
          label="Foto de capa"
          valor={cover}
          pasta="covers"
          aspecto="wide"
          onChange={setCover}
        />
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={
              perfil.professional_type === "service_provider"
                ? "Descreva seus serviços, experiência e diferenciais..."
                : "Fale sobre você..."
            }
            rows={3}
            maxLength={300}
          />
        </div>
        {perfil.professional_type !== "service_provider" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="modelo">Veículo</Label>
                <Input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Corolla" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input id="ano" value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2022" type="number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <Input id="cor" value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Preto" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input id="placa" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ABC1D23" />
              </div>
            </div>
          </>
        )}
        <Button onClick={salvar} disabled={salvando} className="w-full h-11">
          {salvando ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      {/* @handle público — apenas profissionais de serviço/híbrido */}
      {perfil.professional_type !== "driver" && <EditorHandleProfissional />}

      {/* Reputação */}
      {reputacao && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Reputação</h3>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">
                {reputacao.notaMedia > 0 ? reputacao.notaMedia.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">{reputacao.totalAvaliacoes} avaliações</p>
            </div>
            <div className="flex-1">
              <BarraDistribuicao distribuicao={reputacao.distribuicao} total={reputacao.totalAvaliacoes} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-card border border-border p-3 text-center">
              <ThumbsUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{reputacao.taxaAceite.toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Aceite</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 text-center">
              <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{reputacao.mesesAtuacao}</p>
              <p className="text-[10px] text-muted-foreground">Meses</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 text-center">
              <Star className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{reputacao.notaMedia > 0 ? reputacao.notaMedia.toFixed(1) : "—"}</p>
              <p className="text-[10px] text-muted-foreground">Nota</p>
            </div>
          </div>
        </div>
      )}

      {/* Selos */}
      {selos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Selos</h3>
          <div className="flex gap-2 flex-wrap">
            {selos.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5">
                {s.id === "verificado" ? <Shield className="w-3.5 h-3.5 text-primary" /> : <Award className="w-3.5 h-3.5 text-primary" />}
                <span className="text-xs font-medium text-primary">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avaliações recentes */}
      {avaliacoes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Avaliações recentes</h3>
          {avaliacoes.map((a) => (
            <div key={a.id} className="rounded-xl bg-card border border-border p-3 space-y-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < a.rating ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                ))}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(a.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {a.comment && <p className="text-xs text-muted-foreground">{a.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
