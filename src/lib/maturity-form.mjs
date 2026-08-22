export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizePhone(value) {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export function splitInternationalPhone(value, supportedCountryCodes = []) {
  const normalized = normalizePhone(value);
  const countryCodes = supportedCountryCodes
    .map((code) => normalizePhone(code))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);
  const countryCode = countryCodes.find((code) => normalized.startsWith(code)) ?? countryCodes[0] ?? "";
  return {
    countryCode,
    nationalNumber: normalized.slice(countryCode.length).replace(/\D/g, ""),
  };
}

export function validateProfessionalEmail(value) {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email);
}

export function validateProfile(value) {
  const profile = String(value ?? "").trim();
  if (!profile) return true;
  return /^@[A-Za-z0-9._-]{2,}$/.test(profile)
    || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(profile)
    || /^(?:www\.)?[^\s.]+\.[A-Za-z]{2,}(?:\/[^\s]*)?$/i.test(profile);
}

export function validateLeadCapture(values) {
  if (!String(values?.name ?? "").trim()) return { field: "name", code: "required", message: "Indique o seu nome." };
  const fullPhone = normalizePhone(`${values?.countryCode ?? ""}${values?.whatsapp ?? ""}`);
  if (fullPhone.replace(/\D/g, "").length < 9) return { field: "whatsapp", code: "invalid", message: "Confirme o indicativo e o número de WhatsApp." };
  if (!String(values?.sector ?? "").trim()) return { field: "sector", code: "required", message: "Escolha o setor da empresa." };
  return null;
}

export function validateIdentification(values) {
  if (!String(values?.company ?? "").trim()) return { field: "company", code: "required", message: "Indique o nome da empresa." };
  if (!String(values?.role ?? "").trim()) return { field: "role", code: "required", message: "Escolha a função que melhor representa o seu papel." };
  if (!validateProfessionalEmail(values?.email)) return { field: "email", code: "invalid", message: "Indique um endereço de e-mail válido." };
  if (!validateProfile(values?.website)) return { field: "website", code: "invalid", message: "Use um domínio, URL ou perfil iniciado por @." };
  if (!String(values?.timeline ?? "").trim()) return { field: "timeline", code: "required", message: "Escolha o prazo que melhor representa a empresa." };
  if (values?.privacyAccepted !== true) return { field: "privacyAccepted", code: "required", message: "É necessário aceitar a Política de Privacidade para gerar o resultado." };
  return null;
}

export function createIdempotencyKey(randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  const value = typeof randomUUID === "function" ? randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `assessment-${value}`;
}

export function createLeadIdempotencyKey(randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  const value = typeof randomUUID === "function" ? randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `lead-${value}`;
}

export function buildLeadPayload(values, state, { idempotencyKey = createLeadIdempotencyKey(), now = () => new Date().toISOString() } = {}) {
  const error = validateLeadCapture(values);
  if (error) throw new TypeError(error.message);
  const capturedAt = now();
  return {
    idempotency_key: idempotencyKey,
    captured_at: capturedAt,
    source: "teste_maturidade_comercial",
    person: {
      name: String(values.name).trim(),
      whatsapp: normalizePhone(`${values.countryCode ?? ""}${values.whatsapp ?? ""}`),
    },
    company: { sector: String(values.sector).trim() },
    attribution: { ...(state?.attribution ?? {}) },
    consent: {
      privacy_notice_shown: true,
      policy_url: "/privacidade/",
      acknowledged_at: capturedAt,
    },
  };
}

export function buildSubmissionPayload(values, state, { idempotencyKey = createIdempotencyKey(), now = () => new Date().toISOString() } = {}) {
  const error = validateIdentification(values);
  if (error) throw new TypeError(error.message);
  if (!String(state?.lead?.id ?? "").trim()) throw new TypeError("O lead inicial precisa de ser registado antes de gerar o resultado.");
  const answers = Array.from({ length: 18 }, (_, index) => ({ question: index + 1, score: state?.answers?.[String(index + 1)] }));
  if (answers.some(({ score }) => !Number.isInteger(score) || score < 0 || score > 4)) throw new TypeError("As 18 perguntas de maturidade devem estar respondidas.");
  const submittedAt = now();
  return {
    idempotency_key: idempotencyKey,
    lead_id: String(state.lead.id).trim(),
    submitted_at: submittedAt,
    source: "teste_maturidade_comercial",
    person: {
      name: String(state.lead.name).trim(),
      email: normalizeEmail(values.email),
      whatsapp: normalizePhone(state.lead.whatsapp),
      role: String(values.role).trim(),
    },
    company: {
      name: String(values.company).trim(),
      sector: String(state.lead.sector ?? state.context.sector ?? ""),
      website: String(values.website ?? "").trim(),
      monthly_opportunities: String(state.context.monthly_opportunities ?? ""),
      average_sale_value: String(state.context.average_sale_value ?? ""),
      commercial_team_size: String(state.context.commercial_team_size ?? ""),
      main_goal: String(state.context.main_goal ?? ""),
      improvement_timeline: String(values.timeline).trim(),
    },
    answers,
    attribution: { ...(state.attribution ?? {}) },
    consent: {
      privacy_accepted: true,
      marketing_accepted: values.marketingAccepted === true,
      accepted_at: submittedAt,
    },
  };
}
