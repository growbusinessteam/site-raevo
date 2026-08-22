import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { sanitizeCompanySlug } from "./maturity-result.mjs";

const A4 = [595.28, 841.89];
const COLORS = {
  stone: rgb(233 / 255, 228 / 255, 218 / 255),
  sand: rgb(220 / 255, 207 / 255, 190 / 255),
  taupe: rgb(184 / 255, 171 / 255, 152 / 255),
  coal: rgb(31 / 255, 31 / 255, 31 / 255),
  gold: rgb(199 / 255, 169 / 255, 122 / 255),
  cyan: rgb(0, 184 / 255, 198 / 255),
  paper: rgb(253 / 255, 249 / 255, 240 / 255),
  muted: rgb(103 / 255, 95 / 255, 86 / 255),
  white: rgb(1, 1, 1),
};

const normalize = (data) => {
  const result = data.result;
  return {
    ...data,
    result: {
      ...result,
      total_points: result.total_points ?? result.totalPoints,
      max_points: result.max_points ?? result.maxPoints,
      strongest_pillar: result.strongest_pillar ?? result.strongestPillar,
      weakest_pillar: result.weakest_pillar ?? result.weakestPillar,
    },
  };
};

export function sanitizePdfFilename(company) {
  return `relatorio-maturidade-comercial-${sanitizeCompanySlug(company)}.pdf`;
}

export function buildPdfPages(rawData) {
  const data = normalize(rawData);
  const { result } = data;
  return [
    { key: "cover", title: "Teste de Maturidade Comercial", body: [data.company.name, data.person.name, new Intl.DateTimeFormat("pt-PT", { dateStyle: "long", timeZone: "UTC" }).format(new Date(data.submitted_at)), "Visão para evoluir. Sistemas para crescer."] },
    { key: "score", title: "O nível atual da empresa", body: [`${result.percentage}%`, result.level.label, result.level.description, "Inicial · Reativo · Estruturado · Previsível · Inteligente"] },
    { key: "pillars", title: "Análise por pilares", body: [`Pilar mais forte: ${result.strongest_pillar.label}`, `Principal oportunidade de evolução: ${result.weakest_pillar.label}`], bars: result.pillars },
    { key: "insight", title: "O que este resultado revela", body: ["Insight Raevo", data.insight.insight, `Ponto positivo: ${data.insight.strongest_pillar}`, `Principal oportunidade: ${data.insight.weakest_pillar}`, `Principal risco: ${data.insight.risk}`, `Próximo salto: ${data.insight.next_step}`] },
    { key: "priorities", title: "Três prioridades recomendadas", body: ["Uma ordem clara para orientar a evolução comercial."], priorities: data.priorities },
    { key: "next", title: "Transforme o diagnóstico numa evolução concreta", body: ["Um especialista da Raevo pode ajudar a interpretar este diagnóstico e identificar o que precisa de ser implementado como próximo passo.", "raevo.io", "Visão para evoluir. Sistemas para crescer."] },
  ];
}

function wrapText(text, font, size, maxWidth) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) line = candidate;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(page, text, { font, size = 11, x = 54, y, maxWidth = 487, lineHeight = size * 1.55, color = COLORS.muted, maxLines = 20 }) {
  const lines = wrapText(text, font, size, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font, color }));
  return y - lines.length * lineHeight;
}

function drawHeader(page, fonts, pageNumber, light = true) {
  const color = light ? COLORS.coal : COLORS.stone;
  page.drawText("RAEVO", { x: 54, y: 796, size: 15, font: fonts.sora, color });
  page.drawCircle({ x: 112, y: 800, size: 2.6, color: COLORS.cyan });
  page.drawText("TESTE DE MATURIDADE COMERCIAL", { x: 306, y: 798, size: 6.6, font: fonts.inter, color: light ? COLORS.muted : COLORS.taupe, characterSpacing: 1.15 });
  page.drawLine({ start: { x: 54, y: 780 }, end: { x: 541, y: 780 }, thickness: .6, color: light ? COLORS.taupe : rgb(.28, .28, .28) });
  page.drawText(String(pageNumber).padStart(2, "0"), { x: 515, y: 28, size: 7, font: fonts.inter, color: light ? COLORS.muted : COLORS.taupe });
}

function drawTitle(page, text, fonts, { y = 718, size = 31, color = COLORS.coal, maxWidth = 480 } = {}) {
  return drawWrapped(page, text, { font: fonts.sora, size, x: 54, y, maxWidth, lineHeight: size * 1.18, color, maxLines: 4 });
}

async function loadDefaultAssets() {
  const [sora, inter, logo] = await Promise.all([
    fetch("/assets/fonts/Sora-SemiBold.ttf").then((response) => response.arrayBuffer()),
    fetch("/assets/fonts/Inter-Regular.ttf").then((response) => response.arrayBuffer()),
    fetch("/assets/brand/raevo-logo-official-transparent.png").then((response) => response.ok ? response.arrayBuffer() : null).catch(() => null),
  ]);
  return { soraBytes: sora, interBytes: inter, logoBytes: logo };
}

export async function generateMaturityPdf(rawData, suppliedAssets = {}) {
  const data = normalize(rawData);
  const assets = suppliedAssets.soraBytes && suppliedAssets.interBytes ? suppliedAssets : { ...(await loadDefaultAssets()), ...suppliedAssets };
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  document.setTitle(`Teste de Maturidade Comercial — ${data.company.name}`);
  document.setAuthor("Raevo");
  document.setSubject("Diagnóstico de maturidade comercial");
  document.setCreator("Raevo | Inteligência Comercial");
  const fonts = {
    sora: await document.embedFont(assets.soraBytes, { subset: true }),
    inter: await document.embedFont(assets.interBytes, { subset: true }),
  };
  let logo = null;
  if (assets.logoBytes) {
    try { logo = await document.embedPng(assets.logoBytes); } catch { logo = null; }
  }
  const pages = buildPdfPages(data);

  // 1 — Capa
  {
    const page = document.addPage(A4);
    page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: COLORS.coal });
    page.drawRectangle({ x: 0, y: 0, width: 10, height: A4[1], color: COLORS.cyan });
    if (logo) page.drawImage(logo, { x: 54, y: 744, width: 165, height: 47 });
    else { page.drawText("RAEVO", { x: 54, y: 765, size: 18, font: fonts.sora, color: COLORS.stone }); page.drawCircle({ x: 124, y: 771, size: 3, color: COLORS.cyan }); }
    page.drawText("DIAGNÓSTICO RAEVO", { x: 54, y: 672, size: 8, font: fonts.inter, color: COLORS.gold, characterSpacing: 1.6 });
    let y = drawTitle(page, pages[0].title, fonts, { y: 620, size: 40, color: COLORS.stone, maxWidth: 440 });
    y -= 38;
    page.drawText(data.company.name, { x: 54, y, size: 18, font: fonts.sora, color: COLORS.white });
    page.drawText(`Responsável · ${data.person.name}`, { x: 54, y: y - 28, size: 10, font: fonts.inter, color: COLORS.taupe });
    const date = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(data.submitted_at));
    page.drawText(date, { x: 54, y: y - 48, size: 10, font: fonts.inter, color: COLORS.taupe });
    page.drawLine({ start: { x: 54, y: 94 }, end: { x: 541, y: 94 }, thickness: .7, color: rgb(.28, .28, .28) });
    page.drawText("Visão para evoluir. Sistemas para crescer.", { x: 54, y: 64, size: 10, font: fonts.inter, color: COLORS.gold });
  }

  // 2 — Resultado
  {
    const page = document.addPage(A4); page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: COLORS.paper }); drawHeader(page, fonts, 2);
    drawTitle(page, pages[1].title, fonts);
    page.drawText(`${data.result.percentage}%`, { x: 54, y: 548, size: 82, font: fonts.sora, color: COLORS.cyan });
    page.drawText(data.result.level.label.toUpperCase(), { x: 58, y: 514, size: 11, font: fonts.sora, color: COLORS.gold, characterSpacing: 1.6 });
    drawWrapped(page, data.result.level.description, { font: fonts.inter, size: 13, x: 275, y: 585, maxWidth: 255, lineHeight: 20, color: COLORS.muted });
    const scaleY = 392; const cell = 487 / 5;
    const levels = ["Inicial", "Reativo", "Estruturado", "Previsível", "Inteligente"];
    levels.forEach((level, index) => {
      const x = 54 + index * cell;
      page.drawLine({ start: { x, y: scaleY }, end: { x: x + cell - 7, y: scaleY }, thickness: data.result.level.label === level ? 4 : 1, color: data.result.level.label === level ? COLORS.cyan : COLORS.taupe });
      page.drawText(String(index + 1).padStart(2, "0"), { x, y: scaleY - 19, size: 6.5, font: fonts.inter, color: COLORS.muted });
      page.drawText(level, { x, y: scaleY - 37, size: 7.8, font: fonts.sora, color: COLORS.coal });
    });
    drawWrapped(page, data.methodology || "Resultado calculado através da metodologia de maturidade comercial da Raevo.", { font: fonts.inter, size: 9, x: 54, y: 280, maxWidth: 470, lineHeight: 14, color: COLORS.muted });
  }

  // 3 — Pilares
  {
    const page = document.addPage(A4); page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: COLORS.paper }); drawHeader(page, fonts, 3);
    drawTitle(page, pages[2].title, fonts);
    let y = 620;
    data.result.pillars.forEach((pillar, index) => {
      page.drawText(String(index + 1).padStart(2, "0"), { x: 54, y, size: 7, font: fonts.inter, color: COLORS.muted });
      page.drawText(pillar.label, { x: 82, y, size: 10, font: fonts.sora, color: COLORS.coal });
      page.drawText(`${pillar.percentage}%`, { x: 508, y, size: 9, font: fonts.sora, color: COLORS.coal });
      page.drawRectangle({ x: 82, y: y - 17, width: 450, height: 5, color: COLORS.stone });
      page.drawRectangle({ x: 82, y: y - 17, width: 450 * pillar.percentage / 100, height: 5, color: pillar.key === data.result.weakest_pillar.key ? COLORS.cyan : COLORS.coal });
      y -= 72;
    });
    page.drawRectangle({ x: 54, y: 112, width: 487, height: 86, color: COLORS.stone });
    page.drawText("PILAR MAIS FORTE", { x: 72, y: 170, size: 6.5, font: fonts.inter, color: COLORS.muted, characterSpacing: 1 });
    page.drawText(data.result.strongest_pillar.label, { x: 72, y: 146, size: 12, font: fonts.sora, color: COLORS.coal });
    page.drawText("PRINCIPAL OPORTUNIDADE", { x: 310, y: 170, size: 6.5, font: fonts.inter, color: COLORS.muted, characterSpacing: 1 });
    page.drawText(data.result.weakest_pillar.label, { x: 310, y: 146, size: 11, font: fonts.sora, color: COLORS.cyan });
  }

  // 4 — Insight
  {
    const page = document.addPage(A4); page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: COLORS.sand }); drawHeader(page, fonts, 4);
    page.drawText("INSIGHT RAEVO", { x: 54, y: 724, size: 8, font: fonts.inter, color: COLORS.gold, characterSpacing: 1.5 });
    let y = drawTitle(page, pages[3].title, fonts, { y: 682 });
    y -= 22; y = drawWrapped(page, data.insight.insight, { font: fonts.inter, size: 13, x: 54, y, maxWidth: 487, lineHeight: 21, color: COLORS.coal });
    y -= 24; y = drawWrapped(page, `O principal ponto positivo está em ${data.insight.strongest_pillar}. A maior oportunidade de evolução está em ${data.insight.weakest_pillar}.`, { font: fonts.inter, size: 11, x: 54, y, maxWidth: 487, lineHeight: 18, color: COLORS.muted });
    y -= 26; page.drawRectangle({ x: 54, y: y - 118, width: 487, height: 138, color: COLORS.paper });
    page.drawText("PRÓXIMO SALTO", { x: 72, y: y - 4, size: 7, font: fonts.inter, color: COLORS.gold, characterSpacing: 1.2 });
    drawWrapped(page, data.insight.next_step, { font: fonts.inter, size: 11, x: 72, y: y - 30, maxWidth: 450, lineHeight: 18, color: COLORS.coal, maxLines: 5 });
    drawWrapped(page, `Principal risco · ${data.insight.risk}`, { font: fonts.inter, size: 9, x: 54, y: 125, maxWidth: 487, lineHeight: 15, color: COLORS.muted });
  }

  // 5 — Prioridades
  {
    const page = document.addPage(A4); page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: COLORS.coal }); drawHeader(page, fonts, 5, false);
    drawTitle(page, pages[4].title, fonts, { color: COLORS.stone });
    let y = 612;
    data.priorities.forEach((priority, index) => {
      page.drawText(String(index + 1).padStart(2, "0"), { x: 54, y, size: 22, font: fonts.sora, color: COLORS.cyan });
      page.drawText((priority.pillar || `Nível ${data.result.level.label}`).toUpperCase(), { x: 105, y: y + 4, size: 6.5, font: fonts.inter, color: COLORS.gold, characterSpacing: 1 });
      page.drawText(priority.title, { x: 105, y: y - 22, size: 14, font: fonts.sora, color: COLORS.stone });
      const bodyY = drawWrapped(page, priority.body, { font: fonts.inter, size: 9.4, x: 105, y: y - 45, maxWidth: 420, lineHeight: 14.5, color: COLORS.taupe, maxLines: 4 });
      drawWrapped(page, `Resultado esperado · ${priority.outcome}`, { font: fonts.inter, size: 8.3, x: 105, y: bodyY - 7, maxWidth: 420, lineHeight: 13, color: COLORS.stone, maxLines: 2 });
      page.drawLine({ start: { x: 54, y: y - 150 }, end: { x: 541, y: y - 150 }, thickness: .5, color: rgb(.28, .28, .28) });
      y -= 180;
    });
  }

  // 6 — Próximo passo
  {
    const page = document.addPage(A4); page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: COLORS.stone }); drawHeader(page, fonts, 6);
    page.drawText("PRÓXIMO PASSO", { x: 54, y: 704, size: 8, font: fonts.inter, color: COLORS.gold, characterSpacing: 1.5 });
    let y = drawTitle(page, pages[5].title, fonts, { y: 658, size: 37 });
    y -= 35; y = drawWrapped(page, pages[5].body[0], { font: fonts.inter, size: 13, x: 54, y, maxWidth: 455, lineHeight: 21, color: COLORS.muted });
    page.drawRectangle({ x: 54, y: y - 118, width: 300, height: 62, color: COLORS.gold });
    page.drawText("ANALISAR O RESULTADO COM A RAEVO", { x: 72, y: y - 84, size: 8.2, font: fonts.sora, color: COLORS.white, characterSpacing: .4 });
    page.drawText("raevo.io", { x: 54, y: 168, size: 23, font: fonts.sora, color: COLORS.coal });
    page.drawText("Visão para evoluir. Sistemas para crescer.", { x: 54, y: 138, size: 10, font: fonts.inter, color: COLORS.muted });
    page.drawLine({ start: { x: 54, y: 108 }, end: { x: 541, y: 108 }, thickness: .7, color: COLORS.taupe });
    page.drawText("RAEVO | INTELIGÊNCIA COMERCIAL", { x: 54, y: 80, size: 7, font: fonts.inter, color: COLORS.gold, characterSpacing: 1.2 });
  }

  return document.save();
}

export async function downloadMaturityPdf(data) {
  const bytes = await generateMaturityPdf(data);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizePdfFilename(data.company.name);
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return link.download;
}
