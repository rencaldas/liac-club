# Paleta LIAC

Paleta extraída da capa da Liga Acadêmica de Cosmetologia (UFRJ) por
clusterização de pixels (k-means, 10 clusters), ignorando branco puro
(texto/logo) e preto puro (contornos). Ordenada da cor mais fraca
(clara, baixo contraste) à mais forte (escura, saturada).

## Escala de cores

| # | Nome | Hex | RGB | HSL | Papel na arte | Token CSS |
|---|------|-----|-----|-----|----------------|-----------|
| 1 | Rosa claro | `#F5B3C5` | `rgb(245,179,197)` | `hsl(344,77%,83%)` | brilho no canto do blob rosa | `--liac-rosa-claro` |
| 2 | Coral claro | `#FD775C` | `rgb(253,119,92)` | `hsl(10,98%,68%)` | borda do blob laranja | `--liac-coral-claro` |
| 3 | Rosa coral | `#FD5371` | `rgb(253,83,113)` | `hsl(349,98%,66%)` | transição fundo → blob | `--liac-rosa-coral` |
| 4 | Laranja avermelhado | `#F35149` | `rgb(243,81,73)` | `hsl(3,88%,62%)` | núcleo do blob inferior esquerdo | `--liac-laranja` |
| 5 | Vermelho-rosa | `#FC3F57` | `rgb(252,63,87)` | `hsl(352,97%,62%)` | fundo, faixa superior | `--liac-vermelho-rosa` |
| 6 | Magenta vibrante | `#FB3080` | `rgb(251,48,128)` | `hsl(336,96%,59%)` | núcleo do blob rosa superior direito | `--liac-magenta` |
| 7 | Pink | `#F82C69` | `rgb(248,44,105)` | `hsl(342,94%,57%)` | fundo, faixa intermediária | `--liac-pink` |
| 8 | Vermelho-rosa principal | `#F72A59` | `rgb(247,42,89)` | `hsl(346,93%,57%)` | cor dominante do fundo | `--liac-vermelho-rosa-principal` |
| 9 | Vermelho profundo | `#E92948` | `rgb(233,41,72)` | `hsl(350,81%,54%)` | fundo, cantos e bordas | `--liac-vermelho-profundo` |
| 10 | Bordô | `#C2004A` | `rgb(194,0,74)` | `hsl(337,100%,38%)` | cor sólida do logotipo (pote/tampa) | `--liac-bordo` |

Todos os tokens estão definidos em [src/styles/tokens.css](../../src/styles/tokens.css),
junto com os aliases semânticos (`--liac-primary`, `--liac-accent-*` etc.) e os
gradientes derivados (`--liac-gradient-brand`, `--liac-gradient-blob-orange`,
`--liac-gradient-blob-pink`) usados nos componentes.

## Gradientes

```css
/* fundo diagonal, aproximação da arte — --liac-gradient-brand */
background: linear-gradient(135deg,
  #F72A59 0%,
  #FC3F57 30%,
  #F82C69 55%,
  #FB3080 75%,
  #E92948 100%
);

/* blob laranja, inferior esquerdo — --liac-gradient-blob-orange */
background: radial-gradient(circle at 30% 70%,
  #FD775C 0%, #F35149 55%, #E92948 100%);

/* blob rosa, superior direito — --liac-gradient-blob-pink */
background: radial-gradient(circle at 70% 30%,
  #F5B3C5 0%, #FB3080 55%, #F82C69 100%);
```

## Metodologia

- Imagem convertida para array RGB; pixels próximos de branco puro
  (`> 230` em todos os canais) e preto puro (`< 40` em todos os
  canais) foram descartados para não distorcer o cluster com o texto
  "LIAC" e o contorno do ícone.
- K-means com `k=10` sobre os pixels restantes; cada centroide vira
  uma cor da paleta, ponderada pelo tamanho do cluster.
- Ordenação final por luminância (`0.2126R + 0.7152G + 0.0722B`),
  do valor mais alto (mais fraco/claro) ao mais baixo (mais
  forte/escuro).
