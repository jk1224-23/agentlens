#!/usr/bin/env node
/* lint-svg.js: Validate SVG text autofit constraints
   ✓ Each fitted <text> bbox is contained in its sibling shape (1px tolerance)
   ✓ No two <text> bboxes overlap by more than 2px
   Exit non-zero on failure, print which guide + which text violated constraints */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const GUIDES = fs.readdirSync('.')
  .filter(f => fs.statSync(f).isDirectory() && fs.existsSync(`${f}/index.html`))
  .filter(f => fs.readFileSync(`${f}/index.html`, 'utf8').includes('viz-utils.js'))
  .map(f => `${f}/index.html`);

async function lintSvg() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  let violations = [];

  try {
    for (const guide of GUIDES) {
      const url = `http://localhost:8000/${guide}`;
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Wait for MutationObserver debounce + autofit to complete
        await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

        // Get all fitted texts and their containing shapes
        const results = await page.evaluate(() => {
          const violations = [];

          document.querySelectorAll('svg').forEach((svg, svgIdx) => {
            // Check 1: Each fitted text bbox is contained in its sibling shape
            svg.querySelectorAll('text[data-autofit-fitted="1"]').forEach(text => {
              const parent = text.parentNode;
              if (parent?.nodeName !== 'g') return;

              const textBbox = text.getBBox();
              let foundShape = false, isContained = false;

              for (const sib of parent.children) {
                if (sib === text) continue;
                if (!/^(rect|circle|ellipse|polygon|path)$/.test(sib.nodeName)) continue;

                const shapeBbox = sib.getBBox();
                if (shapeBbox.width === 0 || shapeBbox.height === 0) continue;

                // Check if text position matches shape (loose check for finding parent)
                if (textBbox.x >= shapeBbox.x - 1 &&
                    textBbox.y >= shapeBbox.y - 1) {
                  foundShape = true;
                  // 1px tolerance for containment
                  isContained = (
                    textBbox.x >= shapeBbox.x - 1 &&
                    textBbox.y >= shapeBbox.y - 1 &&
                    textBbox.x + textBbox.width <= shapeBbox.x + shapeBbox.width + 1 &&
                    textBbox.y + textBbox.height <= shapeBbox.y + shapeBbox.height + 1
                  );
                  break;
                }
              }

              if (foundShape && !isContained) {
                violations.push({
                  type: 'NOT_CONTAINED',
                  text: text.textContent.substring(0, 30),
                  bbox: `(${textBbox.x.toFixed(1)}, ${textBbox.y.toFixed(1)}, ${textBbox.width.toFixed(1)}x${textBbox.height.toFixed(1)})`
                });
              }
            });

            // Check 2: No two texts overlap by more than 2px
            const texts = Array.from(svg.querySelectorAll('text[data-autofit-fitted="1"]'));
            for (let i = 0; i < texts.length; i++) {
              for (let j = i + 1; j < texts.length; j++) {
                const box1 = texts[i].getBBox();
                const box2 = texts[j].getBBox();

                const overlapX = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
                const overlapY = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));

                if (overlapX > 2 && overlapY > 2) {
                  violations.push({
                    type: 'OVERLAP',
                    text1: texts[i].textContent.substring(0, 20),
                    text2: texts[j].textContent.substring(0, 20),
                    overlap: `${overlapX.toFixed(1)}x${overlapY.toFixed(1)}`
                  });
                }
              }
            }
          });

          return violations;
        });

        if (results.length > 0) {
          violations.push({ guide, issues: results });
          console.error(`✗ ${guide}: ${results.length} violation(s)`);
          results.forEach(v => {
            if (v.type === 'NOT_CONTAINED') {
              console.error(`  - Text "${v.text}" not contained in shape ${v.bbox}`);
            } else {
              console.error(`  - Overlap: "${v.text1}" ↔ "${v.text2}" (${v.overlap})`);
            }
          });
        } else {
          console.log(`✓ ${guide}`);
        }
      } catch (e) {
        console.error(`✗ ${guide}: ${e.message}`);
        violations.push({ guide, error: e.message });
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${violations.length === 0 ? '✓ All guides passed!' : `✗ ${violations.length} guide(s) with issues`}`);
  process.exit(violations.length > 0 ? 1 : 0);
}

lintSvg().catch(err => {
  console.error('Lint error:', err);
  process.exit(1);
});
