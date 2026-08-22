import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  captureAttribution,
  createAssessmentState,
  getFirstIncompletePath,
  getNextPath,
  getPreviousPath,
  readState,
  setContextAnswer,
  setMaturityAnswer,
} from "../src/lib/maturity-state.mjs";

assert.equal(STORAGE_KEY, "raevo:maturity:v1");

const attribution = captureAttribution({
  href: "https://raevo.io/teste-maturidade-comercial/?utm_source=meta&utm_campaign=diagnostico&fbclid=abc",
  referrer: "https://instagram.com/",
});
assert.equal(attribution.utm_source, "meta");
assert.equal(attribution.utm_campaign, "diagnostico");
assert.equal(attribution.fbclid, "abc");
assert.equal(attribution.landing_page, "https://raevo.io/teste-maturidade-comercial/?utm_source=meta&utm_campaign=diagnostico&fbclid=abc");
assert.equal(attribution.referrer, "https://instagram.com/");

const fresh = createAssessmentState({ href: "https://raevo.io/teste-maturidade-comercial/", referrer: "" });
assert.equal(fresh.version, 1);
assert.deepEqual(fresh.context, {});
assert.deepEqual(fresh.answers, {});
assert.equal(getFirstIncompletePath(fresh), "/teste-maturidade-comercial/contexto/setor/");

const withSector = setContextAnswer(fresh, "sector", "Consultoria");
assert.deepEqual(fresh.context, {});
assert.equal(withSector.context.sector, "Consultoria");
assert.equal(getFirstIncompletePath(withSector), "/teste-maturidade-comercial/contexto/oportunidades/");

let completedContext = withSector;
for (const [key, value] of [
  ["monthly_opportunities", "Entre 11 e 30"],
  ["average_sale_value", "Entre 1.001 € e 3.000 €"],
  ["commercial_team_size", "2 a 3 pessoas"],
  ["main_goal", "Aumentar a conversão"],
]) completedContext = setContextAnswer(completedContext, key, value);
assert.equal(getFirstIncompletePath(completedContext), "/teste-maturidade-comercial/pergunta/01/");

const firstAnswer = setMaturityAnswer(completedContext, 1, 3);
assert.equal(firstAnswer.answers["1"], 3);
assert.equal(getFirstIncompletePath(firstAnswer), "/teste-maturidade-comercial/pergunta/02/");
assert.throws(() => setMaturityAnswer(firstAnswer, 19, 2), /entre 1 e 18/);
assert.throws(() => setMaturityAnswer(firstAnswer, 2, 8), /entre 0 e 4/);

assert.equal(getNextPath("/teste-maturidade-comercial/contexto/objetivo/"), "/teste-maturidade-comercial/pergunta/01/");
assert.equal(getPreviousPath("/teste-maturidade-comercial/pergunta/01/"), "/teste-maturidade-comercial/contexto/objetivo/");
assert.equal(getNextPath("/teste-maturidade-comercial/pergunta/18/"), "/teste-maturidade-comercial/identificacao/");
assert.equal(readState({ version: 99 }), null);
assert.equal(readState("invalid"), null);

console.log("Maturity progress state is versioned and deterministic.");
