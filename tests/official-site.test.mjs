import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const required = [
  "src/data/official.ts",
  "src/components/official/OfficialLayout.astro",
  "src/components/official/OfficialHeader.astro",
  "src/components/official/OfficialFooter.astro",
  "src/components/official/CommercialSystem.astro",
  "src/components/official/OfficialLanding.astro",
  "src/components/official/OfficialLeadForm.astro",
  "src/components/official/OfficialThanks.astro",
  "src/styles/official.css",
  "src/pages/pt-oficial/index.astro",
  "src/pages/pt-oficial/forms/index.astro",
  "src/pages/pt-oficial/forms/obrigado.astro",
  "src/pages/br-oficial/index.astro",
  "src/pages/br-oficial/forms/index.astro",
  "src/pages/br-oficial/forms/obrigado.astro",
  "src/pages/pt-med/index.astro",
  "src/pages/pt-med/forms/index.astro",
  "src/pages/pt-med/obrigado/index.astro",
  "src/pages/pt-med/agendamento/index.astro",
];

for (const file of required) assert.ok(existsSync(join(root, file)), `${file} should exist`);

const home = read("src/pages/index.astro");
assert.ok(home.includes("OfficialLanding"), "root should render the official landing");
assert.ok(home.includes('officialContent["pt-PT"]'), "root should default to Portugal");

const content = read("src/data/official.ts");
for (const phrase of [
  '"pt-PT"', '"pt-BR"', "CRM", "WhatsApp", "ERP", "propostas",
  "follow-ups", "IA de atendimento", "mídia paga",
]) assert.ok(content.includes(phrase), `official content should include ${phrase}`);
assert.ok(!/R\$\s*\d|€\s*\d|mensalidade/i.test(content), "official pages should not expose prices");

const layout = read("src/components/official/OfficialLayout.astro");
for (const phrase of ["hreflang", "canonical", "pt-PT", "pt-BR", "/favicon.ico?v=20260702"])
  assert.ok(layout.includes(phrase), `layout should include ${phrase}`);

const officialLanding = read("src/components/official/OfficialLanding.astro");
assert.ok(
  officialLanding.includes("/assets/video/raevo-oficial-hero.mp4"),
  "official pages should use the new institutional hero video",
);
assert.ok(
  !officialLanding.includes("/assets/video/raevo-hero-video-01.mp4"),
  "official pages should not reuse the medical hero video",
);
assert.ok(
  officialLanding.includes("/assets/video/raevo-oficial-hero-poster.jpg"),
  "official pages should use a poster extracted from the institutional video",
);
assert.ok(
  !officialLanding.includes("/assets/landing-3/hero-clinic.png"),
  "official pages should not flash the medical poster while the video loads",
);
assert.ok(
  read("public/stitch/index.html").includes("../assets/video/raevo-hero-video-01.mp4"),
  "the medical landing should preserve its original hero video",
);

const styles = read("src/styles/official.css");
for (const token of ["#E9E4DA", "#DCCFBE", "#B8AB98", "#1F1F1F", "#C7A97A", "#00B8C6", "Sora", "Inter"])
  assert.ok(styles.includes(token), `styles should preserve ${token}`);
assert.match(styles, /\.footer-brand img\s*\{[^}]*height:\s*auto/s, "official footer logo should preserve its intrinsic ratio");

for (const component of ["OfficialHeader.astro", "OfficialFooter.astro", "OfficialLeadForm.astro", "OfficialThanks.astro"]) {
  const markup = read(`src/components/official/${component}`);
  assert.match(markup, /width="755" height="166"/, `${component} should declare the real Raevo logo dimensions`);
}

const form = read("src/components/official/OfficialLeadForm.astro");
for (const phrase of ["name", "whatsapp", "companyProfile", "raevo-site-kommo", "response.ok", "buildLeadPayload"])
  assert.ok(form.includes(phrase), `form should include ${phrase}`);

const medicalRoutes = {
  "src/pages/pt-med/index.astro": "public/stitch/index.html",
  "src/pages/pt-med/forms/index.astro": "public/stitch/forms.html",
  "src/pages/pt-med/obrigado/index.astro": "public/stitch/obrigado.html",
  "src/pages/pt-med/agendamento/index.astro": "public/stitch/agendamento.html",
};
for (const [route, source] of Object.entries(medicalRoutes))
  assert.ok(read(route).includes(source), `${route} should preserve ${source}`);
