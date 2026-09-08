# Links geral Raevo — Design

## Objetivo

Criar e publicar em `https://raevo.io/links-geral` uma página curta de links da Raevo, com apresentação premium e foco em mobile. A rota usa o domínio oficial `raevo.io`; a grafia `raevvo.io` mencionada inicialmente é tratada como lapso de escrita.

## Conteúdo e ordem

A página apresenta quatro destinos nesta ordem:

1. **Live semanal Raevo** — abre `/live-samanal-01`.
2. **Conheça a Raevo** — abre `/`.
3. **Portugal** — abre `https://wa.me/351963763408`.
4. **Brasil** — abre `https://wa.me/5562982727476`.

Os dois contactos exibem apenas o país e o rótulo `WhatsApp direto`, sem nomes de pessoas. O título principal é `Escolha o seu próximo movimento.` e o texto de apoio é `Estratégia, tecnologia e execução para transformar operações e acelerar o crescimento.`

## Direção visual

A página usa somente a linguagem já publicada da Raevo:

- fundo em vídeo com `/assets/video/raevo-oficial-hero.mp4` e poster `/assets/video/raevo-oficial-hero-poster.jpg`;
- overlay escuro equivalente ao hero oficial para manter contraste;
- tipografia Sora nos títulos e Inter no conteúdo;
- paleta carvão `#1F1F1F`, pedra `#E9E4DA`, champagne `#C7A97A` e ciano `#00B8C6`;
- verde oficial do WhatsApp apenas nos ícones dos contactos;
- logo stone + ciano baseada no ficheiro fornecido `Raevo - ID Visual (1).png`, com fundo realmente transparente, sem bloco, placa ou halo;
- largura da logo próxima de `162px` no desktop e `140px` no mobile.

## Estrutura e interação

O conteúdo fica centrado numa coluna de largura controlada sobre o vídeo. A Live e o Site ocupam cartões de largura completa. Portugal e Brasil formam duas colunas em ecrãs maiores e uma coluna no mobile.

Cada destino tem ícone reconhecível, título, descrição curta e seta. Os cartões usam transparência, desfoque controlado e degradês restritos às cores da marca. Hover e foco elevam o cartão e transformam a seta; movimento reduzido desativa animações. Toda a área de cada cartão é clicável.

## Acessibilidade e comportamento

- HTML semântico com um único `h1` e links com nomes acessíveis.
- Contraste suficiente sobre o vídeo e foco de teclado visível em ciano.
- Alvos com altura mínima de 48px.
- Vídeo decorativo, mudo, em loop e com `playsinline`; o poster cobre falhas de carregamento.
- `prefers-reduced-motion` pausa o vídeo e remove animações.
- Links internos abrem na mesma aba; WhatsApp abre numa nova aba com `rel="noopener noreferrer"`.

## Arquitetura

A implementação cria uma rota Astro isolada em `src/pages/links-geral.astro`, um stylesheet próprio em `src/styles/links-geral.css` e um ativo de logo transparente em `public/assets/brand/`. Não reutiliza o layout institucional completo porque cabeçalho e rodapé competiriam com a função de diretório de links.

## Verificação

- Teste estrutural para confirmar rota, ordem, URLs, copy, ícones, vídeo e atributos de acessibilidade.
- `pnpm test` e `pnpm build` devem passar.
- QA visual em 1440px, 768px e 390px, incluindo hover, teclado e movimento reduzido.
- Após validação local, publicar na Hostinger pelo fluxo oficial do projeto e confirmar `https://raevo.io/links-geral` em produção.
