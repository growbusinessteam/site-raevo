const LEVEL_INSIGHTS = {
  initial: {
    insight: "A operação comercial ainda depende principalmente do esforço individual das pessoas. A ausência de processos claros dificulta o acompanhamento das oportunidades e torna os resultados pouco previsíveis.",
    next_step: "O primeiro passo não é automatizar. É definir a jornada, as responsabilidades e a forma como cada oportunidade deve ser acompanhada.",
    risk: "O crescimento aumenta a dependência de memória, esforço individual e decisões sem contexto.",
  },
  reactive: {
    insight: "A empresa já possui algumas práticas e ferramentas, mas a operação ainda reage aos acontecimentos conforme eles surgem.",
    next_step: "O próximo passo é substituir ações isoladas por um processo comercial consistente, utilizado por toda a equipa.",
    risk: "Práticas isoladas perdem força quando o volume cresce ou as responsabilidades mudam.",
  },
  structured: {
    insight: "A empresa já possui parte importante da estrutura necessária, mas ainda existem falhas de utilização, integração ou acompanhamento.",
    next_step: "O próximo salto depende de tornar o processo consistente, mensurável e menos dependente de esforço individual.",
    risk: "A estrutura existe, mas as inconsistências impedem que ela produza previsibilidade.",
  },
  predictable: {
    insight: "A empresa já acompanha boa parte do processo e possui capacidade de antecipar resultados.",
    next_step: "A próxima evolução está na utilização mais inteligente dos dados, na integração dos sistemas e na melhoria contínua da operação.",
    risk: "Sistemas desconectados e decisões tardias podem limitar a eficiência alcançada.",
  },
  intelligent: {
    insight: "A empresa possui um sistema comercial avançado, apoiado por processos, dados e tecnologia.",
    next_step: "O desafio passa a ser melhorar continuamente a eficiência, identificar novas oportunidades e impedir que a complexidade reduza a consistência.",
    risk: "A complexidade pode crescer mais depressa do que a capacidade de manter o sistema consistente.",
  },
};

const PILLAR_RECOMMENDATIONS = {
  opportunities: { title: "Dar visibilidade à origem e à qualidade", body: "Centralizar a origem das oportunidades, definir critérios de qualidade e acompanhar a diferença entre volume gerado e oportunidades realmente qualificadas.", outcome: "Investimento comercial orientado pela qualidade das oportunidades." },
  service: { title: "Estruturar resposta e qualificação", body: "Definir prazos de resposta, padronizar a abordagem inicial e estabelecer critérios claros de qualificação.", outcome: "Atendimento mais rápido, consistente e preparado para priorizar." },
  process: { title: "Desenhar a jornada comercial", body: "Desenhar a jornada completa, definir critérios de avanço e atribuir responsabilidades para cada etapa.", outcome: "Cada oportunidade avança com um próximo passo e um responsável claro." },
  crm_followup: { title: "Centralizar acompanhamento no CRM", body: "Centralizar as oportunidades no CRM e criar uma sequência consistente de tarefas, follow-ups e reativação.", outcome: "Menos oportunidades esquecidas e mais continuidade comercial." },
  data_management: { title: "Criar uma rotina de gestão", body: "Definir indicadores essenciais, padronizar os motivos de perda e criar uma rotina periódica de análise e decisão.", outcome: "Decisões comerciais apoiadas por dados comparáveis." },
  automation_intelligence: { title: "Automatizar processos já validados", body: "Organizar os processos antes de automatizar e integrar progressivamente as tarefas que já possuem uma lógica validada.", outcome: "Mais eficiência sem automatizar desorganização." },
};

export const RESULT_LEVEL_COLORS = {
  initial: "#E4574F",
  reactive: "#F08B43",
  structured: "#D6B21F",
  predictable: "#3F83D8",
  intelligent: "#38A66B",
};

export function composeInsight(result) {
  const level = LEVEL_INSIGHTS[result.level.key];
  const recommendation = PILLAR_RECOMMENDATIONS[result.weakestPillar.key];
  return {
    ...level,
    strongest_pillar: result.strongestPillar.label,
    weakest_pillar: result.weakestPillar.label,
    recommendation: recommendation.body,
    summary: `${level.insight} O principal ponto positivo está em ${result.strongestPillar.label}. A maior oportunidade de evolução está em ${result.weakestPillar.label}. ${level.next_step}`,
  };
}

export function buildPriorities(result) {
  const [first, second] = result.rankedAscending;
  const level = LEVEL_INSIGHTS[result.level.key];
  return [
    { number: 1, pillar: first.label, ...PILLAR_RECOMMENDATIONS[first.key] },
    { number: 2, pillar: second.label, ...PILLAR_RECOMMENDATIONS[second.key] },
    { number: 3, pillar: null, title: "Preparar o próximo nível de maturidade", body: level.next_step, outcome: "Uma evolução sustentada para além de ações isoladas." },
  ];
}

export function buildPublicResult(record) {
  const result = record.result;
  return {
    assessment_id: record.assessment_id,
    submitted_at: record.submitted_at,
    expires_at: record.expires_at,
    person: { name: String(record.person?.name ?? "") },
    company: { sector: String(record.company?.sector ?? "") },
    result,
    insight: composeInsight(result),
    priorities: buildPriorities(result),
    cta_url: record.cta_url || "/agendamento/",
    methodology: "Resultado calculado através da metodologia de maturidade comercial da Raevo.",
  };
}

export function sanitizeCompanySlug(value) {
  return String(value ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " e ")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "empresa";
}

export function getCommercialMessage(publicResult) {
  return `Olá, concluí o Teste de Maturidade Comercial da Raevo. O resultado da minha empresa foi ${publicResult.result.percentage}% — nível ${publicResult.result.level.label}. Gostaria de analisar este resultado e perceber os próximos passos.`;
}

export { LEVEL_INSIGHTS, PILLAR_RECOMMENDATIONS };
