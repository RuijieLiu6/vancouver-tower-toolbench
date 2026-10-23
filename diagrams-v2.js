/* Interactive research diagrams (v2): pictogram-led, after the studio's reference boards.
   A: workflow strip with pain-point lanes. B: tool lines across the steps. C: workbench cycle. D: who does what (hand-offs).
   Uses STEPS_T, PAINS and EXT from the page; pictograms live in images/picto/. */
(function () {
  const P = n => `images/picto/${n}.png`;
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- shared step model (order of the as-is workflow) ---------- */
  const STEPS = [
    { k: '1', name: 'Brief', icon: 'step-brief', who: 'person' },
    { k: '2', name: 'Site truth', icon: 'step-site', who: 'person' },
    { k: '3a', name: 'Views', icon: 'step-views', who: 'tool' },
    { k: '3b', name: 'Solar', icon: 'step-solar', who: 'tool' },
    { k: '3c', name: 'Floor plate', icon: 'step-floorplate', who: 'tool' },
    { k: '3d', name: 'Separation', icon: 'step-separation', who: 'tool' },
    { k: '3e', name: 'FSR', icon: 'step-fsr', who: 'tool' },
    { k: '4', name: 'Options', icon: 'step-options', who: 'person' },
    { k: '5', name: 'Studies', icon: 'step-studies', who: 'person' },
    { k: '6', name: 'Compare', icon: 'step-compare', who: 'person' },
    { k: '7', name: 'City enquiry', icon: 'step-cityhall', who: 'person' },
    { k: '8', name: 'Freeze', icon: 'step-freeze', who: 'person' },
    { k: '9', name: 'Submit', icon: 'step-submit', who: 'tool' },
    { k: '10', name: 'City decides', icon: 'step-decision', who: 'person' },
  ];
  // which steps each pain point touches (from the research, section 3.3)
  const PAIN_STEPS = {
    a: ['2', '3a', '3b', '3c', '3d', '3e', '7', '9', '10'], b: ['1', '4', '5', '6', '7', '8', '10'], c: ['4', '5', '6'],
    d: ['2', '3a', '3b', '3c', '3d', '3e', '4', '5', '9'], e: ['4', '5', '8', '9'], f: ['3a', '3b', '3c', '3d', '3e', '5', '6', '7', '10'], g: ['6', '7', '8', '9'],
  };
  const stepRow = k => STEPS_T.find(r => r[0].split(' ')[0] === k);

  function panel(el, title, rows, note) {
    el.replaceChildren();
    const h = document.createElement('b'); h.textContent = title; el.append(h);
    if (rows.length) {
      const dl = document.createElement('dl'); dl.className = 'v2dl';
      for (const [k, v] of rows) { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd); }
      el.append(dl);
    }
    if (note) { const p = document.createElement('div'); p.className = 'small muted'; p.textContent = note; el.append(p); }
  }

  /* ---------- A: how a tower is designed today ---------- */
  function buildA(host, info) {
    const W = 2040, top = 170, icon = 104, gap = 124, x0 = 300;
    const X = i => x0 + i * gap + icon / 2;
    const groundY = top + icon + 34, laneY0 = groundY + 110, laneGap = 42;
    const H = laneY0 + laneGap * 7 + 30;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="How a Vancouver tower is designed today: fourteen steps with seven pain-point lanes below">`;
    s += `<defs><marker id="v2arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="v2-ink-f"/></marker>
      <marker id="v2arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="v2-acc-f"/></marker></defs>`;
    // rework loops (dashed arcs above, like the weather cycle)
    const loops = [['6', '1', 'reframe the brief', 132], ['6', '4', 'try other options', 30], ['7', '4', 'revise after City advice', 88], ['10', '8', 'revise and resubmit', 52]];
    loops.forEach(([a, b, t, hgt], j) => {
      const ia = STEPS.findIndex(x => x.k === a), ib = STEPS.findIndex(x => x.k === b);
      const xa = X(ia), xb = X(ib), lift = 26 + j * 0; const y = top - 8;
      const mid = (xa + xb) / 2;
      s += `<path class="v2-loop" d="M${xa} ${y} C ${xa} ${y - hgt}, ${xb} ${y - hgt}, ${xb} ${y}" marker-end="url(#v2arrA)"/>`;
      s += `<text class="v2-cap acc" x="${mid}" y="${y - hgt * 0.75 - 8}" text-anchor="middle">${esc(t)}</text>`;
    });
    // ground line + main flow
    s += `<path class="v2-ground" d="M20 ${groundY} H ${W - 20}"/>`;
    s += `<path class="v2-main" d="M${X(0)} ${groundY - 12} H ${X(STEPS.length - 1) + 30}" marker-end="url(#v2arr)"/>`;
    // the five rule checks share one bracket
    const r0 = X(2) - icon / 2 - 6, r1 = X(6) + icon / 2 + 6;
    s += `<path class="v2-bracket" d="M${r0} ${top - 4} V ${top - 14} H ${r1} V ${top - 4}"/><text class="v2-cap" x="${(r0 + r1) / 2}" y="${top - 22}" text-anchor="middle">5 Vancouver rule checks</text>`;
    // steps
    STEPS.forEach((st, i) => {
      const x = X(i);
      s += `<g class="v2-step" data-k="${st.k}" tabindex="0" role="button" aria-label="Step ${st.k}: ${esc(st.name)}">`;
      s += `<rect class="v2-hit" x="${x - icon / 2 - 8}" y="${top - 6}" width="${icon + 16}" height="${icon + 70}" rx="10"/>`;
      s += `<image href="${P(st.icon)}" x="${x - icon / 2}" y="${top}" width="${icon}" height="${icon}" class="v2-pic"/>`;
      s += `<circle class="${st.who === 'person' ? 'v2-who-p' : 'v2-who-t'}" cx="${x}" cy="${groundY - 12}" r="6"/>`;
      s += `<text class="v2-num" x="${x}" y="${groundY + 28}" text-anchor="middle">${st.k}</text>`;
      s += `<text class="v2-lab" x="${x}" y="${groundY + 52}" text-anchor="middle">${esc(st.name)}</text></g>`;
    });
    // pain lanes (metro style)
    PAINS.forEach(([p, t], li) => {
      const y = laneY0 + li * laneGap, idx = PAIN_STEPS[p].map(k => STEPS.findIndex(x => x.k === k)).sort((a, b) => a - b);
      s += `<g class="v2-lane" data-p="${p}" tabindex="0" role="button" aria-label="Pain point ${p}: ${esc(t)}">`;
      s += `<rect class="v2-hit" x="0" y="${y - 15}" width="${W}" height="30"/>`;
      s += `<text class="v2-lanek" x="24" y="${y + 7}">${p}</text><text class="v2-lanet" x="50" y="${y + 7}">${esc(t)}</text>`;
      s += `<path class="v2-laneline" d="M${X(idx[0])} ${y} H ${X(idx[idx.length - 1])}"/>`;
      for (const i of idx) s += `<line class="v2-drop" data-k="${STEPS[i].k}" x1="${X(i)}" x2="${X(i)}" y1="${groundY + 62}" y2="${y}"/><circle class="v2-node" cx="${X(i)}" cy="${y}" r="5.5"/>`;
      s += '</g>';
    });
    s += `<g class="v2-legend" transform="translate(${W - 640} ${H - 12})"><circle class="v2-who-p" cx="0" cy="-6" r="8"/><text class="v2-cap" x="16" y="0">a person decides</text><circle class="v2-who-t" cx="220" cy="-6" r="8"/><text class="v2-cap" x="236" y="0">a tool or file does it</text><path class="v2-loop" d="M450 -6 h40"/><text class="v2-cap" x="500" y="0">rework loop</text></g>`;
    s += '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg');
    const clear = () => { svg.classList.remove('v2-focus'); svg.querySelectorAll('.on').forEach(n => n.classList.remove('on')); };
    const showStep = k => {
      clear(); svg.classList.add('v2-focus');
      svg.querySelector(`.v2-step[data-k="${k}"]`).classList.add('on');
      const pains = Object.keys(PAIN_STEPS).filter(p => PAIN_STEPS[p].includes(k));
      pains.forEach(p => svg.querySelector(`.v2-lane[data-p="${p}"]`).classList.add('on'));
      svg.querySelectorAll(`.v2-drop[data-k="${k}"]`).forEach(n => n.classList.add('on'));
      const r = stepRow(k) || [];
      panel(info, `Step ${k} · ${STEPS.find(x => x.k === k).name}`, [['Who', r[1] || ''], ['What happens', r[2] || ''], ['Code or judgment', r[3] || ''], ['Where it breaks', pains.map(p => p + ' ' + PAINS.find(x => x[0] === p)[1]).join(' · ') || 'none recorded']]);
    };
    const showPain = p => {
      clear(); svg.classList.add('v2-focus');
      svg.querySelector(`.v2-lane[data-p="${p}"]`).classList.add('on');
      PAIN_STEPS[p].forEach(k => { svg.querySelector(`.v2-step[data-k="${k}"]`).classList.add('on'); svg.querySelectorAll(`.v2-lane[data-p="${p}"] .v2-drop[data-k="${k}"]`).forEach(n => n.classList.add('on')); });
      const row = PAINS.find(x => x[0] === p);
      panel(info, `${p} · ${row[1]}`, [['What goes wrong', row[2]], ['Steps affected', row[3]]]);
    };
    bindClicks(svg, '.v2-step', el => showStep(el.dataset.k), clear, info);
    bindClicks(svg, '.v2-lane', el => showPain(el.dataset.p), clear, info);
  }

  /* ---------- B: where today's tools stop ---------- */
  const TOOL_LINES = [
    ['Autodesk Forma', 'ext', { '2': 1, '3b': 1, '4': 1, '5': 1, '6': 1, '9': 1 }, 'No Vancouver permit logic'],
    ['Rhino + Grasshopper', 'ext', { '2': .5, '3a': .5, '3b': .5, '3c': .5, '3d': .5, '3e': .5, '4': 1, '5': 1, '6': .5, '9': 1 }, 'Needs scripting skill; no judgment'],
    ['TestFit', 'ext', { '2': 1, '3e': .5, '4': 1, '5': .5, '6': 1, '9': 1 }, 'Vancouver zoning data unverified'],
    ['Vista', 'team', { '3a': 1, '5': .5, '6': .5 }, 'Approximate, study-only views'],
    ['Downtown Massing Tool', 'team', { '2': .5, '3e': .5, '4': .5, '6': .5 }, 'Hub link not built yet'],
    ['Program Value Visualizer', 'team', { '4': .5, '5': .5, '6': .5 }, 'Value is not feasibility'],
    ['Solar Shading Explorer', 'mate', { '3b': .5, '5': .5, '6': .5 }, 'Facade only; no City shadow test'],
  ];
  const TEAM_NOTES = {
    'Vista': ['Places a proposed tower in a 3D Vancouver and checks the City\'s protected view corridors.', 'Geometry is approximate, so it is a view study, not a compliance test.'],
    'Downtown Massing Tool': ['Loads City data for a real downtown lot and checks blocks against FSR, height and a floor-area target.', 'Its export does not feed the hub yet.'],
    'Program Value Visualizer': ['Sets the programme floor by floor and shows value minus cost, City charges and land value.', 'Early-design estimates only; not a feasibility study.'],
    'Solar Shading Explorer': ['Willem Girard\'s tool for sun angles, solar heat gain and code-compliant shading on a facade.', 'Works on one facade, not on the City\'s park-shadow test.'],
  };
  function buildB(host, info) {
    const W = 2010, x0 = 330, col = 104, top = 150, rowH = 60;
    const X = i => x0 + i * col + col / 2;
    const H = top + TOOL_LINES.length * rowH + 70;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Eight tools drawn as lines across the workflow steps they cover, each ending where it stops">`;
    STEPS.forEach((st, i) => {
      s += `<g class="v2-col" data-k="${st.k}"><image href="${P(st.icon)}" x="${X(i) - 36}" y="14" width="72" height="72" class="v2-pic"/>`;
      s += `<text class="v2-num" x="${X(i)}" y="110" text-anchor="middle">${st.k}</text><text class="v2-cap" x="${X(i)}" y="132" text-anchor="middle">${esc(st.name)}</text>`;
      s += `<line class="v2-colline" x1="${X(i)}" x2="${X(i)}" y1="${top - 6}" y2="${H - 50}"/></g>`;
    });
    // City steps nobody reaches
    const i7 = STEPS.findIndex(x => x.k === '7'), i10 = STEPS.findIndex(x => x.k === '10');
    [i7, i10].forEach(i => { s += `<rect class="v2-cityband" x="${X(i) - col / 2 + 6}" y="${top - 6}" width="${col - 12}" height="${H - top - 44}" rx="6"/>`; });
    s += `<text class="v2-cap acc" x="${X(i7)}" y="${H - 28}" text-anchor="middle">no tool reaches here</text><text class="v2-cap acc" x="${X(i10)}" y="${H - 28}" text-anchor="middle">no tool reaches here</text>`;
    let lastGroup = '';
    TOOL_LINES.forEach(([name, grp, cov, stop], r) => {
      const y = top + 20 + r * rowH;
      if (grp !== lastGroup && (grp === 'team' || grp === 'hub')) s += `<line class="v2-sep" x1="20" x2="${W - 20}" y1="${y - rowH / 2}" y2="${y - rowH / 2}"/>`;
      lastGroup = grp === 'mate' ? 'team' : grp;
      const idx = Object.keys(cov).map(k => STEPS.findIndex(x => x.k === k)).sort((a, b) => a - b);
      s += `<g class="v2-tool ${grp}" data-t="${esc(name)}" tabindex="0" role="button" aria-label="${esc(name)}: stops at ${esc(stop)}">`;
      s += `<rect class="v2-hit" x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}"/>`;
      s += `<text class="v2-toolname" x="24" y="${y + 5}">${esc(name)}</text>`;
      for (let j = 0; j < idx.length; j++) {
        const i = idx[j], v = cov[STEPS[i].k];
        s += `<circle class="${v === 1 ? 'v2-stop-full' : 'v2-stop-part'}" cx="${X(i)}" cy="${y}" r="${v === 1 ? 8 : 6}"/>`;
        if (j > 0) { const a = idx[j - 1]; const full = v === 1 && cov[STEPS[a].k] === 1; s += `<path class="${full ? 'v2-track' : 'v2-track part'}" d="M${X(a) + 9} ${y} H ${X(i) - 9}"/>`; }
      }
      const last = X(idx[idx.length - 1]);
      s += `<path class="v2-end" d="M${last + 26} ${y - 12} V ${y + 12}"/><text class="v2-stoptx" x="${last + 36}" y="${y + 5}">${esc(stop)}</text></g>`;
    });
    s += `<g transform="translate(24 ${H - 22})"><circle class="v2-stop-full" cx="8" cy="-6" r="8"/><text class="v2-cap" x="24" y="0">covers the step</text><circle class="v2-stop-part" cx="200" cy="-6" r="6.5"/><text class="v2-cap" x="216" y="0">partly, only if scripted, or planned</text><path class="v2-end" d="M540 -18 v22"/><text class="v2-cap" x="552" y="0">where it stops</text></g>`;
    s += '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg');
    const clear = () => { svg.classList.remove('v2-focus'); svg.querySelectorAll('.on').forEach(n => n.classList.remove('on')); };
    bindClicks(svg, '.v2-tool', el => {
      clear(); svg.classList.add('v2-focus'); el.classList.add('on');
      const t = el.dataset.t, row = TOOL_LINES.find(x => x[0] === t);
      Object.keys(row[2]).forEach(k => svg.querySelector(`.v2-col[data-k="${k}"]`).classList.add('on'));
      const ext = EXT.find(e => e[0].startsWith(t.split(' ')[0]));
      if (ext) panel(info, t, [['Does', ext[1]], ['How it is used', ext[2]], ['Does well', ext[3]], ['Where it stops', ext[4]]], 'Functions are vendor claims, checked against vendor documentation.');
      else { const n = TEAM_NOTES[t] || ['', '']; panel(info, t, [['Does', n[0]], ['Where it stops', n[1]]]); }
    }, clear, info);
  }

  /* ---------- C: how the workbench runs (cycle) ---------- */
  const CYCLE = [
    ['You state what to test', 'you', 'icon-intent', 'Plain words, for example "check option B against the views and the 9.0 FSR rule". You own the brief and every decision gate.'],
    ['AI turns it into a request', 'ai', 'icon-ai', 'The model fills a fixed form: which option, which checks, which basis. It never touches geometry.'],
    ['Input check', 'code', 'icon-check', 'Code checks units, coordinate frame, source dates and the form. If anything is missing it stops and says CANNOT DETERMINE.'],
    ['Router picks the tools', 'code', 'icon-router', 'A script, not the model, decides which tool runs next.'],
    ['Tools run', 'tool', 'icon-tools', 'Vista, the Downtown Massing Tool, the Program Value Visualizer and others run on the same project file.'],
    ['Engine recomputes', 'tool', 'icon-engine', 'Areas, heights and FSR are recomputed from the geometry with one written area rule.'],
    ['Result check', 'code', 'icon-check', 'Code compares results with the inputs. A failed result goes back to the AI for a permitted revision, at most three times.'],
    ['AI drafts the explanation', 'ai', 'icon-ai', 'The model explains the comparison in plain words, citing every number.'],
    ['Citation check', 'code', 'icon-check', 'Every number must point to its source and basis, and there is no compliance verdict. Otherwise the draft goes back, at most three times.'],
    ['You compare and decide', 'you', 'step-compare', 'You pick an option, freeze it or reframe the brief, and the reason is written into the project file.'],
  ];
  function buildC(host, info) {
    const W = 1240, H = 820, cx = 620, cy = 400, R = 300, ic = 92;
    const pos = i => { const a = -Math.PI / 2 + i * 2 * Math.PI / CYCLE.length; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.86, a]; };
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The workbench as a cycle of ten steps around one project file, with limited reject loops and a stop">`;
    s += `<defs><marker id="v2arrC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="v2-ink-f"/></marker><marker id="v2arrCA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="v2-acc-f"/></marker></defs>`;
    // ring arrows
    for (let i = 0; i < CYCLE.length; i++) {
      const [x1, y1] = pos(i), [x2, y2] = pos((i + 1) % CYCLE.length);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ox = (mx - cx) * 0.16, oy = (my - cy) * 0.16;
      const sx = x1 + (x2 - x1) * 0.24, sy = y1 + (y2 - y1) * 0.24, ex = x1 + (x2 - x1) * 0.76, ey = y1 + (y2 - y1) * 0.76;
      s += `<path class="${i === CYCLE.length - 1 ? 'v2-loop' : 'v2-ring'}" d="M${sx} ${sy} Q ${mx + ox} ${my + oy} ${ex} ${ey}" marker-end="url(#${i === CYCLE.length - 1 ? 'v2arrCA' : 'v2arrC'})"/>`;
    }
    // reject loops inside the ring
    const chord = (a, b, label) => { const [x1, y1] = pos(a), [x2, y2] = pos(b); const qx = cx + (x1 + x2 - 2 * cx) * 0.18, qy = cy + (y1 + y2 - 2 * cy) * 0.18; s += `<path class="v2-loop" d="M${x1 + (cx - x1) * 0.22} ${y1 + (cy - y1) * 0.22} Q ${qx} ${qy} ${x2 + (cx - x2) * 0.22} ${y2 + (cy - y2) * 0.22}" marker-end="url(#v2arrCA)"/><text class="v2-cap acc" x="${qx}" y="${qy - 6}" text-anchor="middle">${esc(label)}</text>`; };
    // loop-back badges on the two checks (inside the ring, toward the centre)
    const badge = (i, line1, line2) => {
      const [x, y] = pos(i), dx = cx - x, dy = cy - y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const bx = x + ux * (ic / 2 + 40), by = y + uy * (ic / 2 + 40), r = 16;
      s += `<path class="v2-loop" d="M${bx + r} ${by} A ${r} ${r} 0 1 1 ${bx} ${by - r}" marker-end="url(#v2arrCA)"/>`;
      const anchor = ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'middle', tx = bx + ux * 28, ty = by + uy * 20;
      s += `<text class="v2-cap acc" x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(line1)}</text><text class="v2-cap" x="${tx}" y="${ty + 17}" text-anchor="${anchor}">${esc(line2)}</text>`;
    };
    badge(6, 'fails: back to the AI', 'max 3 rounds');
    badge(8, 'uncited: redraft', 'max 3 rounds');
    // centre: project file + stop
    s += `<circle class="v2-hub" cx="${cx}" cy="${cy - 34}" r="76"/><image href="${P('icon-file')}" x="${cx - 36}" y="${cy - 96}" width="72" height="72" class="v2-pic"/><text class="v2-hubt" x="${cx}" y="${cy - 2}" text-anchor="middle">One project file</text><text class="v2-cap" x="${cx}" y="${cy + 15}" text-anchor="middle">units, sources, decisions</text>`;
    const sx = cx + 92, sy = cy + 30;
    s += `<g class="v2-stopg"><image href="${P('icon-stop')}" x="${sx - 26}" y="${sy}" width="52" height="52" class="v2-pic"/><text class="v2-cap acc" x="${sx}" y="${sy + 70}" text-anchor="middle">input missing or</text><text class="v2-cap acc" x="${sx}" y="${sy + 86}" text-anchor="middle">3 rounds fail: stop</text><text class="v2-num" x="${sx}" y="${sy + 106}" text-anchor="middle">CANNOT DETERMINE</text></g>`;
    CYCLE.forEach(([t, who], i) => {
      const [x, y] = pos(i);
      s += `<g class="v2-cnode ${who}" data-i="${i}" tabindex="0" role="button" aria-label="${i + 1}. ${esc(t)}">`;
      s += `<circle class="v2-cbg" cx="${x}" cy="${y}" r="${ic / 2 + 8}"/><image href="${P(CYCLE[i][2])}" x="${x - ic / 2}" y="${y - ic / 2}" width="${ic}" height="${ic}" class="v2-pic"/>`;
      const [, , a] = pos(i), ux = Math.cos(a), uy = Math.sin(a), d = ic / 2 + 18;
      const lx = x + ux * d, ly = y + uy * d * 0.9 + (uy > 0.3 ? 18 : uy < -0.3 ? -18 : -6);
      const anchor = ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle';
      s += `<text class="v2-num" x="${lx}" y="${ly}" text-anchor="${anchor}">${String(i + 1).padStart(2, '0')}</text><text class="v2-lab ${who}" x="${lx}" y="${ly + 18}" text-anchor="${anchor}">${esc(t)}</text></g>`;
    });
    s += `<g transform="translate(24 ${H - 20})"><circle class="v2-cbg you" cx="6" cy="-5" r="7"/><text class="v2-cap" x="18" y="0">you decide</text><circle class="v2-cbg ai" cx="110" cy="-5" r="7"/><text class="v2-cap" x="122" y="0">AI writes words</text><circle class="v2-cbg code" cx="236" cy="-5" r="7"/><text class="v2-cap" x="248" y="0">code checks</text><circle class="v2-cbg tool" cx="350" cy="-5" r="7"/><text class="v2-cap" x="362" y="0">tools compute</text></g>`;
    s += '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg');
    const clear = () => { svg.classList.remove('v2-focus'); svg.querySelectorAll('.on').forEach(n => n.classList.remove('on')); };
    const role = { you: 'You (a person)', ai: 'The AI', code: 'Code (a hook in the harness)', tool: 'Tools and engine' };
    bindClicks(svg, '.v2-cnode', el => {
      clear(); svg.classList.add('v2-focus'); el.classList.add('on');
      const c = CYCLE[+el.dataset.i]; panel(info, `${+el.dataset.i + 1}. ${c[0]}`, [['Who does it', role[c[1]]], ['What happens', c[3]]]);
    }, clear, info);
  }

  /* ---------- D: who does what (the hand-offs between people, AI, code and tools) ---------- */
  const ROLES_D = {
    you: { name: 'People decide', role: 'you', icon: 'step-compare', x: 250, y: 300, r: 62, ic: 104, list: ['What the brief is and what matters', 'Which option goes forward', 'What is frozen and submitted'] },
    ai: { name: 'AI can', role: 'ai', icon: 'ai', x: 760, y: 130, r: 62, ic: 104, list: ['Turn what you ask into a structured request', 'Propose a revision within allowed limits', 'Draft an explanation with its sources'] },
    code: { name: 'Code checks', role: 'code', icon: 'check', x: 760, y: 470, r: 62, ic: 104, list: ['Units, coordinate frame, source date', 'Geometry and arithmetic, recomputed', 'Every number has a citation, or it stops'] },
    tool: { name: 'Tools compute', role: 'tool', icon: 'icon-tools', x: 1060, y: 470, r: 50, ic: 84, list: ['Vista, the Downtown Massing Tool, the Program Value Visualizer and others run on the same project file'] },
  };
  // bend: how far the curve's middle sits to the left of its direction of travel (negative = right)
  // at: each label's position, measured in the browser so it clears every line, node, gate and other label (23 Oct 2026)
  const EDGES_D = [
    { k: 'rules', a: 'you', b: 'code', bend: 38, at: [424, 300, 'start'], t: 'Brief, rules and thresholds', carries: 'What matters, and which rules and thresholds the code enforces. The architect changes the rules; the AI never does.' },
    { k: 'ask', a: 'you', b: 'ai', bend: 70, at: [471, 118, 'end'], t: 'What to test, in plain words', carries: 'For example, "check option B against the views and the 9.0 FSR rule".' },
    { k: 'request', a: 'ai', b: 'code', bend: -46, at: [698, 222, 'end'], t: 'Request, revision or draft', carries: 'A fixed form: which option, which checks, which basis. Later, a permitted revision or a drafted explanation. The AI never touches geometry.' },
    { k: 'back', a: 'code', b: 'ai', bend: -46, at: [834, 305, 'start'], t: 'Fails a check: revise', t2: 'at most 3 rounds, then stop', loop: true, carries: 'A failed result or an uncited number goes back to the AI for a permitted revision, at most three times. Then the run stops.' },
    { k: 'run', a: 'code', b: 'tool', bend: 30, at: [910, 412, 'middle'], t: 'Router runs the tools', carries: 'A script, not the model, decides which tool runs next.' },
    { k: 'results', a: 'tool', b: 'code', bend: 30, at: [910, 538, 'middle'], t: 'Results, recomputed', carries: 'Areas, heights and FSR are recomputed from the geometry with one written area rule.' },
    { k: 'report', a: 'code', b: 'you', bend: 92, at: [475, 524, 'end'], off: 40, t: 'Checked and cited, no verdict', t2: 'or CANNOT DETERMINE', carries: 'Only results that passed the checks reach you, each number with its source and basis. If an input is missing, it says CANNOT DETERMINE instead of guessing.' },
  ];
  const NEVER_D = ['confer compliance', 'refresh City policy', 'supply a survey', 'repair a lost file', 'settle values', 'replace City discretion'];
  const STEPS_D = [
    [['e:rules', 'n:you', 'n:code'], 'You set the brief and the rules', 'People decide what the brief is, what matters, and which rules and thresholds the code applies.'],
    [['e:ask', 'n:you', 'n:ai'], 'You say what to test', 'Plain words, for example "check option B against the views and the 9.0 FSR rule".'],
    [['e:request', 'n:ai', 'n:code'], 'The AI fills in a request', 'A fixed form: which option, which checks, which basis. It never touches geometry.'],
    [['n:code'], 'Code checks the input', 'Units, coordinate frame, source dates and the form. If anything is missing it stops and says CANNOT DETERMINE.'],
    [['e:run', 'n:code', 'n:tool'], 'The router runs the tools', 'A script, not the model, decides which tool runs next.'],
    [['e:results', 'n:tool', 'n:code'], 'Results come back, recomputed', 'Areas, heights and FSR are recomputed from the geometry with one written area rule.'],
    [['e:back', 'n:code', 'n:ai'], 'A failed check goes back', 'A failed result returns to the AI for a permitted revision, at most three times. Then the run stops.'],
    [['e:request', 'n:ai', 'n:code'], 'The AI drafts the explanation', 'In plain words, citing every number. Code checks each citation, and there is no compliance verdict.'],
    [['e:report', 'n:code', 'n:you'], 'You get a checked comparison', 'Every number with its source and basis, or CANNOT DETERMINE with what is missing.'],
    [['g:*', 'n:you'], 'You decide', 'Compare, choose, freeze and submit. The seven gates stay with people, and the City decides.'],
  ];
  function buildD(host, info) {
    const W = 1240, H = 752, R = ROLES_D;
    const unit = (x, y) => { const L = Math.hypot(x, y) || 1; return [x / L, y / L]; };
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Who does what: you set the rules and decide, the AI turns your words into requests and drafts, code checks every hand-off and runs the tools, and only checked, cited results come back to you. Seven decisions stay with people, and six things the AI never does.">`;
    s += `<defs><marker id="v2arrD" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="v2-ink-f"/></marker><marker id="v2arrDA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="v2-acc-f"/></marker></defs>`;
    // hand-off arrows
    EDGES_D.forEach(e => {
      const A = R[e.a], B = R[e.b], [dx, dy] = unit(B.x - A.x, B.y - A.y), nx = dy, ny = -dx;
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, cx = mx + nx * e.bend * 2, cy = my + ny * e.bend * 2;
      const [ux, uy] = unit(cx - A.x, cy - A.y), [vx, vy] = unit(cx - B.x, cy - B.y);
      const sx = A.x + ux * (A.r + 10), sy = A.y + uy * (A.r + 10), ex = B.x + vx * (B.r + 14), ey = B.y + vy * (B.r + 14);
      const px = mx + nx * e.bend, py = my + ny * e.bend, sgn = Math.sign(e.bend) || 1, ox = nx * sgn, oy = ny * sgn;
      const off = e.off || 24;                                       // labels sit outside the bow, clear of the line
      let lx = px + ox * off, ly = py + oy * off + (oy > 0.3 ? 14 : oy < -0.3 ? -4 : 5);
      let anchor = ox > 0.3 ? 'start' : ox < -0.3 ? 'end' : 'middle';
      if (e.at) [lx, ly, anchor] = e.at;
      const d = `M${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      s += `<g class="v2-dedge-g" data-k="e:${e.k}" tabindex="0" role="button" aria-label="${esc(R[e.a].name)} to ${esc(R[e.b].name)}: ${esc(e.t)}">`;
      s += `<path class="v2-hitline" d="${d}"/><path class="${e.loop ? 'v2-loop' : 'v2-dedge'}" d="${d}" marker-end="url(#${e.loop ? 'v2arrDA' : 'v2arrD'})"/>`;
      s += `<text class="v2-elab${e.loop ? ' acc' : ''}" x="${lx}" y="${ly}" text-anchor="${anchor}">${esc(e.t)}</text>`;
      if (e.t2) s += `<text class="v2-elab2${e.loop ? ' acc' : ''}" x="${lx}" y="${ly + 18}" text-anchor="${anchor}">${esc(e.t2)}</text>`;
      s += '</g>';
    });
    // what the AI never does: a fence beside the AI
    const fx = 890, fy = 44;
    s += `<g class="v2-nogo-g" data-k="nogo" tabindex="0" role="button" aria-label="The AI cannot: ${esc(NEVER_D.join(', '))}">`;
    s += `<path class="v2-never" d="M${R.ai.x + R.ai.r + 10} ${R.ai.y} H ${fx - 6}"/><text class="v2-elab2 nope" x="${(R.ai.x + R.ai.r + fx) / 2 + 2}" y="${R.ai.y - 8}" text-anchor="middle">never</text>`;
    s += `<rect class="v2-fence" x="${fx}" y="${fy}" width="340" height="168" rx="14"/><text class="v2-lab nope" x="${fx + 18}" y="${fy + 30}">AI cannot</text>`;
    // chip widths per row, sized to the words so every row fills the box evenly
    const CW = [[151, 149], [151, 149], [117, 183]];
    NEVER_D.forEach((n, i) => { const r = Math.floor(i / 2), c = i % 2, w = CW[r][c], x = fx + 16 + (c ? CW[r][0] + 8 : 0), y = fy + 46 + r * 38; s += `<rect class="v2-nope" x="${x}" y="${y}" width="${w}" height="28" rx="14"/><text class="v2-cap nope" x="${x + w / 2}" y="${y + 19}" text-anchor="middle">${esc(n)}</text>`; });
    s += '</g>';
    // the roles
    for (const [k, n] of Object.entries(R)) {
      s += `<g class="v2-dnode v2-cnode ${n.role}" data-k="n:${k}" tabindex="0" role="button" aria-label="${esc(n.name)}">`;
      const isoIcon = window.ISO_ICONS && window.ISO_ICONS[n.icon];   // the drawn pictograms, shared with chapter 4
      s += `<circle class="v2-cbg" cx="${n.x}" cy="${n.y}" r="${n.r}"/>` + (isoIcon ? `<use href="#iso-${n.icon}" x="${n.x - n.ic * 0.6}" y="${n.y - n.ic * 0.6}" width="${n.ic * 1.2}" height="${n.ic * 1.2}"/>` : `<image href="${P(n.icon)}" x="${n.x - n.ic / 2}" y="${n.y - n.ic / 2}" width="${n.ic}" height="${n.ic}" class="v2-pic"/>`);
      const lab = k === 'you' ? [n.x - n.r - 16, n.y + 6, 'end'] : k === 'ai' ? [n.x, n.y - n.r - 16, 'middle'] : [n.x, n.y + n.r + 28, 'middle'];
      s += `<text class="v2-lab ${n.role}" x="${lab[0]}" y="${lab[1]}" text-anchor="${lab[2]}">${esc(n.name)}</text></g>`;
    }
    // seven decisions that stay with people
    const gy = 640, gx0 = 40, gw = 106, gap = 8, gates = typeof GATES !== 'undefined' ? GATES : [];
    s += `<path class="v2-ring" d="M${R.you.x} ${R.you.y + R.you.r + 10} V ${gy - 34}"/><text class="v2-lab you" x="${gx0}" y="${gy - 14}">Seven decisions that stay with people</text>`;
    gates.forEach(([g, name], i) => {
      const x = gx0 + i * (gw + gap);
      s += `<g class="v2-gate" data-k="g:${g}" tabindex="0" role="button" aria-label="${g}: ${esc(name)}"><rect x="${x}" y="${gy}" width="${gw}" height="50" rx="10"/><text class="v2-num" x="${x + gw / 2}" y="${gy + 21}" text-anchor="middle">${g}</text><text class="v2-cap" x="${x + gw / 2}" y="${gy + 40}" text-anchor="middle">${esc(name)}</text></g>`;
    });
    s += `<g transform="translate(812 ${H - 14})"><circle class="v2-cbg you" cx="6" cy="-5" r="7"/><text class="v2-cap" x="18" y="0">you decide</text><circle class="v2-cbg ai" cx="112" cy="-5" r="7"/><text class="v2-cap" x="124" y="0">AI writes words</text><circle class="v2-cbg code" cx="242" cy="-5" r="7"/><text class="v2-cap" x="254" y="0">code checks</text><circle class="v2-cbg tool" cx="350" cy="-5" r="7"/><text class="v2-cap" x="362" y="0">tools</text></g>`;
    s += '</svg>';
    host.innerHTML = s;
    const svg = host.querySelector('svg');
    const play = document.getElementById('v2Dplay'), count = document.getElementById('v2Dcount'), playT = play && play.querySelector('span');
    let step = -1;
    const resetPlay = () => { step = -1; if (playT) playT.textContent = 'Follow one request'; if (count) count.textContent = count.dataset.hint || ''; };
    const clear = () => { svg.classList.remove('v2-focus'); svg.querySelectorAll('.on').forEach(n => n.classList.remove('on')); };
    const light = keys => { clear(); svg.classList.add('v2-focus'); keys.forEach(k => (k === 'g:*' ? svg.querySelectorAll('.v2-gate') : svg.querySelectorAll(`[data-k="${k}"]`)).forEach(n => n.classList.add('on'))); };
    const edgesOf = k => EDGES_D.filter(e => e.a === k || e.b === k);
    bindClicks(svg, '.v2-dnode, .v2-dedge-g, .v2-gate, .v2-nogo-g', el => {
      resetPlay();
      const key = el.dataset.k;
      if (key.startsWith('n:')) {
        const k = key.slice(2), n = R[k];
        light([key, ...edgesOf(k).map(e => 'e:' + e.k), ...edgesOf(k).map(e => 'n:' + (e.a === k ? e.b : e.a))]);
        panel(info, n.name, [[k === 'tool' ? 'What runs' : k === 'you' ? 'Decides' : k === 'ai' ? 'Can' : 'Checks', n.list.join(' · ')],
          ['Sends', edgesOf(k).filter(e => e.a === k).map(e => `${e.t} (to ${R[e.b].name.split(' ')[0].toLowerCase()})`).join(' · ')],
          ['Receives', edgesOf(k).filter(e => e.b === k).map(e => `${e.t} (from ${R[e.a].name.split(' ')[0].toLowerCase()})`).join(' · ')]]);
      } else if (key.startsWith('e:')) {
        const e = EDGES_D.find(x => 'e:' + x.k === key);
        light([key, 'n:' + e.a, 'n:' + e.b]);
        panel(info, e.t + (e.t2 ? ', ' + e.t2 : ''), [['From', R[e.a].name], ['To', R[e.b].name], ['What it carries', e.carries]]);
      } else if (key.startsWith('g:')) {
        const g = gates.find(x => 'g:' + x[0] === key);
        light([key, 'n:you']);
        panel(info, `${g[0]} · ${g[1]}`, [['Who', 'People, never the AI'], ['What happens', g[2]]]);
      } else {
        light(['nogo', 'n:ai']);
        panel(info, 'AI cannot', [['Never', NEVER_D.join(' · ')]], 'These stay with people, with specialists and with the City.');
      }
    }, () => { clear(); resetPlay(); }, info);
    if (play) {
      if (count) count.dataset.hint = count.textContent;
      play.addEventListener('click', () => {
        step = (step + 1) % STEPS_D.length;
        const [keys, title, text] = STEPS_D[step];
        light(keys); panel(info, `${step + 1}. ${title}`, [['What happens', text]]);
        if (playT) playT.textContent = step === STEPS_D.length - 1 ? 'Start again' : 'Next hand-off';
        if (count) count.textContent = `${step + 1} of ${STEPS_D.length}`;
      });
    }
  }

  function bindClicks(svg, sel, fn, clear, info) {
    svg.querySelectorAll(sel).forEach(el => {
      const go = e => { if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault(); if (el.classList.contains('on') && svg.classList.contains('v2-focus') && e.type !== 'mouseenter') { clear(); info.dataset.empty = '1'; info.replaceChildren(info._hint.cloneNode(true)); return; } fn(el); };
      el.addEventListener('click', go); el.addEventListener('keydown', go);
    });
  }

  window.buildResearchDiagrams = function () {
    for (const [id, fn] of [['v2A', buildA], ['v2B', buildB], ['v2C', buildC], ['v2D', buildD]]) {
      const host = document.getElementById(id), info = document.getElementById(id + 'info');
      if (!host || !info) continue;
      info._hint = info.firstElementChild ? info.firstElementChild.cloneNode(true) : document.createElement('span');
      try { fn(host, info); } catch (e) { host.textContent = 'Diagram could not be drawn.'; }
    }
  };
})();
