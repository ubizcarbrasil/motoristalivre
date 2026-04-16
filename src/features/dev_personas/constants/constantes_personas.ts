import type { Persona } from "../types/tipos_personas";

export const SENHA_PADRAO = "Tribo@2025";
export const TENANT_DEMO_SLUG = "demo";

export const PERSONAS: Persona[] = [
  {
    nivel: 1,
    titulo: "Super Admin da plataforma",
    descricao: "Controla toda a plataforma TriboCar (todos os tenants).",
    role: "root_admin",
    email: "root@tribocar.test",
    senha: SENHA_PADRAO,
    rotaDestino: "/root",
  },
  {
    nivel: 2,
    titulo: "Dono do grupo (tenant)",
    descricao: "Administra um grupo/empresa específica.",
    role: "tenant_admin",
    email: "admin@tribocar.test",
    senha: SENHA_PADRAO,
    rotaDestino: "/admin",
  },
  {
    nivel: 3,
    titulo: "Gestor do grupo",
    descricao: "Auxilia o admin com permissões operacionais.",
    role: "manager",
    email: "manager@tribocar.test",
    senha: SENHA_PADRAO,
    rotaDestino: "/admin",
  },
  {
    nivel: 4,
    titulo: "Motorista",
    descricao: "Recebe e executa corridas pelo painel.",
    role: "driver",
    email: "motorista@tribocar.test",
    senha: SENHA_PADRAO,
    rotaDestino: "/painel",
  },
  {
    nivel: 5,
    titulo: "Afiliado",
    descricao: "Indica passageiros e ganha comissão.",
    role: "affiliate",
    email: "afiliado@tribocar.test",
    senha: SENHA_PADRAO,
    rotaDestino: "/afiliado",
  },
  {
    nivel: 6,
    titulo: "Passageiro",
    descricao: "Solicita corridas pela página pública do tenant.",
    role: "passenger",
    email: "passageiro@tribocar.test",
    senha: SENHA_PADRAO,
    rotaDestino: `/${TENANT_DEMO_SLUG}/motorista-demo`,
  },
];
