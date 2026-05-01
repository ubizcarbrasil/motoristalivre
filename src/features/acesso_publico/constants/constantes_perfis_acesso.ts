import { Car, Briefcase, ShieldCheck, User } from "lucide-react";
import type { CardPerfilAcesso } from "../types/tipos_acesso_perfil";

export const PERFIS_ACESSO: CardPerfilAcesso[] = [
  {
    id: "motorista",
    titulo: "Motorista",
    descricao:
      "Receba corridas, gerencie seu link e suas regras de preço e comissão.",
    Icone: Car,
    acessoCaminho: "/motorista/acesso",
    cadastroCaminho: "/motorista/cadastro",
  },
  {
    id: "profissional",
    titulo: "Profissional",
    descricao:
      "Crie sua vitrine, agenda, portfólio e categorias de serviço.",
    Icone: Briefcase,
    acessoCaminho: "/profissional/acesso",
    cadastroCaminho: "/profissional/cadastro",
  },
  {
    id: "passageiro",
    titulo: "Passageiro",
    descricao:
      "Acesse sua conta para pedir corridas e contratar serviços.",
    Icone: User,
    acessoCaminho: "/entrar",
    cadastroCaminho: "/cadastro?tipo=passageiro",
    observacao:
      "Você também pode entrar direto pelo link do motorista ou profissional.",
  },
  {
    id: "admin",
    titulo: "Administrador geral",
    descricao:
      "Acesso restrito ao dono do sistema para gerenciar tribos, planos e operação.",
    Icone: ShieldCheck,
    acessoCaminho: "/admin/acesso",
    observacao: "Sem cadastro público — promoção feita pelo dono do sistema.",
  },
];
