# Live semanal 01 - Design

## Objetivo

Criar uma landing page curta em `raevo.io/live-samanal-01` com um único objetivo: levar empresários e responsáveis comerciais ao grupo silencioso de WhatsApp da live semanal da Raevo.

## Público e promessa

O público é formado por empresas de serviços com venda consultiva que recebem oportunidades por WhatsApp, formulários, telefone, redes sociais ou indicação e dependem demais da memória e disponibilidade da equipa.

A linguagem de entrada usa **vendedor de IA**, termo mais conhecido que SDR. A página explica que esse vendedor responde, qualifica, acompanha e encaminha oportunidades para a equipa. Não promete vendas garantidas, autonomia irrestrita, ausência de erros ou substituição completa de pessoas.

## Copy principal

- Eyebrow: `LIVE GRATUITA · SEMANAL · AO VIVO`
- Headline: `Coloque um vendedor de IA para atender, qualificar e encaminhar oportunidades.`
- Apoio: `Descubra a base necessária para a IA trabalhar com qualidade - sem perder o controlo da experiência e das vendas.`
- CTA: `QUERO ENTRAR NO GRUPO DA LIVE`
- Microcopy: `Acesso direto. Sem formulário. O grupo é silencioso e recebe apenas os avisos da aula.`
- Reforço: `Processo + CRM + IA + equipa. Uma operação que continua a funcionar nos dias de correria.`

## Estrutura

1. Barra superior com marca e indicação de live semanal.
2. Hero escuro em estilo “sala de comando”, com copy, CTA e uma composição orbital que representa processo, CRM, IA e equipa.
3. Bloco curto com quatro resultados de aprendizagem: responder com consistência, qualificar, preservar contexto e encaminhar para pessoas.
4. Bloco de adequação para empresas de serviços com venda consultiva.
5. CTA final e atalho flutuante de WhatsApp.

Todos os CTAs usam o link fornecido pelo utilizador: `https://chat.whatsapp.com/GvwmUptt85a7ffgfk1z358?s=cl&p=i&mlu=4&ilr=4`.

## Direção visual

- Canvas principal claro, com branco e verde-água suave para gerar familiaridade.
- Acento tecnológico: ciano Raevo, aplicado com contenção.
- Ação principal: verde oficial do WhatsApp (`#25D366`).
- Tipografia: Sora para títulos e Inter para texto.
- Assinatura: sistema orbital animado de forma discreta, com versão estática para `prefers-reduced-motion`.
- Logo oficial da Raevo no cabeçalho e no rodapé, preservando a proporção original.
- Todos os CTAs exibem o ícone vetorial reconhecível do WhatsApp.
- Botões verdes com contraste alto, foco visível e alvo mínimo de 48 px.
- Mobile-first, sem navegação institucional concorrente e com CTA fixo na parte inferior em ecrãs pequenos.

## Comportamento e privacidade

- Links abrem o convite do grupo na mesma aba.
- Sem formulário ou backend. GTM `GTM-M743KFT8` e Meta Pixel `2076017423284114` instalados exclusivamente nesta rota.

## Verificação

- Teste estrutural para rota, link, copy, acessibilidade e isolamento dos códigos de rastreamento nesta página.
- `pnpm test` e `pnpm build` devem passar.
- QA visual em 1440 px, 768 px e 390 px, incluindo navegação por teclado e movimento reduzido.
