# D3 to Alternative Tools — Migration Guide
**Purpose:** Document D3 patterns for easy migration to better tools (Konva, Canvas, SVG.js)  
**Current Status:** Phase 2 in progress

---

## Current D3 Architecture

### Core Pattern
All pages follow this structure:
```javascript
// 1. Select SVG (560x560 fixed space)
const svg = d3.select('#main-svg');
const {w, h} = getSize(svg.node()); // Always 560x560
const g = svg.append('g');

// 2. Create nodes (circles, rects, diamonds)
hexN(g, x, y, r, color, label, sublabel);
rectN(g, x, y, width, height, color, label, sublabel);
diamondN(g, x, y, size, color, label);

// 3. Add labels
lbl(g, x, y, text, color, fontSize);

// 4. Connect with edges
edgeLine(g, x1, y1, x2, y2, color);
arcPath(g, x1, y1, x2, y2, color);

// 5. Animate packets
pkt(g, x1, y1, x2, y2, color, duration);
```

### Key Functions to Replicate
| Function | Purpose | D3 Pattern | Migration |
|----------|---------|-----------|-----------|
| `hexN()` | Circle node | SVG circle + text | Canvas arc + text |
| `rectN()` | Rectangle node | SVG rect + tspan | Canvas rect + wrapped text |
| `diamondN()` | Diamond node | SVG rotated rect | Canvas rotated shape |
| `lbl()` | Floating label | SVG text with tspan | Canvas text |
| `edgeLine()` | Straight edge | SVG line | Canvas line |
| `arcPath()` | Curved edge | SVG path (quadratic) | Canvas quadratic curve |
| `pkt()` | Animated packet | SVG circle with transition | Canvas requestAnimationFrame |
| `renderScene()` | Declarative renderer | D3 data binding | Custom loop with data array |

---

## D3-Specific Code Patterns to Replace

### 1. Text Rendering (Most Complex)
**Current D3:**
```javascript
function createMultilineText(textEl, text, color, fontSize) {
  const lines = text.split('\n');
  textEl.attr('fill', color).attr('font-size', fontSize)
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'central');
  
  lines.forEach((line, i) => {
    const dy = i === 0 ? 0 : lineHeight;
    textEl.append('tspan')
      .attr('x', 0).attr('dy', `${dy}em`).text(line);
  });
}
```

**Konva equivalent:**
```javascript
const text = new Konva.Text({
  x: x, y: y,
  text: 'line1\nline2',
  fontSize: fontSize,
  fill: color,
  align: 'center',
  verticalAlign: 'middle'
});
```

**Canvas equivalent:**
```javascript
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillStyle = color;
ctx.font = `${fontSize}px Courier New`;
text.split('\n').forEach((line, i) => {
  ctx.fillText(line, x, y + (i - 0.5) * fontSize * 1.3);
});
```

### 2. Node Creation
**Current D3:**
```javascript
function hexN(p, x, y, r, color, txt, sub) {
  const g = p.append('g');
  g.append('circle').attr('cx', x).attr('cy', y).attr('r', r)
    .attr('fill', color + '22').attr('stroke', color);
  g.append('text').attr('x', x).attr('y', y)
    .text(txt);
}
```

**Konva equivalent:**
```javascript
const circle = new Konva.Circle({x, y, radius: r, fill: color + '22', stroke: color});
const text = new Konva.Text({x, y, text: txt, fill: color, align: 'center'});
group.add(circle, text);
```

### 3. Animations & Transitions
**Current D3:**
```javascript
circle.transition().delay(delay).duration(400)
  .style('opacity', 1)
  .attr('r', newR);
```

**Konva equivalent:**
```javascript
circle.to({
  opacity: 1,
  radius: newR,
  duration: 0.4,
  delay: delay / 1000,
  easing: Konva.Easings.Linear
});
```

**Canvas equivalent:**
```javascript
const startTime = Date.now() + delay;
function animate() {
  const elapsed = Math.max(0, Date.now() - startTime);
  const progress = Math.min(1, elapsed / 400);
  circle.opacity = progress;
  if (progress < 1) requestAnimationFrame(animate);
}
animate();
```

### 4. Event Handling (Not currently used)
**D3:** `.on('click', handler)`  
**Konva:** `.on('click', handler)` (similar API)  
**Canvas:** `canvas.addEventListener('click', e => { hitTest(e.x, e.y); })`

---

## Data Structure Pattern

All scenes use this config format:
```javascript
const config = {
  title: 'Scene Title',
  nodes: [
    {id: 'n1', type: 'circle', x: 0.5, y: 0.5, r: 32, label: 'Text', color: 'blue'},
    {id: 'n2', type: 'rect', x: 0.2, y: 0.8, w: 80, h: 36, label: 'Box', color: 'green'}
  ],
  edges: [
    {from: 'n1', to: 'n2', color: 'gray', marker: 'arrowBlue'}
  ],
  labels: [
    {x: 0.5, y: 0.1, text: 'Floating Label', color: 'dim', size: 12}
  ]
};

renderScene(svg, width, height, config);
```

**This is tool-agnostic.** The config format works with D3, Konva, or canvas. Only the `renderScene()` function changes per tool.

---

## Migration Checklist

To migrate to new tool:

- [ ] Implement circle rendering (hexN)
- [ ] Implement rectangle rendering (rectN)
- [ ] Implement diamond rendering (diamondN)
- [ ] Implement text rendering with multi-line support
- [ ] Implement line/arc edges
- [ ] Implement animations (packets, transitions)
- [ ] Implement `renderScene()` decoder
- [ ] Test all 9 pages render correctly
- [ ] Validate text centering and sizing
- [ ] Measure performance vs D3
- [ ] Update documentation

**Estimated effort:** 8-16 hours (experienced developer)

---

## Why Migration Matters

**D3 problems:**
- Heavyweight (160KB minified)
- Steep learning curve
- Data binding complexity
- Text rendering requires workarounds
- Not ideal for 2D shapes/text

**Better alternatives for this usecase:**
1. **Konva.js** — Built for 2D, simpler API, text baked in
2. **Canvas + helpers** — Lightweight, full control, better text
3. **SVG.js** — Simpler D3, cleaner API, native SVG
4. **Custom D3 lite** — Strip D3 to just transitions + selection

---

## Current Technical Debt

Issues fixed in Phase 1-2 that would be simpler in other tools:

| Issue | D3 Workaround | Konva Native | Why |
|-------|---------------|--------------|-----|
| Multi-line text | `<tspan>` manual append | `.text` with `\n` | Text handling built-in |
| Text centering | `text-anchor` + `dominant-baseline` | `.align` + `.verticalAlign` | Better defaults |
| Text measurement | Create + measure + remove | `.getWidth()` method | Built-in |
| Box sizing | Manual width calcs | `.width` property | Automatic |
| Animations | `.transition()` chains | `.to()` method | Simpler syntax |

**Outcome:** ~30% less code, ~20% better readability in Konva

---

## Recommended Next Steps

1. **Now:** Keep D3, focus on Phase 2-3 fixes
2. **After stabilization:** Profile performance, measure bundle size
3. **If needed:** Create Konva prototype (1 page) for comparison
4. **Decision:** Migrate if Konva benefits > migration cost

---

## Code Locations for Migration

When migrating, update these files in order:

1. **shared/viz-utils.js** — Core drawing functions
   - Functions: `hexN`, `rectN`, `diamondN`, `lbl`, `edgeLine`, `arcPath`, `pkt`, `renderScene`
   - Estimated: 200 lines → 250 lines (net +50 with better structure)

2. **Page-specific rendering** — Each guide page
   - Files: `evaluation/index.html`, `memory/index.html`, etc.
   - Keep `drawXXX()` function structure, only replace D3 calls
   - Estimated: No changes needed (data config stays same)

3. **HTML SVG tags** → Canvas tag
   - Change: `<svg id="main-svg"></svg>` → `<canvas id="main-canvas"></canvas>`
   - Files: All 9 pages
   - Estimated: 1 line per page × 9 pages

4. **setupDefs()** → Custom arrow drawing
   - Arrow markers only work in SVG
   - Canvas version: draw arrows manually or use pre-rendered images
   - Estimated: 30 lines new code

---

## Preserved Through Migration

These aspects don't need to change:
- ✅ Data config format (nodes, edges, labels)
- ✅ Function signatures (`hexN()`, `rectN()`, etc.)
- ✅ Color system (`C.blue`, `C.green`, etc.)
- ✅ Scene structure in guide pages
- ✅ Interaction patterns (if any)

**Result:** Page files themselves don't change, only utilities layer

---

## Estimated Migration Cost

| Task | Hours |
|------|-------|
| Implement core drawing (hexN, rectN, etc.) | 4 |
| Implement text rendering | 3 |
| Implement animations | 2 |
| Convert renderScene() | 2 |
| Test 9 pages | 3 |
| Bug fixes & polish | 2 |
| **Total** | **16 hours** |

**1-2 day project for experienced developer**

---

## Keep This Document Updated

As Phase 2-3 fixes are made, note:
- New patterns introduced
- Functions added/modified
- Breaking changes to function signatures
- New animation types used

This keeps the migration guide accurate and useful.
