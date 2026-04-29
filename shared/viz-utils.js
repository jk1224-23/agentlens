/* ── agentlens shared viz utilities ─────────────────────────────────────────
   Loaded by all guide pages before their own <script> block.
   Provides: colour system, state, D3 drawing helpers, shared UI init.
   ─────────────────────────────────────────────────────────────────────────── */

// ── COLOUR SYSTEM ─────────────────────────────────────────────────────────────
const C_DARK={
  bg:'#0d1117',bg2:'#161b22',text:'#c9d1d9',dim:'#8b949e',
  blue:'#58a6ff',green:'#3fb950',purple:'#d2a8ff',
  orange:'#f0883e',red:'#f85149',yellow:'#e3b341',border:'#30363d'
};
const C_LIGHT={
  bg:'#ffffff',bg2:'#f6f8fa',text:'#24292f',dim:'#57606a',
  blue:'#0969da',green:'#1a7f37',purple:'#8250df',
  orange:'#bc4c00',red:'#cf222e',yellow:'#9a6700',border:'#d0d7de'
};
const C=Object.assign({},C_DARK);
function syncC(){
  const t=document.documentElement.getAttribute('data-theme')||
    (window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  Object.assign(C,t==='light'?C_LIGHT:C_DARK);
}

// ── STATE ─────────────────────────────────────────────────────────────────────
let activeStep=-1;
let timers=[];
function killTimers(){timers.forEach(id=>{clearInterval(id);clearTimeout(id);});timers=[];}

function fitNodeText(text,maxChars){
  const raw=(text??'').toString().trim();
  if(!raw)return '';
  if(raw.length<=maxChars)return raw;
  return raw.slice(0,Math.max(1,maxChars-1))+'…';
}

/** Helper: create multi-line text with proper tspan elements and centering */
function createMultilineText(textEl, text, color, fontSize) {
  if (!text || !text.includes('\n')) {
    textEl.attr('fill', color).attr('font-size', fontSize)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .text(text);
    return;
  }

  const lines = text.split('\n').filter(l => l.trim());
  textEl.attr('fill', color).attr('font-size', fontSize)
    .attr('text-anchor', 'middle');

  const lineHeight = 1.3; // em
  // Center the block: first line starts (n-1)/2 lineHeights above y
  const startDy = -((lines.length - 1) / 2) * lineHeight;
  const xVal = textEl.attr('x') || 0;

  lines.forEach((line, i) => {
    textEl.append('tspan')
      .attr('x', xVal)
      .attr('dy', i === 0 ? `${startDy}em` : `${lineHeight}em`)
      .text(line);
  });
}

// ── SVG HELPERS ───────────────────────────────────────────────────────────────
function getSize(svgEl){
  // Return fixed internal coordinate space (560x560) for all renders.
  // This prevents SVG text/node overflow on narrow viewports.
  // The SVG scales responsively via viewBox and preserveAspectRatio.
  return{w:560,h:560};
}

/** Measure text width for boundary checking (uses cache to reduce reflows) */
function measureText(text,fontSize=12,fontFamily='Courier New'){
  return measureTextCached(text,fontSize,fontFamily);
}

/** Responsive font size: scales between min/max based on viewport */
function responsiveFontSize(baseSize=12,minSize=9,maxSize=16){
  // Scale font size based on window width
  // At 320px: minSize, at 1024px: maxSize
  const viewportW=Math.max(320,Math.min(1024,window.innerWidth));
  const scale=(viewportW-320)/(1024-320);
  return Math.round(minSize+scale*(maxSize-minSize));
}

function setupDefs(svgSel){
  const defs=svgSel.append('defs');
  const f=defs.append('filter').attr('id','glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
  f.append('feGaussianBlur').attr('stdDeviation','3').attr('result','blur');
  const merge=f.append('feMerge');
  merge.append('feMergeNode').attr('in','blur');
  merge.append('feMergeNode').attr('in','SourceGraphic');
  ['Blue','Dim','Green','Orange','Red','Yellow','Purple'].forEach(name=>{
    const col=C[name.toLowerCase()]||C.border;
    defs.append('marker').attr('id','arrow'+name).attr('markerWidth',8).attr('markerHeight',8)
      .attr('refX',6).attr('refY',3).attr('orient','auto')
      .append('path').attr('d','M0,0 L0,6 L8,3 z').attr('fill',col);
  });
}

/** Text measurement cache: stores dimensions to avoid repeated getBBox() calls */
const textMeasureCache=new Map();
function measureTextCached(text,fontSize=12,fontFamily='Courier New'){
  const key=`${text}|${fontSize}|${fontFamily}`;
  if(textMeasureCache.has(key))return textMeasureCache.get(key);
  const svg=d3.select('body').append('svg').style('visibility','hidden');
  const t=svg.append('text').attr('font-size',fontSize).attr('font-family',fontFamily).text(text);
  const bbox=t.node().getBBox();
  svg.remove();
  const result=bbox.width;
  textMeasureCache.set(key,result);
  return result;
}

/** Viewport-aware culling: hides elements outside visible frame to reduce DOM pressure */
function setupViewportCulling(svgSel,opts={}){
  const margin=opts.margin??50;
  const updateCull=()=>{
    const vb=svgSel.node().viewBox.baseVal;
    svgSel.selectAll('[data-cull]').style('display',sel=>{
      const bbox=d3.select(sel).node().getBBox?.();
      if(!bbox)return null;
      const visible=(bbox.x+bbox.width>=vb.x-margin)&&
        (bbox.x<=vb.x+vb.width+margin)&&
        (bbox.y+bbox.height>=vb.y-margin)&&
        (bbox.y<=vb.y+vb.height+margin);
      return visible?null:'none';
    });
  };
  window.addEventListener('resize',updateCull);
  return updateCull;
}

// ── NODE DRAWING ──────────────────────────────────────────────────────────────

/** Smart label positioning: detects collisions and moves text to avoid overlaps */
function getOptimalLabelPosition(x, y, textWidth, textHeight, shapes=[], radius=60) {
  // Try positions in order: top, right, bottom, left, then top-left, top-right, etc.
  const positions = [
    {x, y: y - radius, dy: -radius},  // top
    {x: x + radius, y, dx: radius},    // right
    {x, y: y + radius, dy: radius},    // bottom
    {x: x - radius, y, dx: -radius},   // left
    {x: x + radius*0.7, y: y - radius*0.7, dx: radius*0.7, dy: -radius*0.7},  // top-right
    {x: x - radius*0.7, y: y - radius*0.7, dx: -radius*0.7, dy: -radius*0.7}, // top-left
  ];
  
  for (const pos of positions) {
    let collides = false;
    for (const shape of shapes) {
      const dist = Math.sqrt(Math.pow(pos.x - shape.x, 2) + Math.pow(pos.y - shape.y, 2));
      if (dist < shape.r + 30) { // 30px buffer around shapes
        collides = true;
        break;
      }
    }
    if (!collides) return pos;
  }
  return {x, y}; // fallback to center if all positions collide
}

/** Improved Circle node with smart label positioning */
function hexN(p,x,y,r,color,txt,sub,delay=0,noAutofit=true){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('circle').attr('cx',x).attr('cy',y).attr('r',r)
    .attr('fill',color+'22').attr('stroke',color).attr('stroke-width',1);

  const mainTxt=fitNodeText(txt,r>=44?14:11);
  const subTxt=fitNodeText(sub,18);

  // Place main label inside circle if there's sub-label, else at center
  const mainY = subTxt ? y - 3 : y + 5;
  const mainSize = subTxt ? 13 : 14;

  if(mainTxt) {
    const mainTextEl=g.append('text')
      .attr('x',x).attr('y',mainY)
      .attr('text-anchor','middle')
      .attr('dominant-baseline','central')
      .attr('fill',color)
      .attr('font-size',mainSize)
      .attr('font-family','Courier New')
      .attr('pointer-events','none');
    if(noAutofit) mainTextEl.attr('data-autofit','off');
    mainTextEl.text(mainTxt);
  }

  // Place sub-label outside circle if present
  if(subTxt) {
    g.append('text')
      .attr('x',x).attr('y', y + r + 20)  // Below circle with buffer
      .attr('text-anchor','middle')
      .attr('dominant-baseline','hanging')
      .attr('fill',C.dim)
      .attr('font-size',11)
      .attr('font-family','Courier New')
      .attr('pointer-events','none')
      .text(subTxt);
  }
  return g;
}

/** Improved Rounded-rect node with smart label positioning */
function rectN(p,x,y,w2,h2,color,txt,sub,delay=0,noAutofit=false){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('rect')
    .attr('x',x-w2/2).attr('y',y-h2/2)
    .attr('width',w2).attr('height',h2)
    .attr('rx',6)
    .attr('fill',color+'18')
    .attr('stroke',color)
    .attr('stroke-width',1);

  const mainTxt=fitNodeText(txt.split('\n')[0],Math.max(8,Math.floor(w2/8)));
  const subTxt=fitNodeText(sub,Math.max(10,Math.floor(w2/7)));

  // Main label: inside rect
  if(mainTxt){
    const mainTextEl=g.append('text')
      .attr('x',x)
      .attr('y', subTxt ? y - 6 : y)
      .attr('font-family','Courier New')
      .attr('font-size',subTxt ? 12 : 13)
      .attr('fill',color)
      .attr('text-anchor','middle')
      .attr('dominant-baseline','central')
      .attr('pointer-events','none');

    if(noAutofit) mainTextEl.attr('data-autofit','off');
    if(txt.includes('\n')){
      createMultilineText(mainTextEl, txt, color, subTxt ? 12 : 13);
    } else {
      mainTextEl.text(mainTxt);
    }
  }

  // Sub-label: below rect with buffer
  if(subTxt) {
    g.append('text')
      .attr('x',x)
      .attr('y', y + h2/2 + 16)  // Below rect with buffer
      .attr('text-anchor','middle')
      .attr('dominant-baseline','hanging')
      .attr('fill',C.dim)
      .attr('font-size',11)
      .attr('font-family','Courier New')
      .attr('pointer-events','none')
      .text(subTxt);
  }
  return g;
}

/** Improved Diamond node */
function diamondN(p,x,y,s,color,txt,delay=0){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('rect')
    .attr('x',x-s/2).attr('y',y-s/2)
    .attr('width',s).attr('height',s)
    .attr('rx',2)
    .attr('fill',color+'18')
    .attr('stroke',color)
    .attr('stroke-width',1)
    .attr('transform',`rotate(45,${x},${y})`);
  
  const mainTxt=fitNodeText(txt.split('\n')[0],9);
  if(mainTxt){
    const textEl=g.append('text')
      .attr('x',x)
      .attr('y', y + 4)
      .attr('font-size',10)
      .attr('font-family','Courier New')
      .attr('text-anchor','middle')
      .attr('dominant-baseline','central')
      .attr('fill',color)
      .attr('pointer-events','none');
    
    if(txt.includes('\n')){
      createMultilineText(textEl, txt, color, 10);
    } else {
      textEl.text(mainTxt);
    }
  }
  return g;
}

/** Straight edge line with optional arrowhead and dash */
function edgeLine(p,x1,y1,x2,y2,color,marker,dash,delay=0){
  const l=p.append('line')
    .attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
    .attr('stroke',color).attr('stroke-width',1)
    .attr('stroke-dasharray',dash||null)
    .attr('marker-end',marker?`url(#${marker})`:null)
    .style('opacity',0);
  l.transition().delay(delay).duration(300).style('opacity',1);
  return l;
}

/** Curved arc edge between two points */
function arcPath(p,x1,y1,x2,y2,color,marker,delay=0){
  const mx=(x1+x2)/2,my=(y1+y2)/2;
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
  const cpx=mx-dy/len*32,cpy=my+dx/len*32;
  const l=p.append('path')
    .attr('d',`M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`)
    .attr('stroke',color).attr('stroke-width',1).attr('fill','none')
    .attr('marker-end',marker?`url(#${marker})`:null)
    .style('opacity',0);
  l.transition().delay(delay).duration(300).style('opacity',1);
  return l;
}

/** Improved floating text label with background for readability */
function lbl(p,x,y,text,color,size,delay=0,noAutofit=false){
  const g = p.append('g').style('opacity',0);

  // Create text first to measure it
  const t = g.append('text')
    .attr('x',x).attr('y',y)
    .attr('text-anchor','middle')
    .attr('font-family','Georgia,serif')
    .attr('fill',color||C.dim)
    .attr('font-size',size||13)
    .attr('pointer-events','none');

  if(noAutofit) t.attr('data-autofit','off');
  createMultilineText(t, text, color||C.dim, size||13);

  // Add subtle background box for contrast
  const bbox = t.node().getBBox();
  const padding = 6;
  g.insert('rect', ':first-child')
    .attr('x', bbox.x - padding)
    .attr('y', bbox.y - padding)
    .attr('width', bbox.width + padding*2)
    .attr('height', bbox.height + padding*2)
    .attr('rx', 4)
    .attr('fill', C.bg2)
    .attr('opacity', 0.85)
    .attr('pointer-events', 'none');

  g.transition().delay(delay).duration(400).style('opacity',1);
  return g;
}

/** Measure the rendered scene against the current SVG viewBox. */
function collectSceneMetrics(svgSel){
  const node=svgSel?.node?.();
  if(!node)return null;
  let bbox;
  try{
    bbox=node.getBBox();
  }catch{
    return null;
  }
  if(!Number.isFinite(bbox.width)||!Number.isFinite(bbox.height)||bbox.width<=0||bbox.height<=0)return null;
  const vb=node.viewBox?.baseVal;
  if(!vb)return null;
  return{
    bbox:{x:bbox.x,y:bbox.y,width:bbox.width,height:bbox.height},
    viewBox:{x:vb.x,y:vb.y,width:vb.width,height:vb.height},
    occupancyX:bbox.width/vb.width,
    occupancyY:bbox.height/vb.height,
    leftGap:bbox.x-vb.x,
    topGap:bbox.y-vb.y,
    rightGap:(vb.x+vb.width)-(bbox.x+bbox.width),
    bottomGap:(vb.y+vb.height)-(bbox.y+bbox.height),
  };
}

/** Fit the SVG viewBox to the actually rendered content with guardrails. */
function fitSceneFrame(svgSel,opts={}){
  const metrics=collectSceneMetrics(svgSel);
  if(!metrics)return null;
  const padding=opts.padding??30;
  const minWidth=opts.minWidth??460;
  const minHeight=opts.minHeight??460;
  const maxWidth=opts.maxWidth??620;
  const maxHeight=opts.maxHeight??620;
  const bbox=metrics.bbox;
  const targetWidth=Math.max(minWidth,Math.min(maxWidth,bbox.width+padding*2));
  const targetHeight=Math.max(minHeight,Math.min(maxHeight,bbox.height+padding*2));
  const cx=bbox.x+bbox.width/2;
  const cy=bbox.y+bbox.height/2;
  svgSel.attr('viewBox',`${cx-targetWidth/2} ${cy-targetHeight/2} ${targetWidth} ${targetHeight}`);
  return collectSceneMetrics(svgSel);
}

function isSceneDebugEnabled(){
  try{
    const params=new URLSearchParams(window.location.search);
    return params.get('scene-debug')==='1';
  }catch{
    return false;
  }
}

function drawSceneDebugOverlay(svgSel,metrics){
  if(!metrics)return;
  svgSel.selectAll('.scene-debug-overlay').remove();
  const g=svgSel.append('g').attr('class','scene-debug-overlay').style('pointer-events','none');
  const vb=metrics.viewBox;
  const bb=metrics.bbox;
  g.append('rect')
    .attr('x',vb.x).attr('y',vb.y).attr('width',vb.width).attr('height',vb.height)
    .attr('fill','none').attr('stroke',C.blue).attr('stroke-width',1.5).attr('stroke-dasharray','8,4');
  g.append('rect')
    .attr('x',bb.x).attr('y',bb.y).attr('width',bb.width).attr('height',bb.height)
    .attr('fill','none').attr('stroke',C.red).attr('stroke-width',1).attr('stroke-dasharray','4,3');
  const lines=[
    `content ${Math.round(bb.width)}x${Math.round(bb.height)}`,
    `viewBox ${Math.round(vb.width)}x${Math.round(vb.height)}`,
    `gaps L${Math.round(metrics.leftGap)} T${Math.round(metrics.topGap)} R${Math.round(metrics.rightGap)} B${Math.round(metrics.bottomGap)}`
  ];
  g.append('rect')
    .attr('x',vb.x+12).attr('y',vb.y+12).attr('width',210).attr('height',58)
    .attr('rx',6).attr('fill',C.bg2).attr('stroke',C.border).attr('opacity',0.95);
  lines.forEach((line,i)=>{
    g.append('text')
      .attr('x',vb.x+22).attr('y',vb.y+30+i*15)
      .attr('fill',i===0?C.red:(i===1?C.blue:C.dim))
      .attr('font-size',10)
      .attr('font-family','Courier New')
      .text(line);
  });
}

/** Fit scene framing and expose diagnostics for ad-hoc validation. */
function finalizeScene(svgSel,opts={}){
  const metrics=fitSceneFrame(svgSel,opts)||collectSceneMetrics(svgSel);
  if(metrics){
    window.__agentlensSceneMetrics=metrics;
    if(isSceneDebugEnabled())drawSceneDebugOverlay(svgSel,metrics);
  }
  return metrics;
}

/** Performance observer: tracks render frame rate and scene complexity */
function createPerfObserver(svgSel){
  let frameCount=0,lastTime=performance.now(),fps=60,elementCount=0;
  const observer={
    fps:()=>fps,
    elements:()=>svgSel.selectAll('*').size(),
    record:()=>{frameCount++;const now=performance.now();if(now-lastTime>=1000){fps=frameCount;frameCount=0;lastTime=now;}},
    report:()=>({fps,elementCount:observer.elements()})
  };
  return observer;
}

/** Accessibility helper: adds semantic labeling and focus management */
function addAriaLabel(sel,label){
  sel.attr('role','img').attr('aria-label',label).attr('tabindex','0');
  return sel;
}

/** Animated packet that travels along a line */
function pkt(p,x1,y1,x2,y2,color,dur,delay,r2=5,repeat=true){
  const c=p.append('circle').attr('cx',x1).attr('cy',y1).attr('r',r2)
    .attr('fill',color).attr('filter','url(#glow)').style('opacity',0);
  function anim(){
    c.attr('cx',x1).attr('cy',y1).style('opacity',0)
      .transition().delay(delay).duration(200).style('opacity',1)
      .transition().duration(dur).attr('cx',x2).attr('cy',y2)
      .transition().duration(150).style('opacity',0)
      .on('end',()=>{if(repeat){const id=setTimeout(anim,400);timers.push(id);}});
  }
  anim();
  return c;
}

// ── DECLARATIVE SCENE RENDERER ───────────────────────────────────────────────
/**
 * renderScene(svg, w, h, config)
 *
 * Renders a scene from a pure data config — no manual coordinate math.
 * All x/y values are RELATIVE (0.0–1.0) mapped to the SVG's actual pixel size.
 *
 * config shape:
 * {
 *   title: string,
 *   nodes: [{
 *     id: string,            // used to connect edges
 *     type: 'circle'|'rect'|'diamond',
 *     label: string,
 *     sub:   string|null,
 *     color: string,         // key in C: 'blue','green','orange','purple','red','yellow','dim'
 *     x: 0..1,               // horizontal position (0=left edge, 1=right edge)
 *     y: 0..1,               // vertical position   (0=top,       1=bottom)
 *     r:  number,            // circle radius px   (default 32)
 *     w:  number,            // rect width px      (default 90)
 *     h:  number,            // rect height px     (default 36)
 *     s:  number,            // diamond size px    (default 40)
 *     delay: number,         // ms (auto-staggered if omitted)
 *   }],
 *   edges: [{
 *     from: string, to: string,
 *     color: string,
 *     marker: 'arrowBlue'|'arrowGreen'|'arrowOrange'|'arrowRed'|'arrowYellow'|'arrowPurple'|null,
 *     dash:   string|null,   // e.g. '4,3'
 *     animate: boolean,      // add a travelling packet (default false)
 *     delay:  number,
 *   }],
 *   labels: [{
 *     text: string,
 *     x: 0..1, y: 0..1,
 *     color: string,
 *     size: number,
 *     delay: number,
 *   }]
 * }
 */
function renderScene(svg, w, h, config){
  const {title, nodes=[], edges=[], labels=[]} = config;

  // Scene title
  if(title) lbl(svg, w/2, 42, title, C.text, 15, 0);

  // Convert relative → absolute coords
  function ax(xRel){ return xRel * w; }
  function ay(yRel){ return yRel * h; }

  // Build node map for edge lookup
  const nodeMap = {};
  nodes.forEach((n,i)=>{
    const px = ax(n.x), py = ay(n.y);
    const color = C[n.color] || n.color || C.dim;
    const delay = n.delay ?? (i * 150 + 100);
    nodeMap[n.id] = { x:px, y:py, type:n.type,
      r: n.r||32, w: n.w||90, h: n.h||36, s: n.s||40 };
    if(n.type==='rect'){
      rectN(svg, px, py, n.w||90, n.h||36, color, n.label, n.sub||null, delay);
    } else if(n.type==='diamond'){
      diamondN(svg, px, py, n.s||40, color, n.label, delay);
    } else {
      hexN(svg, px, py, n.r||32, color, n.label, n.sub||null, delay);
    }
  });

  // Edge endpoint on node surface (direction-aware)
  function surfacePt(n, dx, dy){
    const len = Math.sqrt(dx*dx+dy*dy)||1;
    const nx=dx/len, ny=dy/len;
    if(n.type==='rect'){
      const hw=n.w/2, hh=n.h/2;
      const t = (Math.abs(nx)<1e-9) ? hh/Math.abs(ny)
                : (Math.abs(ny)<1e-9) ? hw/Math.abs(nx)
                : Math.min(hw/Math.abs(nx), hh/Math.abs(ny));
      return {x: n.x+nx*t, y: n.y+ny*t};
    }
    if(n.type==='diamond') return {x: n.x+nx*(n.s/Math.SQRT2), y: n.y+ny*(n.s/Math.SQRT2)};
    return {x: n.x+nx*n.r, y: n.y+ny*n.r};
  }

  // Draw edges
  const baseEdgeDelay = nodes.length * 150 + 100;
  edges.forEach((e,i)=>{
    const a = nodeMap[e.from], b = nodeMap[e.to];
    if(!a||!b) return;
    const color = C[e.color]||e.color||C.dim;
    const dx=b.x-a.x, dy=b.y-a.y;
    const p1 = surfacePt(a, dx, dy);
    const p2 = surfacePt(b, -dx, -dy);
    const delay = e.delay ?? (baseEdgeDelay + i*120);
    edgeLine(svg, p1.x, p1.y, p2.x, p2.y, color, e.marker||null, e.dash||null, delay);
    if(e.animate){
      pkt(svg, p1.x, p1.y, p2.x, p2.y, color, 500, 0, 5, true);
    }
  });

  // Floating labels
  labels.forEach((l,i)=>{
    const color = C[l.color]||l.color||C.dim;
    const delay = l.delay ?? (i*100);
    lbl(svg, ax(l.x??0.5), ay(l.y??0.5), l.text, color, l.size||12, delay);
  });
}

function startHeroNetworkAnimation({
  selector='#hero-bg',
  width=1400,
  height=900,
  nodeCount=18,
  linkDistance=150,
  fps=30,
  palette=[C.blue,C.purple,C.green,C.orange],
  avoidRect=null,
}={}){
  const root=d3.select(selector);
  if(root.empty())return ()=>{};
  root.selectAll('*').remove();
  const linesG=root.append('g');

  function randomNode(){
    let x=0,y=0,guard=0;
    do{
      x=Math.random()*width;
      y=Math.random()*height;
      guard++;
    }while(
      avoidRect &&
      x>=avoidRect.x &&
      x<=avoidRect.x+avoidRect.w &&
      y>=avoidRect.y &&
      y<=avoidRect.y+avoidRect.h &&
      guard<12
    );
    return{
      x,y,
      vx:(Math.random()-.5)*.4,
      vy:(Math.random()-.5)*.4,
      r:Math.random()*3+2,
      color:palette[Math.floor(Math.random()*palette.length)],
    };
  }

  const nodes=Array.from({length:nodeCount},()=>randomNode());
  const circles=root.selectAll('circle').data(nodes).enter().append('circle')
    .attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',d=>d.r)
    .attr('fill',d=>d.color).attr('opacity',.35);

  const pairs=[];
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++)pairs.push({a:i,b:j});
  }
  const lineEls=linesG.selectAll('line').data(pairs).enter().append('line')
    .attr('stroke-width',.5)
    .style('display','none');

  let rafId=0;
  let running=true;
  let lastTs=0;
  const frameMs=1000/Math.max(12,fps);

  function tick(ts){
    if(!running)return;
    if(ts-lastTs<frameMs){
      rafId=requestAnimationFrame(tick);
      return;
    }
    lastTs=ts;
    nodes.forEach(n=>{
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>width)n.vx*=-1;
      if(n.y<0||n.y>height)n.vy*=-1;
    });
    circles.attr('cx',d=>d.x).attr('cy',d=>d.y);

    lineEls.each(function(d){
      const na=nodes[d.a],nb=nodes[d.b];
      const dx=na.x-nb.x,dy=na.y-nb.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<linkDistance){
        this.style.display='inline';
        this.setAttribute('x1',na.x);
        this.setAttribute('y1',na.y);
        this.setAttribute('x2',nb.x);
        this.setAttribute('y2',nb.y);
        this.setAttribute('stroke',na.color);
        this.setAttribute('opacity',Math.max(0,(1-dist/linkDistance)*.3));
      }else{
        this.style.display='none';
      }
    });
    rafId=requestAnimationFrame(tick);
  }

  function stop(){
    running=false;
    if(rafId)cancelAnimationFrame(rafId);
  }

  function onVisibility(){
    if(document.hidden){
      if(rafId)cancelAnimationFrame(rafId);
      return;
    }
    if(running){
      lastTs=0;
      rafId=requestAnimationFrame(tick);
    }
  }

  document.addEventListener('visibilitychange',onVisibility);
  rafId=requestAnimationFrame(tick);

  const heroEl=document.getElementById('hero');
  let heroObs=null;
  if(heroEl){
    heroObs=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting)stop();
    },{threshold:0});
    heroObs.observe(heroEl);
  }

  return ()=>{
    stop();
    document.removeEventListener('visibilitychange',onVisibility);
    if(heroObs)heroObs.disconnect();
  };
}

// ── SHARED UI (call once, pass the page's renderStep function) ────────────────
/**
 * initSharedUI(renderStepFn)
 * Sets up scroll progress bar and theme toggle for any guide page.
 * Call this at the bottom of each page's <script>, passing that page's renderStep.
 */
function initSharedUI(renderStepFn){
  function rerenderCurrent(){
    if(!renderStepFn)return;
    const step=activeStep>=0?activeStep:0;
    activeStep=-1;
    renderStepFn(step);
  }

  // Loading state during transitions
  const loader=document.createElement('div');
  loader.id='loader';
  loader.innerHTML='<div class="loader-dot"></div>';
  document.body.appendChild(loader);
  const origTransition=window.transitionTo;
  window.transitionTo=function(step){
    loader.style.opacity='1';
    origTransition(step);
    setTimeout(()=>loader.style.opacity='0',300);
  };

  // Skip to Part menu
  const parts=[];
  const sections=document.querySelectorAll('.section-break');
  if(sections.length===0){
    // Pages 08-09: look for phase sections
    document.querySelectorAll('section.scrolly[id^="phase"]').forEach((s,i)=>{
      parts.push({label:`Phase ${i+1}`,el:s});
    });
  }else{
    // Pages 01-07: extract from section-break labels (part number + name)
    sections.forEach(s=>{
      const labels=s.querySelectorAll('.sb-label');
      const partNum=labels[0]?.textContent||'';
      const partName=labels[1]?.textContent||'';
      const label=partName?`${partNum}: ${partName}`:partNum;
      if(label)parts.push({label,el:s});
    });
  }
  if(parts.length>0){
    const menu=document.createElement('div');
    menu.id='skip-menu';
    menu.innerHTML='<button id="skip-btn">Parts</button><div id="skip-list" style="display:none">'+
      parts.map((p,i)=>`<a href="#" data-idx="${i}">${p.label}</a>`).join('')+
      '</div>';
    document.body.appendChild(menu);
    const btn=document.getElementById('skip-btn');
    const list=document.getElementById('skip-list');
    btn.addEventListener('click',e=>{e.stopPropagation();list.style.display=list.style.display==='none'?'block':'none'});
    document.addEventListener('click',()=>list.style.display='none');
    document.querySelectorAll('#skip-list a').forEach((a,i)=>{
      a.addEventListener('click',e=>{e.preventDefault();parts[i].el.scrollIntoView({behavior:'smooth'});list.style.display='none'});
    });
  }

  // Scroll progress bar (throttled to 60fps)
  let lastScrollUpdate=0;
  window.addEventListener('scroll',()=>{
    const now=performance.now();
    if(now-lastScrollUpdate<16)return; // ~60fps
    lastScrollUpdate=now;
    const st=window.scrollY,docH=document.documentElement.scrollHeight-window.innerHeight;
    const prog=document.getElementById('prog');
    if(prog)prog.style.transform=`scaleX(${docH>0?st/docH:0})`;
  },{passive:true});

  // Theme toggle
  const btn=document.getElementById('themeToggle');
  const prefersDark=window.matchMedia('(prefers-color-scheme:dark)');
  function getTheme(){const s=localStorage.getItem('theme');return s||(prefersDark.matches?'dark':'light');}
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    btn.textContent=t==='dark'?'☀️':'🌙';
    localStorage.setItem('theme',t);
    syncC();
    rerenderCurrent();
  }
  applyTheme(getTheme());
  btn.addEventListener('click',()=>{
    const cur=document.documentElement.getAttribute('data-theme')||(prefersDark.matches?'dark':'light');
    applyTheme(cur==='dark'?'light':'dark');
  });

  // Responsive rerender to prevent stale viewBox/text overlap after resize.
  let resizeTimer=0;
  const onResize=()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(rerenderCurrent,180);
  };
  window.addEventListener('resize',onResize,{passive:true});
  window.addEventListener('orientationchange',onResize,{passive:true});
}
