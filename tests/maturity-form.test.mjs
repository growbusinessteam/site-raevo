import assert from "node:assert/strict";
import {
  buildSubmissionPayload,
  createIdempotencyKey,
  normalizeEmail,
  normalizePhone,
  validateIdentification,
  validateProfile,
} from "../src/lib/maturity-form.mjs";

assert.equal(normalizeEmail("  NOME@Empresa.PT "), "nome@empresa.pt");
assert.equal(normalizePhone("+351 963 763 408"), "+351963763408");
assert.equal(validateProfile(""), true);
assert.equal(validateProfile("raevo.io"), true);
assert.equal(validateProfile("@raevo.io"), true);
assert.equal(validateProfile("perfil sem dominio"), false);

const valid = {
  name: "Ana Silva",
  company: "Empresa Exemplo",
  role: "Sócio ou proprietário",
  email: "ana@empresa.pt",
  countryCode: "+351",
  whatsapp: "963 763 408",
  website: "empresa.pt",
  timeline: "Nos próximos 30 dias",
  privacyAccepted: true,
  marketingAccepted: false,
};
assert.equal(validateIdentification(valid), null);
for (const [field, value] of [
  ["name", ""], ["company", ""], ["role", ""], ["email", "ana@"],
  ["whatsapp", "123"], ["timeline", ""], ["privacyAccepted", false],
]) {
  const error = validateIdentification({ ...valid, [field]: value });
  assert.equal(error.field, field);
}

const state = {
  context: {
    sector: "Consultoria",
    monthly_opportunities: "Entre 11 e 30",
    average_sale_value: "Entre 1.001 € e 3.000 €",
    commercial_team_size: "2 a 3 pessoas",
    main_goal: "Aumentar a conversão",
  },
  answers: Object.fromEntries(Array.from({ length: 18 }, (_, index) => [String(index + 1), 2])),
  attribution: { utm_source: "meta", landing_page: "https://raevo.io/teste-maturidade-comercial/" },
};
const payload = buildSubmissionPayload(valid, state, { idempotencyKey: "assessment-fixed" });
assert.equal(payload.idempotency_key, "assessment-fixed");
assert.equal(payload.person.name, "Ana Silva");
assert.equal(payload.person.email, "ana@empresa.pt");
assert.equal(payload.person.whatsapp, "+351963763408");
assert.equal(payload.company.sector, "Consultoria");
assert.equal(payload.answers.length, 18);
assert.deepEqual(payload.answers[0], { question: 1, score: 2 });
assert.equal(payload.consent.privacy_accepted, true);
assert.equal(payload.consent.marketing_accepted, false);
assert.equal("percentage" in payload, false);
assert.match(createIdempotencyKey(() => "uuid-value"), /^assessment-uuid-value$/);

console.log("Maturity identification and payload validation are correct.");
