// Regenerate the Next.js content from the original single-file site.
//
//   node scripts/build-from-html.mjs
//
// Reads ../globalmedicare.html and produces:
//   app/globals.css      – the <style> block, verbatim
//   content/body.html    – the <body> DOM with <script>s stripped and every
//                          inline base64 image swapped for a /assets URL
//   public/engine.js     – the two vanilla-JS <script> blocks, with the base64
//                          asset map rewritten to /assets URLs and the form
//                          submit wired to POST /api/consult
//   public/assets/*      – every extracted image
//   public/favicon.png   – the favicon extracted from <head>
//
// Re-run any time the original HTML changes.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.resolve(ROOT, "..", "globalmedicare.html");

const ASSETS_DIR = path.join(ROOT, "public", "assets");
const CONTENT_DIR = path.join(ROOT, "content");

const EXT = { jpeg: "jpg", jpg: "jpg", png: "png", webp: "webp", gif: "gif", "svg+xml": "svg", avif: "avif" };

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}
function extFor(mime) {
  return EXT[mime.toLowerCase()] || "bin";
}
function writeAsset(name, dataUri) {
  const m = /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUri);
  if (!m) throw new Error(`Not a base64 image data URI for ${name}`);
  const file = `${name}.${extFor(m[1])}`;
  fs.writeFileSync(path.join(ASSETS_DIR, file), Buffer.from(m[2], "base64"));
  return `/assets/${file}`;
}

// ---------------------------------------------------------------------------
const html = fs.readFileSync(SRC, "utf8");
ensureDir(ASSETS_DIR);
ensureDir(CONTENT_DIR);
ensureDir(path.join(ROOT, "app"));

// --- CSS -------------------------------------------------------------------
const css = html.slice(
  html.indexOf("<style>") + "<style>".length,
  html.indexOf("</style>")
);
fs.writeFileSync(path.join(ROOT, "app", "globals.css"), css.trim() + "\n");

// --- favicon ---------------------------------------------------------------
const head = html.slice(0, html.indexOf("</head>"));
const favMatch = /<link[^>]*rel="icon"[^>]*href="(data:image\/[^"]+)"/.exec(head);
if (favMatch) {
  const m = /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(favMatch[1]);
  fs.writeFileSync(path.join(ROOT, "public", "favicon.png"), Buffer.from(m[2], "base64"));
}

// --- split body + scripts --------------------------------------------------
const bodyOpen = html.indexOf("<body>") + "<body>".length;
const bodyClose = html.indexOf("</body>");
let body = html.slice(bodyOpen, bodyClose);

const scriptRe = /<script>([\s\S]*?)<\/script>/g;
const scripts = [];
let sm;
while ((sm = scriptRe.exec(body)) !== null) scripts.push(sm[1]);
if (scripts.length < 3) {
  throw new Error(`Expected 3 <script> blocks in body, found ${scripts.length}`);
}
// strip all <script> blocks from the rendered markup
body = body.replace(scriptRe, "");

const [assetScript, engineScript, legalScript] = scripts;

// --- extract the __ASSET base64 map ---------------------------------------
const objStart = assetScript.indexOf("{");
const objEnd = assetScript.lastIndexOf("}");
const assetObj = JSON.parse(assetScript.slice(objStart, objEnd + 1));
const assetUrlMap = {};
for (const [key, uri] of Object.entries(assetObj)) {
  assetUrlMap[key] = writeAsset(key, uri);
}
console.log(`  extracted ${Object.keys(assetUrlMap).length} __ASSET images`);

// --- extract inline base64 <img> in the body ------------------------------
const seen = new Map();
let bodyImgCount = 0;
body = body.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+?(?=")/g, (uri) => {
  const clean = uri.replace(/\s+/g, "");
  if (seen.has(clean)) return seen.get(clean);
  const url = writeAsset(`body-${++bodyImgCount}`, clean);
  seen.set(clean, url);
  return url;
});
console.log(`  extracted ${bodyImgCount} inline body images`);

fs.writeFileSync(path.join(CONTENT_DIR, "body.html"), body.trim() + "\n");

// --- rebuild engine.js -----------------------------------------------------
let engine = engineScript;

// wire the form to the real API route (replaces the fake setTimeout success)
const FAKE = "setTimeout(()=>{ef.style.display='none';fs.style.display='block'},1100);";
const REAL = [
  "fetch('/api/consult',{method:'POST',headers:{'Content-Type':'application/json'},",
  "body:JSON.stringify({name:document.getElementById('name').value,",
  "country:document.getElementById('country').value,",
  "dialCode:document.getElementById('telcode').textContent,",
  "phone:document.getElementById('phone').value,",
  "destination:document.getElementById('dest').value,",
  "treatment:document.getElementById('specialty').value,",
  "message:document.getElementById('msg').value})})",
  ".then(r=>r.json()).then(d=>{if(d&&d.ok){ef.style.display='none';fs.style.display='block';}",
  "else{throw new Error(d&&d.error||'failed');}})",
  ".catch(err=>{fe.textContent=(err&&err.message)||'Something went wrong. Please try again or WhatsApp us.';",
  "fe.style.display='block';eb.disabled=false;eb.textContent='Get My Free Medical Opinion';eb.style.opacity='1';});",
].join("");
if (engine.includes(FAKE)) {
  engine = engine.replace(FAKE, REAL);
  console.log("  wired consultation form -> /api/consult");
} else {
  console.warn("  WARNING: form submit stub not found; form left unchanged");
}

const engineOut =
  "/* Globalmediicare engine — generated by scripts/build-from-html.mjs. Do not edit by hand. */\n" +
  `window.__ASSET=${JSON.stringify(assetUrlMap)};\n` +
  engine +
  "\n" +
  legalScript +
  "\n";
fs.writeFileSync(path.join(ROOT, "public", "engine.js"), engineOut);

console.log("Done. Generated globals.css, content/body.html, public/engine.js, public/assets/*");
