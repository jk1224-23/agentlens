# agentlens Guides 04-09: Critical Bug Report

## Executive Summary
**Status:** 4 critical JavaScript errors preventing functionality
**Affected Guides:** 05 (Safety), 07 (Governance), 08 (Advanced), 09 (Capstone)
**Severity:** BLOCKING - Theme toggle broken, visualizations not rendering, page functionality impaired

---

## Critical Errors Found (Browser Console)

### ERROR #1: Theme Toggle Element ID Mismatch
**File:** `shared/viz-utils.js`, line 407
**Problem:**
```javascript
const btn = document.getElementById('theme-btn');  // ← Looking for 'theme-btn'
```
But all guide HTML files use:
```html
<button id="themeToggle" class="theme-toggle">🌙</button>  <!-- ✗ Wrong ID -->
```

**Impact:** Theme toggle button is never initialized. Clicking the button does nothing.
**Solution:** Either:
- Option A: Change all HTML files to use `id="theme-btn"`
- Option B: Change viz-utils.js line 407 to `getElementById('themeToggle')`

**Recommended:** Option A (standardize to `theme-btn`)

---

### ERROR #2: Duplicate Variable Declaration in Guide 07
**File:** `governance/index.html`, line 308 (approximately)
**Problem:**
```javascript
// Global declaration in viz-utils.js line 25:
let activeStep = -1;

// Duplicate declaration in governance/index.html:
let activeStep = ...;  // ← Syntax Error: already declared
```

**Console Error:**
```
SyntaxError: Identifier 'activeStep' has already been declared
```

**Impact:** JavaScript parsing fails after this error. Theme toggle and other event handlers may not initialize properly.
**Solution:** Remove the local declaration of `activeStep` in governance/index.html. Use the global one provided by viz-utils.js.

---

### ERROR #3: Syntax Error in Shared JavaScript
**File:** One of the shared JavaScript files, line 1033 col 71
**Problem:**
```
SyntaxError: Unexpected identifier 's' at line 1033:71
```

**Affected Guides:** Safety (Guide 05)
**Console Error:**
```
(https://jk1224-23.github.io/agentlens/safety/:1033:71)
SyntaxError: Unexpected identifier 's'
```

**Status:** Unable to identify exact location without examining concatenated/minified code. Possibly in a shared file loaded before viz-utils.js or in initSharedUI callback.

**Solution:** Search codebase for line 1033 across all shared JavaScript files. Look for incomplete string literals, missing operators, or malformed expressions around column 71.

---

### ERROR #4: renderScene() Called with Wrong Parameters
**Files:** `advanced/index.html` line 222, `capstone/index.html` line 221
**Problem:**
```javascript
// INCORRECT (current code):
viz.forEach(v => renderScene(v.id, v.defs, v.data));

// CORRECT (from guides 06-07):
renderScene(svg.node(), 560, 560, {nodes: [...], edges: [...]});
```

**renderScene() Function Signature:**
```javascript
function renderScene(svg, w, h, config){
  const {title, nodes=[], edges=[], labels=[]} = config;  // ← Line 196
  // ...
}
```

**Console Error:**
```
TypeError: Cannot destructure property 'title' of 'config' as it is undefined.
    at renderScene (viz-utils.js:196:10)
    at advanced/:222:26 and capstone/:221:26
```

**Impact:** All D3 visualizations fail to render on Guides 08-09. SVG containers remain empty.

**Solution:** Rewrite the visualization initialization in guides 08-09 to match the pattern from guides 06-07:
1. Select SVG element with d3.select('#vizN')
2. Call setupDefs(svg) to initialize SVG filters
3. Call renderScene(svg.node(), 560, 560, configObj)

---

## Light Mode Rendering Issues (From VALIDATION_REPORT.md)

### Issue: Light Mode Accent Color Contrast
**Files:** Guides 06, 07, 08, 09
**Problem:** Accent colors designed for dark backgrounds are unreadable on white backgrounds in light mode.

**Current Colors (Light Mode):**
- Guide 06 (Monitoring): #9a6700 (dark brown on white) = **Poor contrast**
- Guide 07 (Governance): #0d8659 (dark teal on white) = **Poor contrast**
- Guide 08 (Advanced): #0369a1 (acceptable but could be brighter)
- Guide 09 (Capstone): #a16207 (dark brown-orange on white) = **Poor contrast**

**Recommended Fixes:**
```css
/* Guide 06 */
--accent: #d97706;  /* Vibrant amber-orange */

/* Guide 07 */
--accent: #0891b2;  /* Bright teal */

/* Guide 08 */
--accent: #0284c7;  /* Brighter cyan (if needed) */

/* Guide 09 */
--accent: #d97706;  /* Vibrant amber */
```

---

## SVG Visualization Issues

### Issue: SVG Colors Don't Update on Theme Switch
**Problem:** SVG elements use hardcoded colors that don't re-render when theme changes.
**Cause:** renderScene() is called once at page load with fixed colors. When theme switches, visualizations retain original colors.
**Solution:** Need theme-aware re-rendering callback in initSharedUI().

### Issue: SVG Overflow on Narrow Viewports
**Problem:** SVG with viewBox="0 0 560 560" can overflow container on mobile.
**Solution:** Add max-width and overflow constraints to .sticky-viz containers.

---

## Fixes Required (Priority Order)

### P0 (Critical - Blocks All Functionality)
1. **Fix theme button ID mismatch** (5 min)
   - Change `getElementById('theme-btn')` in viz-utils.js to `getElementById('themeToggle')`
   - OR change all button IDs to `id="theme-btn"`

2. **Remove duplicate activeStep declaration** (5 min)
   - Edit governance/index.html to remove local `let activeStep = ...`

3. **Find and fix syntax error at line 1033** (15 min)
   - Search all .js files for line 1033
   - Fix incomplete string literals or malformed expressions

4. **Fix renderScene() calls in guides 08-09** (30 min)
   - Rewrite visualization initialization to match guides 06-07 pattern
   - Ensure proper D3 selections and config structure

### P1 (High - Affects UX)
5. **Fix light mode accent colors** (10 min)
   - Update CSS color variables in guides 06, 07, 09
   - Verify WCAG AA contrast (4.5:1)

6. **Implement SVG re-rendering on theme switch** (45 min)
   - Modify initSharedUI() to support visualization re-rendering
   - Update guides 08-09 visualization configs for easy re-rendering

### P2 (Medium - Improves Responsiveness)
7. **Add SVG overflow constraints** (10 min)
   - Update .sticky-viz CSS for mobile viewports
   - Test on various screen sizes

---

## Testing Checklist Before Release

- [ ] **JavaScript Errors**
  - [ ] Browser console shows no errors on any guide (04-09)
  - [ ] Network tab shows no failed requests

- [ ] **Theme Toggle**
  - [ ] Clicking theme button changes mode
  - [ ] SVG visualizations update colors (guides 06-09)
  - [ ] Text remains readable in both modes
  - [ ] Progress bar visible in both modes
  - [ ] No page flicker during toggle

- [ ] **Dark Mode**
  - [ ] All guides render correctly
  - [ ] Text has good contrast
  - [ ] Visualizations visible with bright colors
  - [ ] Progress bar tracking works

- [ ] **Light Mode**
  - [ ] All accent colors have 4.5:1 contrast ratio
  - [ ] Visualizations visible with dark enough colors
  - [ ] Text readable
  - [ ] No hard-to-read elements

- [ ] **Responsive**
  - [ ] No horizontal scrolling on mobile
  - [ ] SVG visualizations don't overflow
  - [ ] Content readable on 320px-1920px widths
  - [ ] Layout stacks properly below 768px

---

## Estimated Fix Time
- **Critical bugs (P0):** 1 hour
- **UX improvements (P1):** 1 hour
- **Responsiveness (P2):** 30 minutes
- **Testing & validation:** 1 hour

**Total estimated time: 3.5 hours**

---

## Files to Modify
1. `shared/viz-utils.js` - Fix theme button ID, add re-render callback
2. `governance/index.html` - Remove duplicate activeStep declaration
3. `advanced/index.html` - Fix renderScene() calls, add visualization configs
4. `capstone/index.html` - Fix renderScene() calls, add visualization configs
5. `monitoring/index.html` - Update light mode accent color
6. `governance/index.html` - Update light mode accent color
7. `capstone/index.html` - Update light mode accent color

---

## Browser Testing Evidence
- Guide 04 (Memory): ✓ Light mode renders correctly
- Guide 05 (Safety): ✗ JS error at line 1033, theme toggle broken
- Guide 06 (Monitoring): ✓ Dark mode renders correctly, but light mode colors need adjustment
- Guide 07 (Governance): ✗ Duplicate variable error, theme toggle broken
- Guide 08 (Advanced): ✗ renderScene() error, visualizations not rendering
- Guide 09 (Capstone): ✗ renderScene() error, visualizations not rendering
