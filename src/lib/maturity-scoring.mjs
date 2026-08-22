export const PILLARS = [
  { key: "opportunities", label: "Geração de oportunidades" },
  { key: "service", label: "Atendimento e qualificação" },
  { key: "process", label: "Processo comercial" },
  { key: "crm_followup", label: "CRM e acompanhamento" },
  { key: "data_management", label: "Dados e gestão" },
  { key: "automation_intelligence", label: "Automação e inteligência" },
];

export const LEVELS = [
  { key: "initial", label: "Inicial", min: 0, max: 20, description: "O comercial depende principalmente das pessoas e não de um processo definido." },
  { key: "reactive", label: "Reativo", min: 21, max: 40, description: "Existem algumas práticas, mas a empresa atua conforme os problemas aparecem." },
  { key: "structured", label: "Estruturado", min: 41, max: 60, description: "Já existem processos, ferramentas e responsabilidades, embora ainda haja inconsistências." },
  { key: "predictable", label: "Previsível", min: 61, max: 80, description: "A empresa acompanha indicadores, conhece as conversões e consegue antecipar resultados." },
  { key: "intelligent", label: "Inteligente", min: 81, max: 100, description: "Dados, automação e inteligência ajudam a empresa a decidir e melhorar continuamente." },
];

export function classifyPercentage(percentage) {
  if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
    throw new RangeError("A percentagem deve ser um inteiro entre 0 e 100.");
  }
  return LEVELS.find((level) => percentage >= level.min && percentage <= level.max);
}

export function rankPillars(pillars, direction = "ascending") {
  const multiplier = direction === "descending" ? -1 : 1;
  return [...pillars].sort((left, right) => {
    const difference = (left.percentage - right.percentage) * multiplier;
    if (difference !== 0) return difference;
    return PILLARS.findIndex((pillar) => pillar.key === left.key)
      - PILLARS.findIndex((pillar) => pillar.key === right.key);
  });
}

export function validateMaturityAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 18) {
    throw new TypeError("O cálculo exige exatamente 18 respostas.");
  }
  answers.forEach((answer) => {
    if (!Number.isInteger(answer) || answer < 0 || answer > 4) {
      throw new RangeError("Cada resposta deve ser um inteiro entre 0 e 4.");
    }
  });
  return true;
}

export function calculateMaturity(answers) {
  validateMaturityAnswers(answers);
  const pillars = PILLARS.map((pillar, index) => {
    const values = answers.slice(index * 3, index * 3 + 3);
    const points = values.reduce((sum, value) => sum + value, 0);
    return { ...pillar, points, maxPoints: 12, percentage: Math.round((points / 12) * 100) };
  });
  const totalPoints = answers.reduce((sum, value) => sum + value, 0);
  const percentage = Math.round((totalPoints / 72) * 100);
  const rankedAscending = rankPillars(pillars, "ascending");
  const rankedDescending = rankPillars(pillars, "descending");
  return {
    totalPoints,
    maxPoints: 72,
    percentage,
    level: classifyPercentage(percentage),
    pillars,
    strongestPillar: rankedDescending[0],
    weakestPillar: rankedAscending[0],
    rankedAscending,
  };
}
