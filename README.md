# LIAC Club

Hub de portfólio digital da LIAC (Liga Acadêmica de Cosmetologia da UFRJ) — divulgação de
novidades, eventos e artigos científicos, além de apresentar equipe, projetos de pesquisa e
parceiros. Inclui uma área de equipe protegida (`/portal-liac`) com login por cargo, gestão de
Novidades/Eventos/Artigos, convite de colaboradores por e-mail e histórico de auditoria.

**Este repositório continua 100% frontend** (Constitution Princípio I): nenhum código de
servidor, nenhuma lógica de autenticação real e nenhum acesso a banco de dados vivem aqui — tudo
passa pela abstração `ApiClient`. A implementação injetada é `RestApiClient`, que fala HTTP com o
backend real (repositório separado, [`liac-backend`](../liac-backend), rodando como Supabase Edge
Functions) — não há mais fixtures locais nem dados fictícios de seed; todo conteúdo é criado de
verdade pela equipe via `/portal-liac`. Veja `.specify/memory/constitution.md` para os princípios
completos e `specs/002-liac-staff-area/` para o spec da área de equipe.

## Setup

Requer Node.js 20+.

```bash
cp .env.example .env   # preencha com a URL e a anon key do seu backend liac-backend
npm install
npm run dev             # inicia o servidor de desenvolvimento em http://localhost:5173
```

`.env` precisa de `VITE_API_BASE_URL` (URL base das Edge Functions do `liac-backend`) — sem ela,
nada funciona: todo o conteúdo (Novidades/Eventos/Artigos/Projetos/Edições do Simpósio/
Depoimentos/Parceiros), o login da equipe e o formulário de contato dependem do backend real.

Outros scripts:

```bash
npm run build      # type-check + build de produção em dist/
npm run preview    # serve o build de produção localmente
npm run test        # roda a suíte de testes (Vitest) uma vez
npm run test:watch  # roda a suíte em modo watch
npm run lint         # ESLint
```

## Área da Equipe (`/portal-liac`)

Login em `/portal-liac/login`, não linkado em nenhum menu público. Acesso é só por convite (ver
`liac-backend/README.md` para como provisionar a primeira conta).

6 cargos nomeados (Diretor de Marketing, Presidente, Vice-Presidente, Coordenador, Diretor de
Eventos, Desenvolvedor) com CRUD idêntico em Novidades/Eventos/Artigos — a única distinção é que
Diretor de Marketing, Presidente, Vice-Presidente e Desenvolvedor também veem **Equipe** (convidar
colaboradores por e-mail, trocar cargo, revogar acesso) e **Histórico** (log de auditoria de toda
escrita) no menu; Coordenador e Diretor de Eventos não. Convite = e-mail real via Supabase Auth —
a pessoa convidada define a própria senha em `/definir-senha`.

Depois de logar, a equipe pode criar/editar/excluir Novidades, Eventos e Artigos, e marcar
qualquer um deles como "destaque" — o carrossel da Home passa a priorizar os itens marcados,
caindo de volta para os mais recentes quando nenhum estiver marcado. A página pública `/equipe`
lista os mesmos colaboradores que aparecem em **Equipe** no portal (via `GET /team`, leitura
pública de `staff_profiles` no backend real — sem e-mail), mas ainda não tem tela de gestão própria
(quem edita a equipe é sempre a tela **Equipe** do portal). A equipe também pode criar/editar/
excluir Parceiros, Projetos, Edições do Simpósio e Depoimentos — via `/parceiros`, `/projetos`,
`/edicoes-anteriores` e `/depoimentos` no portal, todos persistidos no backend real.

## Estrutura de pastas

```text
src/
├── main.tsx / App.tsx        # bootstrap da aplicação (App.tsx envolve tudo em AuthProvider)
├── router.tsx                  # rotas públicas + subárvore protegida /portal-liac/*
├── styles/tokens.css           # paleta de cores e tipografia da marca LIAC (fonte da verdade)
├── types/entities.ts           # tipos das entidades de domínio + StaffCredentials/AuthSession
├── auth/                        # AuthContext, roles.ts (cargos/ROLE_LABELS), RequireAuth/RequireRole (guards)
├── services/
│   ├── ApiClient.ts             # interface abstrata consumida pelas páginas
│   ├── client.ts                 # instância única injetada (RestApiClient — ver acima)
│   ├── rest/                     # RestApiClient (fetch contra o backend real) + ApiError
│   └── storage.ts                # upload de imagem pro Supabase Storage (bucket post-images)
├── hooks/                        # useAsyncResource, useUnsavedChangesGuard
├── utils/                        # datas, formatação de autores, validação de contato
├── components/
│   ├── ui/                        # Button, Card, Badge, Carousel, LoadingState, EmptyState, ícones
│   ├── layout/                    # Navbar, Footer, PageLayout
│   ├── content/                    # cards e formulário específicos de cada entidade pública
│   └── staff/                      # ConfirmDialog, DataTable, EntityFormLayout, FeaturedToggle,
│                                    # StaffLayout, LoginForm — reusados pelas telas de gestão
└── pages/
    ├── Home, About, Team, Events, Articles, News, Projects, SymposiumEditions, Partners, Contact/
    │                                # páginas públicas
    ├── SetPassword/                 # /definir-senha — pública, define senha após clicar o convite
    └── staff/                      # Login, Team (Equipe), History (Histórico), Profile e
                                      # News/Events/Articles/Projects/SymposiumEditions/Testimonials/
                                      # Partners (ManageList + Form cada um)
```

Cada componente de conteúdo/página tem seu teste colocado ao lado (`Component.test.tsx`), não em
um diretório `tests/` separado.

> **Nota sobre nomes de arquivo no Windows**: o serviço injetado fica em `client.ts`, não
> `apiClient.ts`, deliberadamente. Em um filesystem case-insensitive (Windows/macOS por padrão),
> `apiClient.ts` e `ApiClient.ts` (a interface) seriam o mesmo arquivo — o que já causou um bug
> real durante o desenvolvimento (um sobrescreveu o outro).

## Dados de exemplo

Não há mais fixtures locais nem dados de seed fictícios em nenhuma entidade — todo o conteúdo
(Novidades, Eventos, Artigos, Projetos, Edições do Simpósio, Depoimentos, Parceiros) é criado de
verdade pela equipe via `/portal-liac`, persistido no backend real (`liac-backend`), e não há mais
contas de demonstração seedadas (ver `liac-backend/README.md` para como provisionar acesso).

## Débito técnico conhecido

- **SSR/SSG**: fora de escopo nesta fase. Se SEO de artigos/novidades virar prioridade, migração
  para Next.js é a via natural.
- **Vulnerabilidade de dev-server do esbuild** (`npm audit`): o Vite 5 fixa uma versão do esbuild
  com uma CVE conhecida (CORS no servidor de desenvolvimento, GHSA-67mh-4wv8-2f99). Afeta só
  `npm run dev`, nunca o build de produção. Corrigir exigiria pular para Vite 6+, uma migração
  maior — aceito como risco conhecido por ora.
- **Equipe (página pública)** lê de verdade (`GET /team`, backend real), mas não tem CRUD próprio
  — ela reaproveita `staff_profiles` (a tabela de contas de acesso ao portal) só para leitura, então
  hoje só existe um jeito de editar quem aparece lá: a tela **Equipe** do portal (convidar/trocar
  cargo/revogar), que também controla login. Não dá pra ter alguém na vitrine pública sem também
  virar uma conta de acesso ao portal.
- **Redirect URL do convite** precisa ser adicionada manualmente no Supabase Dashboard
  (Authentication → URL Configuration) antes do fluxo de convite funcionar de ponta a ponta — ver
  `liac-backend/README.md`.

## Deploy

Build estático (`npm run build` gera `dist/`), compatível com qualquer hospedagem estática
(Vercel, Netlify, GitHub Pages) — configure `VITE_API_BASE_URL` como variável de ambiente de
build na hospedagem escolhida (mesmo valor de `.env.example`, ou a URL do seu próprio backend caso
tenha implantado uma cópia de `liac-backend`). O backend (`liac-backend`) é implantado
separadamente via Supabase (`supabase functions deploy`) — ver o README daquele repositório; o
Vercel **não hospeda** esse backend, ele só serve este frontend estático que conversa com o
projeto Supabase já publicado.

No Vercel especificamente:

1. Importe o repositório — o preset "Vite" é detectado automaticamente (`npm run build`, saída em
   `dist/`).
2. Em Settings → Environment Variables, adicione `VITE_API_BASE_URL` com o valor de
   `.env.example`.
3. `vercel.json` na raiz já faz o rewrite de toda rota pra `/index.html`, necessário porque o
   roteamento (`createBrowserRouter`) é 100% client-side — sem isso, recarregar a página em
   qualquer rota que não seja `/` (ex: `/portal-liac/login`) dá 404.
4. Depois do primeiro deploy, adicione a URL de produção do Vercel (`https://.../definir-senha`)
   em Authentication → URL Configuration → Redirect URLs no Supabase Dashboard do `liac-backend` —
   sem isso os fluxos de convite e "esqueci minha senha" quebram em produção (mesma configuração
   manual já necessária em dev, ver `liac-backend/README.md`).
