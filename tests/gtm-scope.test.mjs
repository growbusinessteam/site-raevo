import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const gtmId = "GTM-WCLM4S9P";

const layout = read("src/components/official/OfficialLayout.astro");
assert.ok(layout.includes("enableGoogleTagManager"), "official layout should gate GTM behind an explicit prop");
assert.ok(layout.includes("https://www.googletagmanager.com/gtm.js?id="), "official layout should load GTM in head");
assert.ok(layout.includes(`'${gtmId}'`), "official layout should initialize the requested GTM container");
assert.ok(layout.includes(`https://www.googletagmanager.com/ns.html?id=${gtmId}`), "official layout should include the GTM noscript iframe");

for (const component of ["OfficialLanding.astro", "OfficialLeadForm.astro"]) {
  assert.ok(
    read(`src/components/official/${component}`).includes("enableGoogleTagManager"),
    `${component} should explicitly enable GTM`,
  );
}

assert.ok(
  !read("src/components/official/OfficialThanks.astro").includes("enableGoogleTagManager"),
  "thank-you pages should not enable GTM",
);

for (const path of [
  "src/layouts/BaseLayout.astro",
  "public/stitch/index.html",
  "public/stitch/forms.html",
  "public/stitch/obrigado.html",
  "public/stitch/agendamento.html",
]) {
  assert.ok(!read(path).includes(gtmId), `${path} should not include the official GTM container`);
}
