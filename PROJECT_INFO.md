# Project: agentlens

## Overview
A 9-part animated guide series to building, orchestrating, and deploying AI agents in production. Each guide covers key concepts with interactive SVG visualizations.

## Project Details
- **Created**: 2024
- **Type**: Educational web content
- **Framework**: Pure HTML, CSS, JavaScript (no build tool required)
- **Size**: Small (11 HTML + 1 CSS file)
- **Host**: GitHub Pages

## Content
1. **Guide 01**: Orchestration Patterns (19 concepts, 10 patterns)
2. **Guide 02**: Agent Engineering (16 concepts, 5 phases)
3. **Guide 03**: Evaluation & Testing (15 concepts, 5 phases)
4. **Guide 04**: Memory Systems (15 concepts, 5 phases)
5. **Guide 05**: Safety & Trust (15 concepts, 5 defense phases)
6. **Guide 06**: Monitoring & Observability (15 concepts, 5 phases)
7. **Guide 07**: Governance & Compliance (15 concepts, 5 phases)
8. **Guide 08**: Advanced Reasoning (multi-phase structure)
9. **Guide 09**: Capstone - Production Deployment (multi-phase structure)

Plus:
- **Index**: Series overview and navigation
- **404**: Custom error page
- **Shared CSS**: `shared/base.css` - unified styling for all pages

## Development
See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for best practices and lessons learned.

## How to Extend

### Adding a New Guide
1. Create new folder: `/new-guide-topic/`
2. Create `index.html` with standard structure
3. Link to `../shared/base.css`
4. Add custom `--accent` color in `<style>` block
5. Update index.html with new guide card

### Updating Styles
- Edit `shared/base.css` for global changes
- Add page-specific styles in `<style>` block of guide HTML
- Follow CSS variable pattern for theming

### Testing
```bash
# Check for broken links
grep -o 'href="[^"]*"' *.html | sort -u

# Check for undefined CSS classes
grep -o 'class="[^"]*"' *.html | sed 's/class="//' | sed 's/".*//' | sort -u > used.txt
grep -o '\.[a-zA-Z-]*' shared/base.css | sort -u > defined.txt
comm -23 used.txt defined.txt  # Shows missing classes
```

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Series homepage |
| `shared/base.css` | Global styling for all pages |
| `*/index.html` | Individual guide pages |
| `DEVELOPMENT_GUIDE.md` | Best practices for small projects |
| `.gitignore` | Excludes logs, reports, build files |

## Known Decisions

### Why No Build Tool?
This is a small content site. No build tool needed. Keep it simple.

### Why Both ID-based (01-07) and Class-based (08-09) HTML?
Historical development. Pages 01-07 use `#hdr`, pages 08-09 use `.navbar`. Both work. CSS unifies the styling. Could consolidate in future if needed, but not a priority.

### Why Single CSS File?
At 300 lines, it's manageable. Global styles in one place = easier theming and updates.

## Common Tasks

### Fix a broken link
```bash
grep -r "href=\"" . --include="*.html" | grep "404"
```

### Check mobile responsiveness
See media queries in `shared/base.css` at:
- `@media(max-width:768px)` - Tablet
- `@media(max-width:480px)` - Mobile

### Update theme colors
1. Edit `:root` variables in `shared/base.css`
2. Or override per-page in guide HTML `<style>` block
3. Check both dark and light theme sections

## Support
See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for issue resolution principles.

