# Teste de Maturidade Comercial Enxuto — design aprovado

Data: 23 de agosto de 2026

## Objetivo

Reduzir o esforço do Teste de Maturidade Comercial Raevo sem perder a leitura dos seis pilares, tornar explícita a entrega antes do início e mostrar um progresso único do começo ao fim. A experiência continuará a capturar nome, WhatsApp e setor antes de libertar o teste.

## Decisões aprovadas

- O diagnóstico passa de quatro contextos e 18 perguntas pontuadas para dois contextos e 12 perguntas pontuadas.
- Permanecem os contextos de volume mensal de oportunidades e objetivo comercial.
- Saem os contextos de valor médio de venda e tamanho da equipa, pois não afetam o cálculo atual.
- Cada um dos seis pilares terá exatamente duas perguntas pontuadas.
- A introdução, exibida logo após a captura do lead, alinhará visualmente a expectativa: 12 perguntas de diagnóstico, cerca de cinco minutos, resultado imediato, relatório visual e recomendações personalizadas.
- O CTA principal da introdução terá o texto exato “Iniciar o teste”.
- O progresso não reinicia ao mudar de contexto para diagnóstico. Ele representa a quantidade total respondida entre 14 respostas: duas de contexto e 12 pontuadas.
- O botão “Voltar” permanece em todas as páginas. Uma resposta já guardada reaparece selecionada e pode ser alterada; a restauração não avança sozinha, mas uma nova seleção guarda a correção e segue para a próxima rota.

## Banco enxuto de perguntas

### Contexto sem pontuação

1. Quantas novas oportunidades comerciais a empresa recebe, em média, por mês?
2. Qual é o principal objetivo comercial da empresa neste momento?

### Geração de oportunidades

1. A geração de novas oportunidades é rastreada e previsível? Esta pergunta combina rastreio de origem e previsibilidade num único indicador.
2. A empresa possui critérios para avaliar a qualidade das oportunidades?

### Atendimento e qualificação

3. Quanto tempo a empresa demora, normalmente, para responder a uma nova oportunidade?
4. Como a empresa qualifica uma oportunidade? As alternativas superiores incorporam padronização, critérios e registo, absorvendo a antiga pergunta sobre padrão do primeiro contacto.

### Processo comercial

5. As etapas da jornada comercial estão definidas?
6. As responsabilidades comerciais estão claramente distribuídas?

### CRM e acompanhamento

7. Como as oportunidades são organizadas?
8. Existe um processo de follow-up?

### Dados e gestão

9. A empresa conhece as taxas de conversão do processo comercial?
10. Existe uma rotina de acompanhamento comercial? As alternativas superiores incluem conversões por etapa, motivos de perda, responsáveis e ações.

### Automação e inteligência

11. Os canais e ferramentas comerciais estão integrados?
12. A empresa utiliza automações no processo comercial? A utilização de IA deixa de ser um indicador isolado e pode aparecer como evolução dentro da automação estruturada.

## Rotas e navegação

Permanecem URLs distintas para cada resposta. Serão construídas e usadas apenas:

- `/contexto/oportunidades/`;
- `/contexto/objetivo/`;
- `/pergunta/01/` até `/pergunta/12/`;
- `/processando/` e `/resultado/`.

As rotas antigas de valor médio, equipa e perguntas 13 a 18 deixam de ser geradas. O controlador mantém a proteção contra saltos: uma rota futura só abre quando as anteriores estiverem respondidas. Rotas anteriores podem ser abertas para revisão.

## Introdução visual

A página “Antes de começar” manterá a linguagem Raevo em carvão, champagne e ciano. Ela terá:

- título orientado à expectativa: “O seu diagnóstico começa agora.”;
- explicação curta de que não existem respostas certas ou erradas;
- quatro indicadores visuais: “12 perguntas”, “≈ 5 min”, “Resultado imediato” e “Relatório visual”;
- uma faixa que antecipa a entrega: nível geral, desempenho nos seis pilares e prioridades recomendadas;
- CTA principal “Iniciar o teste”;
- ligação secundária “Alterar dados”.

No mobile, os indicadores serão empilhados sem overflow e o CTA manterá área de toque de pelo menos 48 px.

## Progresso total

O total é 14. O valor exibido é calculado a partir das respostas efetivamente guardadas:

`percentagem = round((respostas concluídas / 14) × 100)`

Assim, a primeira página abre em 0%. Após a primeira resposta, a transição apresenta 7%; após os dois contextos, 14%; e a última pergunta chega a 100% antes do processamento. Voltar para uma pergunta respondida não reduz a percentagem. A barra usa `aria-valuenow`, `aria-valuemin="0"` e `aria-valuemax="100"`, e o texto expõe “X% concluído · Y de 14 respostas”.

## Estado e edição

O estado temporário terá uma nova versão para impedir que respostas do questionário de 18 itens sejam interpretadas com a nova numeração. Ele continuará em `sessionStorage` e guardará lead, contextos, respostas e atribuição.

Ao abrir uma página respondida, a alternativa guardada aparece marcada e o botão Continuar fica disponível. Essa hidratação não dispara avanço. Ao escolher outra alternativa, o valor anterior é substituído e a navegação automática ocorre após a mesma transição curta. O botão Voltar sempre aponta para a rota anterior do funil enxuto; na primeira resposta, aponta para a introdução.

## Cálculo e resultado

- Cada resposta vale de 0 a 4 pontos.
- Máximo geral: 48 pontos.
- Cada pilar tem duas perguntas e máximo de 8 pontos.
- A percentagem geral e as percentagens por pilar continuam arredondadas e classificadas nas mesmas cinco faixas.
- Permanecem o nível geral, o pilar mais forte, o pilar com maior oportunidade, as seis barras e as prioridades.
- O servidor PHP valida exatamente 12 respostas e recalcula todo o resultado com máximo 48; o frontend não é fonte de verdade.

Este é um diagnóstico comercial direcional, não um instrumento psicométrico. Duas perguntas por pilar preservam a leitura comparativa necessária para a isca sem permitir que uma única resposta determine toda a área.

## Compatibilidade e publicação

O payload continua com a mesma estrutura de lista `{ question, score }`, agora com perguntas 1 a 12. O backend, os testes de contrato e o resultado serão atualizados juntos. A versão de release das rotas será renovada para impedir que a CDN da Hostinger combine HTML antigo com JavaScript novo.

O deploy será restrito à área do teste, à API de maturidade e aos assets Astro referenciados, preservando as restantes páginas do site.

## Critérios de aceite

1. A captura inicial continua obrigatória antes da introdução.
2. A introdução mostra 12 perguntas, cerca de cinco minutos, resultado imediato e relatório visual.
3. O CTA principal da introdução diz “Iniciar o teste”.
4. O funil contém duas perguntas de contexto e 12 pontuadas.
5. O progresso é único, baseado em respostas guardadas, e chega a 100% na última resposta.
6. Todas as páginas oferecem Voltar e restauram a resposta guardada sem avançar automaticamente.
7. Alterar uma resposta substitui o valor anterior e mantém o restante progresso.
8. O cálculo geral usa máximo 48 e cada pilar usa máximo 8.
9. O servidor rejeita submissões incompletas ou com mais de 12 respostas.
10. O relatório continua a mostrar nível, seis pilares, insight, prioridades e CTA Raevo.
11. O percurso completo funciona em desktop, mobile e teclado.
12. Testes, build e validação no domínio público terminam sem erro.

## Fora de escopo

- instalação de Pixel ou eventos de analytics;
- novos campos de lead;
- PDF ou envio por e-mail;
- lógica adaptativa que acrescente perguntas conforme as respostas;
- alteração visual da landing page principal;
- benchmark externo.
