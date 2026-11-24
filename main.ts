// WORLD NEWS — Tuesday, 24 November 2026
// A newspaper front page drawn from scratch: own 5x7 bitmap font,
// own rasteriser, own PNG encoder (node:zlib). No assets, no network.
import * as fs from "node:fs";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;
const img = new Uint8Array(W * H * 3);
img.fill(255);

// ---------- raster ----------

function setPx(x: number, y: number, r: number, g: number, b: number): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  img[i] = r;
  img[i + 1] = g;
  img[i + 2] = b;
}

function rect(x: number, y: number, w: number, h: number, r: number, g: number, b: number): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPx(xx, yy, r, g, b);
  }
}

function line(x0: number, y0: number, x1: number, y1: number, r: number, g: number, b: number): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (;;) {
    setPx(x, y, r, g, b);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function circle(cx: number, cy: number, rad: number, r: number, g: number, b: number): void {
  for (let dy = -rad; dy <= rad; dy++) {
    const dx = Math.floor(Math.sqrt(rad * rad - dy * dy));
    for (let xx = cx - dx; xx <= cx + dx; xx++) setPx(xx, cy + dy, r, g, b);
  }
}

// Scanline fill of a simple polygon given as [x, y] vertices.
function poly(pts: Array<[number, number]>, r: number, g: number, b: number): void {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of pts) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) setPx(x, y, r, g, b);
    }
  }
}

// ---------- 5x7 bitmap font (own design) ----------

const FONT: Record<string, string[]> = {
  "A": [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  "B": ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
  "C": [" ####", "#    ", "#    ", "#    ", "#    ", "#    ", " ####"],
  "D": ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
  "E": ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
  "F": ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#    "],
  "G": [" ####", "#    ", "#    ", "# ###", "#   #", "#   #", " ### "],
  "H": ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  "I": ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "#####"],
  "J": ["  ###", "    #", "    #", "    #", "    #", "#   #", " ### "],
  "K": ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"],
  "L": ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
  "M": ["#   #", "## ##", "# # #", "# # #", "#   #", "#   #", "#   #"],
  "N": ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
  "O": [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  "P": ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
  "Q": [" ### ", "#   #", "#   #", "#   #", "# # #", "#  # ", " ## #"],
  "R": ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
  "S": [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
  "T": ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
  "U": ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  "V": ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
  "W": ["#   #", "#   #", "#   #", "# # #", "# # #", "## ##", "#   #"],
  "X": ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
  "Y": ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
  "Z": ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
  "0": [" ### ", "#  ##", "# # #", "##  #", "#   #", "#   #", " ### "],
  "1": ["  #  ", " ##  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
  "2": [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"],
  "3": ["#### ", "    #", "    #", " ### ", "    #", "    #", "#### "],
  "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "],
  "5": ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
  "6": [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "],
  "7": ["#####", "    #", "   # ", "  #  ", "  #  ", "  #  ", "  #  "],
  "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "],
  "9": [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "],
  " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
  ".": ["     ", "     ", "     ", "     ", "     ", " ##  ", " ##  "],
  ",": ["     ", "     ", "     ", "     ", "     ", " ##  ", " ##  ", "#    "],
  ":": ["     ", " ##  ", " ##  ", "     ", " ##  ", " ##  ", "     "],
  ";": ["     ", " ##  ", " ##  ", "     ", " ##  ", " ##  ", "#    "],
  "'": ["  #  ", "  #  ", "  #  ", "     ", "     ", "     ", "     "],
  "!": ["  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "     ", "  #  "],
  "?": [" ### ", "#   #", "    #", "   # ", "  #  ", "     ", "  #  "],
  "-": ["     ", "     ", "     ", " ### ", "     ", "     ", "     "],
  "(": ["   ##", "  #  ", " #   ", " #   ", " #   ", "  #  ", "   ##"],
  ")": ["##   ", "  #  ", "   # ", "   # ", "   # ", "  #  ", "##   "],
  "%": ["##  #", "## # ", "   # ", "  #  ", " #   ", "# ## ", "#  ##"],
  "+": ["     ", "  #  ", "  #  ", " ### ", "  #  ", "  #  ", "     "],
  "/": ["    #", "    #", "   # ", "  #  ", " #   ", "#    ", "#    "],
  "&": [" ### ", "#   #", "#   #", " # # ", "#  # ", "# #  ", " ## #"],
  "$": ["  #  ", " ####", "# #  ", " ### ", "  # #", "#### ", "  #  "],
  "#": [" # # ", " # # ", "#####", " # # ", "#####", " # # ", " # # "],
  "*": ["     ", " # # ", "  #  ", "#####", "  #  ", " # # ", "     "],
  '"': [" # # ", " # # ", " # # ", "     ", "     ", "     ", "     "],
  "=": ["     ", "     ", "#####", "     ", "#####", "     ", "     "],
  "_": ["     ", "     ", "     ", "     ", "     ", "     ", "#####"],
};

function drawChar(x: number, y: number, ch: string, s: number, r: number, g: number, b: number): void {
  const glyph = FONT[ch] || FONT[" "];
  for (let row = 0; row < 7; row++) {
    const bits = glyph[row];
    for (let col = 0; col < 5; col++) {
      if (bits[col] === "#") rect(x + col * s, y + row * s, s, s, r, g, b);
    }
  }
}

function textW(s: number, str: string): number {
  return str.length * 6 * s - s;
}

function drawText(x: number, y: number, str: string, s: number, r: number, g: number, b: number): void {
  const up = str.toUpperCase();
  let cx = x;
  for (const ch of up) {
    drawChar(cx, y, ch, s, r, g, b);
    cx += 6 * s;
  }
}

function wrap(str: string, maxW: number, s: number): string[] {
  const words = str.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (textW(s, t) <= maxW) {
      cur = t;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function para(x: number, y: number, str: string, maxW: number, s: number, lh: number, r: number, g: number, b: number): number {
  const lines = wrap(str, maxW, s);
  lines.forEach((ln, i) => drawText(x, y + i * lh, ln, s, r, g, b));
  return y + lines.length * lh;
}

// ---------- palette ----------

const INK: [number, number, number] = [25, 25, 25];
const RED: [number, number, number] = [176, 32, 32];
const BLUE: [number, number, number] = [24, 48, 96];
const SKY: [number, number, number] = [198, 218, 236];
const SEA: [number, number, number] = [38, 84, 124];
const SHIP: [number, number, number] = [42, 42, 50];
const FIRE: [number, number, number] = [232, 128, 32];
const FIRE2: [number, number, number] = [240, 200, 40];
const WHITE: [number, number, number] = [255, 255, 255];

// ---------- layout ----------

function story(x: number, y: number, w: number, kicker: string, headline: string, body: string): number {
  drawText(x, y, kicker, 2, ...RED);
  const headLines = wrap(headline, w, 3);
  headLines.forEach((ln, i) => drawText(x, y + 20 + i * 24, ln, 3, ...INK));
  const bodyY = y + 20 + headLines.length * 24 + 6;
  return para(x, bodyY, body, w, 2, 19, ...INK);
}

function draw(): void {
  // Masthead
  const mast = "WORLD NEWS";
  drawText((W - textW(10, mast)) / 2, 28, mast, 10, ...BLUE);
  rect(30, 110, 964, 4, ...INK);
  rect(30, 118, 964, 2, ...INK);
  const dateLine = "TUESDAY, 24 NOVEMBER 2026";
  drawText((W - textW(3, dateLine)) / 2, 132, dateLine, 3, ...INK);

  // Lead headline
  drawText(30, 168, "RUSSIAN WARSHIP SUNK", 5, ...INK);
  drawText(30, 210, "OFF LIBYA BY SEA DRONES", 5, ...INK);

  // Lead body, left column
  let y = 268;
  y = para(30, y, "Seven Ukrainian sea drones sank the Russian corvette Merkury off Benghazi, Libya, President Zelensky confirmed on Monday. The cargo ship MV Angara was also hit.", 600, 2, 19, ...INK);
  y += 12;
  para(30, y, "The UN mission in Libya warned the country 'must not become a battleground for foreign conflicts.' Germany's Friedrich Merz called on Russia to stop 'dangerous provocations' after missiles crossed into Poland.", 600, 2, 19, ...INK);

  // Lead illustration: sea strike off Benghazi
  const ix = 650;
  const iy = 268;
  rect(ix, iy, 344, 80, ...SKY);
  rect(ix, iy + 80, 344, 103, ...SEA);
  // waves
  line(ix + 8, iy + 108, ix + 120, iy + 104, ...WHITE);
  line(ix + 150, iy + 130, ix + 260, iy + 126, ...WHITE);
  line(ix + 20, iy + 152, ix + 140, iy + 148, ...WHITE);
  line(ix + 200, iy + 166, ix + 330, iy + 162, ...WHITE);
  // ship hull and deck
  poly([[ix + 30, iy + 132], [ix + 170, iy + 132], [ix + 150, iy + 162], [ix + 50, iy + 162]], ...SHIP);
  rect(ix + 50, iy + 118, 90, 14, ...SHIP);
  line(ix + 95, iy + 118, ix + 95, iy + 88, ...SHIP);
  rect(ix + 95, iy + 88, 16, 10, ...RED);
  // explosion
  circle(ix + 250, iy + 62, 26, ...FIRE2);
  circle(ix + 250, iy + 62, 16, ...FIRE);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    line(
      ix + 250 + Math.round(Math.cos(a) * 20),
      iy + 62 + Math.round(Math.sin(a) * 20),
      ix + 250 + Math.round(Math.cos(a) * 40),
      iy + 62 + Math.round(Math.sin(a) * 40),
      ...FIRE,
    );
  }
  // sea drones
  circle(ix + 55, iy + 32, 4, ...SHIP);
  circle(ix + 105, iy + 20, 4, ...SHIP);
  circle(ix + 155, iy + 38, 4, ...SHIP);
  line(ix + 30, iy + 40, ix + 51, iy + 33, ...SHIP);
  line(ix + 80, iy + 28, ix + 101, iy + 21, ...SHIP);
  line(ix + 130, iy + 46, ix + 151, iy + 39, ...SHIP);
  drawText(ix + (344 - textW(2, "SEA DRONES OFF BENGHAZI")) / 2, iy + 190, "SEA DRONES OFF BENGHAZI", 2, ...INK);

  // Divider
  rect(30, 490, 964, 3, ...INK);

  // Story grid
  story(30, 510, 462, "WASHINGTON", "TRUMP WARNS IRAN: 10 DAYS TO A DEAL",
    "Trump warned Iran of 'bad things' if it rejects a nuclear deal, giving Tehran 10 to 15 days. A second US carrier is moving to the region.");
  story(532, 510, 462, "CLIMATE", "COP31 ENDS WITH NO DEAL",
    "Climate talks in Antalya ended on Sunday with no deal. Saudi Arabia pushed carbon capture and blocked fossil-fuel phase-out language; the EU rejected the text.");
  story(30, 672, 462, "TECH", "HUANG BACK AS NVIDIA CEO",
    "Nvidia's board reinstated Jensen Huang as chief executive on Monday. Nvidia shares rose 31% and SK hynix US shares 20%.");
  story(532, 672, 462, "MARKETS", "ASIAN STOCKS SURGE",
    "The Nikkei rose 4% to above 58,650 on Tuesday. South Korea gained 6.7% and Taiwan 9.1%.");
  story(30, 818, 964, "HEALTH", "FIGHTING DISRUPTS EBOLA RESPONSE IN CONGO",
    "Heavy fighting in Ituri, DR Congo, is disrupting the Ebola response and trapping health teams, officials said.");

  // Footer
  rect(30, 948, 964, 2, ...INK);
  const foot = "WORLD NEWS — TUESDAY, 24 NOVEMBER 2026";
  drawText((W - textW(2, foot)) / 2, 960, foot, 2, ...INK);
}

// ---------- PNG encoder ----------

const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    for (let x = 0; x < W; x++) {
      const si = (y * W + x) * 3;
      const di = y * (1 + W * 3) + 1 + x * 3;
      raw[di] = img[si];
      raw[di + 1] = img[si + 1];
      raw[di + 2] = img[si + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- main ----------

draw();
const png = encodePNG();
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outDir + "/entry.png", png);
console.log("wrote " + outDir + "/entry.png (" + png.length + " bytes)");
