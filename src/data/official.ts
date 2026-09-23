export type OfficialLocale = "pt-PT" | "pt-BR";

type Card = { title: string; body: string };
type Solution = Card & { outcome: string; icon: string };

export interface OfficialContent {
  locale: OfficialLocale;
  country: "PT" | "BR";
  flag: "🇵🇹" | "🇧🇷";
  switchLabel: string;
  alternateHref: string;
  homeHref: string;
  formHref: string;
  phonePrefix: "+351" | "+55";
  seo: { title: string; description: string; canonicalPath: string };
  nav: { label: string; href: string }[];
  hero: { eyebrow: string; title: string; body: string; cta: string; secondary: string };
  labels: Record<string, string>;
  problems: Card[];
  journey: { label: string; detail: string }[];
  solutions: Solution[];
  method: Card[];
  audience: Card[];
  form: {
    title: string; intro: string; next: string; back: string; submit: string;
    submitting: string; retry: string;
    questions: { id: "name" | "whatsapp" | "companyProfile"; label: string; placeholder: string }[];
  };
  thanks: { eyebrow: string; title: string; body: string; back: string };
  footer: { claim: string; terms: string; privacy: string; contact: string };
}

const journey = [
  ["Aquisição", "Canais e campanhas"], ["Atendimento", "Resposta e qualificação"],
  ["CRM", "Pipeline e responsabilidades"], ["Proposta", "Criação e envio"],
  ["Follow-up", "Cadência multicanal"], ["Venda", "Decisão e passagem"],
  ["Análise", "Origem, custos e desempenho"],
].map(([label, detail]) => ({ label, detail }));

const pt: OfficialContent = {
  locale: "pt-PT", country: "PT", flag: "🇵🇹", switchLabel: "Ver versão do Brasil",
  alternateHref: "/br-oficial/", homeHref: "/pt-oficial/", formHref: "/pt-oficial/forms/", phonePrefix: "+351",
  seo: { title: "Raevo | Sistemas comerciais para empresas de serviços", description: "Estratégia, processos, CRM, automação e aquisição ligados para empresas de serviços com vendas consultivas.", canonicalPath: "/pt-oficial/" },
  nav: [{ label: "Home", href: "#home" }, { label: "O problema", href: "#problema" }, { label: "Sistema Raevo", href: "#sistema" }, { label: "Soluções", href: "#solucoes" }, { label: "Método", href: "#metodo" }],
  hero: { eyebrow: "Estratégia · Sistemas · Operação", title: "Transformamos operações comerciais fragmentadas em sistemas de crescimento.", body: "Ligamos processos, tecnologia e aquisição para a sua empresa crescer com mais clareza e controlo.", cta: "Conhecer o sistema", secondary: "Ver soluções" },
  labels: { problemsEyebrow: "Quando a operação cresce sem sistema", problemsTitle: "O problema raramente é a falta de oportunidades.", problemsBody: "É a falta de uma estrutura capaz de conduzir cada oportunidade com contexto, consistência e dados.", systemEyebrow: "Sistema Comercial Raevo", systemTitle: "Tudo o que move a venda, ligado.", systemBody: "Uma jornada única entre aquisição, atendimento, sistemas e decisão.", solutionsEyebrow: "O que implementamos", solutionsTitle: "Soluções que funcionam como um único sistema.", methodEyebrow: "Método", methodTitle: "Da leitura da operação à melhoria contínua.", portfolioEyebrow: "Experiência aplicada", portfolioTitle: "Estrutura comercial para operações que precisam de clareza.", portfolioBody: "A Raevo trabalha entre estratégia e execução: desenha a jornada, implementa a tecnologia e acompanha a adoção do processo.", audienceTitle: "Para empresas prontas para crescer com controlo.", finalTitle: "Vamos mapear a sua operação.", finalBody: "Uma conversa para perceber os gargalos, as prioridades e o sistema que faz sentido construir.", finalCta: "Falar com a Raevo", clients: "Empresas que já confiaram na Raevo" },
  problems: [{ title: "Oportunidades dispersas", body: "Os contactos chegam por vários canais, mas falta uma visão única do que precisa de atenção." }, { title: "WhatsApp sem processo", body: "Conversas importantes ficam dependentes da memória e da rotina de cada pessoa." }, { title: "Follow-up irregular", body: "A oportunidade arrefece quando o acompanhamento não acontece no momento certo." }, { title: "Decisões sem dados", body: "Sem ligar origem, custo e venda, é difícil saber onde investir e o que corrigir." }],
  journey,
  solutions: [
    { title: "Diagnóstico comercial", body: "Mapeamos perdas, tempos de resposta, decisões e responsabilidades em toda a jornada.", outcome: "As prioridades passam a ter uma ordem clara.", icon: "troubleshoot" },
    { title: "CRM ligado ao WhatsApp", body: "Implementamos pipeline, histórico, tarefas e conversas no canal onde a equipa atende.", outcome: "Cada oportunidade ganha contexto e um próximo passo visível.", icon: "hub" },
    { title: "Jornada e dashboard comercial", body: "Acompanhamos custo por lead, custo por venda, tempo médio de fecho, origem e conversão por canal.", outcome: "O investimento concentra-se no que produz resultado real.", icon: "monitoring" },
    { title: "Integração entre CRM e ERP", body: "Ligamos os sistemas para transferir dados comerciais e operacionais sem repetição manual.", outcome: "A equipa poupa tempo e reduz erros.", icon: "sync_alt" },
    { title: "Propostas automáticas", body: "Transformamos dados da oportunidade em propostas consistentes, prontas para revisão e envio.", outcome: "A resposta torna-se mais rápida sem perder controlo.", icon: "description" },
    { title: "Automação de follow-ups por WhatsApp e e-mail", body: "Criamos cadências automáticas com mensagens, pausas e tarefas humanas nos momentos certos.", outcome: "Mais oportunidades recebem acompanhamento.", icon: "schedule_send" },
    { title: "IA de atendimento", body: "Configuramos IA com contexto, regras e encaminhamento para responder, qualificar e apoiar a equipa.", outcome: "Os casos certos chegam às pessoas certas.", icon: "smart_toy" },
    { title: "Funis de captação com mídia paga", body: "Criamos páginas, campanhas, segmentação e otimização ligadas aos dados comerciais.", outcome: "A aquisição é avaliada pela qualidade e pelas vendas.", icon: "campaign" },
    { title: "Operação de crescimento", body: "Acompanhamos indicadores, adoção do processo e oportunidades de melhoria.", outcome: "O sistema evolui com a empresa.", icon: "moving" },
  ],
  method: [{ title: "Diagnosticar", body: "Ler a operação, os dados e os gargalos." }, { title: "Desenhar", body: "Definir jornada, processos e responsabilidades." }, { title: "Implementar", body: "Configurar sistemas, integrações, automações e formação." }, { title: "Otimizar", body: "Acompanhar indicadores e melhorar continuamente." }],
  audience: [{ title: "Venda consultiva", body: "A decisão exige conversa, contexto e acompanhamento." }, { title: "Fluxo de oportunidades", body: "A empresa já gera procura ou está pronta para a criar com consistência." }, { title: "Liderança envolvida", body: "Existe um decisor disposto a priorizar processo, dados e mudança." }],
  form: { title: "Vamos mapear a sua operação", intro: "Três respostas para iniciarmos a conversa com contexto.", next: "Continuar", back: "Voltar", submit: "Enviar respostas", submitting: "A enviar...", retry: "Não foi possível enviar agora. Verifique a ligação e tente novamente.", questions: [{ id: "name", label: "Nome", placeholder: "Como se chama?" }, { id: "whatsapp", label: "WhatsApp", placeholder: "963 763 408" }, { id: "companyProfile", label: "Instagram ou site da empresa", placeholder: "@empresa ou empresa.pt" }] },
  thanks: { eyebrow: "Recebemos os seus dados", title: "Obrigado por partilhar o contexto da sua empresa.", body: "A equipa Raevo irá analisar as informações e entrar em contacto pelo WhatsApp indicado.", back: "Voltar ao site" },
  footer: { claim: "Visão para evoluir. Sistemas para crescer.", terms: "Termos de Uso", privacy: "Privacidade", contact: "Contacto" },
};

const br: OfficialContent = {
  ...pt,
  locale: "pt-BR", country: "BR", flag: "🇧🇷", switchLabel: "Ver versão de Portugal",
  alternateHref: "/pt-oficial/", homeHref: "/br-oficial/", formHref: "/br-oficial/forms/", phonePrefix: "+55",
  seo: { title: "Raevo | Sistemas comerciais para empresas de serviços", description: "Estratégia, processos, CRM, automação e aquisição conectados para empresas de serviços com vendas consultivas.", canonicalPath: "/br-oficial/" },
  hero: { ...pt.hero, body: "Conectamos processos, tecnologia e aquisição para sua empresa crescer com mais clareza e controle." },
  labels: { ...pt.labels, problemsBody: "É a falta de uma estrutura capaz de conduzir cada oportunidade com contexto, consistência e dados.", systemTitle: "Tudo o que move a venda, conectado.", audienceTitle: "Para empresas prontas para crescer com controle.", finalTitle: "Vamos mapear sua operação.", finalBody: "Uma conversa para entender os gargalos, as prioridades e o sistema que faz sentido construir.", clients: "Empresas que já confiaram na Raevo" },
  problems: [{ title: "Oportunidades espalhadas", body: "Os contatos chegam por vários canais, mas falta uma visão única do que precisa de atenção." }, { title: "WhatsApp sem processo", body: "Conversas importantes ficam dependentes da memória e da rotina de cada pessoa." }, { title: "Follow-up irregular", body: "A oportunidade esfria quando o acompanhamento não acontece no momento certo." }, { title: "Decisões sem dados", body: "Sem conectar origem, custo e venda, é difícil saber onde investir e o que corrigir." }],
  solutions: pt.solutions.map((item) => ({ ...item, title: item.title.replace("ligado", "conectado").replace("media", "mídia"), body: item.body.replaceAll("equipa", "equipe").replace("Ligamos", "Conectamos").replace("fecho", "fechamento").replace("ligadas", "conectadas"), outcome: item.outcome.replaceAll("equipa", "equipe").replace("poupa", "economiza").replace("controlo", "controle") })),
  method: [{ title: "Diagnosticar", body: "Ler a operação, os dados e os gargalos." }, { title: "Desenhar", body: "Definir jornada, processos e responsabilidades." }, { title: "Implementar", body: "Configurar sistemas, integrações, automações e treinamento." }, { title: "Otimizar", body: "Acompanhar indicadores e melhorar continuamente." }],
  audience: [{ title: "Venda consultiva", body: "A decisão exige conversa, contexto e acompanhamento." }, { title: "Fluxo de oportunidades", body: "A empresa já gera demanda ou está pronta para criá-la com consistência." }, { title: "Liderança envolvida", body: "Existe um decisor disposto a priorizar processo, dados e mudança." }],
  form: { title: "Vamos mapear sua operação", intro: "Três respostas para começarmos a conversa com contexto.", next: "Continuar", back: "Voltar", submit: "Enviar respostas", submitting: "Enviando...", retry: "Não foi possível enviar agora. Verifique sua conexão e tente novamente.", questions: [{ id: "name", label: "Nome", placeholder: "Como você se chama?" }, { id: "whatsapp", label: "WhatsApp", placeholder: "11 99999-8888" }, { id: "companyProfile", label: "Instagram ou site da empresa", placeholder: "@empresa ou empresa.com.br" }] },
  thanks: { eyebrow: "Recebemos seus dados", title: "Obrigado por compartilhar o contexto da sua empresa.", body: "A equipe Raevo vai analisar as informações e entrar em contato pelo WhatsApp informado.", back: "Voltar ao site" },
  footer: { ...pt.footer, contact: "Contato" },
};

export const officialContent: Record<OfficialLocale, OfficialContent> = { "pt-PT": pt, "pt-BR": br };
