/**
 * تولید آیکون‌های PWA برای «گردونه عملیات ریاضی»
 * خروجی: public/icon-192.png, public/icon-512.png, public/icon-maskable-512.png, public/apple-touch-icon.png
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OPS = [
  { color: "#10b981", symbol: "+" }, // جمع — بالا-راست
  { color: "#f59e0b", symbol: "×" }, // ضرب — پایین-راست
  { color: "#8b5cf6", symbol: "÷" }, // تقسیم — پایین-چپ
  { color: "#f43f5e", symbol: "−" }, // تفریق — بالا-چپ
];

const polar = (cx, cy, r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
};

/** ساخت SVG گردونه در ابعاد ۵۱۲ — با padding متغیر برای maskable */
function wheelSvg({ size = 512, bg = "#fbbf24", scale = 1, rounded = true }) {
  const c = size / 2;
  const R = 170 * scale;
  const sectors = OPS.map((op, i) => {
    const p1 = polar(c, c, R, i * 90);
    const p2 = polar(c, c, R, i * 90 + 90);
    const sym = polar(c, c, R * 0.66, i * 90 + 45);
    return `
      <path d="M ${c} ${c} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z"
            fill="${op.color}" stroke="#ffffff" stroke-width="${6 * scale}" />
      <text x="${sym.x.toFixed(2)}" y="${(sym.y + R * 0.02).toFixed(2)}" text-anchor="middle" dominant-baseline="central"
            font-family="DejaVu Sans" font-size="${(R * 0.42).toFixed(1)}" font-weight="900" fill="#ffffff">${op.symbol}</text>`;
  }).join("");

  const rimR = R + 11 * scale;
  const rim = `<circle cx="${c}" cy="${c}" r="${rimR}" fill="none" stroke="#292524" stroke-width="${16 * scale}" />`;
  const lights = Array.from({ length: 12 }, (_, i) => {
    const p = polar(c, c, rimR, i * 30);
    return `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${5.5 * scale}" fill="#fef3c7" stroke="#292524" stroke-width="${2 * scale}" />`;
  }).join("");
  const hub = `
    <circle cx="${c}" cy="${c}" r="${44 * scale}" fill="#ffffff" stroke="#e7e5e4" stroke-width="${3 * scale}" />
    <circle cx="${c}" cy="${c}" r="${34 * scale}" fill="#292524" />`;
  const pointer = `
    <polygon points="${c},${(c - R + 2).toFixed(1)} ${(c - 20 * scale).toFixed(1)},${(c - R - 34 * scale).toFixed(1)} ${(c + 20 * scale).toFixed(1)},${(c - R - 34 * scale).toFixed(1)}"
             fill="#dc2626" stroke="#ffffff" stroke-width="${4 * scale}" stroke-linejoin="round" />`;

  const bgRect = rounded
    ? `<rect width="${size}" height="${size}" rx="${size * 0.19}" fill="${bg}" />`
    : `<rect width="${size}" height="${size}" fill="${bg}" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bgRect}${rim}${sectors}${hub}${lights}${pointer}
  </svg>`;
}

const outDir = "/home/z/my-project/public";
await mkdir(outDir, { recursive: true });

const base = wheelSvg({ size: 512 });
const maskable = wheelSvg({ size: 512, scale: 0.72, rounded: false });

await sharp(Buffer.from(base)).png().toFile(`${outDir}/icon-512.png`);
await sharp(Buffer.from(base)).resize(192, 192).png().toFile(`${outDir}/icon-192.png`);
await sharp(Buffer.from(maskable)).png().toFile(`${outDir}/icon-maskable-512.png`);
await sharp(Buffer.from(base)).resize(180, 180).png().toFile(`${outDir}/apple-touch-icon.png`);

console.log("icons generated OK");
