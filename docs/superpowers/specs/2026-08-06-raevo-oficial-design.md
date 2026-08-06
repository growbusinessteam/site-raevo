# Raevo Oficial PT/BR - Design aprovado

Data: 6 de agosto de 2026

## Objetivo

Criar o novo site institucional da Raevo para empresas de serviços com vendas consultivas. A experiência terá duas versões localizadas, manterá a identidade visual da landing médica existente e apresentará a Raevo como uma empresa que conecta estratégia, processos, tecnologia e aquisição.

O site será predominantemente institucional e de portfólio. Não exibirá preços nesta fase.

## Escopo de rotas

| Rota | Função |
| --- | --- |
| `/` | Página oficial de Portugal |
| `/pt-oficial` | Página oficial de Portugal |
| `/pt-oficial/forms` | Formulário português |
| `/pt-oficial/forms/obrigado` | Confirmação portuguesa |
| `/br-oficial` | Página oficial do Brasil |
| `/br-oficial/forms` | Formulário brasileiro |
| `/br-oficial/forms/obrigado` | Confirmação brasileira |
| `/pt-med` e rotas descendentes | Landing médica existente, preservada sem alterações |

As versões PT e BR usarão a mesma arquitetura e os mesmos componentes. O conteúdo será localizado por país. A raiz renderizará o mesmo conteúdo de `/pt-oficial`.

## Público

Empresas de serviços com vendas consultivas, especialmente negócios que:

- atendem oportunidades por telefone ou WhatsApp;
- possuem ticket ou valor de contrato relevante;
- dependem de acompanhamento antes da decisão;
- usam ou precisam implantar CRM;
- querem integrar marketing, atendimento, vendas e operação;
- têm um decisor disposto a acompanhar a implementação.

## Posicionamento e tom

A Raevo será apresentada como parceira de transformação comercial, não como uma agência genérica. O discurso deve mostrar clareza operacional, integração e previsibilidade sem promessas exageradas.

Os benefícios aparecerão como consequência das entregas:

- menos dependência de memória e tarefas manuais;
- atendimento e acompanhamento mais consistentes;
- visão clara das oportunidades e do custo de aquisição;
- decisões baseadas nos canais e ações que realmente geram vendas;
- economia de tempo em atividades repetitivas;
- crescimento com mais controle e capacidade de previsão.

O português da versão BR será natural para o Brasil. A versão PT usará português de Portugal, incluindo termos como contacto, equipa, acompanhamento comercial e média de fecho quando apropriado.

## Arquitetura da página

### 1. Header

Reutilizar exatamente a linguagem visual e o comportamento do header da landing existente:

- mesmo logo e ativos oficiais;
- mesma paleta, tipografia, proporções, espaçamento, estados e menu móvel;
- links âncora adaptados à nova página;
- CTA para o formulário do país atual;
- seletor compacto com bandeira e sigla do país atual.

O seletor alternará entre `/pt-oficial` e `/br-oficial`, preservando parâmetros UTM. Na raiz, Portugal será o país atual.

### 2. Hero

Tese principal em BR:

> Transformamos operações comerciais fragmentadas em sistemas de crescimento.

Texto de apoio:

> Conectamos processos, tecnologia e aquisição para sua empresa crescer com mais clareza e controle.

A versão PT terá localização equivalente. A composição manterá o ritmo visual da landing existente, com fundo, tipografia, botão e movimentos coerentes com a identidade atual.

### 3. O problema real

Apresentar as fricções reconhecíveis pelo público:

- leads espalhados e sem prioridade;
- WhatsApp sem processo ou histórico centralizado;
- follow-ups esquecidos;
- propostas demoradas;
- marketing sem rastreamento até a venda;
- CRM e ERP desconectados;
- decisões tomadas sem dados confiáveis.

### 4. Sistema Comercial Raevo

Esta será a assinatura visual da nova página. Um diagrama mostrará a jornada integrada:

`Aquisição -> Atendimento -> CRM -> Proposta -> Follow-up -> Venda -> Análise`

O diagrama deve parecer parte da identidade Raevo, usando carvão, pedra, champagne e ciano. Não deve parecer um dashboard genérico. No desktop, a jornada poderá ser horizontal; no mobile, deverá se reorganizar verticalmente sem rolagem lateral obrigatória.

### 5. Soluções

Apresentar as entregas como partes de um sistema conectado:

1. Diagnóstico comercial para identificar gargalos, perdas e prioridades.
2. Implantação de CRM já conectado ao WhatsApp.
3. Mapeamento e acompanhamento da jornada de vendas.
4. Dashboard comercial com custo por lead, custo por venda, tempo médio de fechamento, origem dos clientes e desempenho por canal.
5. Integração entre CRM e ERP para transferir informações e reduzir retrabalho.
6. Automação da criação de propostas.
7. Automação de follow-ups por WhatsApp e e-mail.
8. IA de atendimento ao cliente com regras, contexto e encaminhamento humano.
9. Criação e gestão de funis de captação com mídia paga.

Cada item terá explicação suficiente para tornar a entrega concreta e um benefício indireto, sem excesso de linguagem promocional.

### 6. Método

Apresentar quatro fases reais e sequenciais:

1. Diagnosticar a operação, os dados e os gargalos.
2. Desenhar a jornada, os processos e as responsabilidades.
3. Implementar sistemas, integrações, automações e treinamento.
4. Acompanhar indicadores e otimizar continuamente.

### 7. Portfólio e autoridade

Reutilizar os logotipos já disponíveis no projeto e apresentar tipos de operação e entregas realizadas. Não serão criadas métricas, depoimentos ou resultados sem fonte verificável.

### 8. Para quem é

Explicar que a Raevo atende empresas de serviços e vendas consultivas com fluxo recorrente de oportunidades, pelo menos uma pessoa envolvida no atendimento ou nas vendas e liderança disposta a priorizar o projeto.

### 9. CTA final

Convite consultivo, sem preço e sem urgência artificial. CTA sugerido:

> Vamos mapear sua operação

O destino será o formulário do país atual.

### 10. Footer

Reutilizar exatamente a identidade, estrutura e comportamento do footer atual. Header e footer serão iguais nas versões PT e BR, com localização apenas do texto e dos links de país.

## Formulários

Cada país terá um formulário próprio com a experiência visual em etapas já usada pela Raevo.

Campos obrigatórios:

1. Nome.
2. WhatsApp, com `+351` como padrão em Portugal e `+55` no Brasil.
3. Instagram ou site da empresa.

O terceiro campo aceitará tanto um identificador iniciado por `@` quanto uma URL ou domínio legível. A validação não deve impedir formatos comuns válidos.

O payload enviado ao webhook atual incluirá:

- os três valores informados;
- país e locale;
- URL e página de origem;
- parâmetros UTM persistidos;
- data e hora do envio, quando o fluxo atual já fornecer essa informação.

O botão final ficará desabilitado durante o envio. Se houver erro, o formulário mostrará uma mensagem clara, preservará as respostas e permitirá nova tentativa. O redirecionamento ocorrerá somente após confirmação de sucesso do webhook:

- PT: `/pt-oficial/forms/obrigado`;
- BR: `/br-oficial/forms/obrigado`.

## Páginas de obrigado

As páginas manterão a mesma identidade do formulário e confirmarão que os dados foram recebidos. Terão uma ação para voltar à página oficial do país correspondente. Não haverá alegação de agendamento ou registro em sistemas internos que o visitante não precise conhecer.

## Arquitetura técnica

Criar uma camada compartilhada de componentes Astro para:

- header e seletor de país;
- footer;
- seções da landing;
- diagrama do Sistema Comercial Raevo;
- formulário em etapas;
- página de obrigado.

O conteúdo localizado ficará em uma estrutura de dados tipada para impedir divergência de layout entre PT e BR. As páginas de rota escolherão o locale e passarão os dados aos componentes.

A landing `/pt-med` continuará servindo seus arquivos atuais. A nova implementação não importará nem sobrescreverá os arquivos `public/stitch` usados por ela.

## Acessibilidade e responsividade

- navegação por teclado e foco visível;
- menu móvel operável e com estado acessível;
- campos com rótulos programáticos e mensagens de erro associadas;
- contraste consistente com a identidade atual;
- respeito a `prefers-reduced-motion`;
- nenhuma rolagem horizontal em larguras móveis comuns;
- CTAs e controles com área de toque adequada.

## SEO e localização

- títulos e descrições próprios por país;
- `lang="pt-PT"` em Portugal e `lang="pt-BR"` no Brasil;
- canonical por rota;
- links `hreflang` entre PT e BR;
- raiz canonicalizada como versão portuguesa principal, sem criar redirecionamento automático por geolocalização.

## Testes e critérios de aceite

1. `/` e `/pt-oficial` exibem a versão portuguesa.
2. `/br-oficial` exibe a versão brasileira.
3. O seletor de país aponta para a versão oposta e preserva UTMs.
4. Header e footer têm a mesma estrutura e estilo nas duas versões.
5. Todos os CTAs apontam para o formulário do país atual.
6. Os formulários contêm apenas os três campos solicitados.
7. Validação, estado de envio, erro e nova tentativa funcionam sem perda de dados.
8. Sucesso redireciona para a página de obrigado correta.
9. O payload inclui país, origem e rastreamento.
10. Não há preços na nova landing.
11. `/pt-med` e suas rotas continuam funcionando com o conteúdo atual.
12. O projeto conclui testes automatizados e build de produção sem erro.
13. A página é inspecionada visualmente em desktop e mobile antes da entrega.

## Direção visual aprovada

A direção escolhida foi "Evolução da identidade atual", com uma restrição explícita: a identidade não será reinterpretada. Logo, paleta, tipografia, menu, footer, botões, proporções e linguagem de movimento deverão seguir a landing existente. A novidade visual será exclusivamente o modo de organizar o conteúdo oficial e o diagrama da jornada comercial.

## Fontes de comunicação

O posicionamento foi derivado dos três mapas estratégicos fornecidos: arquitetura de ofertas, narrativa de transformação e perfil de cliente ideal. Esses materiais orientam o foco em empresas de serviços, vendas consultivas, CRM, WhatsApp, dados, processos, implementação e crescimento previsível.
