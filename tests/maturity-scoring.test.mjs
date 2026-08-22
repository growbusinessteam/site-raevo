import assert from "node:assert/strict";
import {
  calculateMaturity,
  classifyPercentage,
  rankPillars,
} from "../src/lib/maturity-scoring.mjs";

const allZero = calculateMaturity(Array(18).fill(0));
assert.equal(allZero.percentage, 0);
assert.equal(allZero.level.key, "initial");
assert.deepEqual(allZero.pillars.map((pillar) => pillar.percentage), Array(6).fill(0));

const allTwo = calculateMaturity(Array(18).fill(2));
assert.equal(allTwo.percentage, 50);
assert.equal(allTwo.level.key, "structured");
assert.deepEqual(allTwo.pillars.map((pillar) => pillar.percentage), Array(6).fill(50));

const allFour = calculateMaturity(Array(18).fill(4));
assert.equal(allFour.percentage, 100);
assert.equal(allFour.level.key, "intelligent");
assert.deepEqual(allFour.pillars.map((pillar) => pillar.percentage), Array(6).fill(100));

for (const [percentage, key] of [
  [20, "initial"], [21, "reactive"], [40, "reactive"],
  [41, "structured"], [60, "structured"], [61, "predictable"],
  [80, "predictable"], [81, "intelligent"],
]) {
  assert.equal(classifyPercentage(percentage).key, key);
}

assert.throws(() => calculateMaturity(Array(17).fill(2)), /18 respostas/);
assert.throws(() => calculateMaturity([...Array(17).fill(2), 5]), /entre 0 e 4/);
assert.throws(() => classifyPercentage(-1), /entre 0 e 100/);

const uneven = calculateMaturity([
  4, 4, 4,
  0, 0, 0,
  2, 2, 2,
  1, 1, 1,
  3, 3, 3,
  2, 2, 2,
]);
assert.equal(uneven.strongestPillar.key, "opportunities");
assert.equal(uneven.weakestPillar.key, "service");
assert.deepEqual(rankPillars(uneven.pillars, "ascending").map((pillar) => pillar.key), [
  "service", "crm_followup", "process", "automation_intelligence", "data_management", "opportunities",
]);

console.log("Maturity scoring behaves as specified.");
