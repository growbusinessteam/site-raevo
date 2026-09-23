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
  "src/pages/stitch.astro",
  "src/pages/agendamento.astro",
  "src/pages/forms.astro",
  "src/pages/obrigado.astro",
  "src/pages/terceira.astro",
  "public/stitch/index.html",
  "public/stitch/agendamento.html",
  "public/stitch/forms.html",
  "public/stitch/obrigado.html",
  "public/stitch/utm-persistence.js",
  "public/favicon.ico",
  "public/favicon.png",
  "public/favicon-32x32.png",
  "public/apple-touch-icon.png",
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
  "raevo-logo-official-transparent.png",
]) {
  assert.ok(brandAssets.includes(asset), `brand asset ${asset} should exist`);
}

const packageJson = JSON.parse(read("package.json"));
assert.equal(packageJson.scripts.build, "astro build");
assert.equal(packageJson.scripts.dev, "astro dev");
assert.ok(packageJson.dependencies.astro, "Astro dependency should exist");
assert.ok(packageJson.dependencies["@astrojs/sitemap"], "sitemap dependency should exist");

const siteData = read("src/data/site.ts");
assert.ok(
  siteData.includes('{ href: "/", label: "Home" }'),
  "global navigation should include the home page",
);
assert.ok(
  !siteData.includes('{ href: "/privacidade", label: "Privacidade" }'),
  "global navigation should not include the privacy page",
);

const baseLayout = read("src/layouts/BaseLayout.astro");
for (const phrase of [
  "/favicon.ico?v=20260702",
  "/favicon-32x32.png?v=20260702",
  "/apple-touch-icon.png?v=20260702",
]) {
  assert.ok(baseLayout.includes(phrase), `base layout should include ${phrase}`);
}

const homeRoute = read("src/pages/index.astro");
assert.ok(
  homeRoute.includes("OfficialLanding") && homeRoute.includes('officialContent["pt-PT"]'),
  "home route should serve the Portugal official landing",
);

const stitchRoute = read("src/pages/stitch.astro");
assert.ok(
  stitchRoute.includes("../../public/stitch/index.html"),
  "stitch route should keep serving the Stitch landing",
);

const home = read("public/stitch/index.html");
const homePrivacyHrefCount = (home.match(/href="\/privacidade"/g) ?? []).length;
const homeMenuHrefCount = (home.match(/href="\/pt-med\/">Home<\/a>/g) ?? []).length;
const homeFormsHrefCount = (home.match(/href="\/pt-med\/forms\/"/g) ?? []).length;
const metaPixelPhrases = [
  'script id="meta-pixel"',
  "connect.facebook.net/en_US/fbevents.js",
  "fbq('init', '1062540682790246')",
  "fbq('track', 'PageView')",
  "facebook.com/tr?id=1062540682790246",
];
assert.ok(
  homeMenuHrefCount >= 2,
  "official Stitch home should link to /pt-med/ in desktop and mobile nav",
);
assert.ok(
  homePrivacyHrefCount === 1,
  "official Stitch home should link to /privacidade only in the footer",
);
assert.ok(
  homeFormsHrefCount >= 8,
  "official Stitch home CTAs should navigate to /pt-med/forms/",
);
assert.ok(
  !home.includes('data-open-lead-form=""'),
  "official Stitch home should not open the lead form as a modal",
);
assert.ok(
  !home.includes('href="#formulario-raevo"'),
  "official Stitch home should not link to the old form hash",
);
for (const phrase of metaPixelPhrases) {
  assert.ok(home.includes(phrase), `official Stitch home should include Meta Pixel phrase: ${phrase}`);
}

for (const phrase of [
  "RAEVO | Consultoria para Clínicas Especializadas",
  "../favicon.ico?v=20260702",
  "../favicon-32x32.png?v=20260702",
  "../apple-touch-icon.png?v=20260702",
  "Para clínicas especializadas que vendem tratamentos de alto valor",
  "Seu tratamento é especializado.<br/>Seu comercial também precisa ser.",
  "A Raevo estrutura o comercial da sua clínica para conduzir o utente desde o primeiro contacto até à decisão",
  "Quando o utente não percebe valor, ele compara preço.",
  "Ver implementação comercial",
  "Preços visíveis. Plano claro. Sem reunião apenas para descobrir o valor.",
  "Valor antes do preço",
  "Do primeiro contacto à decisão",
  "Comercial estruturado",
  "Atendimento, CRM e follow-up conectados",
  "Tratamento de alto valor precisa de uma conversa comercial à altura.",
  "O Sistema Raevo",
  "Marketing, CRM e IA conectados para atrair utentes certos",
  "1. Atrair utentes com mais perfil",
  "2. Converter com atendimento, CRM e IA",
  "3. Crescer com dados e previsibilidade",
  "Implementação Comercial",
  "Dois Caminhos de Colaboração",
  "Monte seu plano Raevo",
  "Simule a implementação e os módulos recorrentes necessários para a operação da sua clínica.",
  "Quantos profissionais atuam no atendimento da clínica?",
  "Valor da Implementação",
  "Valor da Mensalidade",
  "Manutenção CRM",
  "Mídia Paga + Copy",
  "Quanto pretende investir em mídia?",
  "Investimento mínimo recomendado: €200/mês.",
  "À medida que o investimento aumenta, o trabalho de gestão, análise e otimização também aumenta.",
  "A taxa de gestão é de 10% sobre o investimento e só entra no total quando Mídia Paga + Copy estiver selecionado.",
  "Taxa de gestão de mídia (10% sobre investimento)",
  "Rececionista por IA",
  "Acompanhamento Comercial",
  "Pagamento único",
  "Total mensalidade",
  "Lista dos itens selecionados",
  "Agência comum vs. Raevo",
  "Outras agências",
  "Gerar volume de utentes",
  "Atrair utentes com perfil e conduzir até a venda",
  "Marketing, CRM, IA e atendimento conectados",
  "Scripts, follow-up, CRM e IA para conduzir melhor",
  "Empresas que atende",
  "Clínicas especializadas e operações de saúde",
  "Resultado Alvo",
  "Agenda qualificada, vendas e previsibilidade",
  "Pare de vender tratamento especializado como orçamento comum",
  "simulator",
  "#problema",
  "#implementacao",
  "#crescimento",
  "#precos",
  "id=\"faq\"",
  "id=\"contato\"",
  "raevo-lead-form",
  "Falar com especialista",
  "Agendar Sessão Estratégica",
  "Nome",
  "Insira seu nome",
  "Email",
  "Insira seu melhor e-mail",
  "Instagram Profissional ou da Empresa",
  "@seuinstagram",
  "Quem está preenchendo este formulário?",
  "Médico(a)",
  "Dentista",
  "Dono(a)",
  "Sócio(a)",
  "Rececionista",
  "Qual a média de faturamento mensal?",
  "Portugal / Europa",
  "Brasil",
  "Até €5.000/mês",
  "Acima de €50.000/mês",
  "Abaixo de R$50 mil/mês",
  "Acima de R$500 mil/mês",
  "Quem receciona o utente/lead no WhatsApp hoje?",
  "Tenho equipa comercial interna",
  "Ninguém acompanha isso de forma organizada",
  "Fechar formulário",
  "raevoLeadFormSteps",
  "raevoLeadFormWebhookUrl",
  "https://hook.growautomacao.com.br/webhook/raevo-site-kommo",
  "Content-Type': 'text/plain",
  "raevoLeadFormPendingPayloads",
  "sendLeadPayloadFallback",
  "submission failed after fallback; continuing to thank-you page",
  "raevoLeadFormBookingUrl",
  "/pt-med/obrigado/",
  "setupRaevoMotion",
  "raevo-motion-ready",
  "raevo-motion-armed",
  "motion-card",
  "motion-button",
  "is-visible-item",
  "lead-form-step-motion",
  "lead-form-select",
  "leadFormLongSelectIds",
  "sortLeadOptions",
  "normalizedLeadFormPath",
  "Selecione uma opção",
  "/stitch/utm-persistence.js",
  "window.RaevoTracking.queryString()",
  "sim-total-pulse",
  "prefers-reduced-motion",
  "href=\"/pt-med/forms/\">Contacto</a>",
]) {
  assert.ok(home.includes(phrase), `official Stitch home should include ${phrase}`);
}
assert.ok(
  !/premium/i.test(home),
  "official Stitch home should not use premium wording",
);

assert.ok(
  !home.includes("Não foi possível enviar agora. Tente novamente em instantes."),
  "official Stitch home should not block the user on webhook submission failure",
);
assert.ok(
  !home.includes("id: 'specialty'") && !home.includes("Qual a especialidade ou tipo de negócio?"),
  "official Stitch home should remove the specialty question",
);
assert.ok(
  home.includes("new Set(['role', 'leadHandling'])"),
  "official Stitch home should render role and lead handling as dropdown selectors",
);
assert.ok(
  home.indexOf("submission failed after fallback; continuing to thank-you page") <
    home.indexOf("window.location.assign(raevoLeadFormBookingUrl);"),
  "official Stitch home should continue to the thank-you page even after submission fallback failure",
);

const formsRoute = read("src/pages/forms.astro");
assert.ok(
  formsRoute.includes("../../public/stitch/forms.html"),
  "forms route should serve the dedicated form page",
);

const forms = read("public/stitch/forms.html");
for (const phrase of metaPixelPhrases) {
  assert.ok(forms.includes(phrase), `forms page should include Meta Pixel phrase: ${phrase}`);
}
for (const phrase of [
  "RAEVO | Formulário Estratégico",
  "raevo-lead-form",
  "aria-hidden=\"false\"",
  "Voltar para a página inicial",
  "Nome",
  "Email",
  "Instagram Profissional ou da Empresa",
  "@seuinstagram",
  "raevoLeadFormWebhookUrl",
  "https://hook.growautomacao.com.br/webhook/raevo-site-kommo",
  "Content-Type': 'text/plain",
  "sendLeadPayloadFallback",
  "/pt-med/obrigado/",
  "obrigado.html",
  "openLeadForm();",
  "lead-form-select",
  "leadFormLongSelectIds",
  "sortLeadOptions",
  "normalizedLeadFormPath",
  "Selecione uma opção",
  "/stitch/utm-persistence.js",
  "window.RaevoTracking.queryString()",
]) {
  assert.ok(forms.includes(phrase), `forms page should include ${phrase}`);
}
assert.ok(
  !forms.includes('data-open-lead-form=""'),
  "forms page should not depend on modal opener triggers",
);
assert.ok(
  !forms.includes("id: 'specialty'") && !forms.includes("Qual a especialidade ou tipo de negócio?"),
  "forms page should remove the specialty question",
);
assert.ok(
  forms.includes("new Set(['role', 'leadHandling'])"),
  "role and lead handling should use compact dropdown selectors",
);

const trackingPersistence = read("public/stitch/utm-persistence.js");
for (const phrase of [
  "raevoTrackingParametersV1",
  "startsWith('utm_')",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "ttclid",
  "campaign_id",
  "adset_id",
  "ad_id",
  "adgroup_id",
  "placement",
  "device",
  "network",
  "sessionStorage",
  "appendParameters",
  "syncLinks",
]) {
  assert.ok(trackingPersistence.includes(phrase), `tracking persistence should include ${phrase}`);
}

const thanksRoute = read("src/pages/obrigado.astro");
assert.ok(
  thanksRoute.includes("../../public/stitch/obrigado.html"),
  "thank-you route should serve the dedicated thank-you page",
);

const thanks = read("public/stitch/obrigado.html");
for (const phrase of metaPixelPhrases) {
  assert.ok(thanks.includes(phrase), `thank-you page should include Meta Pixel phrase: ${phrase}`);
}
for (const phrase of [
  "RAEVO | Obrigado",
  "Formulário recebido",
  "Obrigado. Agora escolha o melhor horário.",
  "Abrir agenda oficial",
  "href=\"/pt-med/agendamento/\"",
  "Voltar para a landing",
  "/stitch/utm-persistence.js",
]) {
  assert.ok(thanks.includes(phrase), `thank-you page should include ${phrase}`);
}

const bookingPrivacyPage = read("public/stitch/agendamento.html");
assert.ok(
  bookingPrivacyPage.includes('href="/privacidade"'),
  "booking page should link to /privacidade",
);
assert.ok(
  bookingPrivacyPage.includes('/stitch/utm-persistence.js'),
  "booking page should preserve tracking parameters on internal links",
);

const ptMedHome = read("deploy/raevo-static-hostinger/pt-med/index.html");
const ptMedForms = read("deploy/raevo-static-hostinger/pt-med/forms/index.html");
const ptMedThanks = read("deploy/raevo-static-hostinger/pt-med/obrigado/index.html");
const rootRedirect = read("deploy/raevo-static-hostinger/index.html");
const oldFormsRedirect = read("deploy/raevo-static-hostinger/forms/index.html");
const oldThanksRedirect = read("deploy/raevo-static-hostinger/obrigado/index.html");
for (const [pageName, pageContent, phrase] of [
  ["pt-med home", ptMedHome, 'href="/pt-med/forms/"'],
  ["pt-med forms", ptMedForms, "/pt-med/obrigado/"],
  ["pt-med thanks", ptMedThanks, 'href="/pt-med/agendamento/"'],
  ["root redirect", rootRedirect, "/pt-med/"],
  ["old forms redirect", oldFormsRedirect, "/pt-med/forms/"],
  ["old thanks redirect", oldThanksRedirect, "/pt-med/obrigado/"],
]) {
  assert.ok(pageContent.includes(phrase), `${pageName} should include ${phrase}`);
}

const terceira = read("src/pages/terceira.astro");
const terceiraPrivacyHrefCount = (terceira.match(/href="\/privacidade"/g) ?? []).length;
assert.ok(
  terceiraPrivacyHrefCount >= 2,
  "terceira page should link to /privacidade in menu and footer",
);

const privacyPage = read("src/pages/privacidade.astro");
assert.ok(
  privacyPage.includes("../../public/stitch/index.html"),
  "privacy page should reuse the official Stitch landing shell",
);
assert.ok(
  !privacyPage.includes("BaseLayout"),
  "privacy page should not use the legacy Astro BaseLayout",
);
for (const phrase of [
  "Última actualização: 09 de julho de 2026",
  "GROW BUSINESS LTDA - ME",
  "Dados sensíveis e dados de saúde",
  "A Raevo não vende dados pessoais",
  "Autoridade Nacional de Proteção de Dados",
]) {
  assert.ok(privacyPage.includes(phrase), `privacy page should include ${phrase}`);
}

for (const forbidden of [
  "Sua submissão foi registrada no Kommo CRM",
  "registrada no Kommo CRM",
  "kommoTarget",
  "pipelineStatusName",
  "pipelineName",
  "Prefiro informar na reunião",
  "Criativos",
  "data-module=\"creatives\"",
  "data-module-card=\"creatives\"",
  "Voltar para a landing",
  ".raevo-motion-armed [data-animate]:not(.is-visible)",
  ".raevo-motion-armed [data-animate-item]:not(.is-visible-item)",
  "animation: raevoReveal 760ms var(--raevo-ease) both",
  "animation: raevoRevealItem 620ms var(--raevo-ease) both",
]) {
  assert.ok(!home.includes(forbidden), `official Stitch home should not include forbidden implementation detail: ${forbidden}`);
}

const heroArea = home.slice(
  home.indexOf("<!-- 1. Hero Section -->"),
  home.indexOf("<!-- Client Logos -->"),
);
for (const forbidden of [
  "Para médicos, dentistas e donos de clínicas",
  "Mais Utentes,<br/>Menos Preocupações",
  "Ajudamos clínicas a atraírem utentes qualificados",
  "Valorizamos a clareza: você pode simular seu plano sem precisar de uma reunião apenas para descobrir o preço.",
  "Marketing, Atendimento, IA &amp; CRM",
]) {
  assert.ok(!heroArea.includes(forbidden), `hero should not include old positioning copy: ${forbidden}`);
}

const simulatorModuleArea = home.slice(
  home.indexOf('<div class="grid grid-cols-1 md:grid-cols-2 gap-4">'),
  home.indexOf("<!-- Right: Summary"),
);
const simulatorArea = home.slice(
  home.lastIndexOf("<div", home.indexOf('id="simulator"')),
  home.indexOf("<script>", home.indexOf('id="simulator"')),
);
for (const forbidden of [
  "€500/mês</span>",
  "€400/mês</span>",
  "€50/mês quando nenhum módulo recorrente",
]) {
  assert.ok(
    !simulatorModuleArea.includes(forbidden),
    `simulator module cards should not show individual prices: ${forbidden}`,
  );
}
assert.ok(
  /id="sim-media-investment-card"[\s\S]*?<\/div>\s*<div class="md:col-span-2 p-4 rounded-lg border border-dashed/.test(simulatorModuleArea),
  "media investment and CRM maintenance should render as separate simulator boxes",
);
assert.ok(
  (() => {
    const stack = [];
    const tokens = simulatorArea.match(/<!-- Right: Summary[\s\S]*?-->|<div\b[^>]*>|<\/div>/g) || [];
    for (const token of tokens) {
      if (token.startsWith("<!-- Right: Summary")) {
        return stack.at(-1)?.includes('id="simulator"');
      }
      if (token.startsWith("<div")) stack.push(token);
      if (token === "</div>") stack.pop();
    }
    return false;
  })(),
  "simulator summary should remain inside the main simulator flex container",
);

const bookingRoute = read("src/pages/agendamento.astro");
assert.ok(
  bookingRoute.includes("../../public/stitch/agendamento.html"),
  "booking route should serve the Stitch-style scheduling page",
);

const booking = read("public/stitch/agendamento.html");
for (const phrase of metaPixelPhrases) {
  assert.ok(booking.includes(phrase), `booking page should include Meta Pixel phrase: ${phrase}`);
}
for (const phrase of [
  "RAEVO | Agendamento de Sessão Estratégica",
  "../favicon.ico?v=20260702",
  "../favicon-32x32.png?v=20260702",
  "../apple-touch-icon.png?v=20260702",
  "Sessão estratégica Raevo",
  "Escolha o melhor horário para a conversa.",
  "https://calendar.app.google/VNeQnAZ2P3mjq4yG6",
  "Abrir agenda oficial",
  "Falar pelo WhatsApp antes de agendar",
  "Também pode entrar em contato via WhatsApp",
  "+351 963 763 408",
  "https://wa.me/351963763408",
  "Ol%C3%A1%2C%20preenchi%20o%20forms%20e%20quero%20falar%20com%20um%20especialista%20antes%20de%20agnedar",
  "Voltar para a landing",
  "O que acontece nesta sessão",
  "Diagnóstico da operação atual",
  "Próximo passo recomendado",
  "booking-motion",
  "booking-motion-armed",
  "booking-card-motion",
  "booking-button-motion",
  "data-booking-animate",
  "prefers-reduced-motion",
  "whatsapp-cta",
  "whatsapp-icon",
  "#25D366",
]) {
  assert.ok(booking.includes(phrase), `booking page should include ${phrase}`);
}
for (const forbidden of [
  ".booking-motion-armed [data-booking-animate]:not(.is-visible)",
  "animation: bookingRise 700ms var(--raevo-ease) both",
]) {
  assert.ok(!booking.includes(forbidden), `booking page should not use blocking reveal animation: ${forbidden}`);
}

const thirdLanding = read("src/pages/terceira.astro");
for (const phrase of [
  "Raevo Híbrida",
  "/favicon.ico?v=20260702",
  "/favicon-32x32.png?v=20260702",
  "/apple-touch-icon.png?v=20260702",
  "Faça o utente ver além do preço",
  "Simular meu plano",
  "lead-price-simulator-v3",
  "Implementação Comercial",
  "Crescimento Previsível",
  "https://wa.me/",
  "/terceira/",
]) {
  assert.ok(thirdLanding.includes(phrase), `third landing should include ${phrase}`);
}

for (const forbidden of [
  "cdn.tailwindcss.com",
  "googleusercontent.com",
  "href=\"#\"",
]) {
  assert.ok(!thirdLanding.includes(forbidden), `third landing should not include ${forbidden}`);
}

for (const phrase of [
  "A sua clínica está a conduzir o utente ou apenas a responder mensagens?",
  "O que ajudamos a resolver",
  "Uma clínica especializada não perde valor só na consulta.",
  "WhatsApp cheio",
  "Preço cedo demais",
  "Atendimento passivo",
  "Follow-up perdido",
  "Comercial sem controlo",
  "clínica",
  "clínicas",
  "Preço",
  "equipa",
  "Diagnóstico",
  "informações",
]) {
  assert.ok(home.includes(phrase), `official Stitch home should include accented Portuguese: ${phrase}`);
}

const blogPosts = readdirSync(join(root, "src/content/blog")).filter((file) =>
  file.endsWith(".mdx"),
);
assert.ok(blogPosts.length >= 2, "blog should include at least two MDX posts");

console.log("Site structure matches the Raevo implementation plan.");
