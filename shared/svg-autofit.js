/* ▭▭ agentlens svg-autofit ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭
   Drop-in: <script defer src="../shared/svg-autofit.js"></script>
   Loaded AFTER viz-utils.js. Watches every <svg> and fits each <text> to the
   shape it sits inside via wrap + font-shrink. When a single shape contains
   multiple labels (e.g. a title + sub-label), the box is split vertically so
   they don't collide. Free-floating overlapping labels get nudged apart.
   Zero D3 changes required. New SVGs auto-fit via MutationObserver.
   Mark a text with data-autofit="off" to skip.
   ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭ */
(function () {
  'use strict';

  const PAD = 4;
  const MIN_FONT = 7;
  const COLLISION_PAD = 2;
  const COLLISION_ITERS = 6;
  const DEBOUNCE_MS = 60;
  const SVGNS = 'http://www.w3.org/2000/svg';

  // ▭▭ in-context measurement (matches font/CSS resolution exactly) ▭▭▭▭▭
  function measureWidth(str, fs, refTextEl) {
    if (!str) return 0;
    const ts = document.createElementNS(SVGNS, 'tspan');
    ts.setAttribute('font-size', fs);
    ts.setAttribute('visibility', 'hidden');
    ts.textContent = str;
    refTextEl.appendChild(ts);
    let w = 0;
    try { w = ts.getComputedTextLength(); } catch (_) { w = 0; }
    refTextEl.removeChild(ts);
    return w;
  }
  function safeBBox(el) {
    try { return el.getBBox(); } catch (_) { return { x:0,y:0,width:0,height:0 }; }
  }

  // ▭▭ shape-aware usable box (diamonds & ellipses are narrower at edges) ▭
  function getFitBox(shape) {
    const bb = safeBBox(shape);
    const tag = shape.nodeName;
    if (tag === 'circle' || tag === 'ellipse') {
      const w = bb.width * 0.707, h = bb.height * 0.707;   // inscribed rect
      return { x: bb.x + (bb.width - w)/2, y: bb.y + (bb.height - h)/2,
               width: w, height: h };
    }
    if (tag === 'polygon') {
      const w = bb.width * 0.75, h = bb.height * 0.75;    // hex/diamond safe zone
      return { x: bb.x + (bb.width - w)/2, y: bb.y + (bb.height - h)/2,
               width: w, height: h };
    }
    return bb;   // rect / path: use full bbox
  }

  // ▭▭ greedy wrap into <tspan> lines, vertically centered ▭▭▭▭▭▭▭▭▭▭▭▭▭▭
  function wrap(textEl, raw, maxW, fs) {
    const paragraphs = raw.split('\n');
    const lines = [];
    for (const p of paragraphs) {
      const words = p.split(/\s+/).filter(Boolean);
      if (!words.length) continue;
      let cur = '';
      for (const w of words) {
        const test = cur ? cur + ' ' + w : w;
        if (measureWidth(test, fs, textEl) <= maxW || !cur) cur = test;
        else { lines.push(cur); cur = w; }
      }
      if (cur) lines.push(cur);
    }
    if (!lines.length) lines.push(raw);

    const x = textEl.getAttribute('x') || 0;
    const lineHeight = 1.1;
    const startDy = -((lines.length - 1) / 2) * lineHeight;

    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
    lines.forEach((ln, i) => {
      const ts = document.createElementNS(SVGNS, 'tspan');
      ts.setAttribute('x', x);
      ts.setAttribute('dy', (i === 0 ? startDy : lineHeight) + 'em');
      ts.textContent = ln;
      textEl.appendChild(ts);
    });
    return lines.length;
  }

  // ▭▭ count wrapped lines + widest single word at a candidate font size ▭▭
  function countLines(raw, maxW, fs, refTextEl) {
    const paragraphs = raw.split('\n');
    let lines = 0, widest = 0;
    for (const p of paragraphs) {
      const words = p.split(/\s+/).filter(Boolean);
      if (!words.length) continue;
      let cur = '';
      for (const w of words) {
        const wAlone = measureWidth(w, fs, refTextEl);
        if (wAlone > widest) widest = wAlone;
        const test = cur ? cur + ' ' + w : w;
        if (measureWidth(test, fs, refTextEl) <= maxW || !cur) cur = test;
        else { lines++; cur = w; }
      }
      if (cur) lines++;
    }
    return { lines: Math.max(1, lines), widest };
  }

  // ▭▭ fit one <text> into one box (bbox-shaped allotment) ▭▭▭▭▭▭▭▭▭▭▭▭▭▭
  function fitTextToBox(textEl, bb) {
    const maxW = Math.max(0, bb.width  - PAD * 2);
    const maxH = Math.max(0, bb.height - PAD * 2);
    if (maxW <= 0 || maxH <= 0) return;

    let raw = textEl.dataset.autofitRaw;
    if (raw === undefined) {
      raw = (textEl.textContent || '').trim();
      textEl.dataset.autofitRaw = raw;
    }
    if (!raw) return;

    const sig = raw + '|' + Math.round(maxW) + '|' + Math.round(maxH);
    if (textEl.dataset.autofitSig === sig) return;

    let startFont = parseFloat(textEl.dataset.autofitOrigFont);
    if (!startFont) {
      startFont = parseFloat(textEl.getAttribute('font-size') ||
                              window.getComputedStyle(textEl).fontSize) || 13;
      textEl.dataset.autofitOrigFont = startFont;
    }

    function fits(fs) {
      const r = countLines(raw, maxW, fs, textEl);
      if (r.widest > maxW) return false;       // single word too wide
      return r.lines * fs * 1.1 <= maxH;
    }

    let best = MIN_FONT;
    if (fits(startFont)) {
      best = startFont;
    } else {
      let lo = MIN_FONT, hi = startFont;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) { best = mid; lo = mid; } else { hi = mid; }
        if (hi - lo < 0.25) break;
      }
    }

    textEl.setAttribute('font-size', best);
    wrap(textEl, raw, maxW, best);
    textEl.dataset.autofitSig = sig;
    textEl.dataset.autofitFitted = '1';
  }

  // ▭▭ pair a <text> with the shape it sits inside ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭
  function findShapeForText(textEl) {
    const explicit = textEl.getAttribute('data-fit-to');
    if (explicit) {
      const node = textEl.ownerDocument.querySelector(explicit);
      if (node) return node;
    }
    const parent = textEl.parentNode;
    if (!parent || parent.nodeName !== 'g') return null;

    const tx = parseFloat(textEl.getAttribute('x')) || 0;
    const ty = parseFloat(textEl.getAttribute('y')) || 0;
    let best = null, bestArea = Infinity;
    for (const sib of parent.children) {
      if (sib === textEl) continue;
      if (!/^(rect|circle|ellipse|polygon|path)$/.test(sib.nodeName)) continue;
      const bb = safeBBox(sib);
      if (bb.width === 0 || bb.height === 0) continue;
      if (tx < bb.x - 1 || tx > bb.x + bb.width + 1) continue;
      if (ty < bb.y - 1 || ty > bb.y + bb.height + 1) continue;
      const area = bb.width * bb.height;
      if (area < bestArea) { bestArea = area; best = sib; }
    }
    return best;
  }

  // ▭▭ push overlapping free-floating labels apart vertically ▭▭▭▭▭▭▭▭▭▭▭
  function overlap(a, b) {
    return !(a.x + a.width < b.x || b.x + b.width < a.x ||
             a.y + a.height < b.y || b.y + b.height < a.y);
  }
  function shiftY(el, dy) {
    el.setAttribute('y', (parseFloat(el.getAttribute('y')) || 0) + dy);
  }
  function resolveCollisions(svg) {
    const items = Array.from(svg.querySelectorAll('text'))
      .filter(t => !t.dataset.autofitFitted && t.getAttribute('data-autofit') !== 'off')
      .map(t => ({ el: t, bb: safeBBox(t) }))
      .filter(o => o.bb.width > 0);
    for (let it = 0; it < COLLISION_ITERS; it++) {
      let moved = false;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const A = items[i], B = items[j];
          if (!overlap(A.bb, B.bb)) continue;
          const push = ((A.bb.height + B.bb.height) / 2 + COLLISION_PAD
                     - Math.abs((A.bb.y + A.bb.height/2) - (B.bb.y + B.bb.height/2))) / 2;
          const sign = (A.bb.y < B.bb.y) ? -1 : 1;
          shiftY(A.el,  sign * push);
          shiftY(B.el, -sign * push);
          A.bb = safeBBox(A.el); B.bb = safeBBox(B.el);
          moved = true;
        }
      }
      if (!moved) break;
    }
  }

  // ▭▭ process one SVG ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭
  function autofitSvg(svg) {
    if (!svg || svg.dataset.autofitDisabled === 'true') return;

    // group texts by the shape they sit inside (so multiple labels in
    // one rect can share the box vertically instead of fighting for it)
    const shapeMap = new Map();   // shape -> [text, ...]
    svg.querySelectorAll('text').forEach(t => {
      if (t.getAttribute('data-autofit') === 'off') return;
      const shape = findShapeForText(t);
      if (!shape) return;
      // Skip texts inside circles (hexagons/nodes) — they're positioned explicitly
      if (shape.nodeName === 'circle') return;
      if (!shapeMap.has(shape)) shapeMap.set(shape, []);
      shapeMap.get(shape).push(t);
    });

    for (const [shape, texts] of shapeMap) {
      const bb = getFitBox(shape);
      if (texts.length === 1) { fitTextToBox(texts[0], bb); continue; }

      // sort by current y, partition the box into N horizontal slices
      texts.sort((a, b) => (parseFloat(a.getAttribute('y')) || 0) -
                            (parseFloat(b.getAttribute('y')) || 0));
      const sliceH = bb.height / texts.length;
      texts.forEach((t, i) => {
        const slice = { x: bb.x, y: bb.y + i * sliceH,
                         width: bb.width, height: sliceH };
        // re-anchor text to slice center; clear sig so re-fit runs
        t.setAttribute('y', slice.y + sliceH / 2);
        delete t.dataset.autofitSig;
        fitTextToBox(t, slice);
      });
    }

    resolveCollisions(svg);
  }

  // ▭▭ debounced observer ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭
  const pending = new WeakMap();
  function schedule(svg) {
    if (pending.has(svg)) return;
    pending.set(svg, setTimeout(() => {
      pending.delete(svg); autofitSvg(svg);
    }, DEBOUNCE_MS));
  }
  function watch(svg) {
    if (svg.dataset.autofitWatched === '1') return;
    svg.dataset.autofitWatched = '1';
    schedule(svg);
    new MutationObserver(() => schedule(svg)).observe(svg, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['x','y','width','height','d','points','r','rx','ry','font-size']
    });
  }
  function watchAll() { document.querySelectorAll('svg').forEach(watch); }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', watchAll);
  else watchAll();

  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.nodeName === 'svg') watch(n);
      else if (n.querySelectorAll) n.querySelectorAll('svg').forEach(watch);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', () => {
    document.querySelectorAll('svg[data-autofit-watched="1"]').forEach(svg => {
      svg.querySelectorAll('text').forEach(t => delete t.dataset.autofitSig);
      schedule(svg);
    });
  });

  window.SvgAutofit = { run: autofitSvg, runAll: watchAll };
})();
