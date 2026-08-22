import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const apiUrl = new URL("../public/api/maturidade/index.php", import.meta.url);
assert.equal(existsSync(apiUrl), true, "The same-origin maturity API must exist");
const api = readFileSync(apiUrl, "utf8");

for (const required of [
  "REQUEST_METHOD", "POST", "GET", "CONTENT_LENGTH", "1048576", "json_decode",
  "random_bytes(32)", "rename(", "LOCK_EX", "MATURITY_ASSESSMENT_WEBHOOK_URL",
  "MATURITY_ASSESSMENT_CTA_URL", "MATURITY_RESULT_RETENTION_DAYS", "Cache-Control: no-store",
  "X-Robots-Tag: noindex, nofollow", "18", "72", "20", "21", "40", "41", "60", "61", "80", "81",
]) assert.match(api, new RegExp(required.replace(/[()]/g, "\\$&")), `API must contain ${required}`);

assert.match(api, /bin2hex\(random_bytes\(32\)\)/);
assert.match(api, /flock\([^;]+LOCK_EX/);
assert.match(api, /MATURITY_PRIVATE_STORAGE_PATH/);
assert.match(api, /function_exists\('mb_substr'\)/);
assert.match(api, /\/api\/maturidade\/leads/);
assert.match(api, /handleLeadCapture/);
assert.match(api, /maturity_lead_captured/);
assert.match(api, /maturity_assessment_completed/);
assert.match(api, /lead_id/);
assert.match(api, /lead-/);
assert.match(api, /array_merge\(\$submission/);
assert.match(api, /privacy_notice_required/);
assert.match(api, /context_required/);
assert.doesNotMatch(api, /role_required/);
assert.doesNotMatch(api, /timeline_required/);
assert.doesNotMatch(api, /privacy_required/);
assert.doesNotMatch(api, /hook\.growautomacao\.com|https:\/\/[^'\"]+webhook/i);

const apiRewrite = readFileSync(new URL("../public/api/maturidade/.htaccess", import.meta.url), "utf8");
assert.match(apiRewrite, /RewriteRule/);
assert.match(apiRewrite, /index\.php/);
assert.match(apiRewrite, /leads/);

const resultRewrite = readFileSync(new URL("../public/teste-maturidade-comercial/resultado/.htaccess", import.meta.url), "utf8");
assert.match(resultRewrite, /\[0-9a-fA-F\]/);
assert.match(resultRewrite, /index\.html/);

console.log("Maturity API contract protects secrets and tokenized results.");
