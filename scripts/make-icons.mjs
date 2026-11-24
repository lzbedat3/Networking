// Draws the app's icons from the Darb mark (assets/darb-mark-480.webp), in the same family as the
// other Darb apps: the mark on a forest tile with a gold glow, and a corner badge that names the app.
// This app's badge is a network: three nodes linked into a route, in gold on a ring of the tile.
//
//   node scripts/make-icons.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = join(ROOT, "assets");
const OUT = join(ROOT, "public", "icons");

/** The two tiles. Colours are the site's own: the night forest and the day paper. */
export const TILES = {
  dark: { top: "#0f241b", bottom: "#07110c" },
  light: { top: "#f7f1e4", bottom: "#efe4cd" },
};
const TAB_NIGHT = { top: "#173b2c", bottom: "#0c2118" };
const FOREST = "#14281f";
const GOLD = "#d9a54c";

/** The mark's drawn area inside the 480 x 559 webp (its transparent margin trimmed). */
const MARK_BOX = { left: 26, top: 26, width: 428, height: 507 };

/** Every file this script writes, by name. */
export const FAVICON_SIZES = [16, 32, 48];

const PNG = { compressionLevel: 9, adaptiveFiltering: false, palette: false, effort: 10 };

let markCache;
async function markSource() {
  markCache ??= await sharp(join(BRAND, "darb-mark-480.webp")).extract(MARK_BOX).png().toBuffer();
  return markCache;
}

/** The mark scaled to `height` px. */
async function mark(height) {
  const width = Math.round((height * MARK_BOX.width) / MARK_BOX.height);
  const img = sharp(await markSource()).resize(width, height, { kernel: "lanczos3" });
  // Tab sizes lose the arch's edges to the resize; a light sharpen brings them back.
  if (height <= 48) img.sharpen({ sigma: 0.5 });
  return img.png().toBuffer({ resolveWithObject: true });
}

/** A solid-coloured copy of an RGBA image's silhouette, at `opacity`, blurred by `sigma`. */
async function silhouette(buf, { color, opacity, sigma, pad }) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const [r, g, b] = hex(color);
  const w = info.width + pad * 2;
  const h = info.height + pad * 2;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const o = ((y + pad) * w + x + pad) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = Math.round(data[i + 3] * opacity);
    }
  for (let p = 0; p < w * h; p++) {
    if (out[p * 4 + 3] === 0) {
      out[p * 4] = r;
      out[p * 4 + 1] = g;
      out[p * 4 + 2] = b;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .blur(sigma)
    .png()
    .toBuffer({ resolveWithObject: true });
}

function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A small deterministic random source (mulberry32), for the paper grain. */
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A barely there paper grain for the day tile: warm specks, never a pattern. */
function grain(size, strength) {
  const next = random(0xda4b);
  const out = Buffer.alloc(size * size * 4);
  for (let p = 0; p < size * size; p++) {
    const v = next();
    const light = v > 0.5;
    out[p * 4] = light ? 255 : 120;
    out[p * 4 + 1] = light ? 252 : 96;
    out[p * 4 + 2] = light ? 240 : 52;
    out[p * 4 + 3] = Math.round(Math.abs(v - 0.5) * 2 * strength * 255);
  }
  return sharp(out, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();
}

/** The tile behind the mark, as SVG: the gradient, the light it catches, the edge. */
function tileSvg(theme, size, { radius = 0 } = {}) {
  // A tab icon at night sits on dark browser chrome: its tile lifts a step so the edge still shows.
  const t = theme === "dark" && size <= 48 ? TAB_NIGHT : TILES[theme];
  const r = radius * size;
  const shape = (attrs) => `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" ${attrs}/>`;
  const night = `
    <radialGradient id="glow" cx="0.56" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.26"/>
      <stop offset="0.45" stop-color="${GOLD}" stop-opacity="0.09"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sky" cx="0.3" cy="0" r="0.9">
      <stop offset="0" stop-color="#1d5a43" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#1d5a43" stop-opacity="0"/>
    </radialGradient>`;
  const day = `
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sky" cx="0.5" cy="1.1" r="0.75">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${t.top}"/>
      <stop offset="1" stop-color="${t.bottom}"/>
    </linearGradient>
    ${theme === "dark" ? night : day}
  </defs>
  ${shape('fill="url(#bg)"')}
  ${shape('fill="url(#sky)"')}
  ${shape('fill="url(#glow)"')}
</svg>`);
}

/**
 * The mark on its tile. `fill` is the mark's height as a share of the tile; `radius` rounds the
 * tile's corners (0: full bleed, for iOS and maskable icons, which the system shapes itself).
 */
async function markTile(theme, size, { fill, radius = 0, lift = 0.012 }) {
  const m = await mark(Math.round(size * fill));
  const left = Math.round((size - m.info.width) / 2);
  // Optically centred: the mark's heavy block sits low, so it rises a touch.
  const top = Math.round((size - m.info.height) / 2 - size * lift);
  const layers = [];
  if (size >= 96 && theme === "light") {
    const pad = Math.round(size * 0.08);
    const soft = await silhouette(m.data, {
      color: "#3c341e",
      opacity: 0.22,
      sigma: Math.max(1, size * 0.028),
      pad,
    });
    layers.push({ input: soft.data, left: left - pad, top: top - pad + Math.round(size * 0.022) });
    const contact = await silhouette(m.data, {
      color: "#3c341e",
      opacity: 0.16,
      sigma: Math.max(0.6, size * 0.006),
      pad,
    });
    layers.push({
      input: contact.data,
      left: left - pad,
      top: top - pad + Math.round(size * 0.005),
    });
  }
  if (theme === "dark") {
    // The forest block on a forest tile needs light behind it; a tab icon needs more of it.
    const small = size < 96;
    const pad = Math.round(size * 0.12);
    const halo = await silhouette(m.data, {
      color: small ? "#e7bd6e" : GOLD,
      opacity: small ? 0.5 : 0.2,
      sigma: Math.max(0.8, size * (small ? 0.045 : 0.05)),
      pad,
    });
    layers.push({ input: halo.data, left: left - pad, top: top - pad });
  }
  layers.push({ input: m.data, left, top });
  const placed = await Promise.all(layers.map((l) => place(size, l.input, l.left, l.top)));
  let img = sharp(tileSvg(theme, size, { radius })).composite(placed.map((input) => ({ input })));
  if (theme === "light" && size >= 128) {
    const base = await img.png().toBuffer();
    img = sharp(base).composite([{ input: await grain(size, 0.035) }]);
  }
  let out = await img.png().toBuffer();
  if (radius > 0) out = await clip(out, size, radius);
  return sharp(out).png(PNG).toBuffer();
}

/** `input` drawn at (left, top) on a transparent size x size canvas, cropped to it. */
async function place(size, input, left, top) {
  const meta = await sharp(input).metadata();
  const p = Math.max(meta.width, meta.height);
  const canvas = await sharp({
    create: { width: size + 2 * p, height: size + 2 * p, channels: 4, background: "#0000" },
  })
    .composite([{ input, left: left + p, top: top + p }])
    .png()
    .toBuffer();
  return sharp(canvas).extract({ left: p, top: p, width: size, height: size }).png().toBuffer();
}

/** Rounds a square image's corners (transparent outside). */
async function clip(buf, size, radius) {
  const r = radius * size;
  const maskSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
  );
  return sharp(buf)
    .composite([{ input: maskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();
}


/**
 * The network badge: a gold disc on a ring of the tile colour, carrying three forest nodes linked
 * into a route (a small packet path), so the app reads as "Darb, for networking" at a glance.
 */
function netBadgeSvg(theme, size, { at, r }) {
  const cx = size * at;
  const R = r * size;
  const ring = theme === "dark" ? TILES.dark.bottom : TILES.light.top;
  const k = R / 10; // 20 x 20 grid around the centre
  const n = Math.max(1.2, k * 1.9); // node radius
  const sw = Math.max(1.2, k * 1.35);
  const p1 = [cx - 5.2 * k, cx + 3.6 * k];
  const p2 = [cx, cx - 4.4 * k];
  const p3 = [cx + 5.2 * k, cx + 3.6 * k];
  const small = size < 64;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <circle cx="${cx}" cy="${cx}" r="${R * 1.22}" fill="${ring}"/>
  <circle cx="${cx}" cy="${cx}" r="${R}" fill="${GOLD}"/>
  <path d="M${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}L${p3[0]} ${p3[1]}${small ? "" : `M${p1[0]} ${p1[1]}L${p3[0]} ${p3[1]}`}" fill="none" stroke="${FOREST}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${small ? "" : 'stroke-opacity="0.9"'}/>
  <circle cx="${p1[0]}" cy="${p1[1]}" r="${n}" fill="${FOREST}"/>
  <circle cx="${p2[0]}" cy="${p2[1]}" r="${n}" fill="${FOREST}"/>
  <circle cx="${p3[0]}" cy="${p3[1]}" r="${n}" fill="${FOREST}"/>
</svg>`);
}

async function netTile(theme, size, tile, badge) {
  const base = await markTile(theme, size, tile);
  return sharp(base).composite([{ input: netBadgeSvg(theme, size, badge) }]).png(PNG).toBuffer();
}

const files = {};
for (const theme of ["dark", "light"]) {
  const corner = { at: 0.74, r: 0.15 };
  files[`favicon-${theme}-32.png`] = await netTile(theme, 32, { fill: 0.82, radius: 0.22, lift: 0 }, { at: 0.71, r: 0.24 });
  files[`apple-touch-icon-${theme}.png`] = await netTile(theme, 180, { fill: 0.62 }, corner);
  files[`icon-${theme}-192.png`] = await netTile(theme, 192, { fill: 0.64, radius: 0.22 }, corner);
  files[`icon-${theme}-512.png`] = await netTile(theme, 512, { fill: 0.64, radius: 0.22 }, corner);
  // maskable: the launcher may crop to the centre circle, so the badge moves inward
  files[`maskable-${theme}-512.png`] = await netTile(theme, 512, { fill: 0.58 }, { at: 0.68, r: 0.12 });
}
// the plain Darb mark on its tile (for the footer signature)
files["darb-tile-dark-96.png"] = await markTile("dark", 96, { fill: 0.7, radius: 0.22 });

mkdirSync(OUT, { recursive: true });
for (const [name, buf] of Object.entries(files)) writeFileSync(join(OUT, name), buf);
console.log(`wrote ${Object.keys(files).length} icons to public/icons`);
