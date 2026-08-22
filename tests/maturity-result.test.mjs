import assert from "node:assert/strict";
import { calculateMaturity } from "../src/lib/maturity-scoring.mjs";
import {
  buildPriorities,
  buildPublicResult,
  composeInsight,
  getCommercialMessage,
  sanitizeCompanySlug,
} from "../src/lib/maturity-result.mjs";

const result = calculateMaturity([
  4, 4, 4,
  1, 1, 1,
  3, 3, 3,
  0, 0, 0,
  2, 2, 2,
  2, 2, 2,
]);
const insight = composeInsight(result);
assert.equal(insight.strongest_pillar, "Geração de oportunidades");
assert.equal(insight.weakest_pillar, "CRM e acompanhamento");
assert.match(insight.summary, /Geração de oportunidades/);
assert.match(insight.summary, /CRM e acompanhamento/);
assert.doesNotMatch(insight.summary, /pior área/i);

const priorities = buildPriorities(result);
assert.equal(priorities.length, 3);
assert.equal(priorities[0].pillar, "CRM e acompanhamento");
assert.equal(priorities[1].pillar, "Atendimento e qualificação");
assert.equal(priorities[2].pillar, null);
assert.ok(priorities.every((priority) => priority.title && priority.body && priority.outcome));

const publicResult = buildPublicResult({
  assessment_id: "id",
  submitted_at: "2026-08-22T00:00:00Z",
  expires_at: "2027-02-18T00:00:00Z",
  person: { name: "Ana Silva", email: "private@example.com" },
  company: { name: "Clínica São João" },
  result,
  cta_url: "/agendamento/",
});
assert.equal(publicResult.person.name, "Ana Silva");
assert.equal("email" in publicResult.person, false);
assert.equal(publicResult.priorities.length, 3);
assert.equal(sanitizeCompanySlug("Clínica São João & Filhos"), "clinica-sao-joao-e-filhos");
assert.match(getCommercialMessage(publicResult), /nível/);
assert.match(getCommercialMessage(publicResult), /%/);

console.log("Maturity result insights and priorities are deterministic.");
