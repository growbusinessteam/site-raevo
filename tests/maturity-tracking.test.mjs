import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");
const layoutPath = "src/components/maturity/MaturityLayout.astro";
const layout = read(layoutPath);

assert.match(
  layout,
  /Astro\.url\.pathname\.startsWith\("\/teste-maturidade-comercial\/"\)/,
  "tracking must be restricted to the maturity assessment routes",
);
assert.match(layout, /930433730104908/, "Meta Pixel must use the supplied pixel id");
assert.match(layout, /GTM-T7TVRZCG/, "Google Tag Manager must use the supplied container id");
assert.match(layout, /https:\/\/connect\.facebook\.net\/en_US\/fbevents\.js/);
assert.match(layout, /https:\/\/www\.facebook\.com\/tr\?id=930433730104908&ev=PageView&noscript=1/);
assert.match(layout, /https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=/);
assert.match(layout, /https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-T7TVRZCG/);
assert.equal((layout.match(/\bfbq\(/g) ?? []).length, 2, "no additional Meta Pixel events may be created");
assert.equal((layout.match(/fbq\('init',\s*'930433730104908'\)/g) ?? []).length, 1);
assert.equal((layout.match(/fbq\('track',\s*'PageView'\)/g) ?? []).length, 1);

const collectFiles = (directory) => readdirSync(directory).flatMap((entry) => {
  const absolute = path.join(directory, entry);
  return statSync(absolute).isDirectory() ? collectFiles(absolute) : [absolute];
});

for (const absolute of collectFiles(path.join(root, "src"))) {
  const relative = path.relative(root, absolute);
  if (relative === layoutPath) continue;
  const source = readFileSync(absolute, "utf8");
  assert.doesNotMatch(source, /930433730104908|GTM-T7TVRZCG/, `${relative} must not load the maturity tracking ids`);
}

console.log("Maturity tracking is isolated to the assessment layout.");
