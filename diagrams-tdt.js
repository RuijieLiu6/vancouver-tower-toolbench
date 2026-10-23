/* Tower Design Toolkits proposal diagrams, redrawn in the site's v2 diagram language. */
(function () {
  'use strict';

  const P = n => (window.TDT_PICTO_BASE || 'images/picto/') + n + '.png';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const STAGES = [
    { k: 'concept', n: '01', name: 'Concept / research', short: 'Concept / research', sub: 'Site, climate, zoning, brief', icon: 'step-brief' },
    { k: 'form', n: '02', name: 'Form', short: 'Form', sub: 'Massing options, basic or advanced', icon: 'step-options' },
    { k: 'program', n: '03', name: 'Program', short: 'Program', sub: 'Stack uses, test area and mix', icon: 'step-fsr' },
    { k: 'schematic', n: '04', name: 'Schematic', short: 'Schematic', sub: 'Core, structure grid, circulation', icon: 'step-floorplate' },
    { k: 'development', n: '05', name: 'Design development', short: 'Design development', sub: 'Facade, systems, details', icon: 'step-studies' },
  ];

  const ANALYSES = [
    { k: 'sun', name: 'Sun', icon: 'step-solar' },
    { k: 'rain', name: 'Rain', sym: 'rain' },
    { k: 'view', name: 'View cone', icon: 'step-views' },
    { k: 'traffic', name: 'Traffic', sym: 'traffic' },
    { k: 'circulation', name: 'Circulation', sym: 'circulation' },
    { k: 'economics', name: 'Economics', sym: 'economics' },
    { k: 'energy', name: 'Energy', sym: 'energy' },
    { k: 'structure', name: 'Structure', sym: 'structure' },
    { k: 'code', name: 'Building code', sym: 'code' },
    { k: 'your', name: 'Your tool', sym: 'plus' },
  ];

  function panel(el, title, rows, note) {
    el.replaceChildren();
    const h = document.createElement('b'); h.textContent = title; el.append(h);
    if (rows.length) {
      const dl = document.createElement('dl'); dl.className = 'v2dl';
      for (const [k, v] of rows) {
        const dt = document.createElement('dt'); dt.textContent = k;
        const dd = document.createElement('dd'); dd.textContent = v;
        dl.append(dt, dd);
      }
      el.append(dl);
    }
    if (note) {
      const p = document.createElement('div'); p.className = 'small muted'; p.textContent = note; el.append(p);
    }
  }

  function bindClicks(svg, sel, fn, clear, info) {
    svg.querySelectorAll(sel).forEach(el => {
      const go = e => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (el.classList.contains('on') && svg.classList.contains('v2-focus')) {
          clear();
          info.dataset.empty = '1';
          info.replaceChildren(info._hint.cloneNode(true));
          return;
        }
        fn(el);
      };
      el.addEventListener('click', go);
      el.addEventListener('keydown', go);
    });
  }

  function clearFocus(svg) {
    svg.classList.remove('v2-focus');
    svg.querySelectorAll('.on').forEach(n => n.classList.remove('on'));
  }

  function defs(id) {
    const p = id + '-';
    return `<defs>
      <marker id="${p}arrow-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" class="tdt-arrow-ink"/></marker>
      <marker id="${p}arrow-signal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9Z" class="tdt-arrow-signal"/></marker>
      <marker id="${p}arrow-harbour" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9Z" class="tdt-arrow-harbour"/></marker>
      <marker id="${p}arrow-stop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9Z" class="tdt-arrow-stop"/></marker>
      <symbol id="${p}rain" viewBox="-24 -24 48 48"><path d="M-17 -2C-17-9-11-14-4-13C0-20 13-18 15-9C21-8 23-3 20 2H-17C-21 1-21-1-17-2M-12 8L-16 17M-2 8L-6 17M8 8L4 17M18 8L14 17"/></symbol>
      <symbol id="${p}traffic" viewBox="-24 -24 48 48"><path d="M-19-9H13M6-16L13-9L6-2M19 9H-13M-6 2L-13 9L-6 16"/></symbol>
      <symbol id="${p}circulation" viewBox="-24 -24 48 48"><path d="M2-1A3 3 0 1 1-4-1A8 8 0 1 1 12-1A14 14 0 1 1-16-1A19 19 0 0 1 17-14M12-16L18-14L17-8"/></symbol>
      <symbol id="${p}economics" viewBox="-24 -24 48 48"><path d="M-20 18H20M-16 18V6H-8V18M-4 18V-5H4V18M8 18V-17H16V18M-18-4L-7-10L1-7L16-19M10-19H16V-13"/></symbol>
      <symbol id="${p}energy" viewBox="-24 -24 48 48"><path d="M5-22L-14 3H-3L-7 22L15-7H4Z"/></symbol>
      <symbol id="${p}structure" viewBox="-24 -24 48 48"><path d="M-19-17H19M-19 17H19M-15-17V17M15-17V17M-15-17L15 17M15-17L-15 17M-19 0H19"/></symbol>
      <symbol id="${p}code" viewBox="-24 -24 48 48"><path d="M-19 20V1H-11V-8H-3V-17H19V20ZM-21 7L8-22M7-22H14V-15"/></symbol>
      <symbol id="${p}plus" viewBox="-24 -24 48 48"><path d="M-14 0H14M0-14V14"/></symbol>
      <symbol id="${p}copy-skill" viewBox="-24 -24 48 48"><path d="M-17-14H7V12H-17ZM-8-20H16V6M-11-7H1M-5-13V-1M7 13L12 18L21 7"/></symbol>
      <symbol id="${p}machine" viewBox="-24 -24 48 48"><path d="M-20-16H20V10H-20ZM-9 18H9M0 10V18M-14-10H8M-14-4H14M-14 2H4"/></symbol>
      <symbol id="${p}teach-agent" viewBox="-24 -24 48 48"><path d="M-17-14H17V10H4L-5 18V10H-17ZM-8-2H8M0-10V6M15 14L20 19M20 14L15 19"/></symbol>
      <symbol id="${p}library" viewBox="-24 -24 48 48"><path d="M-20-18H20V18H-20ZM-7-18V18M7-18V18M-20-6H20M-20 7H20M-16-14H-11M-3-2H3M11 12H16"/></symbol>
    </defs>`;
  }

  function pic(name, x, y, size) {
    return `<image href="${esc(P(name))}" x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" class="v2-pic"/>`;
  }

  function symbolIcon(id, name, x, y, size) {
    return `<use href="#${id}-${name}" x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" class="tdt-ic"/>`;
  }

  function itemIcon(id, item, x, y, size) {
    return item.icon ? pic(item.icon, x, y, size) : symbolIcon(id, item.sym, x, y, size);
  }

  function roleLegend(x, y) {
    return `<g class="tdt-role-legend" transform="translate(${x} ${y})">
      <circle class="v2-cbg you" cx="6" cy="-5" r="7"/><text x="18" y="0">you decide</text>
      <circle class="v2-cbg ai" cx="126" cy="-5" r="7"/><text x="138" y="0">AI helps</text>
      <circle class="v2-cbg code" cx="226" cy="-5" r="7"/><text x="238" y="0">code checks</text>
      <circle class="v2-cbg tool" cx="350" cy="-5" r="7"/><text x="362" y="0">tools compute</text>
    </g>`;
  }

  function segment(a, b, ra, rb) {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    return [a.x + dx * ra / d, a.y + dy * ra / d, b.x - dx * rb / d, b.y - dy * rb / d];
  }

  function buildLoop(host, info) {
    const id = 'tdtLoop', W = 1240, H = 820, cx = 520, cy = 385;
    const stages = [
      { ...STAGES[0], x: 235, y: 215, lx: 155, ly: 104, anchor: 'start' },
      { ...STAGES[1], x: 520, y: 105, lx: 598, ly: 62, anchor: 'start' },   // label beside the circle: there is no room above it
      { ...STAGES[2], x: 805, y: 215, lx: 885, ly: 104, anchor: 'end' },
      { ...STAGES[3], x: 775, y: 595, lx: 842, ly: 667, anchor: 'end' },
      { ...STAGES[4], x: 265, y: 595, lx: 198, ly: 667, anchor: 'start' },
    ];
    const analysis = ANALYSES.map((a, i) => {
      const angle = (-110 + i * 36) * Math.PI / 180;
      const x = cx + Math.cos(angle) * 164, y = cy + Math.sin(angle) * 164;
      return { ...a, x, y, ux: Math.cos(angle), uy: Math.sin(angle) };
    });
    const output = { x: 1085, y: 390, r: 62 };
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Five design stages move both ways around one shared model, ten analysis nodes read that model, and a drawing set can be produced at any point.">`;
    s += defs(id);

    for (let i = 0; i < stages.length; i++) {
      const a = stages[i], b = stages[(i + 1) % stages.length];
      const qx = (a.x + b.x) / 2 + ((a.x + b.x) / 2 - cx) * 0.08;
      const qy = (a.y + b.y) / 2 + ((a.y + b.y) / 2 - cy) * 0.08;
      const [x1, y1, x2, y2] = segment(a, b, 68, 68);
      s += `<path class="tdt-link" data-connect="${a.k} ${b.k}" d="M${x1} ${y1}Q${qx} ${qy} ${x2} ${y2}" marker-start="url(#${id}-arrow-ink)" marker-end="url(#${id}-arrow-ink)"/>`;
    }
    s += `<text class="v2-cap" x="520" y="748" text-anchor="middle">Move between stages, either way · no stage is a prerequisite for the next</text>`;

    stages.forEach((st, i) => {
      const bend = i === 0 || i === 4 ? -18 : i === 2 || i === 3 ? 18 : 0;
      s += `<path class="tdt-spoke" data-connect="${st.k}" d="M${st.x} ${st.y}Q${(st.x + cx) / 2 + bend} ${(st.y + cy) / 2} ${cx} ${cy}"/>`;
    });
    analysis.forEach(a => {
      const [x1, y1, x2, y2] = segment({ x: cx, y: cy }, a, 86, 30);
      s += `<path class="tdt-analysis-spoke" data-connect="${a.k}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    });

    s += `<circle class="v2-hub" cx="${cx}" cy="${cy}" r="86"/>${pic('icon-engine', cx, cy - 30, 68)}`;
    s += `<text class="v2-hubt" x="${cx}" y="${cy + 17}" text-anchor="middle">One model</text><text class="v2-cap tdt-inhub" x="${cx}" y="${cy + 38}" text-anchor="middle">massing engine</text>`;
    s += `<g class="tdt-switch" transform="translate(${cx - 71} ${cy + 52})"><rect width="142" height="28" rx="14"/><g class="tdt-switch-on"><rect x="2" y="2" width="66" height="24" rx="12"/><text x="35" y="19" text-anchor="middle">basic</text></g><text x="103" y="19" text-anchor="middle">advanced</text></g>`;
    s += `<text class="v2-cap" x="${cx}" y="${cy + 106}" text-anchor="middle">reads and writes the model</text>`;

    stages.forEach(st => {
      s += `<g class="tdt-stage" data-key="${st.k}" tabindex="0" role="button" aria-label="Stage ${st.n}: ${esc(st.name)}. ${esc(st.sub)}.">`;
      s += `<circle class="v2-hit" cx="${st.x}" cy="${st.y}" r="76"/><circle class="v2-cbg you" cx="${st.x}" cy="${st.y}" r="62"/>${pic(st.icon, st.x, st.y, 92)}`;
      s += `<text class="v2-num" x="${st.lx}" y="${st.ly}" text-anchor="${st.anchor}">${st.n}</text><text class="v2-lab you" x="${st.lx}" y="${st.ly + 22}" text-anchor="${st.anchor}">${esc(st.name)}</text><text class="v2-cap" x="${st.lx}" y="${st.ly + 43}" text-anchor="${st.anchor}">${esc(st.sub)}</text></g>`;
    });

    s += `<g class="tdt-entry"><circle cx="182" cy="177" r="5"/><path d="M186 174Q203 157 222 158"/><text x="172" y="181" text-anchor="end">start here</text><circle cx="420" cy="64" r="5"/><path d="M425 64H466"/><text x="410" y="69" text-anchor="end">or here</text><circle cx="213" cy="653" r="5"/><path d="M218 651Q236 641 248 628"/><text x="151" y="658">or here</text></g>`;

    analysis.forEach(a => {
      const nudge = { your: [0, -18], structure: [0, -16], code: [-8, 0] }[a.k] || [0, 0];   // keep these labels off the spokes
      const tx = a.x + a.ux * 42 + nudge[0], ty = a.y + a.uy * 42 + 5 + nudge[1];
      const anchor = a.ux > 0.28 ? 'start' : a.ux < -0.28 ? 'end' : 'middle';
      s += `<g class="tdt-analysis${a.k === 'your' ? ' tdt-dashed' : ''}" data-key="${a.k}" tabindex="0" role="button" aria-label="Analysis node: ${esc(a.name)}.">`;
      s += `<circle class="v2-hit" cx="${a.x}" cy="${a.y}" r="35"/><circle class="v2-cbg tool" cx="${a.x}" cy="${a.y}" r="28"/>${itemIcon(id, a, a.x, a.y, 38)}<text class="v2-cap" x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(a.name)}</text></g>`;
    });

    s += `<path class="v2-loop" data-connect="output" d="M604 385C760 335 880 330 1017 377" marker-end="url(#${id}-arrow-signal)"/><text class="v2-cap acc" x="855" y="326" text-anchor="middle">exit at any point</text>`;
    s += `<g class="tdt-output" data-key="output" tabindex="0" role="button" aria-label="Output: drawing set with plans, sections, diagrams and renders."><circle class="v2-hit" cx="${output.x}" cy="${output.y}" r="74"/><circle class="v2-cbg tool" cx="${output.x}" cy="${output.y}" r="${output.r}"/>${pic('step-submit', output.x, output.y, 90)}<text class="v2-num" x="${output.x}" y="${output.y + 88}" text-anchor="middle">OUTPUT</text><text class="v2-lab" x="${output.x}" y="${output.y + 110}" text-anchor="middle">Drawing set</text><text class="v2-cap" x="${output.x}" y="${output.y + 131}" text-anchor="middle">Plans, sections, diagrams, renders</text></g>`;
    s += roleLegend(24, 800) + '</svg>';
    host.innerHTML = s;

    const svg = host.querySelector('svg');
    const clear = () => clearFocus(svg);
    bindClicks(svg, '.tdt-stage, .tdt-analysis, .tdt-output', el => {
      clear(); svg.classList.add('v2-focus'); el.classList.add('on');
      const key = el.dataset.key;
      svg.querySelectorAll(`[data-connect~="${key}"]`).forEach(n => n.classList.add('on'));
      if (el.classList.contains('tdt-analysis')) {
        const a = ANALYSES.find(x => x.k === key);
        panel(info, `Analysis node: ${a.name}. It reads the shared model and is available to every stage.`, [], '');
      } else if (el.classList.contains('tdt-stage')) {
        const st = STAGES.find(x => x.k === key);
        panel(info, `${st.n} · ${st.name}`, [['At this stage', st.sub], ['Shared model', 'Reads and writes the model']]);
      } else {
        panel(info, 'Output · drawing set', [['Includes', 'Plans, sections, diagrams, renders'], ['When', 'Exit at any point']]);
      }
    }, clear, info);
  }

  function flowNode(id, x, y, role, label, icon, sym, extra) {
    const iconMarkup = icon ? pic(icon, x, y, 58) : symbolIcon(id, sym, x, y, 34);
    return `<g class="tdt-node ${extra || ''}"><circle class="v2-cbg ${role}" cx="${x}" cy="${y}" r="40"/>${iconMarkup}<text class="v2-lab" x="${x}" y="${y + 61}" text-anchor="middle">${esc(label)}</text></g>`;
  }

  function buildWhy(host, info) {
    const id = 'tdtWhy', W = 1240, H = 450;
    let s = `<svg viewBox="0 -30 ${W} ${H + 30}" role="img" aria-label="Today's separated sequence loses weeks when analysis fails, while one platform keeps massing, analysis and learning in a short loop on the same model.">` + defs(id);
    s += `<g class="tdt-row" data-row="today" tabindex="0" role="button" aria-label="Today: five separate steps can end by starting over."><rect class="tdt-hit" x="12" y="18" width="1216" height="188" rx="10"/>`;
    s += `<text class="v2-num" x="28" y="40">TODAY</text><text class="v2-cap" x="1110" y="42" text-anchor="middle">separate tool at each step</text>`;
    const top = [
      [135, 'Research', 'step-brief', null, 'you'], [330, 'Model in CAD', 'step-options', null, 'tool'],
      [525, 'Export to analysis', 'icon-documents', null, 'code'], [720, 'Wait for results', 'icon-tools', null, 'tool'],
      [915, "It doesn't work", 'icon-stop', null, 'code'],
    ];
    for (let i = 0; i < top.length - 1; i++) s += `<path class="tdt-link" d="M177 105H${top[i + 1][0] - 43}" marker-end="url(#${id}-arrow-ink)"/>`.replace('M177', `M${top[i][0] + 43}`);
    top.forEach((n, i) => { s += flowNode(id, n[0], 105, n[4], n[1], n[2], n[3], i === 4 ? 'tdt-stop' : ''); });
    s += `<path class="v2-loop" d="M915 58C760 5 280 5 135 58" marker-end="url(#${id}-arrow-signal)"/><text class="v2-cap acc" x="525" y="0" text-anchor="middle">Start over · weeks lost · five tools, five files</text></g>`;

    s += `<g class="tdt-row" data-row="loop" tabindex="0" role="button" aria-label="In the loop: mass, analyse and learn on one model, then proceed knowing it works."><rect class="tdt-hit" x="12" y="218" width="1216" height="186" rx="10"/><text class="v2-num" x="28" y="246">IN THE LOOP</text><rect class="tdt-rowbox" x="90" y="250" width="760" height="126" rx="30"/>`;
    const low = [[220, 'Mass', 'step-options', 'you'], [435, 'Analyse', 'icon-tools', 'tool'], [650, 'Learn', 'icon-check', 'code']];
    low.forEach(n => { s += flowNode(id, n[0], 310, n[3], n[1], n[2], null, ''); });
    s += `<path class="tdt-link" d="M263 310H390" marker-end="url(#${id}-arrow-ink)"/><path class="tdt-link" d="M478 310H605" marker-end="url(#${id}-arrow-ink)"/>`;
    s += `<path class="v2-loop" d="M650 263C560 234 310 234 220 263" marker-end="url(#${id}-arrow-signal)"/><text class="v2-cap acc" x="435" y="226" text-anchor="middle">Minutes, same model</text>`;
    s += `<path class="tdt-link" d="M695 310H895" marker-end="url(#${id}-arrow-ink)"/>${flowNode(id, 945, 310, 'you', 'Proceed, knowing it works', 'step-submit', null, '')}<text class="v2-cap" x="1120" y="306" text-anchor="middle">one platform, one model,</text><text class="v2-cap" x="1120" y="326" text-anchor="middle">all the nodes</text></g>`;
    s += roleLegend(24, 432) + '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg'), clear = () => clearFocus(svg);
    bindClicks(svg, '.tdt-row', el => {
      clear(); svg.classList.add('v2-focus'); el.classList.add('on');
      el.querySelectorAll('.tdt-link, .v2-loop, .tdt-node').forEach(n => n.classList.add('on'));
      if (el.dataset.row === 'today') {
        panel(info, 'Today', [['Sequence', "Research → model in CAD → export to analysis → wait for results → it doesn't work"], ['Loop', 'Start over · weeks lost · five tools, five files'], ['Setup', 'Separate tool at each step']]);
      } else {
        panel(info, 'In the loop', [['Sequence', 'Mass → analyse → learn → proceed, knowing it works'], ['Loop', 'Minutes, same model'], ['Setup', 'One platform, one model, all the nodes']]);
      }
    }, clear, info);
  }

  const OPEN_NODES = [
    { k: 'copy', name: 'Copy a node as a skill', detail: 'Any tool on the site, exported with its logic and inputs', sym: 'copy-skill', x: 290, y: 105, tx: 226, ty: 75, anchor: 'end' },
    { k: 'machine', name: 'Run it on your own machine', detail: 'Your data, your model, your agent', sym: 'machine', x: 950, y: 105, tx: 1014, ty: 75, anchor: 'start' },
    { k: 'teach', name: 'Teach your agent a new tool', detail: 'Daylight for a new climate, a local code, a cost model', sym: 'teach-agent', x: 950, y: 315, tx: 1014, ty: 285, anchor: 'start' },
    { k: 'contribute', name: 'Contribute it back', detail: 'Reviewed, versioned, listed in the node library', sym: 'library', x: 290, y: 315, tx: 226, ty: 285, anchor: 'end' },
  ];

  function twoLineDetail(text, x, y, anchor) {
    const split = text.length > 47 ? text.lastIndexOf(' ', 47) : -1;
    if (split < 0) return `<text class="v2-cap" x="${x}" y="${y}" text-anchor="${anchor}">${esc(text)}</text>`;
    return `<text class="v2-cap" x="${x}" y="${y}" text-anchor="${anchor}"><tspan x="${x}" dy="0">${esc(text.slice(0, split))}</tspan><tspan x="${x}" dy="19">${esc(text.slice(split + 1))}</tspan></text>`;
  }

  function buildOpen(host, info) {
    const id = 'tdtOpen', W = 1240, H = 460, hub = { x: 620, y: 210 };
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Four steps form an open-source loop around a shared tool database: copy a skill, run it, teach an agent, and contribute it back.">` + defs(id);
    OPEN_NODES.forEach(n => {
      const [x1, y1, x2, y2] = segment(hub, n, 76, 48);
      s += `<path class="tdt-analysis-spoke" data-connect="${n.k}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    });
    for (let i = 0; i < OPEN_NODES.length; i++) {
      const a = OPEN_NODES[i], b = OPEN_NODES[(i + 1) % OPEN_NODES.length];
      const [x1, y1, x2, y2] = segment(a, b, 50, 50);
      const side = i === 0 ? -28 : i === 1 ? 36 : i === 2 ? 28 : -36;
      const qx = (x1 + x2) / 2 + (i % 2 ? side : 0), qy = (y1 + y2) / 2 + (i % 2 ? 0 : side);
      s += `<path class="tdt-link" data-connect="${a.k} ${b.k}" d="M${x1} ${y1}Q${qx} ${qy} ${x2} ${y2}" marker-end="url(#${id}-arrow-ink)"/>`;
    }
    s += `<circle class="v2-hub" cx="620" cy="210" r="70"/>${symbolIcon(id, 'library', 620, 188, 54)}<text class="v2-hubt" x="620" y="232" text-anchor="middle">Shared tool database</text><text class="v2-cap tdt-inhub" x="620" y="254" text-anchor="middle">node library</text>`;
    OPEN_NODES.forEach(n => {
      s += `<g class="tdt-node tdt-stage" data-key="${n.k}" tabindex="0" role="button" aria-label="${esc(n.name)}. ${esc(n.detail)}."><circle class="v2-hit" cx="${n.x}" cy="${n.y}" r="55"/><circle class="v2-cbg you" cx="${n.x}" cy="${n.y}" r="44"/>${symbolIcon(id, n.sym, n.x, n.y, 48)}<text class="v2-lab you" x="${n.tx}" y="${n.ty}" text-anchor="${n.anchor}">${esc(n.name)}</text>${twoLineDetail(n.detail, n.tx, n.ty + 23, n.anchor)}</g>`;
    });
    s += `<text class="v2-cap" x="620" y="399" text-anchor="middle">Every contribution returns to the library, so the next designer starts from more than the last one did.</text>`;
    s += roleLegend(24, 442) + '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg'), clear = () => clearFocus(svg);
    bindClicks(svg, '.tdt-node', el => {
      clear(); svg.classList.add('v2-focus'); el.classList.add('on');
      const key = el.dataset.key;
      svg.querySelectorAll(`[data-connect~="${key}"]`).forEach(n => n.classList.add('on'));
      const n = OPEN_NODES.find(x => x.k === key);
      panel(info, n.name, [['What it carries', n.detail]]);
    }, clear, info);
  }

  const A_POINTS = {
    concept: { x: 210, y: 220 }, form: { x: 530, y: 165 }, program: { x: 875, y: 235 }, schematic: { x: 340, y: 565 }, development: { x: 760, y: 590 }, output: { x: 1110, y: 410 },
    sun: { x: 405, y: 285 }, view: { x: 665, y: 285 }, rain: { x: 490, y: 405 }, traffic: { x: 1000, y: 555 }, circulation: { x: 585, y: 505 }, economics: { x: 865, y: 410 }, energy: { x: 650, y: 680 }, structure: { x: 480, y: 665 }, code: { x: 225, y: 410 }, your: { x: 1035, y: 160 },
  };

  function pointNode(id, key, p) {
    const st = STAGES.find(x => x.k === key);
    const an = ANALYSES.find(x => x.k === key);
    const isOutput = key === 'output';
    const r = an ? 24 : 42, cls = an ? `tdt-analysis${key === 'your' ? ' tdt-dashed' : ''}` : isOutput ? 'tdt-output' : 'tdt-stage';
    const label = an ? an.name : isOutput ? 'Drawing set' : st.short;
    const iconMarkup = an ? itemIcon(id, an, p.x, p.y, 32) : pic(isOutput ? 'step-submit' : st.icon, p.x, p.y, isOutput ? 58 : 62);
    return `<g class="tdt-node ${cls}" data-point="${key}"><circle class="v2-cbg ${an || isOutput ? 'tool' : 'you'}" cx="${p.x}" cy="${p.y}" r="${r}"/>${iconMarkup}<text class="v2-lab" x="${p.x}" y="${p.y + r + 22}" text-anchor="middle">${esc(label)}</text></g>`;
  }

  function pathD(keys) {
    const points = keys.map(k => ({ ...A_POINTS[k] }));
    if (keys[keys.length - 1] === 'output' && points.length > 1) {
      const end = points[points.length - 1], prev = points[points.length - 2];
      const dx = end.x - prev.x, dy = end.y - prev.y, d = Math.hypot(dx, dy) || 1;
      end.x -= dx * 47 / d; end.y -= dy * 47 / d;
    }
    return points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('');
  }

  function visitBadges(visits) {
    const offsets = {
      'form-1': [-54, -43], 'sun-2': [-35, -35], 'program-3': [46, -40], 'form-4': [55, -8], 'code-5': [-37, -37],
      'concept-6': [-47, -38], 'schematic-7': [-48, -40], 'form-8': [42, 45], 'development-9': [48, -38], 'output-10': [53, -41],
    };
    return visits.map((k, i) => {
      const o = offsets[`${k}-${i + 1}`] || [32, -32], x = A_POINTS[k].x + o[0], y = A_POINTS[k].y + o[1];
      return `<g class="tdt-badge"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 4}" text-anchor="middle">${i + 1}</text></g>`;
    }).join('');
  }

  function buildA(host, info) {
    const id = 'tdtA', W = 1240, H = 810;
    const edges = [
      ['concept', 'form'], ['concept', 'schematic'], ['concept', 'output'],
      ['form', 'program'], ['form', 'schematic'], ['form', 'development'],
      ['program', 'development'], ['program', 'output'],
      ['schematic', 'development'], ['development', 'output'],
    ];
    const visitsA = ['form', 'sun', 'program', 'form', 'code', 'concept', 'schematic', 'form', 'development', 'output'];
    const visitsB = ['economics', 'program', 'code', 'form', 'schematic', 'program', 'development', 'output'];
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="One dashed model field holds five stages, one output and ten analysis nodes, with a numbered form-first path and a dashed brief-first path.">` + defs(id);
    s += `<ellipse class="tdt-field" cx="620" cy="420" rx="570" ry="325"/><text class="v2-hubt" x="70" y="94">One model</text><text class="v2-cap" x="70" y="116">Any move the platform allows</text>`;
    edges.forEach(e => { s += `<path class="tdt-web" d="M${A_POINTS[e[0]].x} ${A_POINTS[e[0]].y}L${A_POINTS[e[1]].x} ${A_POINTS[e[1]].y}"/>`; });
    s += `<path class="tdt-path-b" d="${pathD(visitsB)}" marker-end="url(#${id}-arrow-harbour)"/>`;
    s += `<path class="tdt-path-a" d="${pathD(visitsA)}" marker-end="url(#${id}-arrow-signal)"/>`;
    Object.entries(A_POINTS).forEach(([k, p]) => { s += pointNode(id, k, p); });
    s += `<g class="tdt-path-badges tdt-path-a-badges">${visitBadges(visitsA)}</g>`;
    s += `<g class="tdt-legend-button tdt-designer-a" data-path="a" tabindex="0" role="button" aria-label="Show only Designer A's form-first path."><rect class="tdt-hit" x="734" y="24" width="218" height="42" rx="10"/><rect class="tdt-panel-bg" x="740" y="30" width="206" height="30" rx="8"/><path class="tdt-path-a" d="M754 45H792"/><text x="804" y="50">Designer A · form-first</text></g>`;
    s += `<g class="tdt-legend-button tdt-designer-b" data-path="b" tabindex="0" role="button" aria-label="Show only Designer B's brief-first path."><rect class="tdt-hit" x="958" y="24" width="250" height="42" rx="10"/><rect class="tdt-panel-bg" x="964" y="30" width="238" height="30" rx="8"/><path class="tdt-path-b" d="M978 45H1016"/><text x="1028" y="50">Designer B · brief-first</text></g>`;
    s += `<text class="v2-cap" x="620" y="772" text-anchor="middle">Nothing in this drawing is upstream of anything else. The numbers belong to the visits, not the stages.</text>`;
    s += roleLegend(24, 794) + '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg'), clear = () => clearFocus(svg);
    bindClicks(svg, '.tdt-legend-button', el => {
      clear(); svg.classList.add('v2-focus'); el.classList.add('on');
      const which = el.dataset.path, visits = which === 'a' ? visitsA : visitsB;
      svg.querySelector(`.tdt-path-${which}`).classList.add('on');
      el.querySelector(`.tdt-path-${which}`).classList.add('on');
      if (which === 'a') svg.querySelector('.tdt-path-a-badges').classList.add('on');
      visits.forEach(k => svg.querySelector(`[data-point="${k}"]`).classList.add('on'));
      if (which === 'a') panel(info, 'Designer A · form-first', [['Visits', 'Form → Sun → Program → Form → Building code → Concept / research → Schematic → Form → Design development → Output'], ['Numbering', 'Numbered by visit 1–10']]);
      else panel(info, 'Designer B · brief-first', [['Visits', 'Economics → Program → Building code → Form → Schematic → Program → Design development → Output'], ['Start', 'Economics']]);
    }, clear, info);
  }

  // a long title wraps onto two lines so it stays inside its card
  function splitTitle(label) {
    if (label.length <= 12 || !label.includes(' ')) return [label];
    const words = label.split(' ');
    let best = [label], diff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      if (Math.abs(a.length - b.length) < diff) { diff = Math.abs(a.length - b.length); best = [a, b]; }
    }
    return best;
  }
  function card(id, x, y, w, h, label, icon, mode) {
    const lines = [...splitTitle(label).map(l => ['tdt-card-title', l]), ...(mode ? [['v2-cap acc', mode]] : [])];
    const y0 = y + h / 2 - (lines.length - 1) * 9 + 5;
    const text = lines.map(([cls, l], i) => `<text class="${cls}" x="${x + 64}" y="${y0 + i * 18}">${esc(l)}</text>`).join('');
    return `<g class="tdt-stage-card-group"><rect class="tdt-stage-card" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>${pic(icon, x + 34, y + h / 2, 48)}${text}</g>`;
  }

  function pill(id, key, label, x, y, w, source) {
    const a = ANALYSES.find(n => n.k === key);
    return `<g class="tdt-pill-group" data-analysis="${key}" data-source="${source}" tabindex="0" role="button" aria-label="Analysis node: ${esc(label)}."><rect class="tdt-hit" x="${x - 4}" y="${y - 4}" width="${w + 8}" height="42" rx="19"/><rect class="tdt-pill" x="${x}" y="${y}" width="${w}" height="34" rx="17"/>${itemIcon(id, a, x + 19, y + 17, 24)}<text class="v2-cap" x="${x + 38}" y="${y + 22}">${esc(label)}</text></g>`;
  }

  function canvasTitle(x, y, w, key, title, subtitle) {
    return `<g class="tdt-canvas-title" data-title="${key}" tabindex="0" role="button" aria-label="Highlight ${esc(title)}."><rect class="tdt-hit" x="${x - 6}" y="${y - 24}" width="${w}" height="50" rx="8"/><text x="${x}" y="${y}">${esc(title)}</text><text class="v2-cap" x="${x}" y="${y + 20}">${esc(subtitle)}</text></g>`;
  }

  function buildC(host, info) {
    const id = 'tdtC', W = 1240, H = 875;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Two site-style canvases show a form-first graph and a brief-first graph wired from the same ten-node library in different orders.">` + defs(id);
    s += `<g class="tdt-canvas" data-canvas="a"><rect class="tdt-card" x="25" y="30" width="580" height="615" rx="10"/>${canvasTitle(50, 67, 320, 'a', 'Designer A · form-first', 'Massing engine · advanced')}`;
    s += `<path class="tdt-wire" data-wire="sun" d="M220 147H260V197"/><path class="tdt-wire" data-wire="view" d="M220 207H245V211H260"/><path class="tdt-wire" data-wire="code" d="M220 267H250V227H260"/>`;
    s += `<path class="tdt-wire" d="M350 255V298Q350 320 390 345"/><path class="v2-loop" d="M390 365C328 352 302 309 322 258" marker-end="url(#${id}-arrow-signal)"/><text class="v2-cap acc" x="300" y="304" text-anchor="end">re-mass</text>`;
    s += `<path class="tdt-wire" d="M320 255V430"/><path class="tdt-wire" d="M475 380V477Q475 500 488 515"/><path class="tdt-wire" d="M370 465H410Q435 465 450 515"/>`;
    s += pill(id, 'sun', 'Sun', 70, 130, 150, 'a') + pill(id, 'view', 'View cone', 70, 190, 150, 'a') + pill(id, 'code', 'Building code', 70, 250, 150, 'a');
    s += card(id, 260, 175, 180, 80, 'Massing engine', 'icon-engine', 'advanced') + card(id, 390, 320, 165, 70, 'Program', 'step-fsr', '') + card(id, 195, 430, 175, 70, 'Schematic', 'step-floorplate', '') + card(id, 410, 515, 170, 70, 'Drawing set', 'step-submit', '');
    s += `<text class="tdt-note" x="50" y="620">No concept node: went straight to form</text></g>`;

    s += `<g class="tdt-canvas" data-canvas="b"><rect class="tdt-card" x="635" y="30" width="580" height="615" rx="10"/>${canvasTitle(660, 67, 320, 'b', 'Designer B · brief-first', 'Massing engine · basic')}`;
    s += `<path class="tdt-wire" data-wire="economics" d="M805 147H830V193"/><path class="tdt-wire" data-wire="code" d="M805 207H818V207H830"/>`;
    s += `<path class="tdt-wire" data-wire="traffic" d="M805 327H830V382"/><path class="tdt-wire" data-wire="energy" d="M805 387H830"/><path class="tdt-wire" data-wire="structure" d="M805 447H818V417H830"/>`;
    s += `<path class="tdt-wire" d="M1000 202H1020"/><path class="tdt-wire" d="M915 240V365"/><path class="v2-loop" d="M855 365C790 325 800 275 855 240" marker-end="url(#${id}-arrow-signal)"/><text class="v2-cap acc" x="796" y="290" text-anchor="end">re-stack</text>`;
    s += `<path class="tdt-wire" d="M1000 402H1020"/><path class="tdt-wire" d="M1100 425V500"/>`;
    s += pill(id, 'economics', 'Economics', 655, 130, 150, 'b') + pill(id, 'code', 'Building code', 655, 190, 150, 'b') + pill(id, 'traffic', 'Traffic', 655, 310, 150, 'b') + pill(id, 'energy', 'Energy', 655, 370, 150, 'b') + pill(id, 'structure', 'Structure', 655, 430, 150, 'b');
    s += card(id, 830, 165, 170, 75, 'Program', 'step-fsr', '') + card(id, 1020, 145, 165, 75, 'Concept / research', 'step-brief', '') + card(id, 830, 365, 170, 75, 'Massing engine', 'icon-engine', 'basic') + card(id, 1020, 350, 165, 75, 'Design development', 'step-studies', '') + card(id, 1020, 500, 165, 75, 'Drawing set', 'step-submit', '');
    s += `<text class="tdt-note" x="660" y="620">No schematic node yet: added when the numbers close</text></g>`;

    s += `<rect class="tdt-library" x="25" y="675" width="1190" height="150" rx="10"/><text class="v2-hubt" x="50" y="705">Node library</text><text class="v2-cap" x="50" y="726">The ten analysis nodes</text>`;
    ANALYSES.forEach((a, i) => {
      const x = 235 + i * 96, y = 744;
      s += `<g class="tdt-analysis${a.k === 'your' ? ' tdt-dashed' : ''}"><circle class="v2-cbg tool" cx="${x}" cy="${y}" r="24"/>${itemIcon(id, a, x, y, 31)}<text class="v2-cap" x="${x}" y="${y + 42}" text-anchor="middle">${esc(a.name)}</text></g>`;
    });
    s += roleLegend(24, 856) + '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg'), clear = () => clearFocus(svg);
    bindClicks(svg, '.tdt-canvas-title', el => {
      clear(); svg.classList.add('v2-focus'); el.classList.add('on');
      const canvas = el.closest('.tdt-canvas'); canvas.classList.add('on');
      canvas.querySelectorAll('.tdt-wire, .v2-loop').forEach(n => n.classList.add('on'));
      if (el.dataset.title === 'a') panel(info, 'Designer A · form-first', [['Inputs', 'Sun, view cone, building code'], ['Graph', 'Massing engine (advanced) → program and schematic → drawing set'], ['Note', 'No concept node: went straight to form']]);
      else panel(info, 'Designer B · brief-first', [['Inputs', 'Economics, building code → program; traffic, energy, structure → massing engine (basic)'], ['Graph', 'Program → concept / research; massing engine → design development → drawing set'], ['Note', 'No schematic node yet: added when the numbers close']]);
    }, clear, info);
    bindClicks(svg, '.tdt-pill-group', el => {
      clear(); svg.classList.add('v2-focus');
      const canvas = el.closest('.tdt-canvas'); canvas.classList.add('on'); el.classList.add('on');
      canvas.querySelectorAll(`[data-wire="${el.dataset.analysis}"]`).forEach(n => n.classList.add('on'));
      const a = ANALYSES.find(n => n.k === el.dataset.analysis);
      panel(info, `Analysis node: ${a.name}. It reads the shared model and is available to every stage.`, [], '');
    }, clear, info);
  }

  window.buildTdtDiagrams = function () {
    for (const [id, fn] of [['tdtLoop', buildLoop], ['tdtWhy', buildWhy], ['tdtOpen', buildOpen], ['tdtA', buildA], ['tdtC', buildC]]) {
      const host = document.getElementById(id), info = document.getElementById(id + 'info');
      if (!host || !info) continue;
      info._hint = info.firstElementChild ? info.firstElementChild.cloneNode(true) : document.createElement('span');
      try { fn(host, info); } catch (e) { host.textContent = 'Diagram could not be drawn.'; }
    }
  };
})();
