# Teste de Maturidade Comercial Raevo — design aprovado

Data: 22 de agosto de 2026

## Objetivo

Criar uma nova área da Raevo em `raevo.io/teste-maturidade-comercial/` que funcione como isca digital, ferramenta de diagnóstico e ponto de entrada comercial. A experiência deverá permitir que decisores de empresas de serviços avaliem o seu sistema comercial, recebam um resultado personalizado e avancem para uma análise com a Raevo.

O produto deve parecer uma ferramenta própria da Raevo, com profundidade metodológica e acabamento executivo. Não deve parecer um formulário genérico, um quiz infantil ou um site independente.

## Decisões aprovadas

- A entrega inclui a landing page, captura inicial do lead, introdução, quatro perguntas adicionais de contexto, 18 perguntas de maturidade, processamento automático, cálculo, resultado visual, prioridades e integração com CRM.
- Antes de libertar o teste, a experiência recolhe e grava nome, WhatsApp e setor da empresa. O setor deixa de ser perguntado novamente.
- Cada avanço do funil terá uma URL real e distinta. A instalação de eventos ou de um Pixel específico ficará para uma fase posterior.
- A área será uma extensão visual e funcional dos sites oficiais já publicados pela Raevo.
- O gráfico de resultado apresentado no mockup foi aprovado como parte da experiência.
- O backend será leve, servido no mesmo domínio e compatível com o alojamento Apache/Hostinger utilizado pelo projeto.

## Público e linguagem

O teste destina-se a empresários e decisores de empresas de serviços com vendas consultivas, incluindo saúde, contabilidade, arquitetura, engenharia, educação, consultoria, tecnologia e serviços especializados.

A linguagem usará principalmente os termos oportunidades, contactos, potenciais clientes, atendimento, processo comercial, equipa, propostas, vendas e crescimento. O conteúdo principal será em português de Portugal, de acordo com o briefing aprovado.

## Identidade visual

A nova área reutilizará a identidade dos sites oficiais atuais, sem criar uma linguagem paralela:

- logótipo oficial existente em `public/assets/brand/`;
- Sora para títulos, números, percentagens e destaques;
- Inter para textos, controlos e formulários;
- Pedra `#E9E4DA`, Areia `#DCCFBE`, Taupe `#B8AB98`, Carvão `#1F1F1F`, Champagne `#C7A97A` e Ciano `#00B8C6`;
- botões, proporções, linhas finas, pouca curvatura, foco visível e ritmo de espaçamento coerentes com `src/styles/official.css`;
- ciano reservado a progresso, seleção e dados; champagne reservado a CTAs e detalhes institucionais;
- transições discretas, com suporte a `prefers-reduced-motion`.

A landing será editorial, clara e espaçosa. O questionário usará uma área predominantemente em carvão para favorecer concentração. O resultado voltará a uma superfície mineral clara e terá linguagem de relatório executivo.

## Arquitetura de rotas

Todas as rotas deverão funcionar com barra final no alojamento de produção.

| Rota | Função |
| --- | --- |
| `/teste-maturidade-comercial/` | Landing page |
| `/teste-maturidade-comercial/dados-iniciais/` | Captura obrigatória de nome, WhatsApp e setor |
| `/teste-maturidade-comercial/antes-de-comecar/` | Introdução e condições do teste |
| `/teste-maturidade-comercial/contexto/oportunidades/` | Oportunidades mensais |
| `/teste-maturidade-comercial/contexto/valor-medio/` | Valor médio de venda |
| `/teste-maturidade-comercial/contexto/equipa/` | Dimensão da equipa comercial |
| `/teste-maturidade-comercial/contexto/objetivo/` | Objetivo comercial principal |
| `/teste-maturidade-comercial/pergunta/01/` até `/pergunta/18/` | Perguntas de maturidade |
| `/teste-maturidade-comercial/processando/` | Submissão automática e preparação do relatório |
| `/teste-maturidade-comercial/resultado/[token]/` | Resultado recuperável por token |

Cada ecrã será uma página real. A navegação usará links ou redirecionamento para a rota seguinte apenas depois de existir uma resposta válida. A separação de URLs permitirá medir o funil por page view quando o Pixel específico for instalado, sem alterar a arquitetura.

## Landing page

O cabeçalho será simples: logótipo, identificação “Teste de Maturidade Comercial” e CTA “Começar o teste”. Não terá o menu completo do site institucional.

A landing terá as seguintes secções:

1. Hero com “Teste gratuito · Cerca de 5 minutos”, título principal, explicação, CTA e microcopy de resultado visual imediato e ausência de compromisso.
2. Escala visual Inicial → Reativo → Estruturado → Previsível → Inteligente, sem resultados fictícios.
3. “Mais do que uma pontuação”, com nível atual, bloqueios e próximo passo.
4. Os seis pilares do diagnóstico, com ícones lineares discretos.
5. Como funciona, em três passos reais.
6. Pré-visualização explicitamente identificada como “Exemplo de resultado”.
7. CTA final.
8. Rodapé Raevo com privacidade, termos, contacto e direitos reservados.

## Fluxo do questionário

O CTA da landing abre primeiro um ecrã curto de captura com três dados: nome, WhatsApp e setor da empresa. O botão só liberta o teste depois de a API confirmar que o lead foi guardado. Em seguida, a introdução explica a duração, o número de perguntas, o resultado imediato e a utilização das respostas.

As quatro perguntas adicionais de contexto não afetam a pontuação. As 18 perguntas seguintes serão organizadas nos pilares:

1. Geração de oportunidades.
2. Atendimento e qualificação.
3. Processo comercial.
4. CRM e acompanhamento.
5. Dados e gestão.
6. Automação e inteligência.

Cada ecrã de maturidade exibirá:

- nome do pilar;
- número da pergunta e total;
- percentagem de progresso;
- enunciado;
- cinco alternativas grandes, sem mostrar a pontuação interna;
- ação para voltar;
- avanço automático depois de selecionar uma alternativa;
- ação para continuar como alternativa acessível, ativa apenas depois de selecionar uma resposta.

No clique ou ativação direta de uma alternativa, a resposta será guardada primeiro e a próxima URL será aberta após uma transição curta, evitando cliques duplicados. A restauração de uma resposta ao voltar para a página não deverá disparar navegação automática. O utilizador poderá navegar entre alternativas pelas setas do teclado sem ser retirado imediatamente da página; Enter, Espaço ou o botão “Continuar” concluirão a etapa. A resposta selecionada terá texto, contorno e marcador visível, sem depender apenas da cor. No mobile, a ação de continuar permanecerá acessível sem cobrir o conteúdo.

## Persistência temporária e navegação

O identificador do lead, o nome, o WhatsApp normalizado, o setor, os restantes contextos, as respostas e a atribuição serão guardados temporariamente em `sessionStorage`, com uma versão explícita do esquema. Isso permite avançar, voltar e atualizar uma página sem perder o progresso, mas evita persistência indefinida entre sessões do navegador.

As UTMs, `gclid`, `fbclid`, referrer e landing page serão capturados na entrada e preservados durante o funil. Os três dados iniciais serão guardados no backend assim que a captura inicial for validada. Após a conclusão e a abertura bem-sucedida do resultado, o estado temporário com dados pessoais será eliminado do navegador.

Se alguém tentar abrir uma pergunta sem ter concluído as etapas anteriores, a aplicação encaminhará para a primeira etapa incompleta. Se o esquema guardado tiver uma versão incompatível, o teste será reiniciado com uma mensagem clara.

## Captura e conclusão automática

Antes da introdução, a página de captura inicial recolherá:

- nome;
- WhatsApp com indicativo do país;
- setor da empresa;
- aviso e ligação visível para a Política de Privacidade.

Depois da pergunta 18, não haverá outro formulário. A rota de processamento reutilizará o `lead_id`, nome, WhatsApp, setor, contextos e respostas já guardados, enviará a avaliação automaticamente e abrirá a URL tokenizada do resultado. Enquanto processa, exibirá apenas uma mensagem curta de preparação do relatório. Em caso de falha, preservará o estado e oferecerá uma nova tentativa sem pedir dados adicionais.

## Cálculo

O cálculo ficará centralizado num único módulo JavaScript puro, reutilizado pelo frontend e coberto por testes automatizados.

- Cada resposta de maturidade vale de 0 a 4 pontos.
- Máximo geral: 72 pontos.
- Percentagem geral: `round((pontos / 72) × 100)`.
- Cada pilar tem máximo de 12 pontos.
- Percentagem do pilar: `round((pontos / 12) × 100)`.
- A classificação usa a percentagem já arredondada.

Faixas:

| Percentagem | Nível |
| --- | --- |
| 0–20% | Inicial |
| 21–40% | Reativo |
| 41–60% | Estruturado |
| 61–80% | Previsível |
| 81–100% | Inteligente |

Empates entre pilares serão resolvidos pela ordem metodológica dos seis pilares. Isso garante um resultado determinístico para pilar mais forte, pilar com maior oportunidade de evolução e prioridades.

## Backend e integração

O frontend enviará a submissão para um endpoint no mesmo domínio. O endpoint será implementado em PHP por compatibilidade com o alojamento Apache/Hostinger e não dependerá de segredos no bundle público.

Contratos públicos:

- `POST /api/maturidade/leads` grava a captura inicial e devolve `lead_id`;
- `POST /api/maturidade/submissions` cria uma submissão válida;
- `GET /api/maturidade/resultado/{token}` devolve apenas os dados necessários para renderizar o resultado visual;
- todas as outras combinações de método e rota devolvem uma resposta JSON controlada.

Responsabilidades do endpoint:

1. Aceitar apenas `POST` com JSON e tamanho limitado.
2. Validar e guardar nome, WhatsApp, setor, atribuição e aviso de privacidade antes de libertar o teste.
3. Devolver um `lead_id` não enumerável e associá-lo à submissão final.
4. Reutilizar o aviso de privacidade registado na captura inicial e validar o número e o intervalo das respostas.
5. Recalcular todo o resultado no servidor; nunca confiar na percentagem enviada pelo browser.
6. Criar um identificador de avaliação e token criptograficamente aleatórios.
7. Guardar os registos de forma atómica numa pasta privada fora da árvore pública.
8. Encaminhar os eventos de lead inicial e diagnóstico concluído ao webhook definido por `MATURITY_ASSESSMENT_WEBHOOK_URL`.
9. Responder com o token e a URL do resultado.

O webhook não será exposto no frontend. Falhas no CRM serão registadas no servidor. A criação local do resultado será a fonte de sucesso para o visitante, evitando que uma indisponibilidade temporária do CRM destrua o diagnóstico; o registo da falha permitirá reprocessamento operacional.

O destino do CTA comercial será lido de `MATURITY_ASSESSMENT_CTA_URL`. Nenhum dado pessoal ou conjunto completo de respostas será colocado no URL do CTA.

Os resultados ficarão disponíveis durante 180 dias por defeito. O prazo será configurável por `MATURITY_RESULT_RETENTION_DAYS`; um pedido posterior ao prazo devolverá o mesmo estado seguro de um token inexistente. A retenção no CRM seguirá a política de privacidade e os processos próprios desse sistema.

## Resultado

A rota de resultado recuperará os dados pelo token e apresentará:

- identificação “Resultado do Teste de Maturidade Comercial”;
- frase “A sua empresa possui {percentagem}% de maturidade comercial”;
- nível atual e explicação;
- arco de progresso com percentagem central;
- escala textual dos cinco níveis e posição atual;
- Insight Raevo composto pelo insight do nível, pilar mais forte, pilar com maior oportunidade e recomendação principal;
- seis barras horizontais com percentagem por pilar;
- identificação acessível do pilar mais forte e da principal oportunidade;
- três prioridades: duas derivadas dos pilares mais baixos e uma derivada do nível geral;
- aplicação de uma cor de estado por nível: vermelho, laranja, amarelo, azul ou verde;
- CTA principal “Falar com a Raevo sobre este resultado”.

O resultado deixará claro que é uma avaliação baseada nas respostas fornecidas, e não um benchmark de mercado. Download e envio de PDF ficam fora desta fase. Um futuro envio por e-mail deverá usar um fornecedor transacional por SMTP ou API, sem depender de geração no navegador.

## Conteúdo personalizado

Os cinco insights de nível e as seis recomendações de pilar seguirão integralmente o briefing fornecido. As três prioridades usarão uma biblioteca editorial controlada, sem geração por IA no momento do pedido. Isso torna o resultado previsível, rápido e testável.

Cada prioridade terá título, explicação curta e resultado esperado, sem entregar um tutorial completo de implementação.

## Estados de erro

- Estado temporário ausente: encaminhar para a landing ou primeira etapa incompleta.
- Resposta inválida: manter o ecrã atual e explicar o que falta.
- Submissão recusada: preservar o estado do diagnóstico e permitir nova tentativa automática.
- Token inexistente ou expirado: mostrar uma página Raevo clara com ação para refazer o teste.
- Resultado temporariamente indisponível: permitir nova tentativa sem expor detalhes técnicos.
- Falha do webhook: registar no servidor sem bloquear um resultado já guardado.

## Segurança e privacidade

- O servidor recalcula e valida todos os valores.
- Tokens terão entropia suficiente para impedir enumeração prática.
- Respostas da API usarão cabeçalhos para evitar indexação e cache público de dados pessoais.
- O resultado terá `noindex, nofollow`.
- O endpoint aplicará limite de tamanho, método, formato e tentativas por origem quando suportado pelo alojamento.
- Logs não incluirão respostas completas nem dados pessoais desnecessários.
- A redação jurídica dos consentimentos deverá ser revista antes da publicação final.

## Acessibilidade e responsividade

- foco visível e ordem de teclado coerente;
- alternativas operáveis por teclado;
- títulos e regiões semânticas;
- anúncios acessíveis para erros e mudanças de progresso;
- contraste suficiente em superfícies claras e escuras;
- texto principal com pelo menos 16 px no mobile;
- controlos com área de toque mínima de 48 px;
- nenhuma rolagem horizontal em 320 px ou mais;
- suporte a `prefers-reduced-motion`;
- gráficos compreensíveis sem depender apenas de cor.

## Métricas futuras

Nenhum Pixel novo nem evento de analytics será instalado nesta entrega. As URLs separadas de cada etapa permitirão medir entradas, avanços e abandono por page view quando o Pixel específico for adicionado.

Os componentes exporão nomes estáveis de etapa em atributos `data-*`, sem enviar dados a terceiros, para facilitar a instrumentação futura.

## Estratégia de testes

### Automatizados

- fórmula geral e por pilar;
- limites 20/21, 40/41, 60/61 e 80/81;
- resultados para todas as respostas 0, 2 e 4;
- validação de conjunto incompleto ou fora de intervalo;
- desempate determinístico de pilares;
- geração das três prioridades;
- validação e normalização do formulário;
- serialização do payload e atribuição;
- existência e encadeamento de todas as rotas;
- ausência de webhook e segredos no frontend.

### Manuais

- percurso completo no desktop e mobile;
- avançar, voltar e atualizar em diferentes etapas;
- navegação por teclado;
- validação e recuperação de erros;
- resultado a 0%, 50% e 100%;
- gráfico, escala e barras em larguras representativas;
- token inválido;
- build de produção e ausência de regressões nas páginas existentes.

## Critérios de aceite

1. Todas as rotas descritas são construídas e navegáveis.
2. O lead inicial é gravado antes da introdução, e as 22 respostas restantes do diagnóstico são preservadas durante o funil.
3. Não é possível avançar sem uma resposta válida.
4. O cálculo e as classificações cumprem os limites definidos.
5. O backend recalcula e guarda um resultado recuperável por token.
6. O webhook permanece apenas no servidor.
7. O resultado inclui gráfico, pilares, Insight Raevo e três prioridades.
8. O relatório visual usa vermelho, laranja, amarelo, azul ou verde de acordo com o nível, sem depender apenas da cor.
9. O CTA final convida a falar com a Raevo e não oferece download de PDF.
10. A identidade é reconhecivelmente a mesma dos sites oficiais Raevo.
11. Nenhum Pixel específico é adicionado nesta entrega.
12. O fluxo funciona por teclado e em mobile sem overflow.
13. Testes automatizados e build de produção terminam sem erro.
14. Nenhum dado complementar é solicitado depois da captura inicial.

## Fora de escopo

- instalação ou configuração do Pixel específico;
- dashboard administrativo;
- comparação com benchmarks externos;
- geração de recomendações por IA em tempo real;
- edição das perguntas por utilizadores não técnicos;
- autenticação de utilizadores finais.
