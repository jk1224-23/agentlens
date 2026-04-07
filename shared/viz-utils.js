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

// ── SVG HELPERS ───────────────────────────────────────────────────────────────
function getSize(svgEl){
  // Return fixed internal coordinate space (560x560) for all renders.
  // This prevents SVG text/node overflow on narrow viewports.
  // The SVG scales responsively via viewBox and preserveAspectRatio.
  return{w:560,h:560};
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

// ── NODE DRAWING ──────────────────────────────────────────────────────────────

/** Calculate minimum width needed for text in rect (with padding) */
function calcMinWidth(txt, sub, fontSize=13, padding=20) {
  // Approximate: Courier New ~7.5px per character at 13px font size
  const charWidth = fontSize * 0.58;
  const mainWidth = (txt || '').length * charWidth;
  const subWidth = (sub || '').length * (fontSize * 0.55);
  return Math.max(mainWidth, subWidth) + padding;
}

/** Calculate minimum height needed for rect with dual labels */
function calcMinHeight(hasSub=false, fontSize=13, subSize=11) {
  // Main text + padding + sub text + spacing
  return hasSub ? (fontSize + 8 + subSize + 12) : (fontSize + 12);
}

/** Circle node with optional label + sub-label */
function hexN(p,x,y,r,color,txt,sub,delay=0){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('circle').attr('cx',x).attr('cy',y).attr('r',r)
    .attr('fill',color+'22').attr('stroke',color).attr('stroke-width',1.5);
  const mainTxt=fitNodeText(txt,r>=44?14:11);
  const subTxt=fitNodeText(sub,18);
  if(mainTxt)g.append('text').attr('x',x).attr('y',subTxt?y-3:y+5).attr('text-anchor','middle')
    .attr('fill',color).attr('font-size',subTxt?13:14).attr('font-family','Courier New').text(mainTxt);
  if(subTxt)g.append('text').attr('x',x).attr('y',y+14).attr('text-anchor','middle')
    .attr('fill',C.dim).attr('font-size',11).attr('font-family','Courier New').text(subTxt);
  return g;
}

/** Rounded-rect node with optional label + sub-label (FIXED SIZE VERSION - kept for compatibility) */
function rectN(p,x,y,w2,h2,color,txt,sub,delay=0){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('rect').attr('x',x-w2/2).attr('y',y-h2/2).attr('width',w2).attr('height',h2)
    .attr('rx',6).attr('fill',color+'18').attr('stroke',color).attr('stroke-width',1.5);
  const mainTxt=fitNodeText(txt,Math.max(8,Math.floor(w2/8)));
  const subTxt=fitNodeText(sub,Math.max(10,Math.floor(w2/7)));
  if(mainTxt)g.append('text').attr('x',x).attr('y',subTxt?y-2:y+5).attr('text-anchor','middle')
    .attr('fill',color).attr('font-size',subTxt?12:13).attr('font-family','Courier New').text(mainTxt);
  if(subTxt)g.append('text').attr('x',x).attr('y',y+15).attr('text-anchor','middle')
    .attr('fill',C.dim).attr('font-size',11).attr('font-family','Courier New').text(subTxt);
  return g;
}

/** AUTO-SIZING Rounded-rect node - calculates size based on text length */
function rectNauto(p,x,y,color,txt,sub,delay=0){
  // Calculate minimum dimensions needed
  const minW = calcMinWidth(txt, sub, sub?12:13, 25);
  const minH = calcMinHeight(!!sub, sub?12:13, 11);

  const w2 = Math.max(minW, 100); // Minimum 100px
  const h2 = Math.max(minH, 36);  // Minimum 36px

  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('rect').attr('x',x-w2/2).attr('y',y-h2/2).attr('width',w2).attr('height',h2)
    .attr('rx',6).attr('fill',color+'18').attr('stroke',color).attr('stroke-width',1.5);

  // Use full text without truncation (it should fit now)
  if(txt)g.append('text').attr('x',x).attr('y',sub?y-2:y+5).attr('text-anchor','middle')
    .attr('fill',color).attr('font-size',sub?12:13).attr('font-family','Courier New')
    .attr('dominant-baseline','middle').text(txt);
  if(sub)g.append('text').attr('x',x).attr('y',y+15).attr('text-anchor','middle')
    .attr('fill',C.dim).attr('font-size',11).attr('font-family','Courier New')
    .attr('dominant-baseline','middle').text(sub);
  return g;
}

/** Diamond (rotated square) node */
function diamondN(p,x,y,s,color,txt,delay=0){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('rect').attr('x',x-s/2).attr('y',y-s/2).attr('width',s).attr('height',s)
    .attr('rx',2).attr('fill',color+'18').attr('stroke',color).attr('stroke-width',1.5)
    .attr('transform',`rotate(45,${x},${y})`);
  const mainTxt=fitNodeText(txt,9);
  if(mainTxt)g.append('text').attr('x',x).attr('y',y+4).attr('text-anchor','middle')
    .attr('fill',color).attr('font-size',10).attr('font-family','Courier New').text(mainTxt);
  return g;
}

/** Straight edge line with optional arrowhead and dash */
function edgeLine(p,x1,y1,x2,y2,color,marker,dash,delay=0){
  const l=p.append('line')
    .attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2)
    .attr('stroke',color).attr('stroke-width',1.5)
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
    .attr('stroke',color).attr('stroke-width',1.5).attr('fill','none')
    .attr('marker-end',marker?`url(#${marker})`:null)
    .style('opacity',0);
  l.transition().delay(delay).duration(300).style('opacity',1);
  return l;
}

/** Floating text label */
function lbl(p,x,y,text,color,size,delay=0){
  const t=p.append('text').attr('x',x).attr('y',y).attr('text-anchor','middle')
    .attr('fill',color||C.dim).attr('font-size',size||13).attr('font-family','Georgia,serif')
    .style('opacity',0).text(text);
  t.transition().delay(delay).duration(400).style('opacity',1);
  return t;
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

  // Scroll progress bar
  window.addEventListener('scroll',()=>{
    const st=window.scrollY,docH=document.documentElement.scrollHeight-window.innerHeight;
    const prog=document.getElementById('prog');
    if(prog)prog.style.width=(st/docH*100)+'%';
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
