export const STORAGE_KEY = "raevo:maturity:v2";
export const STATE_VERSION = 2;

const BASE = "/teste-maturidade-comercial";
export const LEAD_PATH = `${BASE}/dados-iniciais/`;
export const CONTEXT_STEPS = [
  ["monthly_opportunities", "oportunidades"],
  ["average_sale_value", "valor-medio"],
  ["commercial_team_size", "equipa"],
  ["main_goal", "objetivo"],
];

const contextPaths = CONTEXT_STEPS.map(([, slug]) => `${BASE}/contexto/${slug}/`);
const questionPaths = Array.from({ length: 18 }, (_, index) => `${BASE}/pergunta/${String(index + 1).padStart(2, "0")}/`);
export const FUNNEL_PATHS = [...contextPaths, ...questionPaths, `${BASE}/identificacao/`];

export function captureAttribution({ href = "", referrer = "" } = {}) {
  let url;
  try { url = new URL(href || `${BASE}/`, "https://raevo.io"); }
  catch { url = new URL(`${BASE}/`, "https://raevo.io"); }
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_placement", "gclid", "fbclid"];
  const values = Object.fromEntries(keys.map((key) => [key, url.searchParams.get(key) ?? ""]));
  return { ...values, referrer: String(referrer || ""), landing_page: href || url.href };
}

export function createAssessmentState(location = {}) {
  return {
    version: STATE_VERSION,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lead: null,
    context: {},
    answers: {},
    attribution: captureAttribution(location),
  };
}

export function readState(value) {
  let parsed = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); }
    catch { return null; }
  }
  if (!parsed || typeof parsed !== "object" || parsed.version !== STATE_VERSION) return null;
  if (!parsed.context || typeof parsed.context !== "object" || !parsed.answers || typeof parsed.answers !== "object") return null;
  if (parsed.lead !== null && (typeof parsed.lead !== "object" || !String(parsed.lead.id ?? "").trim())) return null;
  return parsed;
}

const touch = (state, changes) => ({ ...state, ...changes, updatedAt: new Date().toISOString() });

export function setLeadCapture(state, { leadId, name, whatsapp, sector }) {
  const lead = {
    id: String(leadId ?? "").trim(),
    name: String(name ?? "").trim(),
    whatsapp: String(whatsapp ?? "").trim(),
    sector: String(sector ?? "").trim(),
  };
  if (!lead.id || !lead.name || !lead.whatsapp || !lead.sector) throw new TypeError("Os dados iniciais do lead são obrigatórios.");
  return touch(state, { lead, context: { ...state.context, sector: lead.sector } });
}

export function setContextAnswer(state, key, value) {
  if (!CONTEXT_STEPS.some(([candidate]) => candidate === key)) throw new RangeError("Etapa de contexto desconhecida.");
  if (!String(value ?? "").trim()) throw new TypeError("A resposta de contexto é obrigatória.");
  return touch(state, { context: { ...state.context, [key]: String(value) } });
}

export function setMaturityAnswer(state, number, score) {
  if (!Number.isInteger(number) || number < 1 || number > 18) throw new RangeError("O número da pergunta deve estar entre 1 e 18.");
  if (!Number.isInteger(score) || score < 0 || score > 4) throw new RangeError("A pontuação deve estar entre 0 e 4.");
  return touch(state, { answers: { ...state.answers, [String(number)]: score } });
}

export function getFirstIncompletePath(state) {
  if (!String(state?.lead?.id ?? "").trim()) return LEAD_PATH;
  for (let index = 0; index < CONTEXT_STEPS.length; index += 1) {
    const [key] = CONTEXT_STEPS[index];
    if (!String(state?.context?.[key] ?? "").trim()) return contextPaths[index];
  }
  for (let number = 1; number <= 18; number += 1) {
    if (!Number.isInteger(state?.answers?.[String(number)])) return questionPaths[number - 1];
  }
  return `${BASE}/identificacao/`;
}

function normalizePath(path) {
  const clean = String(path || "").split(/[?#]/)[0];
  return clean.endsWith("/") ? clean : `${clean}/`;
}

export function getNextPath(path) {
  const current = normalizePath(path);
  const index = FUNNEL_PATHS.indexOf(current);
  if (index < 0 || index === FUNNEL_PATHS.length - 1) return null;
  return FUNNEL_PATHS[index + 1];
}

export function getPreviousPath(path) {
  const current = normalizePath(path);
  const index = FUNNEL_PATHS.indexOf(current);
  if (index <= 0) return `${BASE}/antes-de-comecar/`;
  return FUNNEL_PATHS[index - 1];
}

export function loadBrowserState(storage = globalThis.sessionStorage) {
  if (!storage) return null;
  return readState(storage.getItem(STORAGE_KEY));
}

export function saveBrowserState(state, storage = globalThis.sessionStorage) {
  storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function clearBrowserState(storage = globalThis.sessionStorage) {
  storage?.removeItem(STORAGE_KEY);
}

export function ensureBrowserState({ storage = globalThis.sessionStorage, href = globalThis.location?.href, referrer = globalThis.document?.referrer } = {}) {
  const current = loadBrowserState(storage);
  if (current) return current;
  const fresh = createAssessmentState({ href, referrer });
  saveBrowserState(fresh, storage);
  return fresh;
}
