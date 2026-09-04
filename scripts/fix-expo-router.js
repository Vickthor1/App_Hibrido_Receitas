// Patch para expo-router 57.0.16 — corrige build/index.d.ts que referencia src/ em vez de build/
// Sem este patch, `npx tsc` falha com "Module 'expo-router' has no exported member 'Stack'"
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "node_modules", "expo-router", "build", "index.d.ts");
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, "utf8");
  const fixed = content.replace(/expo-router\/src/g, "expo-router/build");
  if (content !== fixed) {
    fs.writeFileSync(file, fixed, "utf8");
    console.log("[fix-expo-router] patch aplicado:", file);
  }
}
