# Downtown Vancouver figure: handoff

*Version 1.0, 22 Oct 2026. For designers and developers changing the figure. Every value below is taken from `build.mjs`; when you change a value in code, change it here too.*

The figure is an interactive isometric site model of downtown Vancouver: eight real towers in shades of blue among low grey context blocks on a baseboard, and a ghost tower on the site in the middle. Hover a tower and it lifts off the board as one mass while the read-out gives its height and year. Hover the site and the ghost tower extrudes up to 226 m.

Live copy: https://claude.ai/artifact/3GbirjQSTaTxNQJnL91R4A (private until shared).

---

## 1. Files

| File | What it is |
|---|---|
| `build.mjs` | The whole figure: data, geometry, card and live script. Run `node build.mjs`; it writes both pages. |
| `downtown.html` | The light page (ships). |
| `downtown-dark.html` | The dark page. |
| `osm/towers_grid.json` | The tower footprints the build reads: metres, centred on each tower, turned to the street grid. |
| `osm/towers_osm.json` | The same before the turn, straight from the OSM ways. |
| `osm/ways.json`, `osm/map-*.osm` | The raw OpenStreetMap data fetched around each address. |
| `osm/osmmap.py`, `osm/osmmap2.py`, `osm/extract.py`, `osm/extract2.py`, `osm/extract3.py` | The data pipeline, in that order (section 4). |
| `shots/` | Screenshots from the checks (section 9). |

The build imports the Anatomy kit from `C:\Users\sinnie\.claude\skills\anatomy\kit\iso-kit.mjs` and inlines it into the page, so each HTML file is self-contained: no install, no server.

---

## 2. The model

| Thing | Value |
|---|---|
| Card | 660 × 470 viewBox, card padding from the kit |
| Scale | `M = 0.42` model units per metre, for heights and footprints alike |
| Grid | 7 × 7 cells, `CELL = 24` units (57 m); `EXT = 168` |
| Board | `{x: −12, y: −12, w: 192, d: 192, r: 7}`, 7 thick, on four feet 4 high, corner screws, a scored street grid and a scale strip (one tick per 10 m, a major every 50) |
| Camera | `fitProjection`, azimuth 42°, elevation 30°, pad 26, fitted to the board corners, the finished ghost tower (118 high) and the Shangri-La lifted |
| Site | cell `[3, 3]`, the middle |
| Context blocks | every cell that is not a tower or the site: 13–17 wide, 4–12.5 high from a fixed hash (`ctxH`), a roof inset line, and a rooftop box on every third |

**Cell layout** (column, row; `[0,0]` is the far corner, `[6,6]` the near one):

| Cell | Tower |
|---|---|
| `[1, 1]` | The Butterfly |
| `[4, 1]` | Paradox Hotel Vancouver |
| `[6, 1]` | Living Shangri-La |
| `[0, 3]` | One Burrard Place |
| `[6, 3]` | One Wall Centre |
| `[3, 3]` | Our building (the ghost) |
| `[3, 5]` | Private Residences at Hotel Georgia |
| `[0, 5]` | Vancouver House |
| `[2, 6]` | The Stack |

The cells in front of the site (`[4,4]`, `[5,5]`, `[6,6]` and their neighbours) are all low blocks, so the site is never hidden. Keep it that way when moving towers.

---

## 3. The towers

Heights and years are the read-out's words and come from the poster the figure was built against. Masses come from OpenStreetMap (section 4).

| id | Name | Height | Year | OSM parts used (way ids) | How the mass is drawn |
|---|---|---|---|---|---|
| `shangri` | Living Shangri-La | 200.9 m | 2010 | 360939770 (podium 0–50), 360939772 (shaft 0–189), 360939774 (189–201), 360939775 (crown 189–201) | each part extruded as mapped |
| `paradox` | Paradox Hotel Vancouver | 188 m | 2016 | 305776179 and eleven slices 362300477 … 362300482 (15 m each, `min_height` to `height`) | twelve slices, each turned as mapped: the twist |
| `butterfly` | The Butterfly | 178.6 m | 2024 | 1524215058 (lobed outline, 0–178.6), 1524215057 (0–178.6) | as mapped; the 6-storey base outline (653660958) is left out, it is 84 m wide |
| `burrard` | One Burrard Place | 167.6 m | 2021 | 1248977468 (0–167.64) | as mapped; the podium (1071649623) is left out, 66 m wide |
| `stack` | The Stack | 162.3 m | 2023 | 223089079 (one 60 × 35 m rectangle, 36 storeys) | that plan as four boxes of a quarter height each, shifted `[−1.5, 0.5] [1.5, −1] [−1, 1.5] [2, 0]` |
| `georgia` | Private Residences at Hotel Georgia | 158.5 m | 2012 | 964467734 (podium 0–48), 360781840 (tower 48–154) | as mapped |
| `vhouse` | Vancouver House | 150.3 m | 2019 | 1092241825 (top block, 0–157) | ten segments of that plan; the near corner is cut by a share `1 − i/9`, a triangle at the ground. The podium outline (742009401) is left out, 114 m long |
| `onewall` | One Wall Centre | 149.8 m | 2001 | 91998089 (ellipse, 0–150) | as mapped; the ellipse is diagonal to the street grid, which is true |

Rules that hold for every tower:
- All parts of a tower share one `data-lift` (`LIFT = 26`) and `data-stagger="0"`, so the whole mass lifts together.
- Floor seams (`ringSeams`) every 4.2 units, 3.1 on the Paradox, 3.6 on Vancouver House. They are the tower's `inner` lines, under the outline.
- Each tower is one `<g class="tw c-<id>" data-tower="<id>">`, its parts `<g data-piece="n" data-lift="26">`.
- Parts wider than `LIMIT = 62` m are dropped by `osm/extract3.py`; that is why three podiums are missing. Raise the limit or move to a larger `CELL` to bring them back.

---

## 4. Data pipeline (OpenStreetMap)

Overpass was at capacity, so the data comes from the OSM API directly. Re-run in this order from `osm/`:

1. `python -I osmmap.py` and `python -I osmmap2.py`: fetch `map?bbox=` around each address (about 130 × 200 m) into `map-*.osm`.
2. `python -I extract.py`: every closed way tagged `building` or `building:part`, with its tags and lat/lon, into `ways.json`. Prints what is near each tower.
3. `python -I extract2.py`: picks the way ids above, converts to metres (x east, y south) centred on the tower, reads `height`, `min_height`, `building:levels` (3.2 m per storey when only levels are tagged), writes `towers_osm.json`.
4. `python -I extract3.py`: turns every footprint by the street-grid angle, measured from the Stack's rectangle (44.7°), drops parts wider than `LIMIT`, recentres each tower on its parts, writes `towers_grid.json`.

Then `node build.mjs`. Use `python -I` because the OSM files are downloaded data.

Attribution is required by the licence and is in the caption: "Map data © OpenStreetMap contributors, ODbL." Keep it.

---

## 5. Colour

Each tower is one blue. A blue is a pair `[light, dark]` in `BLUES`; `tokens()` turns each into a full kit token set (`--anatomy-paper`, `-face`, `-top`, four shades, lit tones, and the line tones `hi/mid/lo/faint`) under the class `.c-<id>`, with a dark override under `.iso[data-theme="dark"] .c-<id>`. Shades are mixes of the base toward black (30 %, 14 %, 0) and white (12 %); the top is 30 % toward white.

| id | Light | Dark |
|---|---|---|
| `shangri` | `#1f5f8b` | `#143f5e` |
| `paradox` | `#8fb6d6` | `#3a6686` |
| `butterfly` | `#bcd3e6` | `#4d728f` |
| `burrard` | `#5e8fbd` | `#2b5377` |
| `stack` | `#3b6f9f` | `#1e4a6e` |
| `georgia` | `#7aa6cc` | `#345e82` |
| `vhouse` | `#a3bed4` | `#45657f` |
| `onewall` | `#1d3b63` | `#122a47` |
| `proposal` (ghost body) | `#38a3e0` | `#1f7fb5` |
| `context` | `#e2e6ea` | `#2d3238` |

**Selection:** a hovered tower keeps its colour. Only its edges change, to `--anatomy-lit` (white in dark, black in light), through `.tw[data-on] .iso-edge`.

**The ghost** (`.ghost`, the site): body `--ghost: #38a3e0` at fill-opacity .42 (fill), .22–.34 (sides), .12 (top); lines `--ghost-line: #ffffff` at .8 px, creases .55 px at 60 %; selected, lines go to 1 px at 100 %. In dark the fills drop to .26 / .14–.20 / .08. No halo.

---

## 6. Motion and interaction

| What | Value |
|---|---|
| Tower lift | spring per piece, stiffness 64, damping 14.2, four sub-steps per frame; target 1 apart, 0 home; `LIFT = 26` units straight up |
| Ghost stacking | no spring: `grow.x` runs to its target at a steady rate, `RISE_S = 1.7` s up and `SINK_S = 0.8` s down; the drawn height is quantised to `BLOCKS = 16` blocks of `BLOCK_U = (TOWER_H - STUB_H) / 16` units (about four floors), so the tower stacks up block by block from `STUB_H = 6` to `TOWER_H = 89` above the podium (`POD_H = 6`); the solid is rebuilt with the kit's `slabOf` at each step, with a crease line on the visible faces where each block meets the next |
| Hover | `pointermove` on the stage; the tower is `event.target.closest("[data-tower]")`; `pointerleave` deselects |
| Keys | ← → ↑ ↓ step through `ORDER` (butterfly order: shangri, paradox, butterfly, burrard, proposal, stack, georgia, vhouse, onewall), Home/End to the ends, Escape deselects |
| Idle tour | starts on load; selects the next item every 2.6 s, rests 1.6 s after the last; stops on any input and resumes 3.6 s after the last one |
| Reduced motion | everything jumps to its target, no tour |
| Offscreen | the loop stops (IntersectionObserver, 120 px margin) |

**Read-out** (`[data-readout]`, bottom right):
- rest: `downtown · hover a tower`
- a tower: `<name> · <height> m · <year>`
- the site rising: `Our building · <m> m of 226 · rising`; finished: `Our building · 226 m · topped out`

`aria-valuetext` on the stage carries the name, height, year and a one-line note; it is written when the selection changes, never per frame.

---

## 7. Card

| Corner | Text |
|---|---|
| Top left | `Fig 1` |
| Top right | `Downtown Vancouver` |
| Bottom left (hint) | `Hover a tower to lift it · arrows step through them` |
| Bottom right | the read-out |

Legend keys: `lit` the hovered tower; `dotted` our building, the ghost; `flat` context blocks and the street grid, 1 cell = 57 m. The caption lists the eight towers with heights and years, says how each mass is drawn, and carries the OSM attribution.

---

## 8. Changing things

- **Move a tower:** change its `cell` in `TOWERS`. Keep the cells in front of the site low.
- **Recolour:** edit its pair in `BLUES`. Both themes update.
- **Change a mass:** edit the way list in `osm/extract2.py`, re-run steps 3–4 of section 4, rebuild. To draw a tower by hand instead, add a `case` in `pieces()` as `stack` and `vhouse` do.
- **Change the ghost's height:** `TOWER_H` (units above the podium); the read-out's metres follow.
- **Change the lift:** `LIFT`; the camera fit includes it.
- **Add a tower:** add to `TOWERS`, `BLUES` and `osm/extract2.py`; `ORDER` is built from `TOWERS`.

---

## 9. Checks

From `downtown-figure/`, with `S` = `C:\Users\sinnie\.claude\skills\anatomy\scripts`:

```
node build.mjs
node S/capture.mjs downtown.html --out shots/rest.png --reduced
node S/capture.mjs downtown-dark.html --out shots/dark.png --reduced
node S/capture.mjs downtown.html --out shots/phone.png --width 390 --reduced
node S/lines.mjs downtown.html
node S/lines.mjs downtown-dark.html
node S/drive.mjs downtown.html --actions steps.json --height 1300
```

`lines.mjs` must print `line ends: 0`; `capture.mjs` must print `console: clean` and `scrolls sideways: no`. A drive file for the site is `[["wait",800],["move",null,0.502,0.54],["wait",600],["shot","shots/grow-600.png"],["wait",2200],["shot","shots/grow-done.png"]]`; keep the waits under 3.6 s or the tour resumes. Read every PNG.

Last run (22 Oct 2026): line ends 0 on both themes, console clean, phone fits, hover works on every tower and the site.

---

## 10. Known limits

- The Stack and Vancouver House are not fully mapped in OSM (one rectangle; the top block only), so their forms are drawn from that data as described in section 3.
- Three podiums are left out because they would spill past their cells.
- The towers sit on a stylised grid, not at their real positions; real downtown spans about 1.5 km, far wider than the board.
- The Paradox's 158–173 m slice is mapped slightly out of sequence with its neighbours (its axis is 55° where the series runs 78–83°). It is drawn as mapped.
- No WebGL, no 3D mode; the figure is SVG only and works without scripts as a still.
