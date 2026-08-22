import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { calculateMaturity } from "../src/lib/maturity-scoring.mjs";
import { buildPublicResult } from "../src/lib/maturity-result.mjs";
import {
  buildPdfPages,
  generateMaturityPdf,
  sanitizePdfFilename,
} from "../src/lib/maturity-pdf.mjs";

const publicResult = buildPublicResult({
  assessment_id: "pdf-test",
  submitted_at: "2026-08-22T10:30:00Z",
  expires_at: "2027-02-18T10:30:00Z",
  person: { name: "Ana Silva" },
  company: { name: "Clínica São João" },
  result: calculateMaturity(Array(18).fill(2)),
  cta_url: "https://raevo.io/agendamento/",
});

const pages = buildPdfPages(publicResult);
assert.equal(pages.length, 6);
assert.match(pages[0].title, /Maturidade Comercial/);
assert.match(pages[0].body.join(" "), /Clínica São João/);
assert.match(pages[1].body.join(" "), /50%/);
assert.equal(pages[2].bars.length, 6);
assert.match(pages[3].body.join(" "), /Insight Raevo/);
assert.equal(pages[4].priorities.length, 3);
assert.match(pages[5].body.join(" "), /próximo passo/i);
assert.equal(sanitizePdfFilename("Clínica São João & Filhos"), "relatorio-maturidade-comercial-clinica-sao-joao-e-filhos.pdf");

const sora = readFileSync(new URL("../public/assets/fonts/Sora-SemiBold.ttf", import.meta.url));
const inter = readFileSync(new URL("../public/assets/fonts/Inter-Regular.ttf", import.meta.url));
const bytes = await generateMaturityPdf(publicResult, { soraBytes: sora, interBytes: inter });
assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), "%PDF");
const document = await PDFDocument.load(bytes);
assert.equal(document.getPageCount(), 6);

console.log("Maturity PDF contains six branded A4 pages.");
