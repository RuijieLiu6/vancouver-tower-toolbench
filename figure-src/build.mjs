/**
 * Downtown Vancouver: a site model on a baseboard. Seven of the city's towers
 * stand among low context blocks, each built from its real form at 0.42 units
 * per metre and painted in its own blue. Hover a tower and it comes apart into
 * the pieces it is really made of, lifted and staggered; the site in the middle
 * holds a massing stub that grows into the next tower when you hover it.
 *
 * node build.mjs            writes downtown.html (light) and downtown-dark.html
 */
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "file:///C:/Users/sinnie/.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "file:///C:/Users/sinnie/.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 660, HEIGHT = 470;
const M = 0.42;                       // model units per metre
const N = 7, CELL = 24, EXT = N * CELL;
/** Footprints and heights from OpenStreetMap (osm/towers_grid.json): metres, centred on each tower, turned to the street grid. */
const OSM = JSON.parse(readFileSync(join(HERE, "osm", "towers_grid.json"), "utf8"));
const BOARD = { x: -12, y: -12, w: EXT + 24, d: EXT + 24, r: 7 }, BOARD_H = 7, FOOT_H = 4;
const SPRING = { stagger: 0.035, stiffness: 64, damping: 14.2 };
const LIFT = 26;                      // how far a hovered tower lifts off the board
const cc = (i) => i * CELL + CELL / 2;
const SITE = [3, 3];

/* ---------- blues: one token set per tower, light and dark ---------- */
const hex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mixc = (c, t, to) => c.map((v, i) => v + (to[i] - v) * t);
const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** A token set for a solid painted in `base`: four shades from dark to light, a lighter top, and lines in the same hue. */
function tokens(name, base, dark) {
  const c = parse(base), W = [255, 255, 255], B = [0, 0, 0];
  const light = {
    paper: hex(...c), face: hex(...mixc(c, 0.18, W)), top: hex(...mixc(c, 0.3, W)),
    s0: hex(...mixc(c, 0.3, B)), s1: hex(...mixc(c, 0.14, B)), s2: hex(...c), s3: hex(...mixc(c, 0.12, W)),
    litTop: hex(...mixc(c, 0.55, W)), litShade: hex(...mixc(c, 0.25, W)),
    hi: hex(...mixc(c, 0.62, B)), mid: hex(...mixc(c, 0.4, B)), lo: hex(...mixc(c, 0.28, B)), faint: hex(...mixc(c, 0.16, B)),
  };
  const d = parse(dark);
  const dk = {
    paper: hex(...d), face: hex(...mixc(d, 0.12, W)), top: hex(...mixc(d, 0.2, W)),
    s0: hex(...mixc(d, 0.35, B)), s1: hex(...mixc(d, 0.18, B)), s2: hex(...d), s3: hex(...mixc(d, 0.1, W)),
    litTop: hex(...mixc(d, 0.4, W)), litShade: hex(...mixc(d, 0.15, W)),
    hi: hex(...mixc(d, 0.55, W)), mid: hex(...mixc(d, 0.35, W)), lo: hex(...mixc(d, 0.22, W)), faint: hex(...mixc(d, 0.12, W)),
  };
  const css = (t) => `--anatomy-paper:${t.paper};--anatomy-face:${t.face};--anatomy-top:${t.top};--anatomy-shade-0:${t.s0};--anatomy-shade-1:${t.s1};--anatomy-shade-2:${t.s2};--anatomy-shade-3:${t.s3};--anatomy-lit-top:${t.litTop};--anatomy-lit-shade:${t.litShade};--anatomy-hi:${t.hi};--anatomy-mid:${t.mid};--anatomy-lo:${t.lo};--anatomy-faint:${t.faint}`;
  return `.iso .c-${name}{${css(light)}}.iso[data-theme="dark"] .c-${name}{${css(dk)}}`;
}
const BLUES = {
  shangri: ["#1f5f8b", "#143f5e"], paradox: ["#8fb6d6", "#3a6686"], butterfly: ["#bcd3e6", "#4d728f"], burrard: ["#5e8fbd", "#2b5377"],
  stack: ["#3b6f9f", "#1e4a6e"], georgia: ["#7aa6cc", "#345e82"], vhouse: ["#a3bed4", "#45657f"], onewall: ["#1d3b63", "#122a47"],
  proposal: ["#38a3e0", "#1f7fb5"], context: ["#e2e6ea", "#2d3238"],
};
const COLOR_CSS = Object.entries(BLUES).map(([n, [l, d]]) => tokens(n, l, d)).join("\n");

/* ---------- camera ---------- */
const TALL = cc(SITE[0]);
const P = k.fitProjection(
  [...k.boxCorners(BOARD, -BOARD_H - FOOT_H, 0), [TALL, TALL, 118], [cc(6), cc(1), 201 * M + LIFT + 4], [cc(0), cc(5), 70]],
  WIDTH, HEIGHT, { pad: 26, azimuth: 42, elevation: 30 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const plan = (cx, cy, w, d, r = 1.2) => ({ x: cx - w / 2, y: cy - d / 2, w, d, r });
const seams = (pl, z0, z1, every, steps = 3) => { let out = ""; for (let z = z0 + every; z < z1 - 1; z += every) out += L(k.sideSeam(pl, z, P, steps), { tone: "faint" }); return out; };
const ringSeams = (ring, z0, z1, every) => { let out = ""; for (let z = z0 + every; z < z1 - 1; z += every) out += L(k.ringSeam(ring, z, P), { tone: "faint" }); return out; };
const slab = (pl, z, h, style = {}, inner = "") => S(k.slabOf(pl, z, h, P, 3, style.bevel ?? 0.5), { tone: "hi", crease: "lo", ...style, inner });
const ellipse = (cx, cy, a, b, n = 40) => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [cx + a * Math.cos(t), cy + b * Math.sin(t)]; });
const chamfered = (pts, f = 0.22) => pts.flatMap((p, i) => { const q = pts[(i + 1) % pts.length], o = pts[(i - 1 + pts.length) % pts.length]; return [[p[0] + (o[0] - p[0]) * f, p[1] + (o[1] - p[1]) * f], [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]]; });

/* ---------- the towers: each built from its real form; the whole tower lifts as one mass when hovered ---------- */

const TOWERS = [
  { id: "shangri", cell: [6, 1], name: "Living Shangri-La", m: 200.9, year: 2010, note: "the city's tallest: a slender glass tower, stepped above the hotel floors and again below a curved crown" },
  { id: "paradox", cell: [4, 1], name: "Paradox Hotel Vancouver", m: 188, year: 2016, note: "a tower that twists 45 degrees as it rises, its facade a diamond lattice" },
  { id: "butterfly", cell: [1, 1], name: "The Butterfly", m: 178.6, year: 2024, note: "three rounded lobes in plan, every floor a scalloped balcony band" },
  { id: "burrard", cell: [0, 3], name: "One Burrard Place", m: 167.6, year: 2021, note: "a softly rounded glass tower on a low podium" },
  { id: "stack", cell: [2, 6], name: "The Stack", m: 162.3, year: 2023, note: "four boxes stacked and shifted off one another" },
  { id: "georgia", cell: [3, 5], name: "Private Residences at Hotel Georgia", m: 158.5, year: 2012, note: "a slender glass tower rising beside the 1927 hotel" },
  { id: "vhouse", cell: [0, 5], name: "Vancouver House", m: 150.3, year: 2019, note: "BIG: a triangle at the base that widens into a cantilevered rectangle at the top" },
  { id: "onewall", cell: [6, 3], name: "One Wall Centre", m: 149.8, year: 2001, note: "a thin ellipse in plan, 7 to 1, in blue reflective glass under a pointed cap" },
];
const rot = (pts, cx, cy, deg) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), si = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * si, cy + (x - cx) * si + (y - cy) * c]); };
/** Three lobes in plan: the outline of three overlapping circles, R round, d from the centre. */
const clover = (cx, cy, R, d, n = 60) => Array.from({ length: n }, (_, i) => {
  const t = (i / n) * Math.PI * 2;
  let best = 0;
  for (const ph of [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3]) {
    const s2 = d * d * Math.sin(t - ph) ** 2; if (s2 > R * R) continue;
    best = Math.max(best, d * Math.cos(t - ph) + Math.sqrt(R * R - s2));
  }
  return [cx + best * Math.cos(t), cy + best * Math.sin(t)];
});

/** The vertex of a ring nearest the viewer. */
const nearest = (ring) => ring.reduce((best, q, i) => (q[0] + q[1] > ring[best][0] + ring[best][1] ? i : best), 0);
/** A ring with its near corner cut off by a share `cut` of its two edges: 1 is a full triangle, 0 the whole ring. */
function cutCorner(ring, cut) {
  if (cut <= 0.01) return ring;
  const i = nearest(ring), n = ring.length, a = ring[(i - 1 + n) % n], b = ring[(i + 1) % n], q = ring[i];
  const f = Math.min(0.98, cut);
  return [...ring.slice(0, i), [q[0] + (a[0] - q[0]) * f, q[1] + (a[1] - q[1]) * f], [q[0] + (b[0] - q[0]) * f, q[1] + (b[1] - q[1]) * f], ...ring.slice(i + 1)];
}
function pieces(t) {
  const [cx, cy] = [cc(t.cell[0]), cc(t.cell[1])];
  const out = [];
  const add = (svg, cls = t.id) => out.push({ cls, svg });
  const ringOf = (part) => part.pts.map(([x, y]) => [cx + x * M, cy + y * M]);
  const solidOf = (ring, z0, z1, every = 4.2) => S(k.extrude(ring, z0, z1 - z0, P, { convex: false, bevel: 0.4 }), { tone: "hi", crease: "lo", inner: ringSeams(ring, z0, z1, every) });
  const parts = OSM[t.id].parts;
  switch (t.id) {
    case "stack": {
      // OSM has the Stack as one rectangle, 36 storeys: its four boxes are that plan, shifted off one another
      const ring = ringOf(parts[0]), h = parts[0].z1 * M / 4, shifts = [[-1.5, 0.5], [1.5, -1], [-1, 1.5], [2, 0]];
      shifts.forEach(([dx, dy], i) => { const r = ring.map(([x, y]) => [x + dx, y + dy]); add(solidOf(r, i * h, (i + 1) * h) + L(k.ringSeam(r, (i + 1) * h - 0.01, P), { tone: "faint" })); });
      break;
    }
    case "vhouse": {
      // OSM has the 157 m top block; the stem below it is that plan with its near corner cut away, a triangle at the ground
      const ring = ringOf(parts[parts.length - 1]), n = 10, h = parts[parts.length - 1].z1 * M / n;
      for (let i = 0; i < n; i++) add(solidOf(cutCorner(ring, 1 - i / (n - 1)), i * h, (i + 1) * h, 3.6));
      break;
    }
    default:
      for (const part of parts) add(solidOf(ringOf(part), part.z0 * M, part.z1 * M, t.id === "paradox" ? 3.1 : 4.2));
  }
  return out;
}

/* ---------- our building: a ghost podium, and one continuous tower that extrudes up when hovered ---------- */
const POD_H = 6, STUB_H = 6, TOWER_H = 89;
const SITE_PLAN = () => plan(cc(SITE[0]) - 1, cc(SITE[1]), 14, 14, 1.4);
function proposal() {
  const [cx, cy] = [cc(SITE[0]), cc(SITE[1])];
  const pod = plan(cx - 1, cy, 17, 19, 1.6);
  const fixed = S(k.slabOf(pod, 0, POD_H, P, 3, 0), { tone: "hi", crease: "lo" }) + L(k.planOutline(k.insetPlan(pod, 2), POD_H, P, 3), { tone: "lo" });
  // the tower at rest, as its own solid whose paths the page rewrites as it grows
  const q = k.slabOf(SITE_PLAN(), POD_H, STUB_H, P, 3, 0);
  const tower = `<g class="iso-solid" data-prop-tower>` +
    `<path class="iso-fill" data-pp="fill" d="${q.fill}"/>` +
    q.shades.map((d, i) => `<path class="iso-shade" data-shade="${i}" data-pp="s${i}" d="${d || ""}"/>`).join("") +
    `<path class="iso-top" data-pp="top" d="${q.top}"/>` +
    `<path class="iso-line iso-crease" data-tone="lo" data-pp="crease" d="${q.crease || ""}"/>` +
    `<path class="iso-line iso-edge" data-tone="hi" data-pp="outline" d="${q.outline}"/></g>`;
  const metres = (POD_H + TOWER_H) / M;
  return { fixed, tower, metres: Math.round(metres) };
}

/* ---------- context blocks ---------- */
const ctxH = (i, j) => 4 + ((i * 7 + j * 5 + (i * j) % 4) % 6) * 1.7;
function context(i, j) {
  const [cx, cy] = [cc(i), cc(j)];
  const w = 13 + ((i * 3 + j * 5) % 4) * 1.4, d = 13 + ((i * 5 + j * 3) % 4) * 1.4, h = ctxH(i, j);
  const pl = plan(cx, cy, w, d, 1.2);
  let out = S(k.slabOf(pl, 0, h, P, 3, 0.3), { tone: "mid", crease: "faint" }) + L(k.planOutline(k.insetPlan(pl, 1.6), h, P, 3), { tone: "faint" });
  if ((i + j) % 3 === 1) out += S(k.slabOf(plan(cx + 2, cy - 2, 4, 3, 0.5), h, 1.6, P, 2), { tone: "mid", crease: "none" });
  return out;
}

/* ---------- the board ---------- */
function board() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BOARD, -BOARD_H - FOOT_H, BOARD_H, P)}"/>`];
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of byDepth(k.corners(BOARD, 16))) out.push(S(k.cylinder(x, y, 5, -BOARD_H - FOOT_H, FOOT_H, P, 24), { tone: "lo" }));
  out.push(S(k.slabOf(BOARD, -BOARD_H, BOARD_H, P, 8, 1.2), { tone: "lo", crease: "faint" }));
  out.push(L(k.planOutline(k.insetPlan(BOARD, 5), 0, P, 8), { tone: "faint" }));
  const screws = k.corners(BOARD, 7);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, 0, P, 14)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.45 }));
  // a scale strip along the near edge: one tick per 10 m, a major every 50
  const strip = { x: 0, y: BOARD.y + BOARD.d - 9, w: EXT, d: 4, r: 0.8 };
  out.push(S(k.slabOf(strip, 0, 0.5, P, 2), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 1, strip.x + strip.w - 1, 10 * M, 5, strip.y + 0.6, 0.5, [1.2, 2.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 0.6, strip.y + 2, 0.5]), at([strip.x + strip.w - 0.6, strip.y + 2, 0.5])], { size: 0.4 }));
  // the street grid, scored into the board
  for (let i = 1; i < N; i++) {
    out.push(L(k.lineOnTop([i * CELL, 0], [i * CELL, EXT], 0, P), { tone: "faint" }));
    out.push(L(k.lineOnTop([0, i * CELL], [EXT, i * CELL], 0, P), { tone: "faint" }));
  }
  out.push(L(k.planOutline({ x: 0, y: 0, w: EXT, d: EXT, r: 0.5 }, 0, P, 2), { tone: "faint" }));
  return out.join("");
}

/* ---------- assemble: back to front by cell ---------- */
const prop = proposal();
const byCell = new Map(TOWERS.map((t) => [t.cell.join(","), t]));
const cells = [];
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push([i, j]);
cells.sort((a, b) => k.depthOf([cc(a[0]), cc(a[1]), 0], P) - k.depthOf([cc(b[0]), cc(b[1]), 0], P));
const body = [board()];
const INFO = {};
for (const [i, j] of cells) {
  const key = i + "," + j;
  if (i === SITE[0] && j === SITE[1]) {
    body.push(`<g class="tw ghost" data-tower="proposal">${prop.fixed}${prop.tower}</g>`);
    INFO.proposal = { name: "Our building", m: prop.metres, year: "proposed", note: "a ghost on the site in the middle; hovering it extrudes the tower up to " + prop.metres + " m" };
  } else if (byCell.has(key)) {
    const t = byCell.get(key);
    const ps = pieces(t).map((p, n) => `<g data-piece="${n}" data-lift="${LIFT}" class="c-${p.cls}">${p.svg}</g>`).join("");
    body.push(`<g class="tw c-${t.id}" data-tower="${t.id}" data-stagger="0">${ps}</g>`);
    INFO[t.id] = { name: t.name, m: t.m, year: t.year, note: t.note };
  } else body.push(`<g class="c-context">${context(i, j)}</g>`);
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A site model of downtown Vancouver: eight towers in shades of blue among low grey blocks on a baseboard. Hovering a tower lifts it off the board and names its height and year; the site in the middle holds a ghost tower that extrudes up.",
  body,
});

const EXTRA_CSS = `
${COLOR_CSS}
.tw{cursor:pointer}
.tw[data-on] .iso-edge{stroke:var(--anatomy-lit)}
.ghost{--ghost:#38a3e0;--ghost-line:#ffffff}
.ghost .iso-fill{fill:var(--ghost);fill-opacity:.42}
.ghost .iso-shade{fill:var(--ghost);fill-opacity:.22}
.ghost .iso-shade[data-shade="0"]{fill-opacity:.34}.ghost .iso-shade[data-shade="1"]{fill-opacity:.28}
.ghost .iso-top{fill:var(--ghost);fill-opacity:.12}
.ghost .iso-line{stroke:var(--ghost-line);stroke-width:.8px;stroke-opacity:.95}
.ghost .iso-crease,.ghost .iso-bevel{stroke-width:.55px;stroke-opacity:.6}
.ghost .iso-halo{display:none}
.ghost[data-on] .iso-line{stroke-width:1px;stroke-opacity:1}
.iso[data-theme="dark"] .ghost .iso-fill{fill-opacity:.26}.iso[data-theme="dark"] .ghost .iso-shade{fill-opacity:.14}
.iso[data-theme="dark"] .ghost .iso-shade[data-shade="0"]{fill-opacity:.2}.iso[data-theme="dark"] .ghost .iso-top{fill-opacity:.08}
.tw [data-piece]{transition:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
`;

const live = `
const P = ${JSON.stringify(P)};
const INFO = ${JSON.stringify(INFO)};
const ORDER = ${JSON.stringify([...TOWERS.map((t) => t.id).slice(0, 4), "proposal", ...TOWERS.map((t) => t.id).slice(4)])};
const SPRING = ${JSON.stringify(SPRING)};
const SITE_PLAN = ${JSON.stringify(SITE_PLAN())}, POD_H = ${POD_H}, STUB_H = ${STUB_H}, TOWER_H = ${TOWER_H}, FLOOR_M = 3.2;
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const propEls = {}; for (const el of svg.querySelectorAll("[data-prop-tower] [data-pp]")) propEls[el.dataset.pp] = el;
const BLOCKS = 16, BLOCK_U = (TOWER_H - STUB_H) / BLOCKS;   // the tower stacks up in sixteen blocks of about four floors (12 m) rather than extruding
const RISE_S = 1.7, SINK_S = 0.8;                            // seconds to stack the whole tower, and to take it down
const grow = { x: 0, v: 0, target: 0, drawn: -1 };
const blocksUp = () => Math.min(BLOCKS, Math.floor(grow.x * BLOCKS + 1e-6));
function drawTower() {
  const n = blocksUp(), h = STUB_H + n * BLOCK_U;
  if (h === grow.drawn) return;
  grow.drawn = h;
  const q = slabOf(SITE_PLAN, POD_H, h, P, 3, 0);
  propEls.fill.setAttribute("d", q.fill); propEls.top.setAttribute("d", q.top); propEls.outline.setAttribute("d", q.outline);
  const lines = [];                                          // a line where each block meets the next, on the faces you can see
  for (let k = 0; k < n; k++) lines.push(slabOf(SITE_PLAN, POD_H + STUB_H + k * BLOCK_U, 0, P, 3, 0).crease || "");
  propEls.crease.setAttribute("d", lines.join(""));
  q.shades.forEach((d, i) => propEls["s" + i].setAttribute("d", d || ""));
}
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const towers = {};
for (const g of svg.querySelectorAll("[data-tower]")) {
  towers[g.dataset.tower] = { g, stagger: +g.dataset.stagger, floors: +(g.dataset.floors || 0), pieces: [...g.querySelectorAll("[data-piece]")].map((el) => ({ el, lift: +el.dataset.lift, x: 0, v: 0, target: 0, at: 0, placed: 0 })) };
}
let selected = null, clock = 0, last = 0, frame = 0, visible = false, touring = !still.matches, idleTimer = 0, tourAt = 0, tourIndex = -1;
let lastSaid;
function say() {
  const t = selected ? INFO[selected] : null;
  let text = "downtown · hover a tower";
  if (t && selected === "proposal") {
    const metres = Math.round((POD_H + STUB_H + blocksUp() * BLOCK_U) / ${M});
    text = blocksUp() >= BLOCKS ? t.name + " · " + t.m + " m · topped out" : "Our building · " + metres + " m of " + t.m + " · rising";
  } else if (t) text = t.name + " · " + t.m + " m · " + t.year;
  if (readout.textContent !== text) readout.textContent = text;
  if (selected !== lastSaid) { lastSaid = selected; stage.setAttribute("aria-valuetext", t ? t.name + ", " + t.m + " metres, " + t.year + ". " + t.note : "Nothing selected"); }
}
function select(id) {
  if (id === selected) return;
  const prev = selected; selected = id;
  for (const [key, t] of Object.entries(towers)) {
    const on = key === id;
    t.g.toggleAttribute("data-on", on);
    const ps = on ? t.pieces : [...t.pieces].reverse();
    ps.forEach((p, n) => { const want = on ? 1 : 0; if (p.target !== want) { p.target = want; p.at = clock + n * t.stagger; } });
  }
  grow.target = id === "proposal" ? 1 : 0;
  say();
  run();
}
function place(p) {
  const z = p.lift * p.x;
  if (Math.abs(z - p.placed) < 0.01) return;
  p.placed = z;
  if (z < 0.01) p.el.removeAttribute("transform"); else p.el.setAttribute("transform", translateAlong(P, [0, 0, z]));
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now; clock += dt;
  const calm = still.matches;
  if (touring && clock >= tourAt) { tourIndex = (tourIndex + 1) % (ORDER.length + 1); tourAt = clock + (tourIndex === ORDER.length ? 1.6 : 2.6); select(tourIndex === ORDER.length ? null : ORDER[tourIndex]); }
  let moving = touring;
  for (const t of Object.values(towers)) for (const p of t.pieces) {
    const goal = clock >= p.at ? p.target : p.x;
    if (calm) { p.x = p.target; p.v = 0; }
    else for (let s = 0; s < 4; s++) { p.v += ((goal - p.x) * SPRING.stiffness - p.v * SPRING.damping) * dt / 4; p.x += p.v * dt / 4; }
    if (Math.abs(p.target - p.x) < 5e-4 && Math.abs(p.v) < 5e-4 && clock >= p.at) { p.x = p.target; p.v = 0; } else moving = true;
    place(p);
  }
  // the site's tower stacks up block by block at a steady pace, and comes down faster; no spring, so every block lands as a step
  if (calm) grow.x = grow.target;
  else { const d = grow.target - grow.x, rate = d > 0 ? 1 / RISE_S : 1 / SINK_S; grow.x += Math.sign(d) * Math.min(Math.abs(d), rate * dt); }
  if (grow.x !== grow.target) moving = true;
  drawTower();
  if (selected === "proposal") say();
  frame = visible && moving ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (id) => { touring = false; clearTimeout(idleTimer); select(id); idleTimer = setTimeout(() => { touring = !still.matches; tourAt = clock + 0.4; run(); }, 3600); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (e) => { const g = e.target.closest && e.target.closest("[data-tower]"); steer(g ? g.dataset.tower : null); });
stage.addEventListener("pointerleave", () => steer(null));
stage.addEventListener("keydown", (e) => {
  const i = ORDER.indexOf(selected);
  let to;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") to = ORDER[(i + 1) % ORDER.length];
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = ORDER[(i - 1 + ORDER.length) % ORDER.length];
  else if (e.key === "Home") to = ORDER[0]; else if (e.key === "End") to = ORDER[ORDER.length - 1];
  else if (e.key === "Escape") to = null; else return;
  e.preventDefault(); steer(to);
});
say();
`;

for (const theme of ["light", "dark"]) {
  const plate = k.plateHtml({
    fig: "Fig 1",
    title: "Downtown Vancouver",
    hint: "Hover a tower to lift it · arrows step through them",
    readout: "downtown · hover a tower",
    keys: [
      { mark: "lit", label: "The tower under the pointer, lifted off the board, with its height and year" },
      { mark: "dotted", label: "Our building, a white-line ghost on the site in the middle: hover it and the tower extrudes up" },
      { mark: "flat", label: "Context blocks and the street grid, 1 cell = 57 m" },
    ],
    caption: `A site model of downtown Vancouver at 0.42 units per metre, with the eight tallest towers: Living Shangri-La 200.9 m (2010), Paradox Hotel 188 m (2016), The Butterfly 178.6 m (2024), One Burrard Place 167.6 m (2021), The Stack 162.3 m (2023), the Private Residences at Hotel Georgia 158.5 m (2012), Vancouver House 150.3 m (2019) and One Wall Centre 149.8 m (2001). Each mass is drawn from its OpenStreetMap footprint and height tags, turned to the downtown street grid: the Shangri-La's podium, shaft and crown, the Paradox's twelve turning slices, the Butterfly's lobed outline, the Hotel Georgia tower above its podium, One Wall's ellipse. The Stack is one rectangle in OSM, drawn as four shifted boxes; Vancouver House is its mapped top block, cut to a triangle at the ground. Podiums wider than a block are left out. Our building, a ghost on the site in the middle, extrudes up to ${prop.metres} m when you hover it. Map data © OpenStreetMap contributors, ODbL.`,
    body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Downtown Vancouver site model: arrow keys step through the towers, Escape puts them back">${svg}</div>`,
  });
  const html = k.pageHtml({ title: "Downtown Vancouver", theme, body: plate, script: kitScript() + live }).replace("</style>", EXTRA_CSS + "</style>");
  const file = theme === "light" ? "downtown.html" : "downtown-dark.html";
  writeFileSync(join(HERE, file), html);
  console.log("wrote", file);
}
