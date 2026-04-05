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

// ── SVG HELPERS ───────────────────────────────────────────────────────────────
function getSize(svgEl){
  const r=svgEl.getBoundingClientRect();
  return{w:r.width||500,h:r.height||500};
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

/** Circle node with optional label + sub-label */
function hexN(p,x,y,r,color,txt,sub,delay=0){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('circle').attr('cx',x).attr('cy',y).attr('r',r)
    .attr('fill',color+'22').attr('stroke',color).attr('stroke-width',1.5);
  if(txt)g.append('text').attr('x',x).attr('y',sub?y-3:y+5).attr('text-anchor','middle')
    .attr('fill',color).attr('font-size',sub?13:14).attr('font-family','Courier New').text(txt);
  if(sub)g.append('text').attr('x',x).attr('y',y+14).attr('text-anchor','middle')
    .attr('fill',C.dim).attr('font-size',11).attr('font-family','Courier New').text(sub);
  return g;
}

/** Rounded-rect node with optional label + sub-label */
function rectN(p,x,y,w2,h2,color,txt,sub,delay=0){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('rect').attr('x',x-w2/2).attr('y',y-h2/2).attr('width',w2).attr('height',h2)
    .attr('rx',6).attr('fill',color+'18').attr('stroke',color).attr('stroke-width',1.5);
  if(txt)g.append('text').attr('x',x).attr('y',sub?y-2:y+5).attr('text-anchor','middle')
    .attr('fill',color).attr('font-size',sub?12:13).attr('font-family','Courier New').text(txt);
  if(sub)g.append('text').attr('x',x).attr('y',y+15).attr('text-anchor','middle')
    .attr('fill',C.dim).attr('font-size',11).attr('font-family','Courier New').text(sub);
  return g;
}

/** Diamond (rotated square) node */
function diamondN(p,x,y,s,color,txt,delay=0){
  const g=p.append('g').style('opacity',0);
  g.transition().delay(delay).duration(400).style('opacity',1);
  g.append('rect').attr('x',x-s/2).attr('y',y-s/2).attr('width',s).attr('height',s)
    .attr('rx',2).attr('fill',color+'18').attr('stroke',color).attr('stroke-width',1.5)
    .attr('transform',`rotate(45,${x},${y})`);
  if(txt)g.append('text').attr('x',x).attr('y',y+4).attr('text-anchor','middle')
    .attr('fill',color).attr('font-size',10).attr('font-family','Courier New').text(txt);
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

// ── SHARED UI (call once, pass the page's renderStep function) ────────────────
/**
 * initSharedUI(renderStepFn)
 * Sets up scroll progress bar and theme toggle for any guide page.
 * Call this at the bottom of each page's <script>, passing that page's renderStep.
 */
function initSharedUI(renderStepFn){
  // Scroll progress bar
  window.addEventListener('scroll',()=>{
    const st=window.scrollY,docH=document.documentElement.scrollHeight-window.innerHeight;
    const prog=document.getElementById('prog');
    if(prog)prog.style.width=(st/docH*100)+'%';
  },{passive:true});

  // Theme toggle
  const btn=document.getElementById('theme-btn');
  const prefersDark=window.matchMedia('(prefers-color-scheme:dark)');
  function getTheme(){const s=localStorage.getItem('theme');return s||(prefersDark.matches?'dark':'light');}
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    btn.textContent=t==='dark'?'☀️':'🌙';
    localStorage.setItem('theme',t);
    syncC();
    if(renderStepFn){const prev=activeStep;activeStep=-1;renderStepFn(prev);}
  }
  applyTheme(getTheme());
  btn.addEventListener('click',()=>{
    const cur=document.documentElement.getAttribute('data-theme')||(prefersDark.matches?'dark':'light');
    applyTheme(cur==='dark'?'light':'dark');
  });
}
