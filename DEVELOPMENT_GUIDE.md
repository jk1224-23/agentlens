# Development Guide: agentlens

## How to Avoid Scope Creep & Overcomplicated Fixes

### The Problem We Had
We spent excessive time on a small project by:
- Over-analyzing before fixing
- Attempting complex restructuring instead of simple CSS fixes
- Creating detailed reports instead of acting immediately
- Reverting and trying again instead of thinking through changes first

### The Solution: Development Principles

---

## 1. **Issue-First Approach** ⚡

**Rule**: Identify issues → Fix directly → Test → Move on

**❌ Wrong Way**:
```
1. Report issue
2. Do comprehensive audit
3. Plan refactoring
4. Implement
5. Test everything
6. Revert if fails
7. Try again
```

**✅ Right Way**:
```
1. Spot issue
2. Fix immediately
3. Test that specific area
4. Commit & push
5. Move to next issue
```

**Time saved**: 70% faster

---

## 2. **CSS-First, Not HTML Restructuring** 🎨

**Rule**: Can you fix it with CSS? Do that first. Avoid HTML changes if possible.

**❌ Avoid**:
- Restructuring pages from ID-based to class-based
- Renaming all elements across multiple files
- Complex migrations

**✅ Do This Instead**:
- Add CSS rules to make elements look/behave the same
- Use CSS to unify styling
- Minimal HTML changes

**For this project**: Pages 08-09 didn't need HTML restructuring. We could have just added missing CSS classes in `base.css` and called it done.

---

## 3. **Test as You Go** 🧪

**Rule**: After each commit, verify the specific change works. Don't batch 10 changes and test later.

**Checklist before committing**:
```
□ Visual check (does it look right?)
□ Functional check (does it work?)
□ No broken links or missing elements
□ Mobile responsive (if applicable)
```

**Command to verify locally**:
```bash
# Check for broken links in HTML
grep -o 'href="[^"]*"' *.html | sort -u

# Check for undefined CSS classes
grep -o 'class="[^"]*"' *.html | sed 's/class="//' | sed 's/".*//' | sort -u > used_classes.txt
grep -o '\.[a-zA-Z-]*' shared/base.css | sort -u > defined_classes.txt
comm -23 used_classes.txt defined_classes.txt  # Shows missing classes
```

---

## 4. **Keep Commits Atomic & Small** 📦

**Rule**: One logical change per commit. Not "everything we fixed today."

**❌ Wrong**:
```
commit: "Fix all accessibility issues and unify pages and add CSS and more"
```

**✅ Right**:
```
commit 1: "Add focus-visible styles to buttons"
commit 2: "Add missing CSS classes for footer navigation"
commit 3: "Fix Safety page navigation link"
commit 4: "Standardize aria-labels on theme toggle"
```

**Benefit**: 
- Easy to revert single changes if needed
- Clear git history
- Easier to debug issues

---

## 5. **Define "Done" Upfront** 🎯

**Before starting work, answer**:
- What specific issues are we fixing?
- What constitutes a working fix?
- How will we know when we're done?

**For agentlens example**:
```
Done = All 9 pages render without errors + consistent navigation
NOT Done = Perfect code organization + comprehensive refactoring
```

---

## 6. **Use Checklists, Not Reports** ✅

**❌ Wrong**:
- 50-page detailed audit report
- Comprehensive gap analysis
- All possible improvements listed

**✅ Right**:
```
Issues to fix:
□ Safety page missing Guide 06 link
□ Pages 08-09 missing CSS classes
□ Hero padding broken on pages 08-09
□ Theme toggle aria-labels inconsistent
```

**Then fix them one by one.**

---

## 7. **Rollback Threshold** 🔄

**Rule**: If a fix takes more than 15 minutes and fails → Rollback immediately

```bash
# Quick rollback
git revert HEAD
# or
git reset --hard HEAD~1
```

Don't spend 2 hours trying to fix a failed refactoring. Revert and try simpler approach.

---

## 8. **No Perfectionism on Small Projects** 🚀

**Rule**: Differentiate project size:

| Project Size | Time to Spend on Quality | Approach |
|---|---|---|
| **Tiny** (< 20 files) | 10% | Fix what's broken, move on |
| **Small** (20-100 files) | 20% | Fix + basic testing |
| **Medium** (100-500 files) | 40% | Plan, design, test thoroughly |
| **Large** (500+ files) | 60%+ | Audit, plan, document, test |

**agentlens is TINY** (11 HTML files + 1 CSS file).
We should have treated it as "fix and done" not "audit and refactor."

---

## Quick Reference: When to STOP

| ❌ Stop When | ✅ Don't Stop When |
|---|---|
| Fix is taking > 15 min | Testing proper functionality |
| You're writing comprehensive audits | You're verifying commits |
| You're refactoring "for later" | You're fixing reported bugs |
| You're over-analyzing | You're being methodical |
| You're creating 50-page reports | You're documenting for team |

---

## Git Discipline Checklist

Before every commit:
```
□ Issue is actually fixed (not "should be fixed")
□ Changes are minimal & focused
□ No unrelated files modified
□ Commit message is clear & concise
□ Test verified locally
□ Ready to push immediately
```

---

## Common Mistakes on Small Projects

### ❌ Mistake 1: Over-Planning
"Let me audit the entire codebase first"
→ **15 pages of notes, no fixes**

### ❌ Mistake 2: Scope Creep
"While fixing X, let me also improve Y and Z"
→ **One fix balloons into 5 tasks**

### ❌ Mistake 3: Perfectionism
"Let me make this perfect for future maintainers"
→ **3 hours on a 1-hour project**

### ❌ Mistake 4: Fear-Based Development
"Let me revert and try again 3 times"
→ **Easy fixes become complex**

---

## What Worked (The Fixes That Actually Matter)

For **agentlens**, the actual fixes that mattered:
1. ✅ Add focus-visible styles (5 min)
2. ✅ Fix Safety page nav link (2 min)
3. ✅ Fix hero padding (2 min)
4. ✅ Add missing CSS classes (5 min)
5. ✅ Standardize aria-labels (3 min)

**Total productive time: 17 minutes**
**Actual time spent: 4+ hours**

The difference = over-analysis, over-planning, and scope creep.

---

## Summary: The Golden Rule

**For small projects: SPEED > PERFECTION**

Just fix it, test it, commit it, move on. 🚀

