import assert from "node:assert/strict";
import {
  buildLeadPayload,
  normalizePhone,
  validateCompanyProfile,
  validateLead,
} from "../src/lib/official-form.mjs";

assert.equal(normalizePhone("+55 (11) 99999-8888"), "+5511999998888");
assert.equal(normalizePhone("+351 963 763 408"), "+351963763408");
assert.equal(validateCompanyProfile("@raevo"), true);
assert.equal(validateCompanyProfile("raevo.io"), true);
assert.equal(validateCompanyProfile("https://raevo.io"), true);
assert.equal(validateCompanyProfile("x"), false);

assert.deepEqual(
  validateLead({ name: "", whatsapp: "+55 11 99999-8888", companyProfile: "raevo.io" }),
  { field: "name", code: "required" },
);

const payload = buildLeadPayload(
  { name: "Ana Lima", whatsapp: "+55 (11) 99999-8888", companyProfile: "@analima" },
  {
    locale: "pt-BR",
    country: "BR",
    sourceUrl: "https://raevo.io/br-oficial/forms?utm_source=meta",
    utm: { utm_source: "meta" },
  },
);

assert.equal(payload.fullName, "Ana Lima");
assert.equal(payload.whatsapp, "+5511999998888");
assert.equal(payload.instagramOrWebsite, "@analima");
assert.equal(payload.country, "BR");
assert.deepEqual(payload.utm, { utm_source: "meta" });
