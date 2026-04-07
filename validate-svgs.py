#!/usr/bin/env python3

"""
SVG Text Rendering Validation Tool
Analyzes all pages for SVG text overflow, sizing, and readability issues
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent
PAGES = [
    'index.html',
    '404.html',
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

class SVGValidator:
    def __init__(self):
        self.results = {
            'total_pages': 0,
            'pages_analyzed': 0,
            'pages_with_svgs': 0,
            'total_svgs': 0,
            'issues': [],
            'patterns': defaultdict(int),
            'stats': {}
        }

    def analyze_page(self, page_path, page_name):
        """Analyze a single HTML page for SVG issues"""
        if not page_path.exists():
            return

        self.results['pages_analyzed'] += 1

        with open(page_path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Find all SVG elements
        svg_pattern = r'<svg[^>]*>'
        svgs = re.findall(svg_pattern, html)

        if not svgs:
            return

        self.results['pages_with_svgs'] += 1
        self.results['total_svgs'] += len(svgs)

        issues = []

        for idx, svg_tag in enumerate(svgs):
            # Check 1: ViewBox presence
            if 'viewBox' not in svg_tag:
                issues.append({
                    'svg_idx': idx,
                    'type': 'missing_viewbox',
                    'severity': 'HIGH',
                    'details': 'SVG lacks viewBox attribute'
                })
                self.results['patterns']['missing_viewbox'] += 1

            # Check 2: Overflow property
            if 'overflow' not in svg_tag:
                # This is usually implicit but check for explicit handling
                pass

            # Check 3: preserveAspectRatio
            if 'preserveAspectRatio' not in svg_tag:
                issues.append({
                    'svg_idx': idx,
                    'type': 'missing_preserve_aspect',
                    'severity': 'MEDIUM',
                    'details': 'SVG lacks preserveAspectRatio (may scale incorrectly)'
                })
                self.results['patterns']['missing_preserve_aspect'] += 1

            # Check 4: Extract viewBox dimensions
            vb_match = re.search(r'viewBox="([^"]+)"', svg_tag)
            if vb_match:
                vb_parts = vb_match.group(1).split()
                if len(vb_parts) == 4:
                    vb_w, vb_h = float(vb_parts[2]), float(vb_parts[3])
                    # Check aspect ratio reasonableness
                    aspect = vb_w / vb_h if vb_h > 0 else 0

                    # Large viewBox might indicate text overflow concerns
                    if vb_w > 2000 or vb_h > 2000:
                        issues.append({
                            'svg_idx': idx,
                            'type': 'oversized_viewbox',
                            'severity': 'MEDIUM',
                            'details': f'Large viewBox ({vb_w}x{vb_h}) may cause rendering issues'
                        })
                        self.results['patterns']['oversized_viewbox'] += 1

            # Check 5: Dynamic SVG (populated by JS)
            svg_id_match = re.search(r'id="([^"]*)"', svg_tag)
            svg_id = svg_id_match.group(1) if svg_id_match else 'unnamed'

            if 'main-svg' in svg_id or 'hero-bg' in svg_id:
                # These are populated dynamically with JavaScript
                # Check if this is likely to have text rendering
                if 'main-svg' in svg_id and not 'hero' in svg_id:
                    issues.append({
                        'svg_idx': idx,
                        'svg_id': svg_id,
                        'type': 'dynamic_svg_with_text',
                        'severity': 'INFO',
                        'details': f'Dynamic SVG {svg_id} - check text fitting via fitNodeText'
                    })
                    self.results['patterns']['dynamic_svg_with_text'] += 1

        if issues:
            self.results['issues'].append({
                'page': page_name,
                'issues': issues
            })

    def generate_report(self):
        """Generate validation report"""
        print("\n" + "="*70)
        print("SVG TEXT RENDERING VALIDATION REPORT")
        print("="*70 + "\n")

        print(f"📊 SUMMARY:")
        print(f"   Total pages: {self.results['total_pages']}")
        print(f"   Pages analyzed: {self.results['pages_analyzed']}")
        print(f"   Pages with SVGs: {self.results['pages_with_svgs']}")
        print(f"   Total SVGs found: {self.results['total_svgs']}\n")

        if not self.results['issues']:
            print("✅ No critical SVG issues detected!\n")
            return

        print(f"⚠️  ISSUE PATTERNS:\n")
        for pattern, count in sorted(self.results['patterns'].items(),
                                     key=lambda x: x[1], reverse=True):
            severity_map = {
                'missing_viewbox': 'HIGH',
                'missing_preserve_aspect': 'MEDIUM',
                'oversized_viewbox': 'MEDIUM',
                'dynamic_svg_with_text': 'INFO'
            }
            sev = severity_map.get(pattern, 'LOW')
            print(f"   [{sev}] {pattern}: {count} occurrence(s)")

        print(f"\n📋 DETAILED ISSUES:\n")
        for page_issues in self.results['issues']:
            print(f"   PAGE: {page_issues['page']}")
            for issue in page_issues['issues']:
                sev = issue['severity']
                print(f"      [{sev}] {issue['type']}")
                if 'svg_id' in issue:
                    print(f"           SVG ID: {issue['svg_id']}")
                print(f"           {issue['details']}")
            print()

    def run(self):
        """Run full validation"""
        print("🔍 Scanning SVG text rendering across all pages...\n")

        self.results['total_pages'] = len(PAGES)

        for page in PAGES:
            page_path = BASE_DIR / page
            self.analyze_page(page_path, page)

        self.generate_report()
        return self.results

if __name__ == '__main__':
    validator = SVGValidator()
    results = validator.run()

    # Exit code
    has_critical = any(
        any(i['severity'] == 'HIGH' for i in page['issues'])
        for page in results['issues']
    )
    exit(1 if has_critical else 0)
