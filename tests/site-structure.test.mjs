import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const requiredFiles = [
  "designer.md",
  "package.json",
  "astro.config.mjs",
  "src/content/config.ts",
  "src/layouts/BaseLayout.astro",
  "src/components/Header.astro",
  "src/components/Footer.astro",
  "src/components/Hero.astro",
  "src/components/CTA.astro",
  "src/components/SolutionCard.astro",
  "src/pages/index.astro",
  "src/pages/sobre.astro",
  "src/pages/solucoes/index.astro",
  "src/pages/solucoes/ia-e-automacao.astro",
  "src/pages/solucoes/sistemas-inteligentes.astro",
  "src/pages/solucoes/dashboards-e-operacoes.astro",
  "src/pages/blog/index.astro",
  "src/pages/blog/[slug].astro",
  "src/pages/rss.xml.js",
  "src/pages/contato.astro",
  "src/pages/privacidade.astro",
  "src/styles/global.css",
];

for (const file of requiredFiles) {
  assert.ok(existsSync(join(root, file)), `${file} should exist`);
}

const designer = read("designer.md");
for (const token of [
  "#E9E4DA",
  "#DCCFBE",
  "#B8AB98",
  "#1F1F1F",
  "#C7A97A",
  "#00B8C6",
  "Sora",
  "Inter",
  "warm modern luxury",
]) {
  assert.ok(designer.includes(token), `designer.md should include ${token}`);
}

const contentConfig = read("src/content/config.ts");
for (const field of [
  "title",
  "description",
  "pubDate",
  "updatedDate",
  "author",
  "category",
  "tags",
  "heroImage",
  "draft",
]) {
  assert.ok(contentConfig.includes(field), `content config should include ${field}`);
}

const brandAssets = readdirSync(join(root, "public/assets/brand"));
for (const asset of [
  "raevo-brandboard.png",
  "raevo-symbol-gold.png",
  "raevo-symbol-stone.png",
  "raevo-symbol-cyan.png",
  "raevo-logo-dark-cyan.png",
  "raevo-logo-champagne-cyan.png",
]) {
  assert.ok(brandAssets.includes(asset), `brand asset ${asset} should exist`);
}

const packageJson = JSON.parse(read("package.json"));
assert.equal(packageJson.scripts.build, "astro build");
assert.equal(packageJson.scripts.dev, "astro dev");
assert.ok(packageJson.dependencies.astro, "Astro dependency should exist");
assert.ok(packageJson.dependencies["@astrojs/sitemap"], "sitemap dependency should exist");

const home = [
  read("src/pages/index.astro"),
  existsSync(join(root, "src/components/PlanSimulator.astro"))
    ? read("src/components/PlanSimulator.astro")
    : "",
  read("src/components/Hero.astro"),
  read("src/components/CTA.astro"),
  read("src/data/site.ts"),
].join("\n");
for (const phrase of [
  "Simular plano",
  "Faça o paciente ver além do preço",
  "Tratamento premium não pode ser vendido como orçamento comum",
  "Implementação Comercial",
  "Crescimento Previsível",
  "A partir de €1.997",
  "€400/mês",
  "Agência comum entrega movimento",
  "Pare de vender tratamento premium como orçamento comum",
  "lead-price-simulator",
  "Acompanhamento Estratégico Comercial",
  "Gestão Comercial e CRM",
  "Tráfego Pago",
  "Landing Page de Captação",
  "IA no Atendimento",
  "#problema",
  "#implementacao",
  "#crescimento",
  "#precos",
  "#faq",
]) {
  assert.ok(home.includes(phrase), `home should include ${phrase}`);
}

for (const phrase of [
  "Você não estudou anos",
  "comparação de preço",
  "clínica",
  "clínicas",
  "Preço",
  "Preços visíveis",
  "reunião",
  "equipe",
  "diagnóstico",
  "informações",
]) {
  assert.ok(home.includes(phrase), `home should include accented Portuguese: ${phrase}`);
}

const blogPosts = readdirSync(join(root, "src/content/blog")).filter((file) =>
  file.endsWith(".mdx"),
);
assert.ok(blogPosts.length >= 2, "blog should include at least two MDX posts");

console.log("Site structure matches the Raevo implementation plan.");
