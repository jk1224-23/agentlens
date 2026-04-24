# AgentLens Style Guide & Formatting Checklist

This is the authoritative style guide for all content in the agentlens repository. **Every update must pass these checks before committing.**

---

## A. HTML Structure & Markup

### Page Template
- [ ] DOCTYPE declared at top: `<!DOCTYPE html>`
- [ ] Lang attribute set: `<html lang="en">`
- [ ] Meta charset: `<meta charset="UTF-8">`
- [ ] Viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] Favicon linked: `<link rel="icon" href="./favicon.svg">`
- [ ] Page title descriptive: `<title>agentlens — [specific guide name]</title>`

### Navigation & Links
- [ ] Internal links use relative paths: `./guide/index.html` NOT `https://...`
- [ ] External links open in new tab: `target="_blank" rel="noopener noreferrer"`
- [ ] Links are semantic: descriptive link text, not "click here"
- [ ] No broken links (verify all hrefs exist)

### Semantic HTML
- [ ] Use proper heading hierarchy: `<h1>` → `<h2>` → `<h3>` (no skipping levels)
- [ ] Use `<section>`, `<article>`, `<nav>` tags where appropriate
- [ ] Use `<code>` for inline code snippets
- [ ] Use `<pre><code>` for code blocks
- [ ] Lists use `<ul>`, `<ol>`, `<li>` appropriately

---

## B. Typography & Fonts

### Font Families (from index.html)
```
--mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
--serif: 'Instrument Serif', 'Times New Roman', serif;
--sans: 'IBM Plex Sans', system-ui, sans-serif;
```

- [ ] Headings: `font-family: var(--serif)` (Instrument Serif)
- [ ] Body text: `font-family: var(--sans)` (IBM Plex Sans)
- [ ] Code/technical: `font-family: var(--mono)` (JetBrains Mono)
- [ ] Base font size: 13.5px (body)
- [ ] Line height: 1.6 (body content)
- [ ] Letter spacing: 0.02em (body), 0.06em-0.12em (headings/labels)

### Text Styling
- [ ] Headings are NOT bold, use weight 400 with serif
- [ ] Emphasis uses italics `<em>` or `<i>` with serif font
- [ ] Important text color: `color: var(--ink)` (main text color)
- [ ] Secondary text color: `color: var(--ink-2)` (muted)
- [ ] Metadata/labels color: `color: var(--ink-3)` (darkest secondary)

---

## C. Color System (CSS Variables)

### Theme-Aware Colors (Ink Theme as Default)
```
--bg: #0d0c0a          /* Background */
--bg-2: #141310        /* Secondary background */
--ink: #ece6d8         /* Primary text */
--ink-2: #a39d8e       /* Secondary text */
--ink-3: #6b6556       /* Tertiary/metadata text */
--rule: #2a2721        /* Borders/lines */
--rule-soft: rgba(...) /* Soft borders */
--hair: rgba(...)      /* Very light dividers */
--accent: oklch(...)   /* Highlight color (green by default) */
--accent-soft: oklch(...)  /* Soft accent background */
```

- [ ] Use CSS variables ONLY: `color: var(--ink)` NOT hardcoded hex
- [ ] Accent color for highlights/CTAs: `color: var(--accent)`
- [ ] Accent backgrounds: `background: var(--accent-soft)`
- [ ] Borders use: `border-color: var(--rule)` or `var(--hair)`
- [ ] NO hardcoded colors in new HTML content

---

## D. Spacing & Layout

### Standard Spacing Values
- [ ] Gutter (padding): `var(--gutter)` = clamp(16px, 2vw, 28px)
- [ ] Gaps between elements: 8px, 12px, 18px, 22px, 24px (multiples of 2)
- [ ] Padding: 10px, 12px, 14px, 18px, 20px, 22px, 34px
- [ ] Margins: 0 (reset default), use padding instead

### Layout Grid
- [ ] Max width container: 1480px
- [ ] Use CSS Grid for major layouts
- [ ] Use Flexbox for component layouts
- [ ] Responsive: use clamp() for fluid scaling
- [ ] Mobile first: base styles, then larger breakpoints

### Section Structure
```html
<div class="frame">
  <section>
    <div class="section-head">
      <div class="idx">01</div>
      <h2>Section Title</h2>
      <div class="aside">metadata</div>
    </div>
    <!-- content here -->
  </section>
</div>
```

---

## E. Code Examples

### Code Block Format
```html
<pre><code class="language-python">
# Code here
def example():
    return True
</code></pre>
```

- [ ] Use `<pre><code>` with class for syntax highlighting
- [ ] Include language class: `language-python`, `language-javascript`, etc.
- [ ] Code is readable: proper indentation, line length < 80 chars where possible
- [ ] Include comments for non-obvious logic
- [ ] Real examples only (no placeholder code like `// TODO`)

### Inline Code
- [ ] Use `<code>` for variable names, function calls, file paths
- [ ] Style: monospace font (var(--mono)), slightly lighter color

---

## F. Content Quality

### Writing Style
- [ ] Clear, professional, educational tone
- [ ] NO marketing language or hype
- [ ] NO promotional phrases like "revolutionary", "game-changing"
- [ ] Technical accuracy verified against current framework versions
- [ ] Sentences are concise: avg 15-20 words
- [ ] Paragraphs max 4-5 sentences

### Terminology & Naming
- [ ] Consistent terminology throughout guides
- [ ] Same concept = same name (no "orchestrator" and "conductor")
- [ ] Technical terms properly defined on first use
- [ ] Industry standard names used (check existing guides)

### Structure
- [ ] Clear introduction to each guide section
- [ ] Logical flow: simple → complex
- [ ] Headings accurately describe content below
- [ ] Lists (bullet/numbered) used appropriately
- [ ] Related concepts linked to each other

---

## G. News/Updates Section (index.html)

### News Entry Format
```
[Topic - Date] → [summary]
```
Example: `[Safety patterns update - 2026-04-17] → New validation framework`

- [ ] Date format: `YYYY-MM-DD`
- [ ] Topic is specific: "Safety patterns update" NOT "Update"
- [ ] Summary is concise: 5-15 words max
- [ ] Arrow separator: ` → ` (space-arrow-space)
- [ ] Total entries visible: exactly 10 max
- [ ] Oldest entries moved to news-archive.html

### Archive File (news-archive.html)
- [ ] Matches site styling and theme
- [ ] Header: `News Archive — AgentLens`
- [ ] Organized by month: `[2026-04] | [2026-03]`
- [ ] Same entry format as homepage
- [ ] Linked from homepage: "View older updates → news-archive.html"
- [ ] Proper HTML structure with nav/styles

---

## H. Image & Asset Guidelines

### Images
- [ ] Favicon: `favicon.svg` (SVG preferred)
- [ ] Use relative paths: `./favicon.svg` NOT absolute
- [ ] Optimize SVGs: minimal, clean markup
- [ ] Alt text provided for all meaningful images
- [ ] NO embedded large images in guides (link instead)

### Icons
- [ ] Use SVG format for crisp rendering
- [ ] Icons use inherited color: `fill="currentColor"`
- [ ] Consistent icon sizing
- [ ] Icons defined in scripts (like GUIDE_ICONS in index.html)

---

## I. Accessibility (A11y)

- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Semantic HTML used (headers, nav, main, etc.)
- [ ] Links have descriptive text
- [ ] Alt text for images
- [ ] Keyboard navigable (tab through links)
- [ ] Focus states visible

---

## J. Performance

- [ ] CSS is minimal and organized
- [ ] No unused CSS rules
- [ ] Images are optimized (SVG preferred)
- [ ] No render-blocking scripts above fold
- [ ] Fonts preconnected: `<link rel="preconnect">`
- [ ] Lazy loading where appropriate

---

## K. Consistency Checks (Before Every Commit)

Run these checks before committing ANY changes:

### Visual Consistency
- [ ] Color palette matches existing guides
- [ ] Typography matches: serif for headers, sans for body, mono for code
- [ ] Spacing/padding consistent with other sections
- [ ] Border styles match (var(--rule), var(--hair))
- [ ] Hover states defined and consistent

### Content Consistency
- [ ] Terminology matches existing guides
- [ ] Code examples use same style as others
- [ ] Links are formatted the same way
- [ ] Updates section formatted correctly
- [ ] No orphaned or incomplete sections

### Technical Accuracy
- [ ] All links work (no 404s)
- [ ] Code examples run on current framework versions
- [ ] Framework version references are current
- [ ] No deprecation warnings in examples
- [ ] All facts verified/sourced

### Quality Gate
- [ ] No TODOs or FIXMEs left in code
- [ ] No hardcoded colors (use CSS vars)
- [ ] No inline styles (use stylesheets)
- [ ] No "Lorem ipsum" or placeholder text
- [ ] No AI tool attribution in code/comments

---

## L. Quick Checklist (Use Before Each Commit)

```
□ All HTML semantic and valid
□ Colors use CSS variables only
□ Typography matches: serif/sans/mono correct
□ Spacing consistent with existing style
□ Links are working and relative paths correct
□ Code examples verified with current versions
□ Content tone is professional/educational
□ Terminology consistent with existing guides
□ News entries: 10 max on homepage, older → archive
□ No hardcoded values, colors, or styles
□ No AI tool/Claude mentions anywhere
□ Accessibility standards met
□ Visual consistency with other guides
□ All facts technically accurate
□ Ready to commit
```

---

## Reference Files

- **Main stylesheet source**: Check `<style>` in `index.html`
- **Theme variables**: `:root` CSS custom properties
- **Guide template**: `guide-template.html` (copy and customize)
- **Icon definitions**: `icons.js` (add new icons here)
- **Existing guides**: Reference `/orchestration/`, `/safety/`, `/evaluation/` for examples

---

## How to Use This Checklist

1. **Before writing:** Review relevant sections (B, C, D for styling; F for content)
2. **While writing:** Check as you go (easier than fixing later)
3. **Before committing:** Run the Quick Checklist (Section L)
4. **On doubt:** Look at existing guides in the repo and match their style
5. **On verification:** Test links, code examples, visual appearance in browser

**Every piece of content must pass this checklist before being committed.**