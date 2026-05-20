#!/usr/bin/env node
/* Génère les favicons PNG + ICO à partir de public/favicon.svg.
   Usage: node scripts/build-favicons.js
*/
const fs   = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..", "public");
const SVG_PATH = path.join(ROOT, "favicon.svg");

// Variante claire (pour iOS / apple-touch-icon) : background blanc + EW.
// Variante "dark" SVG pour Android : background ink + EW blanc.
const INK    = "#0A1F3D";
const ACCENT = "#2E7EF4";

function eFlatSvg(bg, ink, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${bg}" rx="6"/>
  <rect x="3"  y="4"    width="3.6"  height="24" fill="${ink}"/>
  <rect x="3"  y="4"    width="14"   height="3.6" fill="${ink}"/>
  <rect x="3"  y="14.2" width="11"   height="3.6" fill="${ink}"/>
  <rect x="3"  y="24.4" width="14"   height="3.6" fill="${ink}"/>
  <path d="M 18 4 L 22 28 L 24.5 14 L 27 28 L 31 4"
        fill="none" stroke="${accent}" stroke-width="3.2"
        stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;
}

const svgLightBg = eFlatSvg("#ffffff", INK,   ACCENT);
const svgDarkBg  = eFlatSvg(INK,       "#fff", "#5BA0FF");

async function renderPng(svg, size, outName) {
  const buf = await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(ROOT, outName), buf);
  console.log(`✓ ${outName} (${size}×${size}, ${(buf.length/1024).toFixed(1)} KB)`);
  return buf;
}

(async () => {
  // 1. PNG fallback pour les vieux navigateurs + apple-touch
  await renderPng(svgLightBg, 16,  "favicon-16.png");
  await renderPng(svgLightBg, 32,  "favicon-32.png");
  await renderPng(svgLightBg, 192, "android-chrome-192.png");
  await renderPng(svgLightBg, 512, "android-chrome-512.png");
  await renderPng(svgLightBg, 180, "apple-touch-icon.png");

  // 2. ICO multi-tailles (16+32+48) — sharp ne fait pas ICO directement.
  //    On utilise la spec : header + 3 entries + 3 PNG payloads.
  const png16 = await sharp(Buffer.from(svgLightBg)).resize(16, 16).png().toBuffer();
  const png32 = await sharp(Buffer.from(svgLightBg)).resize(32, 32).png().toBuffer();
  const png48 = await sharp(Buffer.from(svgLightBg)).resize(48, 48).png().toBuffer();
  const ico = makeIco([
    { size: 16, png: png16 },
    { size: 32, png: png32 },
    { size: 48, png: png48 },
  ]);
  fs.writeFileSync(path.join(ROOT, "favicon.ico"), ico);
  console.log(`✓ favicon.ico (16+32+48, ${(ico.length/1024).toFixed(1)} KB)`);
})();

function makeIco(images) {
  // ICONDIR (6) + ICONDIRENTRY*N (16) + image data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);            // reserved
  header.writeUInt16LE(1, 2);            // type: 1 = ico
  header.writeUInt16LE(images.length, 4);
  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + entries.length;
  const blobs = [];
  images.forEach((img, i) => {
    const sz = img.size === 256 ? 0 : img.size;
    entries.writeUInt8(sz, i * 16);            // width
    entries.writeUInt8(sz, i * 16 + 1);        // height
    entries.writeUInt8(0,  i * 16 + 2);        // palette
    entries.writeUInt8(0,  i * 16 + 3);        // reserved
    entries.writeUInt16LE(1, i * 16 + 4);      // planes
    entries.writeUInt16LE(32, i * 16 + 6);     // bpp
    entries.writeUInt32LE(img.png.length, i * 16 + 8); // size in bytes
    entries.writeUInt32LE(offset, i * 16 + 12);        // offset
    blobs.push(img.png);
    offset += img.png.length;
  });
  return Buffer.concat([header, entries, ...blobs]);
}
