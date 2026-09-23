export function normalizePhone(value) {
  const trimmed = String(value ?? "").trim();
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export function validateCompanyProfile(value) {
  const profile = String(value ?? "").trim();
  return /^@[A-Za-z0-9._]{2,}$/.test(profile)
    || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(profile)
    || /^(?:www\.)?[^\s.]+\.[A-Za-z]{2,}(?:\/[^\s]*)?$/i.test(profile);
}

export function validateLead(values) {
  if (!String(values.name ?? "").trim()) return { field: "name", code: "required" };
  if (normalizePhone(values.whatsapp).length < 11) return { field: "whatsapp", code: "invalid" };
  if (!validateCompanyProfile(values.companyProfile)) return { field: "companyProfile", code: "invalid" };
  return null;
}

export function buildLeadPayload(values, context) {
  return {
    fullName: String(values.name ?? "").trim(),
    whatsapp: normalizePhone(values.whatsapp),
    instagramOrWebsite: String(values.companyProfile ?? "").trim(),
    locale: context.locale,
    country: context.country,
    sourceUrl: context.sourceUrl,
    utm: { ...(context.utm ?? {}) },
    submittedAt: new Date().toISOString(),
  };
}
