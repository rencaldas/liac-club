# Quickstart: Área da Equipe LIAC

Guia de validação end-to-end desta feature. Pré-requisito: a feature 001 já implementada e
rodando (ver `specs/001-liac-club-platform/quickstart.md` para o setup base).

## Cenários de validação (mapeados às User Stories do spec.md)

1. **Proteção de rota (US1)** — sem logar, acessar `/portal-liac/novidades`; confirmar
   redirecionamento para `/portal-liac/login`.
2. **Login inválido (US1)** — em `/portal-liac/login`, enviar credenciais erradas; confirmar
   mensagem de erro genérica (não indica se foi e-mail ou senha).
3. **Login válido (US1)** — logar com a credencial `member` de `src/mocks/staffAccounts.json`
   (ver README); confirmar acesso ao painel e que o item de menu "Histórico" **não** aparece.
4. **Login como Diretora (US1, US8)** — logar com a credencial `director`; confirmar que
   "Histórico" aparece no menu e é acessível.
5. **Bloqueio por papel (US8)** — autenticado como `member`, tentar acessar
   `/portal-liac/historico` digitando a URL diretamente; confirmar bloqueio/redirecionamento.
6. **CRUD de Novidades (US2)** — criar uma novidade pelo painel; em outra aba (mesma sessão de
   navegador), confirmar que ela aparece em `/novidades`; editá-la e confirmar a mudança
   refletida; excluí-la (confirmando o modal) e confirmar que desaparece.
7. **Destaque no carrossel (US2-4)** — marcar uma novidade, um evento e um artigo como
   "Destacar no carrossel"; acessar `/` e confirmar que o carrossel da Home mostra esses itens
   em vez dos puramente mais recentes.
8. **Fallback cronológico (US2-4)** — desmarcar todos os destaques de um tipo de conteúdo;
   confirmar que a Home volta a mostrar os 3 mais recentes daquele tipo.
9. **Evento multi-dia (US3)** — criar um evento com `startDate` ≠ `endDate` pelo painel;
   confirmar que a listagem pública de Eventos mostra o intervalo corretamente.
10. **Alterações não salvas (Edge Case)** — abrir o formulário de edição de um item, alterar um
    campo sem salvar, e tentar navegar para outra tela do painel; confirmar o aviso de
    confirmação antes de descartar.
11. **Histórico de Alterações (US8)** — autenticado como Diretora, realizar 2-3 ações (criar,
    editar, excluir) logado como `member` em outra sessão/aba anônima; voltar como Diretora e
    confirmar que todas aparecem no histórico com autor e horário corretos, mais recente
    primeiro; testar o filtro por autor.
12. **Reset ao recarregar (Assumption)** — após criar/editar itens, recarregar a página (F5);
    confirmar que os dados voltam ao estado original das fixtures (comportamento esperado do
    mock em memória, documentado como limitação conhecida).

## Testes automatizados

```bash
npm run test
```

Cobertura mínima adicional a US1-US8 (feature 001): guard de autenticação, guard de papel
`director`, emissão de entrada de auditoria por cada tipo de ação, e o fallback
featured→cronológico da Home.
