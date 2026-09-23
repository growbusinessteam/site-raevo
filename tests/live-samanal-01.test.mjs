import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pagePath = join(root, "src/pages/live-samanal-01.astro");
const stylePath = join(root, "src/styles/live-semanal.css");
const iconPath = join(root, "src/components/WhatsAppIcon.astro");

assert.ok(existsSync(pagePath), "the live page route should exist");
assert.ok(existsSync(stylePath), "the live page should have isolated styles");
assert.ok(existsSync(iconPath), "the WhatsApp icon component should exist");

const page = readFileSync(pagePath, "utf8");
const styles = readFileSync(stylePath, "utf8");
const icon = readFileSync(iconPath, "utf8");
const whatsappUrl = "https://chat.whatsapp.com/DXya5we7sNfA6TxFfbokzF?mode=gi_t";

const collectAstroFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectAstroFiles(path);
    return entry.name.endsWith(".astro") ? [path] : [];
  });

for (const phrase of [
  "vendedor de IA",
  "atender, qualificar e encaminhar oportunidades",
  "LIVE GRATUITA",
  "Processo",
  "CRM",
  "Equipe",
]) {
  assert.ok(page.includes(phrase), `live page should include ${phrase}`);
}

assert.ok(page.includes(whatsappUrl), "all CTAs should use the approved WhatsApp group");
assert.ok(
  !page.includes("HI9VyLX4nSZLKUTR1c5yma"),
  "the expired WhatsApp invitation should not remain in the page",
);
assert.ok(
  (page.match(/data-whatsapp-cta/g) || []).length >= 3,
  "the page should repeat the WhatsApp CTA at least three times",
);
for (const trackingId of ["GTM-M743KFT8", "2076017423284114"]) {
  assert.ok(page.includes(trackingId), `the live page should include ${trackingId}`);
  for (const astroFile of collectAstroFiles(join(root, "src"))) {
    if (astroFile === pagePath) continue;
    assert.ok(
      !readFileSync(astroFile, "utf8").includes(trackingId),
      `${trackingId} should be isolated to live-samanal-01.astro`,
    );
  }
}
assert.ok((page.match(/GTM-M743KFT8/g) || []).length >= 2, "GTM should include script and noscript fallbacks");
assert.ok((page.match(/2076017423284114/g) || []).length >= 2, "Meta Pixel should include script and noscript fallbacks");
assert.ok(page.includes("aria-label"), "the page should expose accessible labels");
assert.ok(
  page.includes("TERÇA-FEIRA · 🇧🇷 12H BRASIL · 🇵🇹 16H PORTUGAL"),
  "the live schedule should show the correct Brazil and Portugal times with flags",
);
assert.ok(
  page.includes("terça-feira, às 12h no Brasil e às 16h em Portugal"),
  "the accessible schedule should explain both time zones",
);
assert.doesNotMatch(
  page,
  /\b(controlo|contactos|equipa|ficheiro|ecrã|utilizador|telemóvel)\b/i,
  "the live page copy should use Brazilian Portuguese only",
);
assert.ok(page.includes("class=\"live-schedule\""), "the schedule should have a dedicated highlight bar");
assert.ok(page.includes("NÃO É UM CHATBOT."), "the page should clearly state that the solution is not a chatbot");
assert.ok(!page.includes("Não é só um chatbot"), "the page should remove the weaker chatbot comparison");
assert.ok(page.includes("É treinada para o seu negócio."), "the page should emphasize business-specific training");
assert.ok(page.includes("class=\"live-industries\""), "the page should prominently showcase applicable industries");
for (const industry of [
  "Advocacia", "Arquitetura", "Medicina", "Odontologia", "Contabilidade",
  "Imobiliário", "Engenharia", "Clínicas", "Estética", "Educação",
  "Consultoria", "Agências", "Seguros", "Tecnologia", "Turismo", "Serviços financeiros",
]) {
  assert.ok(page.includes(industry), `the industries section should include ${industry}`);
}
assert.ok(page.includes("E muito mais"), "the industries section should remain open to other service businesses");
assert.ok(!/[\s][—–-][\s]/.test(page), "the visible page copy should not use dashes as separators");
assert.match(styles, /\.live-schedule\s*\{[^}]*background:\s*var\(--ink\)/s, "the schedule bar should have strong contrast");
assert.ok(
  page.includes("/assets/brand/raevo-logo-official-transparent.png"),
  "the page should use the official Raevo logo",
);
assert.ok(page.includes("<WhatsAppIcon />"), "the main CTAs should render the WhatsApp icon component");
assert.match(
  icon,
  /<svg[^>]*class="whatsapp-icon"/s,
  "the icon component should render a recognizable WhatsApp SVG",
);
assert.match(styles, /--whatsapp:\s*#25d366/i, "the CTA should use WhatsApp green");
assert.match(styles, /\.primary-cta\s*\{[^}]*background:\s*var\(--whatsapp\)/s, "main CTAs should be green");
assert.match(styles, /--page:\s*#f7f8f5/i, "the page should use a familiar light canvas");
assert.match(styles, /:focus-visible/, "keyboard focus should be visible");
assert.match(styles, /prefers-reduced-motion/, "motion should respect the user preference");
assert.match(styles, /@media\s*\(max-width:\s*720px\)/, "the page should have a mobile layout");
assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*?\.live-schedule\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1fr auto;/,
  "the two-time-zone schedule should use a non-overflowing mobile grid",
);
assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*?\.live-schedule strong\s*\{[^}]*grid-column:\s*1 \/ -1;[^}]*white-space:\s*normal;/,
  "the complete schedule should wrap safely across the mobile width",
);
assert.doesNotMatch(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*?\.command-system\s*\{[^}]*width:\s*min\(98vw,\s*390px\)/,
  "the mobile orbit must not widen the hero grid beyond its padded container",
);
assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*?\.command-system\s*\{[^}]*width:\s*min\(100%,\s*390px\)/,
  "the mobile orbit should be constrained by the available container width",
);

assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*?\.live-header\s*\{[^}]*grid-template-columns:\s*1fr;[^}]*justify-items:\s*center/,
  "the mobile header should center the Raevo logo on the same axis as the hero",
);

console.log("Live semanal route, conversion copy, privacy, and accessibility are present.");
