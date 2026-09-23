import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const page = read("src/pages/vendas.astro");
assert.match(page, /width="755"\s+height="166"/, "sales playbook should declare the real Raevo logo dimensions");
assert.match(page, /id="stage-nav"/);
assert.match(page, /id="stage-content"/);
assert.match(page, /id="prev-step"/);
assert.match(page, /id="next-step"/);
assert.match(page, /id="new-call"/);

const data = JSON.parse(read("public/data/sales-playbook.json"));
assert.equal(data.stages.length, 12, "the playbook must expose 12 stages");

const diagnosticQuestionCount = data.diagnostics.reduce(
  (total, pillar) => total + pillar.cards.length,
  0,
);
assert.equal(
  diagnosticQuestionCount,
  30,
  "the playbook must expose all 30 diagnostic questions",
);
assert.equal(
  data.spinPrompts.length,
  4,
  "the SPIN library must have four groups",
);
assert.equal(
  data.objections.length,
  8,
  "the objection library must have eight categories",
);

const controller = read("public/scripts/sales-playbook.js");
assert.match(controller, /localStorage/);
assert.match(controller, /navigator\.clipboard/);
assert.match(controller, /window\.print/);

const styles = read("public/styles/sales-playbook.css");
assert.match(styles, /#c4a34f/i);
assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
assert.match(
  styles,
  /\.sales-brand img\s*\{\s*max-width:\s*88px;\s*height:\s*auto;/,
  "mobile sales logo should preserve its intrinsic ratio",
);
assert.match(styles, /@media\s+print/);

console.log(
  `Sales playbook verified: ${data.stages.length} stages, ${diagnosticQuestionCount} diagnostic questions, ${data.objections.length} objection groups.`,
);
