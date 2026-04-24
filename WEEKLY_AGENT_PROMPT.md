# Weekly AgentLens Repository Update

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

### Style Guide Compliance (MANDATORY FOR ALL CHANGES)
**Before updating ANY content, consult STYLE_GUIDE_CHECKER.md:**
- [ ] Sections A-E: HTML structure, typography, colors, spacing layout
- [ ] Section F: Content quality, writing style, terminology
- [ ] Section G: News/updates formatting standards
- [ ] Section H-J: Images, accessibility, performance standards
- [ ] Section K: Consistency checks before commit
- Run the **Quick Checklist (Section L)** before every commit—it's your final gate

**Key Guardrails:**
- Match existing guide formatting exactly (fonts, colors, spacing)
- Follow typography: Serif (headers), Sans (body), Mono (code)
- Use CSS variables ONLY: `var(--ink)`, `var(--accent)`, etc. — NO hardcoded colors
- Verify code examples work on current framework versions
- Content tone: professional, educational, technical (no marketing language)
- Terminology: match existing guide terminology exactly

### Update Existing Content
- Refresh code examples to match current framework APIs
- Update framework version references where outdated
- Fix broken links or outdated resource references
- Clarify confusing or incomplete explanations in existing guides
- **CHECK:** Visual consistency with existing guides (colors, fonts, spacing)

### Add New Content (Only if clear fit)
- Add new orchestration patterns discovered that fit project scope
- Expand existing sections with proven recent examples
- Add new "considerations" or "gotchas" for patterns
- Link related patterns together if connections emerge
- **CHECK:** Style guide before publishing any new section

### Homepage News Management (index.html)

**Current News Section:**
- Keep ONLY latest 10 news/update entries visible in the main updates section
- Display format: `[Topic - Date] → [summary]`
- Example: `[Safety patterns update - 2026-04-17] → New validation framework`

**Archive Management (When news > 10):**
- If total news entries exceed 10, move older entries to separate archive file
- Create/update: `news-archive.html` file
- Archive format: Organize entries by month with dates and links
  - Header: `News Archive — AgentLens`
  - Sections: `[2026-04] | [2026-03] | [2026-02]` etc.
  - Each entry: `[Topic - Date] → [summary]`
- Link from homepage to archive: Add link at bottom of news section
  - Text: "View older updates → news-archive.html"

**Update Process:**
1. Check current news count in index.html
2. If ≤ 10: Keep all visible, no archive needed
3. If > 10: Move oldest entries to news-archive.html
4. Keep 10 most recent in index.html main section
5. Update archive file with proper date organization

### Style & Consistency
- Match existing guide format (HTML structure, tone, code examples)
- Keep technical depth consistent with current guides
- Use same terminology and concepts throughout
- No marketing language—stay educational and technical
- Archive page should match site theme and styling

---

## Phase 3: Commit & Document (10 min)

### Git Commits - CRITICAL: Zero AI Attribution
**NO TRACE OF CLAUDE OR AI TOOLS IN COMMITS**
- Commits must read as if a human made the changes
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
- "Create news archive file with date-based organization"

**Examples (✗ WRONG - Never use):**
- "Claude updated guides" 
- "AI tool added new content"
- "Automated framework version check"
- "Generated by Claude"
- "Tool assisted commit"

### Memory Update
- Document what was researched this week
- Note any patterns or frameworks that are stabilizing/changing
- Flag any topics that may need deeper coverage soon
- Save for continuity across future weekly runs

---

## Success Criteria
- ✓ At least 1-2 guides reviewed for accuracy
- ✓ Any outdated content updated to reflect current best practices
- ✓ New relevant patterns added (if discovered)
- ✓ All changes stay within project scope
- ✓ News management: Keep exactly 10 current entries visible
- ✓ News management: Move older entries to news-archive.html when needed
- ✓ Archive file properly organized by date with links
- ✓ 1-3 clean, descriptive commits made
- ✓ NO mention of Claude, AI, or automation in ANY commit message
- ✓ No broken links, no inaccurate technical claims
- ✓ Consistency with existing guide style maintained

## When to Skip Changes
- If an update would expand scope beyond agent orchestration
- If a new pattern is still too speculative or niche
- If changes contradict existing, proven content
- If you can't verify the information with high confidence

---

## Tools & Resources
- Repository: `https://github.com/jk1224-23/agentlens`
- Local structure: top-level directories = guide categories (orchestration, safety, evaluation, etc.)
- Each directory contains HTML guides with shared styling
- Reference existing guides for format and tone before making changes
- Homepage: `index.html` - contains news updates section (max 10 entries)
- Archive: `news-archive.html` - created when news exceeds 10 entries

---

## After Completion
When finished, send a push notification to Claude mobile:
- Status: "agentlens updated"
- Details: Brief summary of what changed (e.g., "Updated 2 guides, 8 current news items, 12 archived")