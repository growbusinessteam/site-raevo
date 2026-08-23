import assert from "node:assert/strict";
import {
  buildLeadPayload,
  buildSubmissionPayload,
  createIdempotencyKey,
  createLeadIdempotencyKey,
  normalizeEmail,
  normalizePhone,
  splitInternationalPhone,
  validateLeadCapture,
  validateProfile,
} from "../src/lib/maturity-form.mjs";

assert.equal(normalizeEmail("  NOME@Empresa.PT "), "nome@empresa.pt");
assert.equal(normalizePhone("+351 963 763 408"), "+351963763408");
assert.deepEqual(splitInternationalPhone("+55 11 99999-9999", ["+351", "+55", "+34", "+44", "+1"]), {
  countryCode: "+55",
  nationalNumber: "11999999999",
});
assert.equal(validateProfile(""), true);
assert.equal(validateProfile("raevo.io"), true);
assert.equal(validateProfile("@raevo.io"), true);
assert.equal(validateProfile("perfil sem dominio"), false);

const validLead = {
  name: "Ana Silva",
  countryCode: "+351",
  whatsapp: "963 763 408",
  sector: "Consultoria",
};
assert.equal(validateLeadCapture(validLead), null);
for (const [field, value] of [["name", ""], ["whatsapp", "123"], ["sector", ""]]) {
  const error = validateLeadCapture({ ...validLead, [field]: value });
  assert.equal(error.field, field);
}

const state = {
  lead: {
    id: "9f3d70fb-8cb5-45cb-8b1c-76e4904078b8",
    name: "Ana Silva",
    whatsapp: "+351963763408",
    sector: "Consultoria",
  },
  context: {
    sector: "Consultoria",
    monthly_opportunities: "Entre 11 e 30",
    main_goal: "Aumentar a conversão",
  },
  answers: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [String(index + 1), 2])),
  attribution: { utm_source: "meta", landing_page: "https://raevo.io/teste-maturidade-comercial/" },
};
const leadPayload = buildLeadPayload(validLead, state, { idempotencyKey: "lead-fixed", now: () => "2026-08-22T00:00:00.000Z" });
assert.equal(leadPayload.idempotency_key, "lead-fixed");
assert.equal(leadPayload.person.name, "Ana Silva");
assert.equal(leadPayload.person.whatsapp, "+351963763408");
assert.equal(leadPayload.company.sector, "Consultoria");
assert.equal(leadPayload.consent.privacy_notice_shown, true);

const payload = buildSubmissionPayload(state, { idempotencyKey: "assessment-fixed", now: () => "2026-08-22T00:30:00.000Z" });
assert.equal(payload.idempotency_key, "assessment-fixed");
assert.equal(payload.lead_id, "9f3d70fb-8cb5-45cb-8b1c-76e4904078b8");
assert.equal(payload.person.name, "Ana Silva");
assert.equal(payload.person.whatsapp, "+351963763408");
assert.equal(payload.company.sector, "Consultoria");
assert.equal(payload.company.monthly_opportunities, "Entre 11 e 30");
assert.equal(payload.answers.length, 12);
assert.deepEqual(payload.answers[0], { question: 1, score: 2 });
assert.equal(payload.consent.privacy_notice_shown, true);
assert.equal(payload.consent.policy_url, "/privacidade/");
assert.equal("email" in payload.person, false);
assert.equal("role" in payload.person, false);
assert.equal("name" in payload.company, false);
assert.equal("website" in payload.company, false);
assert.equal("improvement_timeline" in payload.company, false);
assert.equal("percentage" in payload, false);
assert.match(createIdempotencyKey(() => "uuid-value"), /^assessment-uuid-value$/);
assert.equal(createLeadIdempotencyKey(() => "uuid-value"), "lead-uuid-value");

console.log("Maturity lead and automatic submission payload validation are correct.");
