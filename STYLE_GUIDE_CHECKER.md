# Style Compliance Check - Use Template as Source

**Simple Rule:** Copy `guide-template.html`, change only the content. Don't memorize style rules.

---

## Pre-Commit Checklist

Before every commit, answer these three questions:

### 1. HTML Structure
- [ ] Did you start from `guide-template.html`?
- [ ] Is the `<head>` identical to the template?
- [ ] Does your guide have the same header/nav structure?

### 2. CSS & Colors
- [ ] All colors use `var(--*)` (no hardcoded hex)?
- [ ] Did you use template as-is for styles?
- [ ] No new colors or CSS rules added?

### 3. Content Only
- [ ] Only the `<main>` section content changed?
- [ ] Title and description updated (lines 7-8)?
- [ ] Everything else matches the template exactly?

**If all YES:** Ready to commit.  
**If any NO:** Copy that section from guide-template.html.

---

## What NOT to Do

- ❌ Create custom CSS rules
- ❌ Add hardcoded colors
- ❌ Change fonts or typography
- ❌ Modify header/nav structure
- ❌ Deviate from guide-template.html layout

---

## What to DO

- ✅ Copy from guide-template.html
- ✅ Change only: title, description, main content
- ✅ Keep everything else identical
- ✅ Use existing theme colors (var(--ink), etc.)
- ✅ Reference the template when unsure

---

## Source of Truth

See `STYLE_REFERENCE.md` for details.

**Real source:** `guide-template.html` — It's the only style guide you need.