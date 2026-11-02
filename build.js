
const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");

(async () => {
  const outputDir = path.resolve("dist");

  const files = [
    "index.html",
    "styles.css",
    "app.js"
  ];

  // Comprobar que existan los archivos necesarios.
  for (const file of files) {
    if (!fs.existsSync(path.resolve(file))) {
      throw new Error(`No se encontró el archivo ${file}.`);
    }
  }

  // Crear carpeta de salida.
  fs.mkdirSync(outputDir, { recursive: true });

  // Leer HTML.
  let html = fs.readFileSync("index.html", "utf8");

  // Minificar HTML sin modificar los archivos externos.
  const minified = await minify(html, {
    collapseWhitespace: true,
    conservativeCollapse: false,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: false,
    removeAttributeQuotes: false,
    minifyCSS: false,
    minifyJS: false,
    keepClosingSlash: true,
    sortAttributes: false,
    sortClassName: false
  });

  fs.writeFileSync(
    path.join(outputDir, "index.html"),
    minified,
    "utf8"
  );

  // Copiar JavaScript y CSS a dist.
  fs.copyFileSync(
    "app.js",
    path.join(outputDir, "app.js")
  );

  fs.copyFileSync(
    "styles.css",
    path.join(outputDir, "styles.css")
  );

  console.log("Versión protegida creada correctamente en dist.");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
