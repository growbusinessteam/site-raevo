import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const required = [
  "src/pages/teste-maturidade-comercial/index.astro",
  "src/pages/teste-maturidade-comercial/dados-iniciais/index.astro",
  "src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro",
  "src/pages/teste-maturidade-comercial/contexto/[slug].astro",
  "src/pages/teste-maturidade-comercial/pergunta/[number].astro",
  "src/pages/teste-maturidade-comercial/processando/index.astro",
  "src/pages/teste-maturidade-comercial/resultado/index.astro",
  "src/pages/termos.astro",
  "src/components/maturity/MaturityLanding.astro",
  "src/components/maturity/MaturityLeadGate.astro",
  "src/components/maturity/MaturityCompletion.astro",
  "src/components/maturity/MaturityStep.astro",
  "public/teste-maturidade-comercial/.htaccess",
  "public/assets/brand/raevo-logo-official-transparent.png",
  "public/assets/brand/raevo-symbol-cyan.png",
];
for (const file of required) assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), true, `${file} must exist`);

const landing = read("src/components/maturity/MaturityLanding.astro");
const header = read("src/components/maturity/MaturityHeader.astro");
const content = read("src/data/maturity.ts");
const scoring = read("src/lib/maturity-scoring.mjs");
assert.match(landing, /Qual é o nível de maturidade comercial da sua empresa\?/);
assert.match(landing, /\/teste-maturidade-comercial\/dados-iniciais\//);
assert.match(landing, /withMaturityRelease/);
assert.match(header, /\/teste-maturidade-comercial\/dados-iniciais\//);
assert.match(landing, /Mais do que uma pontuação/);
assert.match(landing, /Seis áreas do seu sistema comercial/);
assert.match(landing, /Exemplo de resultado/);
assert.doesNotMatch(landing, /PDF|download/i);
for (const level of ["Inicial", "Reativo", "Estruturado", "Previsível", "Inteligente"]) assert.match(`${landing}\n${content}\n${scoring}`, new RegExp(level));
assert.doesNotMatch(landing, /fbq\(|gtag\(|dataLayer/);

const contextRoute = read("src/pages/teste-maturidade-comercial/contexto/[slug].astro");
for (const slug of ["oportunidades", "objetivo"]) assert.match(contextRoute, new RegExp(slug));
for (const slug of ["valor-medio", "equipa"]) assert.doesNotMatch(contextRoute, new RegExp(slug));
assert.doesNotMatch(contextRoute, /"setor"/);
assert.match(contextRoute, /getStaticPaths/);

const leadGate = read("src/components/maturity/MaturityLeadGate.astro");
assert.match(leadGate, /name="name"/);
assert.match(leadGate, /name="whatsapp"/);
assert.match(leadGate, /name="sector"/);
assert.match(leadGate, /\/api\/maturidade\/leads/);
assert.match(leadGate, /\/privacidade\//);
assert.match(leadGate, /withMaturityRelease/);

const introduction = read("src/pages/teste-maturidade-comercial/antes-de-comecar/index.astro");
assert.doesNotMatch(introduction, /PDF|download/i);
assert.match(introduction, /withMaturityRelease/);
for (const copy of ["12 perguntas", "≈ 5 min", "Resultado imediato", "Relatório visual", "seis pilares", "Iniciar o teste"]) assert.match(introduction, new RegExp(copy));

assert.equal(existsSync(new URL("../src/components/maturity/MaturityIdentification.astro", import.meta.url)), false);
assert.equal(existsSync(new URL("../src/pages/teste-maturidade-comercial/identificacao/index.astro", import.meta.url)), false);
const completion = read("src/components/maturity/MaturityCompletion.astro");
assert.match(completion, /\/api\/maturidade\/submissions/);
assert.match(completion, /buildSubmissionPayload/);
assert.match(completion, /createIdempotencyKey/);
assert.match(completion, /data-completion-retry/);
assert.doesNotMatch(completion, /<form|name="/);

const questionRoute = read("src/pages/teste-maturidade-comercial/pergunta/[number].astro");
assert.match(questionRoute, /getStaticPaths/);
assert.match(questionRoute, /maturityQuestions/);
assert.match(questionRoute, /total=\{12\}/);

const definedQuestions = (content.match(/\bquestion\(/g) ?? []).length;
assert.equal(definedQuestions, 12);
assert.doesNotMatch(content, /Como a inteligência artificial é utilizada/);

const step = read("src/components/maturity/MaturityStep.astro");
assert.match(step, /data-maturity-step/);
assert.match(step, /data-step-key/);
assert.match(step, /data-continue/);
assert.match(step, /data-back/);
assert.match(step, /aria-live/);
assert.match(step, /role="progressbar"/);
assert.match(step, /data-progress-label/);
assert.match(step, /getAssessmentProgress/);
assert.match(step, /AUTO_ADVANCE_DELAY_MS/);
assert.match(step, /window\.setTimeout/);
assert.match(step, /form\.classList\.add\("is-advancing"\)/);
assert.match(step, /radio\.addEventListener\("click"/);
assert.match(step, /withMaturityRelease/);
assert.match(step, /querySelector\("\.maturity-step-page\[data-maturity-step\]"\)/);
assert.doesNotMatch(step, />\s*[0-4]\s*</);

const resultPage = read("src/components/maturity/MaturityResult.astro");
assert.doesNotMatch(resultPage, /data-pdf-download/);
assert.doesNotMatch(resultPage, /downloadMaturityPdf/);
assert.match(resultPage, /maturity:result-ready/);
assert.match(resultPage, /dataset\.resultLevel/);
assert.match(resultPage, /Falar com a Raevo sobre este resultado/);
assert.match(resultPage, /\/teste-maturidade-comercial\/dados-iniciais\//);

const footer = read("src/components/maturity/MaturityFooter.astro");
assert.match(footer, /href="\/termos\/"/);
assert.match(header, /width="755" height="166"/);
assert.match(footer, /width="755" height="166"/);
const maturityStyles = read("src/styles/maturity.css");
assert.match(maturityStyles, /\.maturity-footer__logo\s*\{[^}]*height:\s*auto/s);

const cacheRules = read("public/teste-maturidade-comercial/.htaccess");
assert.match(cacheRules, /Cache-Control/);
assert.match(cacheRules, /no-store/);
assert.match(cacheRules, /must-revalidate/);

console.log("Maturity routes and conversion structure are present.");
