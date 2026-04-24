# AgentLens Style Reference

**DO NOT MAINTAIN THIS FILE.** It's auto-generated from guide-template.html. Copy the template, don't memorize rules.

---

## Quick Start: Copy This

When creating or updating any guide:

1. **Copy from:** `guide-template.html`
2. **Change only:** 
   - `<title>` (line 7)
   - Content in `<main>` section
   - Metadata description (line 8)
3. **Keep everything else:** Exact same `<head>`, CSS variables, header structure

---

## Golden Rules (Use Template to Verify)

### Typography (from guide-template.html lines 33-35)
```css
--mono: 'JetBrains Mono'     /* Code & technical */
--serif: 'Instrument Serif'  /* Headings */
--sans: 'IBM Plex Sans'      /* Body text */
```

### Colors (from guide-template.html lines 21-31)
- Use CSS variables ONLY: `var(--ink)`, `var(--accent)`, etc.
- NO hardcoded hex colors
- Three built-in themes: ink (default), paper, terminal
- All defined in `<style>` block at top

### Spacing (from guide-template.html)
- Copy padding/gap values from template
- Consistent throughout: 28px gutters, 40px sections
- Use template as reference—don't guess

### Structure (from guide-template.html)
```html
<header class="site">           <!-- Fixed top nav -->
  <a class="logo">◉ agentlens</a>
  <nav class="nav-breadcrumb">  <!-- Breadcrumb links -->
  <div class="nav-right">       <!-- Theme toggle, stats -->
</header>

<main>
  <section class="hero-section"> <!-- Intro section -->
  <section>                       <!-- Content sections -->
</main>
```

---

## Source of Truth

**This file is just a cheat sheet.** The actual style rules live in:

| What | Where | Don't Memorize |
|------|-------|---|
| HTML structure | `guide-template.html` lines 1-120 | Just copy |
| CSS variables | `guide-template.html` lines 20-62 | Already in template |
| Typography | `guide-template.html` lines 33-35 | Copy from template |
| Colors | `guide-template.html` lines 21-31 | Copy from template |
| Spacing | `guide-template.html` body | Copy from template |
| Homepage style | `index.html` `<style>` block | Reference only |

---

## Before Committing

**Follow these, not from memory—from the actual files:**

1. Open `guide-template.html` (reference)
2. Open your new/updated guide (your work)
3. Compare side-by-side:
   - [ ] Same `<head>` structure?
   - [ ] Same CSS variables?
   - [ ] Colors use `var(--*)` only?
   - [ ] Header & nav match template?
   - [ ] Font families match template?
4. If doubt: copy the element from template, modify only the content

---

## What This Means

- **NO separate checklist to maintain** ✓
- **NO duplication of style rules** ✓
- **Template is the source of truth** ✓
- When template updates, guides automatically align ✓
- Agent just references the template, not a separate guide ✓

---

## For the Weekly Agent

Instead of memorizing STYLE_GUIDE_CHECKER.md, the agent should:

```
1. Read guide-template.html (source of truth)
2. Read the guide being updated
3. Compare: Does it match the template structure?
4. If no: Copy the matching section from template
5. Commit (no separate checklist needed)
```

---

## Example: Adding a New Guide

```html
<!-- Start with guide-template.html -->
<!-- Copy entire file -->
<!-- Change only: -->
<title>Your Guide Name — agentlens</title>
<meta name="description" content="Your description.">

<!-- Keep everything else the same -->
<!-- Update <main> content with your text -->
<!-- Submit -->
```

Done. No checklist. No duplication. Just the template.

---

## If Template Changes

All existing guides automatically stay in sync because they're built from the same template. Update the template → all guides benefit from the update → zero manual work.

This is why we use templates. This is why we don't maintain separate style checklists.