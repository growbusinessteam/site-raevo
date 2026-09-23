import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const deployRoot = join(root, "deploy/raevo-static-hostinger");

const read = (path) => readFileSync(join(root, path), "utf8");
const write = (path, content) => {
  const fullPath = join(root, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content);
};

const redirectPage = (targetPath) => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${targetPath}">
  <title>Raevo</title>
  <link rel="canonical" href="${targetPath}">
  <script>
    window.location.replace(${JSON.stringify(targetPath)} + window.location.search + window.location.hash);
  </script>
</head>
<body>
  <a href="${targetPath}">Abrir Raevo</a>
</body>
</html>
`;

const pages = [
  {
    source: "public/stitch/index.html",
    output: "deploy/raevo-static-hostinger/pt-med/index.html",
    transform: (html) => html,
  },
  {
    source: "public/stitch/forms.html",
    output: "deploy/raevo-static-hostinger/pt-med/forms/index.html",
    transform: (html) => html,
  },
  {
    source: "public/stitch/obrigado.html",
    output: "deploy/raevo-static-hostinger/pt-med/obrigado/index.html",
    transform: (html) => html,
  },
  {
    source: "public/stitch/agendamento.html",
    output: "deploy/raevo-static-hostinger/pt-med/agendamento/index.html",
    transform: (html) => html
      .replaceAll("../favicon", "/favicon")
      .replaceAll("../apple-touch-icon", "/apple-touch-icon")
      .replaceAll("../assets/", "/assets/"),
  },
];

for (const page of pages) {
  write(page.output, page.transform(read(page.source)));
}

write("deploy/raevo-static-hostinger/stitch/utm-persistence.js", read("public/stitch/utm-persistence.js"));

write("deploy/raevo-static-hostinger/index.html", redirectPage("/pt-med/"));
write("deploy/raevo-static-hostinger/forms/index.html", redirectPage("/pt-med/forms/"));
write("deploy/raevo-static-hostinger/obrigado/index.html", redirectPage("/pt-med/obrigado/"));
write("deploy/raevo-static-hostinger/agendamento/index.html", redirectPage("/pt-med/agendamento/"));

console.log(`Generated pt-med deploy in ${deployRoot}`);
