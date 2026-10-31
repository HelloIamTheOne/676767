const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");
const JavaScriptObfuscator = require("javascript-obfuscator");

(async () => {
  const input = path.resolve("index.html");
  const outputDir = path.resolve("dist");
  const output = path.join(outputDir, "index.html");

  if (!fs.existsSync(input)) {
    throw new Error("No se encontró index.html en la raíz del proyecto.");
  }

  let html = fs.readFileSync(input, "utf8");

  // Actualiza el UID del administrador confirmado por el usuario.
  html = html.replace(
    /const\s+ADMIN_UID\s*=\s*["'][^"']*["']\s*;/,
    'const ADMIN_UID = "a899ab31-456a-40dc-b03d-af59182afd41";'
  );

  // Ofusca el último script inline (el JavaScript propio, no el CDN de Supabase).
  const scripts = [...html.matchAll(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/gi)];
  if (!scripts.length) {
    throw new Error("No se encontró el bloque JavaScript inline.");
  }

  const target = scripts[scripts.length - 1];
  const source = target[1];

  const obfuscated = JavaScriptObfuscator.obfuscate(source, {
    compact: true,
    simplify: true,
    renameGlobals: false,
    renameProperties: false,
    identifierNamesGenerator: "hexadecimal",
    stringArray: true,
    stringArrayThreshold: 0.55,
    stringArrayEncoding: [],
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayIndexShift: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    selfDefending: false,
    debugProtection: false,
    disableConsoleOutput: false,
    numbersToExpressions: false,
    transformObjectKeys: false,
    unicodeEscapeSequence: false
  }).getObfuscatedCode();

  const replacement = target[0].replace(source, obfuscated);
  html = html.slice(0, target.index) + replacement +
         html.slice(target.index + target[0].length);

  const minified = await minify(html, {
    collapseWhitespace: true,
    conservativeCollapse: false,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: false,
    removeAttributeQuotes: false,
    minifyCSS: true,
    minifyJS: false,
    keepClosingSlash: true,
    sortAttributes: false,
    sortClassName: false
  });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(output, minified, "utf8");
  console.log("Versión protegida creada en dist/index.html");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
                                                    
