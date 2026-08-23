import { LEVELS, PILLARS } from "../lib/maturity-scoring.mjs";

export type MaturityOption = { label: string; value: string; score?: number };
export type MaturityStep = {
  key: string;
  slug: string;
  question: string;
  options: MaturityOption[];
  helper?: string;
};
export type MaturityQuestion = MaturityStep & { number: number; pillarKey: string; pillarLabel: string };

const option = (label: string, value: string): MaturityOption => ({ label, value });
const scored = (label: string, score: number): MaturityOption => ({ label, value: String(score), score });

export const contextSteps: MaturityStep[] = [
  {
    key: "sector", slug: "setor", question: "Em que setor atua a sua empresa?",
    options: ["Saúde e clínicas", "Contabilidade e serviços financeiros", "Arquitetura e engenharia", "Educação e formação", "Consultoria", "Tecnologia", "Serviços profissionais", "Outro"].map((label) => option(label, label)),
  },
  {
    key: "monthly_opportunities", slug: "oportunidades", question: "Quantas novas oportunidades comerciais a empresa recebe, em média, por mês?",
    options: ["Até 10", "Entre 11 e 30", "Entre 31 e 100", "Entre 101 e 300", "Mais de 300", "Não sabemos"].map((label) => option(label, label)),
  },
  {
    key: "main_goal", slug: "objetivo", question: "Qual é o principal objetivo comercial da empresa neste momento?",
    options: ["Gerar mais oportunidades", "Melhorar o atendimento", "Aumentar a conversão", "Organizar o processo comercial", "Implementar ou melhorar o CRM", "Automatizar tarefas e follow-ups", "Acompanhar melhor os resultados", "Ainda não temos clareza"].map((label) => option(label, label)),
  },
];

const question = (number: number, pillarKey: string, prompt: string, alternatives: string[]): MaturityQuestion => {
  const pillar = PILLARS.find((item) => item.key === pillarKey)!;
  return { key: `q${number}`, slug: String(number).padStart(2, "0"), number, pillarKey, pillarLabel: pillar.label, question: prompt, options: alternatives.map((label, score) => scored(label, score)) };
};

export const maturityQuestions: MaturityQuestion[] = [
  question(1, "opportunities", "A geração de novas oportunidades é rastreada e previsível?", [
    "Não sabemos de onde vêm e não existe previsibilidade", "Conhecemos apenas o canal principal e o volume varia muito", "Registamos parte das origens e temos estimativas ocasionais", "Registamos a maioria das origens, com metas e acompanhamento mensal", "Analisamos origem, campanha, qualidade e previsão por canal",
  ]),
  question(2, "opportunities", "A empresa possui critérios para avaliar a qualidade das oportunidades?", [
    "Todas são tratadas da mesma forma", "A equipa possui uma perceção informal", "Existem alguns critérios básicos", "Os critérios de qualificação estão definidos", "Os critérios são definidos, registados e revistos com base nas conversões",
  ]),
  question(3, "service", "Quanto tempo a empresa demora, normalmente, para responder a uma nova oportunidade?", [
    "Mais de 24 horas ou não sabemos", "No mesmo dia, mas normalmente após várias horas", "Entre 1 e 4 horas", "Entre 15 e 60 minutos", "Em menos de 15 minutos, com responsabilidade e prazo definidos",
  ]),
  question(4, "service", "Como a empresa qualifica uma oportunidade?", [
    "Não existe qualificação nem um padrão de atendimento", "A abordagem depende da experiência de quem atende", "Existem algumas perguntas ou mensagens comuns", "Existem critérios, perguntas e uma abordagem definida", "A qualificação é padronizada, treinada e registada no CRM",
  ]),
  question(5, "process", "As etapas da jornada comercial estão definidas?", [
    "Não existem etapas claras", "A equipa conhece algumas etapas informalmente", "Existe um funil básico", "As etapas e objetivos estão documentados", "Cada etapa possui critérios claros de entrada, avanço e conclusão",
  ]),
  question(6, "process", "As responsabilidades comerciais estão claramente distribuídas?", [
    "Não existe clareza sobre responsabilidades", "As responsabilidades são decididas conforme a situação", "Existem responsáveis, mas ocorrem falhas e sobreposições", "Cada etapa possui um responsável", "Existem responsáveis, prazos, alertas e acompanhamento",
  ]),
  question(7, "crm_followup", "Como as oportunidades são organizadas?", [
    "Em conversas, memória pessoal ou anotações dispersas", "Em folhas de cálculo ou ferramentas não centralizadas", "Existe CRM, mas é utilizado apenas parcialmente", "O CRM centraliza a maioria das oportunidades", "O CRM é a fonte principal da operação e é utilizado por toda a equipa",
  ]),
  question(8, "crm_followup", "Existe um processo de follow-up?", [
    "Não existe", "O follow-up acontece quando alguém se lembra", "Existem algumas mensagens ou tarefas", "Existe uma sequência definida", "A sequência é personalizada, acompanhada e parcialmente automatizada",
  ]),
  question(9, "data_management", "A empresa conhece as taxas de conversão do processo comercial?", [
    "Não conhece", "Conhece apenas a quantidade final de vendas", "Acompanha alguns números manualmente", "Conhece as conversões das principais etapas", "Analisa conversões por etapa, período, canal e responsável",
  ]),
  question(10, "data_management", "Existe uma rotina de acompanhamento comercial?", [
    "Não existe", "Os resultados são analisados apenas quando surge um problema", "Existem reuniões, números ou registos ocasionais", "Existe acompanhamento periódico de conversões e motivos de perda", "Existe uma rotina com indicadores, perdas padronizadas, responsáveis, decisões e ações",
  ]),
  question(11, "automation_intelligence", "Os canais e ferramentas comerciais estão integrados?", [
    "As informações estão dispersas", "A equipa transfere informações manualmente", "Existem algumas integrações", "Os principais canais estão ligados", "A informação circula entre os sistemas com monitorização e controlo",
  ]),
  question(12, "automation_intelligence", "A empresa utiliza automações no processo comercial?", [
    "Não utiliza", "Utiliza apenas respostas automáticas simples", "Automatiza algumas tarefas ou utiliza IA individualmente", "Automatiza tarefas, alertas e acompanhamentos", "Automação e IA apoiam o processo de forma monitorizada e continuamente melhorada",
  ]),
];

export const maturityLevels = LEVELS;
export const maturityPillars = PILLARS;

export const levelInsights: Record<string, { insight: string; nextStep: string; risk: string }> = {
  initial: {
    insight: "A operação comercial ainda depende principalmente do esforço individual das pessoas. A ausência de processos claros dificulta o acompanhamento das oportunidades e torna os resultados pouco previsíveis.",
    nextStep: "O primeiro passo não é automatizar. É definir a jornada, as responsabilidades e a forma como cada oportunidade deve ser acompanhada.",
    risk: "O crescimento aumenta a dependência de memória, esforço individual e decisões sem contexto.",
  },
  reactive: {
    insight: "A empresa já possui algumas práticas e ferramentas, mas a operação ainda reage aos acontecimentos conforme eles surgem.",
    nextStep: "O próximo passo é substituir ações isoladas por um processo comercial consistente, utilizado por toda a equipa.",
    risk: "Práticas isoladas perdem força quando o volume cresce ou as responsabilidades mudam.",
  },
  structured: {
    insight: "A empresa já possui parte importante da estrutura necessária, mas ainda existem falhas de utilização, integração ou acompanhamento.",
    nextStep: "O próximo salto depende de tornar o processo consistente, mensurável e menos dependente de esforço individual.",
    risk: "A estrutura existe, mas as inconsistências impedem que ela produza previsibilidade.",
  },
  predictable: {
    insight: "A empresa já acompanha boa parte do processo e possui capacidade de antecipar resultados.",
    nextStep: "A próxima evolução está na utilização mais inteligente dos dados, na integração dos sistemas e na melhoria contínua da operação.",
    risk: "Sistemas desconectados e decisões tardias podem limitar a eficiência alcançada.",
  },
  intelligent: {
    insight: "A empresa possui um sistema comercial avançado, apoiado por processos, dados e tecnologia.",
    nextStep: "O desafio passa a ser melhorar continuamente a eficiência, identificar novas oportunidades e impedir que a complexidade reduza a consistência.",
    risk: "A complexidade pode crescer mais depressa do que a capacidade de manter o sistema consistente.",
  },
};

export const pillarRecommendations: Record<string, { title: string; body: string; outcome: string }> = {
  opportunities: { title: "Dar visibilidade à origem e à qualidade", body: "Centralizar a origem das oportunidades, definir critérios de qualidade e acompanhar a diferença entre volume gerado e oportunidades realmente qualificadas.", outcome: "Investimento comercial orientado pela qualidade das oportunidades." },
  service: { title: "Estruturar resposta e qualificação", body: "Definir prazos de resposta, padronizar a abordagem inicial e estabelecer critérios claros de qualificação.", outcome: "Atendimento mais rápido, consistente e preparado para priorizar." },
  process: { title: "Desenhar a jornada comercial", body: "Desenhar a jornada completa, definir critérios de avanço e atribuir responsabilidades para cada etapa.", outcome: "Cada oportunidade avança com um próximo passo e um responsável claro." },
  crm_followup: { title: "Centralizar acompanhamento no CRM", body: "Centralizar as oportunidades no CRM e criar uma sequência consistente de tarefas, follow-ups e reativação.", outcome: "Menos oportunidades esquecidas e mais continuidade comercial." },
  data_management: { title: "Criar uma rotina de gestão", body: "Definir indicadores essenciais, padronizar os motivos de perda e criar uma rotina periódica de análise e decisão.", outcome: "Decisões comerciais apoiadas por dados comparáveis." },
  automation_intelligence: { title: "Automatizar processos já validados", body: "Organizar os processos antes de automatizar e integrar progressivamente as tarefas que já possuem uma lógica validada.", outcome: "Mais eficiência sem automatizar desorganização." },
};

export const maturityRoles = ["Sócio ou proprietário", "Diretor", "Responsável comercial", "Responsável de marketing", "Gestor", "Profissional da equipa", "Outro"];
export const improvementTimelines = ["Imediatamente", "Nos próximos 30 dias", "Entre 1 e 3 meses", "Entre 3 e 6 meses", "Ainda estamos a avaliar"];
