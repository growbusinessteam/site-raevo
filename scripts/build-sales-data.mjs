import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const structured = readJson(
  "docs/research/blacksales-diagnostic-structured.json",
);
const objectionExtract = readJson("docs/research/blacksales-objections.json");

const slug = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const stages = [
  {
    id: "pre-call",
    shortTitle: "Pré-call",
    title: "Ficha Inicial",
    subtitle: "Dados do lead e contexto da call",
  },
  {
    id: "rapport",
    shortTitle: "Rapport",
    title: "Rapport Inteligente",
    subtitle: "Dicas de abertura com base nos dados preenchidos",
  },
  {
    id: "abertura",
    shortTitle: "Abertura",
    title: "Abertura da Call",
    subtitle: "Entenda o contexto e motivação do médico",
  },
  {
    id: "diagnostico",
    shortTitle: "Diagnóstico",
    title: "Diagnóstico Principal",
    subtitle: "70% da call — explore cada pilar em profundidade",
  },
  {
    id: "metas",
    shortTitle: "Metas",
    title: "Metas e Financeiro",
    subtitle: "Estado ideal, desafios e inputs financeiros",
  },
  {
    id: "dores",
    shortTitle: "Dores",
    title: "Impedimentos e Dores",
    subtitle: "Explore a dor, o tempo e as perdas acumuladas",
  },
  {
    id: "stack-dor",
    shortTitle: "Stack Dor",
    title: "Empilhamento da Dor",
    subtitle: "Resumo automático para pressionar e gerar urgência",
  },
  {
    id: "plano",
    shortTitle: "Plano",
    title: "Relatório de Gargalos",
    subtitle:
      "Visão completa dos problemas identificados — use para montar o plano de ação na call",
  },
  {
    id: "pitch",
    shortTitle: "Pitch",
    title: "Transição para Pitch",
    subtitle: "Texto pronto no modelo Céu × Inferno",
  },
  {
    id: "oferta",
    shortTitle: "Oferta",
    title: "Preparação de Oferta",
    subtitle: "Resumo executivo e munição comercial para a oferta",
  },
  {
    id: "fechamento",
    shortTitle: "Fechamento",
    title: "Objeções e Fechamento",
    subtitle: "Registre objeções, próximos passos e desfecho da call",
  },
  {
    id: "resumo",
    shortTitle: "Resumo",
    title: "Ficha Resumo do Cliente",
    subtitle: "Visão completa consolidada de toda a call",
  },
];

const diagnostics = structured
  .filter((pillar) => pillar.cards.length)
  .map((pillar) => ({
    id: slug(pillar.tab),
    title: pillar.tab,
    cards: pillar.cards.map((card) => {
      const options = card.buttons.slice(0, -3);
      return {
        id: slug(card.code),
        code: card.code,
        question: card.paragraphs[1],
        hint: card.multi ? "Selecione todas que se aplicam" : "",
        multi: card.multi,
        options: options.map((label, index) => ({
          id: `${slug(card.code)}-opcao-${index + 1}`,
          label,
        })),
        extraFields: card.fields
          .filter(
            (field) =>
              !["Outro cenário", "Observação do closer"].includes(field.label),
          )
          .map((field, index) => ({
            id: `${slug(card.code)}-extra-${index + 1}`,
            label: field.label,
            type:
              field.tag === "TEXTAREA"
                ? "textarea"
                : field.type || "text",
            placeholder: field.placeholder,
          })),
      };
    }),
  }));

const spinPrompts =
  structured.find((pillar) => pillar.tab === "SPIN")?.spin ?? [];

const emojiPattern = /^(\p{Extended_Pictographic}\uFE0F?)\s*/u;
const objections = objectionExtract.map((item, index) => {
  const emoji = item.heading.match(emojiPattern)?.[1] ?? "";
  const headingWithoutEmoji = item.heading.replace(emojiPattern, "");
  const quoteIndex = headingWithoutEmoji.indexOf('"');
  const title =
    quoteIndex === -1
      ? headingWithoutEmoji
      : headingWithoutEmoji.slice(0, quoteIndex).trim();
  const objection =
    quoteIndex === -1 ? "" : headingWithoutEmoji.slice(quoteIndex).trim();
  return {
    id: `objecao-${index + 1}-${slug(title)}`,
    emoji,
    title,
    objection,
    heading: item.heading,
    responses: item.responses,
  };
});

const data = {
  schemaVersion: 1,
  stages,
  painOptions: ["Baixa", "Média", "Alta"],
  rapportPrompts: [
    "Comentar sobre a autoridade construída e como o próximo passo de crescimento é estratégico.",
    "Falar sobre a janela de oportunidade: quem estrutura marketing e comercial com método primeiro domina a praça.",
    "Observar tempo de carreira e experiência — usar como gancho de autoridade.",
    "Comentar sobre o perfil do paciente ideal e como isso conecta com posicionamento.",
    "Perguntar sobre o que mais o médico se orgulha na carreira — gera conexão emocional.",
  ],
  diagnostics,
  spinPrompts,
  objectionTypes: ["Real", "Superficial"],
  objectionCategories: [
    "Tempo",
    "Dinheiro",
    "Prioridade",
    "Confiança",
    "Sócio",
    "Cônjuge",
    "Momento",
  ],
  results: [
    "Comprou",
    "Pix compromisso",
    "Contrato enviado",
    "Segunda reunião agendada",
    "Não avançou",
  ],
  objections,
  pitch: {
    model: "Céu × Inferno",
    promise:
      "Conecte o custo da inércia ao objetivo declarado e apresente dois caminhos possíveis.",
  },
  offer: {
    transitionLines: [
      "Faz sentido para você resolver isso agora ou prefere esperar mais?",
      "O que muda na sua vida se você resolve isso nos próximos 90 dias?",
      "Quanto mais tempo isso ficar assim, mais caro fica resolver depois.",
      "Você prefere continuar tentando sozinho ou ter alguém implementando com você?",
    ],
  },
};

const totalQuestions = diagnostics.reduce(
  (total, pillar) => total + pillar.cards.length,
  0,
);

if (stages.length !== 12) throw new Error("Expected 12 stages");
if (totalQuestions !== 30) throw new Error("Expected 30 diagnostic questions");
if (spinPrompts.length !== 4) throw new Error("Expected 4 SPIN groups");
if (objections.length !== 8) throw new Error("Expected 8 objection groups");

const output = path.join(root, "public/data/sales-playbook.json");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`);

console.log(
  `Generated ${output}: ${stages.length} stages, ${totalQuestions} questions, ${spinPrompts.length} SPIN groups, ${objections.length} objections.`,
);
