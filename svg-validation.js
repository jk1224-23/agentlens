#!/usr/bin/env node

/**
 * SVG Text Overflow Validation Tool
 * Checks all HTML pages for SVG text rendering issues
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PAGES = [
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
];

const BASE_DIR = __dirname;

class SVGValidator {
  constructor() {
    this.results = {
      total_pages: 0,
      pages_with_svgs: 0,
      total_svgs: 0,
      issues: [],
      patterns: {},
      summary: {}
    };
  }

  validatePage(filePath, pageName) {
    try {
      const html = fs.readFileSync(filePath, 'utf-8');
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      const svgs = doc.querySelectorAll('svg');
      if (svgs.length === 0) return;

      this.results.pages_with_svgs++;
      this.results.total_svgs += svgs.length;

      Array.from(svgs).forEach((svg, idx) => {
        const issues = this.validateSVG(svg, pageName, idx);
        if (issues.length > 0) {
          this.results.issues.push({
            page: pageName,
            svg_index: idx,
            svg_id: svg.id || 'unnamed',
            issues: issues
          });

          // Track patterns
          issues.forEach(issue => {
            const pattern = issue.type;
            this.results.patterns[pattern] = (this.results.patterns[pattern] || 0) + 1;
          });
        }
      });
    } catch (err) {
      console.error(`Error processing ${pageName}:`, err.message);
    }
  }

  validateSVG(svg, pageName, idx) {
    const issues = [];

    // Check 1: Text elements
    const textElements = svg.querySelectorAll('text, tspan');
    if (textElements.length > 0) {
      textElements.forEach(text => {
        const content = text.textContent?.trim();
        if (!content) return;

        // Check for common overflow issues
        const bbox = text.getBBox?.() || {};
        const computedStyle = text.ownerDocument.defaultView.getComputedStyle(text);

        const fontSize = parseFloat(computedStyle.fontSize) || 12;
        const x = parseFloat(text.getAttribute('x')) || bbox.x || 0;
        const y = parseFloat(text.getAttribute('y')) || bbox.y || 0;

        // Check if text length suggests potential overflow
        const textLength = content.length;
        if (textLength > 20 && fontSize < 10) {
          issues.push({
            type: 'small_font_with_long_text',
            severity: 'medium',
            details: `Text "${content.substring(0, 30)}..." (${textLength} chars) with font-size ${fontSize}px`
          });
        }

        // Check for missing text-anchor/alignment
        const textAnchor = text.getAttribute('text-anchor');
        if (textLength > 15 && !textAnchor) {
          issues.push({
            type: 'missing_text_anchor',
            severity: 'low',
            details: `Text "${content.substring(0, 30)}..." lacks text-anchor alignment`
          });
        }
      });
    }

    // Check 2: ViewBox and dimensions
    const viewBox = svg.getAttribute('viewBox');
    const width = svg.getAttribute('width');
    const height = svg.getAttribute('height');

    if (!viewBox) {
      issues.push({
        type: 'missing_viewbox',
        severity: 'high',
        details: 'SVG lacks viewBox attribute'
      });
    }

    if (!width || !height) {
      issues.push({
        type: 'missing_dimensions',
        severity: 'medium',
        details: `Missing width (${width}) or height (${height})`
      });
    }

    // Check 3: Container overflow
    const rects = svg.querySelectorAll('rect');
    if (rects.length > 0) {
      rects.forEach(rect => {
        const x = parseFloat(rect.getAttribute('x')) || 0;
        const y = parseFloat(rect.getAttribute('y')) || 0;
        const w = parseFloat(rect.getAttribute('width')) || 0;
        const h = parseFloat(rect.getAttribute('height')) || 0;

        // Check if any text extends beyond rect bounds
        const texts = rect.parentNode.querySelectorAll('text');
        texts.forEach(text => {
          const tx = parseFloat(text.getAttribute('x')) || 0;
          const ty = parseFloat(text.getAttribute('y')) || 0;

          if (tx > x + w || ty > y + h) {
            issues.push({
              type: 'text_exceeds_container',
              severity: 'high',
              details: `Text at (${tx}, ${ty}) exceeds container bounds (${x}, ${y}, ${w}x${h})`
            });
          }
        });
      });
    }

    return issues;
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('SVG TEXT OVERFLOW VALIDATION REPORT');
    console.log('='.repeat(70) + '\n');

    console.log(`📊 SUMMARY:`);
    console.log(`   Total pages: ${this.results.total_pages}`);
    console.log(`   Pages with SVGs: ${this.results.pages_with_svgs}`);
    console.log(`   Total SVGs found: ${this.results.total_svgs}`);
    console.log(`   Pages with issues: ${this.results.issues.length}\n`);

    if (this.results.issues.length === 0) {
      console.log('✅ No SVG text overflow issues detected!\n');
      return;
    }

    console.log(`⚠️  IDENTIFIED PATTERNS:\n`);
    Object.entries(this.results.patterns).forEach(([pattern, count]) => {
      console.log(`   ${pattern}: ${count} occurrence(s)`);
    });

    console.log(`\n📋 DETAILED ISSUES:\n`);
    this.results.issues.forEach(issue => {
      console.log(`   PAGE: ${issue.page}`);
      console.log(`   SVG: ${issue.svg_id} (index ${issue.svg_index})`);
      issue.issues.forEach(i => {
        console.log(`      ❌ [${i.severity.toUpperCase()}] ${i.type}`);
        console.log(`         ${i.details}`);
      });
      console.log();
    });

    return this.results;
  }

  run() {
    console.log('🔍 Scanning SVG text rendering...\n');

    PAGES.forEach(page => {
      const filePath = path.join(BASE_DIR, page);
      if (fs.existsSync(filePath)) {
        this.results.total_pages++;
        this.validatePage(filePath, page);
      }
    });

    return this.generateReport();
  }
}

// Run validation
if (require.main === module) {
  try {
    const validator = new SVGValidator();
    const results = validator.run();
    process.exit(results.issues.length > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Validation error:', err.message);
    process.exit(1);
  }
}

module.exports = SVGValidator;
