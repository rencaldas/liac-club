<!--
Sync Impact Report
- Version change: [template] → 1.0.0 (initial ratification)
- Modified principles: n/a (first version)
- Added sections: Core Principles (I-VI), Não-Objetivos Explícitos, Stack e Qualidade, Governance
- Removed sections: template placeholders and example comments
- Templates requiring updates: .specify/templates/plan-template.md (⚠ pending review against
  Principle I/IV when /speckit-plan runs), .specify/templates/spec-template.md (⚠ pending review),
  .specify/templates/tasks-template.md (⚠ pending review)
- Follow-up TODOs: none — all placeholders resolved from project brief
-->

# LIAC Club Constitution

## Core Principles

### I. Fronteira Frontend-Only (NÃO-NEGOCIÁVEL)

Este repositório contém exclusivamente código de frontend (React 18 + Vite + TypeScript),
responsável apenas por visualização e renderização. Nenhuma lógica de servidor — requisições
HTTP reais, banco de dados, ORM, autenticação/autorização real, upload de arquivos, envio real
de formulário ou e-mail — pode existir neste repositório. Toda leitura de dados passa por uma
camada de abstração (`ApiClient`); a única implementação presente neste repo é mockada, lendo
fixtures JSON locais e simulando latência/paginação. Nenhuma chamada `fetch`/`axios` para um
servidor externo real é permitida em componentes ou serviços. Trocar o mock pela implementação
real DEVE ser possível substituindo apenas a implementação injetada, sem alterar componentes.
Racional: o backend é construído em repositório separado; misturar as responsabilidades cria
acoplamento prematuro e abre espaço para lógica "provisória" que nunca é removida.

### II. Fidelidade à Identidade Visual LIAC

Os tokens de design (`src/styles/tokens.css`) DEVEM implementar exatamente a paleta de cores e
a tipografia do design system do projeto: cor de marca `--liac-primary` (#C2004B), gradiente de
marca magenta→vermelho→coral, tipografia Playfair Display (display/headings) e Poppins
(corpo/UI). Nenhuma cor "inventada" fora dos tokens documentados é permitida. Combinações de
texto sobre fundo DEVEM respeitar as notas de contraste documentadas — em particular, texto
branco sobre `--liac-gradient-mid` (#ED2835) só é aprovado para texto grande/bold (H1/H2,
~4.2:1), nunca para corpo de texto pequeno. Racional: a marca é o diferencial visual do produto;
inconsistência de cor ou tipografia dilui a identidade e pode violar acessibilidade.

### III. Componentização Modular e Pequena

Componentes DEVEM ter responsabilidade única e ser pequenos o suficiente para serem legíveis em
uma tela; componentes "deus" que acumulam múltiplas responsabilidades são proibidos. Nenhum
teste existente PODE ser removido ao longo do projeto — testes que precisarem mudar de
comportamento devem ser atualizados, não apagados. Racional: mantém o código navegável por
qualquer membro da equipe e evita regressões silenciosas.

### IV. Contrato de API Mockado como Interface Estável

O contrato REST esperado do backend futuro (endpoints, métodos HTTP, shape de request/response)
DEVE ser documentado em `/specs/contracts/api-contract.md` antes de, ou junto com, a
implementação da camada mock correspondente. Esse documento é a especificação que o backend
(construído separadamente) deverá implementar. Racional: desacopla o desenvolvimento do
frontend do backend sem perder rastreabilidade do contrato entre eles.

### V. Acessibilidade WCAG AA

Todo texto DEVE atender contraste mínimo AA, HTML semântico é obrigatório, atributos ARIA devem
ser usados onde a semântica nativa não for suficiente, e o layout é mobile-first e responsivo em
todos os breakpoints suportados. Racional: a LIAC se dirige tanto à comunidade acadêmica quanto
ao público externo; acessibilidade é requisito de alcance, não um extra opcional.

### VI. Desenvolvimento Incremental com Gates de Aprovação

O trabalho é conduzido em fases sequenciais (constitution → specify → clarify → plan → tasks →
implement), seguindo a metodologia Spec-Driven Development via GitHub Spec Kit. Fases que geram
muitos arquivos (plan, tasks, implement) EXIGEM aprovação humana explícita antes de prosseguir
para a próxima. A implementação usa commits pequenos e descritivos; ao final de cada bloco de
tarefas relacionadas, um resumo DEVE ser apresentado antes de seguir ao próximo bloco. Racional:
projetos amplos sem checkpoints divergem da intenção original e ficam caros de corrigir
tardiamente.

## Não-Objetivos Explícitos

As seguintes capacidades estão fora de escopo deste repositório e NÃO DEVEM ser implementadas,
nem de forma "provisória":

- Servidor Node/Express ou de qualquer outra stack de backend.
- Banco de dados ou ORM.
- Autenticação/autorização real (uma "área de membro" na UI, se existir, é protótipo visual sem
  lógica de sessão real).
- Envio real de formulário ou e-mail.
- Configuração de deploy além de notas básicas de hospedagem estática (Vercel/Netlify) no
  README.

## Stack e Qualidade

React 18 + Vite + TypeScript; roteamento via React Router; estilo via CSS Modules (ou Tailwind
quando acelerar sem comprometer fidelidade à marca) mais o arquivo central de tokens
(`src/styles/tokens.css`). Testes de componente com Vitest + Testing Library cobrindo cards,
listagens e formulário. `npm run test` DEVE rodar sem falhas antes de qualquer merge. SSR/SSG
está fora de escopo nesta fase; uma futura migração para Next.js fica documentada como débito
técnico caso SEO de artigos vire prioridade.

## Governance

Esta constituição tem precedência sobre qualquer prática, atalho ou preferência individual em
conflito com ela. Emendas exigem: (1) proposta explícita descrevendo a mudança e o racional,
(2) atualização deste documento com um Sync Impact Report, (3) versionamento semântico do
documento — MAJOR para remoção ou redefinição incompatível de princípios, MINOR para novo
princípio ou seção materialmente nova, PATCH para esclarecimentos e correções redacionais. Toda
revisão de código/PR DEVE verificar conformidade com os princípios I-VI acima; complexidade que
os viole deve ser justificada explicitamente ou rejeitada.

**Version**: 1.0.0 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-29
