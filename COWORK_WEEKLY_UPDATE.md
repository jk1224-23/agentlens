# Weekly AgentLens Update - CoWork Manual Version

Run this interactively in Claude Code to manually update the agentlens repository. Same as the scheduled agent, but you control when it runs and can fix issues in real-time.

---

## Mission
Keep agentlens as the authoritative, fact-checked guide for AI agent orchestration patterns. Focus on staying current with rapid AI developments while maintaining accuracy and staying within the scope of what we're building.

---

## Phase 1: Research & Fact-Check (30-40 min)

### Current AI Landscape Review
- Research major AI developments from the past 7 days (frameworks, patterns, best practices)
- Focus on: agent orchestration, multi-agent systems, LLM safety, evaluation methods
- Check if any existing agentlens content needs updating due to:
  - Framework deprecations or breaking changes
  - New industry best practices
  - Inaccurate or outdated technical details
  - Better examples that have emerged

### Scope Boundaries (Stay Within These)
- ✓ Agent orchestration patterns and architectures
- ✓ Safety, evaluation, monitoring for multi-agent systems
- ✓ Memory, governance, and advanced orchestration concepts
- ✗ Unrelated AI topics (vision models, image generation, general LLM usage)
- ✗ Speculative future developments not yet proven
- ✗ Marketing-driven claims without technical backing

### Fact-Checking
- Verify all code examples still work with current framework versions
- Cross-check pattern names and definitions against industry standards
- Ensure no contradictions within guides themselves
- Mark any uncertain findings for manual review (don't commit unverified claims)

---

## Phase 2: Update agentlens Repository (20-30 min)

### Style Compliance - Simple Rule

**Source of Truth:** `guide-template.html`

When updating or creating ANY guide:
1. Open `guide-template.html` in editor
2. Copy the entire file
3. Change ONLY:
   - `<title>` (line 7)
   - `<meta name="description">` (line 8)
   - Content in `<main>` section
4. Keep everything else identical—styles, header, fonts, colors

**Pre-Commit Check (3 Questions):**
- [ ] Started from guide-template.html?
- [ ] All colors use `var(--*)` only (no hardcoded hex)?
- [ ] Only content changed, not structure/styles?

✓ YES to all three → ready to commit  
✗ NO to any → copy that section from template

### Update Existing Content
- Refresh code examples to match current framework APIs
- Update framework version references where outdated
- Fix broken links or outdated resource references
- Clarify confusing or incomplete explanations in existing guides

### Add New Content (Only if clear fit)
- Add new orchestration patterns discovered that fit project scope
- Expand existing sections with proven recent examples
- Add new "considerations" or "gotchas" for patterns
- Link related patterns together if connections emerge

### Homepage News Management (index.html)

**Current News Section (FEED array):**
- Keep ONLY latest 10 news/update entries visible in FEED array
- Each entry MUST have: `{ date, tag, src, title, body, url }`
- Date format: `YYYY.MM.DD` (e.g., `2026.04.17`)
- Tags: MODEL, FRAMEWORK, PROTOCOL, INDUSTRY
- Example:
  ```javascript
  { date: '2026.04.17', tag: 'SAFETY', src: 'Anthropic', title: 'Safety patterns update', body: 'New validation framework...', url: 'https://anthropic.com/...' }
  ```
- **CRITICAL:** Every news item MUST include a `url` field linking to the source

**Archive Management (When news > 10):**
- If total news entries exceed 10, move older entries to separate file
- Create/update: `news-archive.html`
- Archive format: Organize entries by month with clickable links
  - Header: `News Archive — AgentLens`
  - Sections: `[2026-04] | [2026-03] | [2026-02]`
  - Each entry: `[Topic - Date] → [summary]` WITH clickable link to source URL
- Link from homepage: "View older updates → news-archive.html"

**Update Process:**
1. Check current news count in index.html
2. If ≤ 10: Keep all visible, no archive needed
3. If > 10: Move oldest entries to news-archive.html
4. Keep 10 most recent in index.html main section
5. Update archive file with proper date organization

---

## Phase 3: Commit & Push (10 min)

### Git Commits - CRITICAL: Zero AI Attribution

**NO TRACE OF CLAUDE OR AI TOOLS IN COMMITS**

Commits must read as if a human made the changes:
- Do NOT mention: "Claude", "AI", "automated", "generated", "tool", etc.
- Language: Direct, action-based, professional
- All commits represent human work

**Commit Format:**
```
[Description of what changed] - [why it changed]
```

**Examples (✓ Correct):**
- "Update orchestration guide: clarify routing patterns with latest framework API"
- "Fact-check safety section: fix deprecated validation approach"
- "Add hierarchical agent pattern to advanced section"
- "Organize news: move entries to archive, keep latest 10 on homepage"

**Examples (✗ WRONG - Never use):**
- "Claude updated guides"
- "AI tool added new content"
- "Automated framework version check"

### Commands to Run

```bash
# Check status
git status

# See what you changed
git diff

# Stage files
git add [filename]

# Commit
git commit -m "Your message here"

# Push to GitHub
git push origin main
```

---

## Success Criteria
- ✓ At least 1-2 guides reviewed for accuracy
- ✓ Any outdated content updated to reflect current best practices
- ✓ New relevant patterns added (if discovered)
- ✓ All changes stay within project scope
- ✓ News management: Keep exactly 10 current entries visible
- ✓ All guide updates match guide-template.html (use 3-question checklist)
- ✓ 1-3 clean, descriptive commits made
- ✓ NO mention of Claude, AI, or automation in ANY commit message
- ✓ No broken links, no inaccurate technical claims
- ✓ ALL news items include clickable URLs to sources

## When to Skip Changes
- If an update would expand scope beyond agent orchestration
- If a new pattern is still too speculative or niche
- If changes contradict existing, proven content
- If you can't verify the information with high confidence
- If the change doesn't match guide-template.html structure

---

## Advantages of CoWork Version

✅ **Run anytime** — Don't wait for Wednesday  
✅ **Fix immediately** — If something breaks, you fix it live  
✅ **See results** — Watch changes happen in real-time  
✅ **Interactive** — Ask questions, dig deeper into topics  
✅ **No timeout** — Take as long as you need  
✅ **Full access** — Can do anything on your local filesystem  
✅ **Test locally** — See changes before pushing to GitHub  

---

## Quick Start Checklist

- [ ] Research this week's AI developments
- [ ] Open guide-template.html (reference)
- [ ] Open guide you're updating (your work)
- [ ] Update content (keep structure from template)
- [ ] Check: 3-question style checklist
- [ ] Update news feed in index.html (10 max, all with URLs)
- [ ] Test locally (open in browser if needed)
- [ ] `git status` to see changes
- [ ] `git add [files]`
- [ ] `git commit -m "message"` (zero AI mention)
- [ ] `git push origin main`
- [ ] ✅ Done!

---

## Tools & Resources
- Repository: Local copy at `c:\Workspace\App\agent\agent-orchestration-guide`
- **Style Source:** `guide-template.html` (copy from this, don't memorize)
- Guide structure: top-level directories = guide categories
- Homepage: `index.html` - FEED array (max 10 entries, each with url field)
- Archive: `news-archive.html` - create when news exceeds 10 entries

---

## Difference from Scheduled Agent

| Aspect | Scheduled | CoWork |
|--------|-----------|--------|
| When | Every Wed 9am | You decide |
| Run time | ~1-2 hours max | No limit |
| Errors | Can't fix live | Fix immediately |
| Testing | None (goes live) | Test locally first |
| Token budget | Set limit | 200k context |
| Cost | Pay per run | Your plan |
| Convenience | Automatic | Manual |