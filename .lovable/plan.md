

# Plano: Estrutura Base do TriboCar

## Visão Geral
Criar a estrutura base (sem telas) de um SaaS multi-tenant chamado TriboCar, com roteamento, contextos de autenticação e tenant, layout base dark mode, e fonte IBM Plex Sans.

## 1. Design System e Tema
- Dark mode fixo: fundo `#000`, texto `#fff`, accent `#1db865`
- Fonte IBM Plex Sans via Google Fonts (importar no `index.html`)
- Atualizar variáveis CSS no `index.css` para refletir o tema
- Atualizar `tailwind.config.ts` com cores customizadas (accent verde)

## 2. Estrutura de Pastas (feature-based)
```
src/
├── features/
│   ├── autenticacao/
│   │   ├── contexts/contexto_autenticacao.tsx
│   │   ├── hooks/hook_autenticacao.ts
│   │   ├── types/tipos_autenticacao.ts
│   │   └── pages/ (pagina_entrar.tsx, pagina_cadastro.tsx - placeholder)
│   ├── tenant/
│   │   ├── contexts/contexto_tenant.tsx
│   │   ├── hooks/hook_tenant.ts
│   │   ├── types/tipos_tenant.ts
│   │   └── services/servico_tenant.ts
│   ├── passageiro/ (placeholder)
│   ├── motorista/ (placeholder)
│   ├── painel/ (placeholder)
│   ├── admin/ (placeholder)
│   ├── root/ (placeholder)
│   └── onboarding/ (placeholder)
├── compartilhados/
│   ├── components/layout_base.tsx
│   └── types/
└── components/ui/ (shadcn existente)
```

## 3. Roteamento (React Router)
- `/:slug` → página passageiro (placeholder)
- `/:slug/:driver_slug` → perfil motorista público (placeholder)
- `/painel` → painel do motorista autenticado (protegida)
- `/admin` → admin do grupo (protegida)
- `/root` → root admin (protegida)
- `/entrar` → login
- `/cadastro` → cadastro
- `/onboarding` → onboarding

## 4. Contexto de Autenticação
- Provider com Supabase Auth (`onAuthStateChange` + `getSession`)
- Hook `useAutenticacao` expondo: usuario, sessao, carregando, entrar, sair, cadastrar
- Componente de rota protegida

## 5. Contexto de Tenant
- Detecta tenant pelo slug na URL (parâmetro de rota)
- Carrega configurações do tenant (nome, cores, logo) — inicialmente mockado
- Hook `useTenant` expondo: tenant, carregando
- Tipagem: `{ id, slug, nome, cores, logo_url }`

## 6. Layout Base
- Layout wrapper com dark mode fixo aplicado
- Estrutura mínima (header/main/footer placeholders)
- Aplicação do tema do tenant quando disponível

## 7. Integração Supabase
- Configurar cliente Supabase em `src/compartilhados/services/cliente_supabase.ts`
- Usar variáveis de ambiente para URL e anon key

