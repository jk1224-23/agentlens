#!/usr/bin/env python3

"""
Automatic SVG Fix Tool
Adds missing viewBox, preserveAspectRatio, and overflow attributes
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

# Pages to fix (exclude 404.html which doesn't have dynamic SVGs)
PAGES = [
    'index.html',
    'advanced/index.html',
    'capstone/index.html',
    'engineering/index.html',
    'evaluation/index.html',
    'governance/index.html',
    'memory/index.html',
    'monitoring/index.html',
    'orchestration/index.html',
    'safety/index.html'
]

# SVG attribute fixes
SVG_FIXES = {
    # Main viz SVGs (populated by D3 with renderScene)
    r'<svg\s+id="main-svg"(?![^>]*viewBox)': '<svg id="main-svg" viewBox="0 0 560 560" preserveAspectRatio="xMidYMid meet" overflow="visible"',
    r'<svg\s+id="main-svg2"(?![^>]*viewBox)': '<svg id="main-svg2" viewBox="0 0 560 560" preserveAspectRatio="xMidYMid meet" overflow="visible"',
    r'<svg\s+id="main-svg3"(?![^>]*viewBox)': '<svg id="main-svg3" viewBox="0 0 560 560" preserveAspectRatio="xMidYMid meet" overflow="visible"',
    r'<svg\s+id="main-svg4"(?![^>]*viewBox)': '<svg id="main-svg4" viewBox="0 0 560 560" preserveAspectRatio="xMidYMid meet" overflow="visible"',
    r'<svg\s+id="main-svg5"(?![^>]*viewBox)': '<svg id="main-svg5" viewBox="0 0 560 560" preserveAspectRatio="xMidYMid meet" overflow="visible"',

    # Hero background SVGs
    r'<svg\s+id="hero-bg"(?![^>]*viewBox)': '<svg id="hero-bg" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice" overflow="hidden"',

    # Class-based hero SVGs (advanced/capstone)
    r'<svg\s+class="hero-bg"(?![^>]*viewBox)': '<svg class="hero-bg" viewBox="0 0 560 560" preserveAspectRatio="xMidYMid slice" overflow="hidden"',
}

def fix_page(page_path):
    """Fix SVG attributes in a single page"""
    if not page_path.exists():
        return False, "File not found"

    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    fixes_applied = 0

    # Apply each fix pattern
    for pattern, replacement in SVG_FIXES.items():
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            fixes_applied += re.subn(pattern, replacement, content)[1]
            content = new_content

    # Write back if changed
    if content != original_content:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, f"Fixed {fixes_applied} SVG(s)"

    return False, "No fixes needed"

def main():
    print("\n" + "="*70)
    print("SVG ATTRIBUTE AUTO-FIX TOOL")
    print("="*70 + "\n")

    total_pages = 0
    fixed_pages = 0
    total_fixes = 0

    for page in PAGES:
        page_path = BASE_DIR / page
        total_pages += 1

        success, message = fix_page(page_path)

        status = "✅" if success else "⏭️"
        print(f"{status} {page}: {message}")

        if success:
            fixed_pages += 1
            # Count fixes (rough estimate)
            total_fixes += 5  # Usually main-svg x5 per page

    print("\n" + "="*70)
    print(f"SUMMARY: Fixed {fixed_pages}/{total_pages} pages")
    print(f"Estimated total SVG attributes added: {total_fixes}")
    print("="*70 + "\n")

    return 0 if fixed_pages > 0 else 1

if __name__ == '__main__':
    exit(main())
