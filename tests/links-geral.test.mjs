import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pagePath = join(root, "src/pages/links-geral.astro");
const stylePath = join(root, "src/styles/links-geral.css");
const logoPath = join(root, "public/assets/brand/raevo-logo-stone-cyan-transparent.png");

assert.ok(existsSync(pagePath), "the links geral route should exist");
assert.ok(existsSync(stylePath), "the links geral route should have isolated styles");
assert.ok(existsSync(logoPath), "the transparent stone and cyan logo should exist");

const page = readFileSync(pagePath, "utf8");
const styles = readFileSync(stylePath, "utf8");

const live = 'href="/live-samanal-01"';
const site = 'class="link-card site" href="/"';
const portugal = 'href="https://wa.me/351963763408"';
const brasil = 'href="https://wa.me/5562982727476"';

for (const phrase of [
  "Escolha o seu",
  "próximo movimento.",
  "Estratégia, tecnologia e execução para transformar operações e acelerar o crescimento.",
  "Live semanal Raevo",
  "Conheça a Raevo",
  "Portugal",
  "Brasil",
  "WhatsApp direto",
]) {
  assert.ok(page.includes(phrase), `links page should include ${phrase}`);
}

for (const href of [live, site, portugal, brasil]) {
  assert.ok(page.includes(href), `links page should include ${href}`);
}

assert.ok(page.indexOf(live) < page.indexOf(site), "live should appear before the institutional site");
assert.ok(page.indexOf(site) < page.indexOf(portugal), "site should appear before Portugal");
assert.ok(page.indexOf(portugal) < page.indexOf(brasil), "Portugal should appear before Brasil");
assert.ok(!page.includes("Alysson"), "the page should not expose a person name");
assert.ok(!page.includes("Equipe Raevo"), "the WhatsApp cards should show only country names");
assert.ok(page.includes("/assets/video/raevo-oficial-hero.mp4"), "the official hero video should be reused");
assert.ok(page.includes("/assets/video/raevo-oficial-hero-poster.jpg"), "the official poster should be reused");
assert.ok(page.includes("/assets/brand/raevo-logo-stone-cyan-transparent.png"), "the transparent approved logo should be used");
assert.ok((page.match(/<svg/g) ?? []).length >= 4, "every destination should have an inline icon");
assert.equal((page.match(/target="_blank"/g) ?? []).length, 2, "only WhatsApp links should open a new tab");
assert.equal((page.match(/rel="noopener noreferrer"/g) ?? []).length, 2, "external WhatsApp links should be isolated");
assert.ok(page.includes("data-links-video"), "the decorative video should be addressable for reduced motion");
assert.ok(page.includes("video.pause()"), "the decorative video should pause for reduced motion");
assert.match(styles, /--carvao:\s*#1f1f1f/i, "the page should use Raevo charcoal");
assert.match(styles, /--pedra:\s*#e9e4da/i, "the page should use Raevo stone");
assert.match(styles, /--champagne:\s*#c7a97a/i, "the page should use Raevo champagne");
assert.match(styles, /--ciano:\s*#00b8c6/i, "the page should use Raevo cyan");
assert.match(styles, /--whatsapp:\s*#25d366/i, "WhatsApp icons should use the official green");
assert.match(styles, /:focus-visible/, "keyboard focus should be visible");
assert.match(styles, /prefers-reduced-motion/, "motion should respect the user preference");
assert.match(styles, /@media\s*\(max-width:\s*640px\)/, "the page should have a mobile layout");

console.log("Links geral route, destinations, branding, and accessibility are present.");
