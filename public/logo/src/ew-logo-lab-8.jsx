/* eslint-disable */
// Echowai — Logo Lab vol. 8
// 50 best-in-class interactive logos. Aim: most innovative animation + interaction.

const LogoLab8Styles = () => (
  <style>{`
    @keyframes voltGrad { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes glowPulse2 { 0%, 100% { filter: drop-shadow(0 0 0 transparent); } 50% { filter: drop-shadow(0 0 8px var(--volt-glow)); } }
    @keyframes shimmerSweep { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes morphRotate { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
    @keyframes shockwave { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
    @keyframes squashStretch { 0%, 100% { transform: scaleY(1) scaleX(1); } 30% { transform: scaleY(0.7) scaleX(1.3); } 60% { transform: scaleY(1.2) scaleX(0.9); } }
    @keyframes glitchSlice { 0%, 100% { clip-path: inset(0 0 0 0); } 20% { clip-path: inset(20% 0 60% 0); transform: translateX(-2px); } 40% { clip-path: inset(60% 0 20% 0); transform: translateX(2px); } 60% { clip-path: inset(0 0 0 0); } }
    @keyframes letterFlipUp { 0% { transform: rotateX(0); } 50% { transform: rotateX(-90deg); } 100% { transform: rotateX(0); } }
    @keyframes elasticIn { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 80% { transform: scale(0.95); } 100% { transform: scale(1); } }
    @keyframes traceLine { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
    @keyframes gradientFlow { 0% { background-position: 0% 0%; } 100% { background-position: 100% 0%; } }
    @keyframes wipeUp { 0% { clip-path: inset(100% 0 0 0); } 100% { clip-path: inset(0 0 0 0); } }
    @keyframes letterFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  `}</style>
);

const $W8 = ({ scale=1, color="var(--ink)", accent="var(--volt)", style }) => (
  <span className="serif" style={{ fontSize:32*scale, lineHeight:1, letterSpacing:"-0.035em", fontWeight:500, color, ...style }}>
    echo<span style={{color:accent}}>wai</span>
  </span>
);
const $E8 = ({ scale=1 }) => {
  const { last, trend, source } = useEmmy();
  return (<div style={{display:"flex",alignItems:"center",gap:5,marginTop:0}}>
    <span style={{width:4,height:4,borderRadius:"50%",background:emmyHue(trend)}} className="volt-dot"/>
    <span className="mono" style={{fontSize:8.5*scale,color:"var(--muted)"}}>EMMY {last.toFixed(2)} {trend>0?"↑":trend<0?"↓":"→"}</span>
  </div>);
};
const $S8 = ({ scale=1, children }) => (<div style={{display:"inline-flex",flexDirection:"column"}}>{children}<$E8 scale={scale}/></div>);

// ─── 171. LIQUID MERCURY — letters morph and flow into each other ───
const L_Mercury = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$S8 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        display:"inline-block", cursor:"pointer", filter:`url(#mercuryFilter)`,
        transition:"filter .4s",
      }}>
      <svg width="0" height="0" style={{position:"absolute"}}>
        <filter id="mercuryFilter">
          <feGaussianBlur in="SourceGraphic" stdDeviation={h?"3":"0"} />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>
        </filter>
      </svg>
      <$W8 scale={scale} color={color} accent={accent} />
    </span>
  </$S8>);
};

// ─── 172. SOUND VISUALIZER — letters tied to live freq bars synced w/ EMMY ───
const L_SoundVis = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { series, last } = useEmmy();
  const [t, setT] = React.useState(0);
  React.useEffect(() => { let raf, s0=performance.now(); const loop=now=>{setT((now-s0)/600); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return ()=>cancelAnimationFrame(raf); }, []);
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"flex-end",gap:1.5,height:36*scale}} className="serif">
      {"echowai".split("").map((c,i)=>{
        const v = series[series.length-1-i]||CEE_BASELINE;
        const wave = 0.5 + Math.sin(t*1.5 + i*0.8)*0.5;
        const h = (emmyNorm(v)*0.6 + wave*0.4) * 32 + 12;
        return (<span key={i} style={{display:"inline-flex",flexDirection:"column",alignItems:"center"}}>
          <span style={{width:14*scale,height:6,background:accent,opacity:0.7,borderRadius:1,marginBottom:2,transform:`scaleY(${h/40})`,transformOrigin:"bottom",transition:"transform .3s var(--ease-out-quart)"}}/>
          <span style={{fontSize:24*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color}}>{c}</span>
        </span>);
      })}
    </span>
  </$S8>);
};

// ─── 173. ELASTIC SPRING — letters bounce in elastic on click ───
const L_Elastic = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [k,setK] = React.useState(0);
  return (<$S8 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <span key={k} style={{display:"inline-flex"}} className="serif">
        {"echowai".split("").map((c,i)=>(
          <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",animation:`elasticIn .7s cubic-bezier(.5,1.7,.5,1) ${i*0.06}s both`}}>{c}</span>
        ))}
      </span>
    </button>
  </$S8>);
};

// ─── 174. GLITCH SLICE — RGB slice glitch on EMMY tick ───
const L_GlitchSlice = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last } = useEmmy();
  const [k,setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(()=>{if(prev.current!==last){setK(k+1);prev.current=last;}},[last]);
  return (<$S8 scale={scale}>
    <span key={k} style={{display:"inline-block",position:"relative",animation:"glitchSlice .6s linear"}}>
      <$W8 scale={scale} color={color} accent={accent}/>
      <span style={{position:"absolute",inset:0,color:"#ff0040",mixBlendMode:"screen",transform:"translateX(-2px)",animation:"glitchSlice .6s linear"}}><$W8 scale={scale} color="#ff0040" accent="#ff0040"/></span>
      <span style={{position:"absolute",inset:0,color:"#00ffff",mixBlendMode:"screen",transform:"translateX(2px)",animation:"glitchSlice .6s linear"}}><$W8 scale={scale} color="#00ffff" accent="#00ffff"/></span>
    </span>
  </$S8>);
};

// ─── 175. SQUASH & STRETCH — physics-inspired hover ───
const L_SquashStretch = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [h,setH] = React.useState(0);
  return (<$S8 scale={scale}>
    <span onMouseEnter={()=>setH(x=>x+1)} key={h} style={{display:"inline-block",cursor:"pointer",animation:h>0?"squashStretch .5s cubic-bezier(.5,1.5,.5,1)":"none",transformOrigin:"bottom"}}>
      <$W8 scale={scale} color={color} accent={accent}/>
    </span>
  </$S8>);
};

// ─── 176. KINETIC TYPE — each letter has individual motion ───
const L_Kinetic = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span style={{display:"inline-flex"}} className="serif">
    {"echowai".split("").map((c,i)=>(
      <span key={i} style={{
        fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,
        color:i>=4?accent:color,display:"inline-block",
        animation:`letterFloat ${1.6+i*0.2}s ease-in-out ${i*0.15}s infinite`,
      }}>{c}</span>
    ))}
  </span>
</$S8>);

// ─── 177. SCAN LINE — single horizontal line scans across text ───
const L_ScanLine = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(()=>{ let raf, s0=performance.now(); const loop=now=>{setT(((now-s0)/2500)%1); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf); },[]);
  return (<$S8 scale={scale}>
    <span style={{position:"relative",display:"inline-block"}}>
      <$W8 scale={scale} color={color} accent={accent}/>
      <span style={{position:"absolute",left:0,right:0,top:`${t*100}%`,height:2,background:accent,boxShadow:`0 0 12px ${accent}`,pointerEvents:"none"}}/>
    </span>
  </$S8>);
};

// ─── 178. SHOCKWAVE BUTTON — click sends 3 shockwaves ───
const L_Shockwave = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [waves, setWaves] = React.useState([]);
  const fire = () => {
    const id = Math.random();
    setWaves(w=>[...w, id]);
    setTimeout(()=>setWaves(w=>w.filter(x=>x!==id)), 1400);
  };
  return (<$S8 scale={scale}>
    <button onClick={fire} style={{background:"transparent",border:0,padding:"12px 20px",cursor:"pointer",position:"relative"}}>
      <$W8 scale={scale} color={color} accent={accent}/>
      {waves.map(id=>([0,0.2,0.4].map((d,i)=>(
        <span key={`${id}-${i}`} style={{position:"absolute",inset:0,border:`1.5px solid ${accent}`,borderRadius:6,animation:`shockwave 1.4s var(--ease-out-quart) ${d}s forwards`,pointerEvents:"none"}}/>
      ))))}
    </button>
  </$S8>);
};

// ─── 179. PARALLAX DEPTH — multi-layer parallax ───
const L_Parallax = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const ref = React.useRef(null);
  const [m, setM] = React.useState({x:0,y:0});
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    setM({x:((e.clientX-r.left)/r.width-0.5)*10, y:((e.clientY-r.top)/r.height-0.5)*6});
  };
  return (<$S8 scale={scale}>
    <div ref={ref} onMouseMove={onMove} onMouseLeave={()=>setM({x:0,y:0})}
      style={{position:"relative",display:"inline-block",padding:"8px 12px",cursor:"crosshair"}}>
      <span style={{position:"absolute",inset:8,opacity:0.15,transform:`translate(${m.x*2}px,${m.y*2}px)`,transition:"transform .2s var(--ease-out-quart)"}}>
        <$W8 scale={scale} color={color} accent={accent}/>
      </span>
      <span style={{position:"absolute",inset:8,opacity:0.4,transform:`translate(${m.x}px,${m.y}px)`,transition:"transform .15s var(--ease-out-quart)"}}>
        <$W8 scale={scale} color={color} accent={accent}/>
      </span>
      <span style={{position:"relative",transform:`translate(${m.x*0.5}px,${m.y*0.5}px)`,transition:"transform .1s var(--ease-out-quart)"}}>
        <$W8 scale={scale} color={color} accent={accent}/>
      </span>
    </div>
  </$S8>);
};

// ─── 180. LIQUID FILL — text fills with EMMY-driven liquid level + wobble ───
const L_LiquidFill = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last, trend } = useEmmy();
  const [t, setT] = React.useState(0);
  React.useEffect(()=>{ let raf, s0=performance.now(); const loop=now=>{setT((now-s0)/400); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf); },[]);
  const fill = 30 + emmyNorm(last)*55;
  const waveD = `M 0 ${100-fill+Math.sin(t)*1.5} Q 25 ${100-fill-2+Math.sin(t+1)*2} 50 ${100-fill+Math.sin(t)*1.5} T 100 ${100-fill+Math.sin(t)*1.5} L 100 100 L 0 100 Z`;
  return (<$S8 scale={scale}>
    <span style={{position:"relative",display:"inline-block",lineHeight:1}}>
      <span className="serif" style={{fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,color:"transparent",WebkitTextStroke:`1.4px ${color}`,WebkitTextStrokeColor:color}}>echo<span style={{WebkitTextStrokeColor:accent}}>wai</span></span>
      <span style={{position:"absolute",inset:0,overflow:"hidden",clipPath:"url(#liquidPath)"}}>
        <svg width="0" height="0"><defs><clipPath id="liquidPath" clipPathUnits="objectBoundingBox"><path d={waveD.split(" ").map((p,i)=>i%3===0?p:isNaN(parseFloat(p))?p:(parseFloat(p)/100).toString()).join(" ")}/></clipPath></defs></svg>
        <span style={{position:"absolute",inset:0,background:emmyHue(trend),clipPath:`polygon(0 ${100-fill+Math.sin(t)*1.5}%, 25% ${100-fill-2+Math.sin(t+1)*2}%, 50% ${100-fill+Math.sin(t)*1.5}%, 75% ${100-fill-1+Math.sin(t+2)*2}%, 100% ${100-fill+Math.sin(t)*1.5}%, 100% 100%, 0 100%)`,transition:"background .4s"}}/>
        <span className="serif" style={{position:"absolute",inset:0,fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,color:"#fff",mixBlendMode:"difference"}}>echowai</span>
      </span>
    </span>
  </$S8>);
};

// ─── 181. KEYBOARD KEYS — letters as 3D keys, press on click ───
const L_KeyboardKeys = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [pressed, setPressed] = React.useState(-1);
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex",gap:3}}>
      {"echowai".split("").map((c,i)=>(
        <button key={i} onMouseDown={()=>setPressed(i)} onMouseUp={()=>setPressed(-1)} onMouseLeave={()=>setPressed(-1)}
          style={{
            width:24*scale, height:30*scale, fontFamily:"var(--font-display)", fontSize:18*scale, fontWeight:500,
            background: i>=4 ? accent : "var(--card)", color: i>=4 ? "#fff" : color,
            border: `1px solid ${i>=4 ? accent : "var(--rule-on)"}`, borderRadius:3, cursor:"pointer",
            boxShadow: pressed===i ? "inset 0 2px 0 rgba(0,0,0,.2)" : "0 2px 0 rgba(10,31,61,.15)",
            transform: pressed===i ? "translateY(2px)" : "translateY(0)",
            transition: "all .08s",
          }}>{c}</button>
      ))}
    </span>
  </$S8>);
};

// ─── 182. CIRCULAR TEXT — text on a circular path ───
const L_CircularText = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <svg width={72*scale} height={72*scale} viewBox="0 0 72 72" style={{animation:"morphRotate 14s linear infinite",transformOrigin:"36px 36px"}}>
    <defs><path id="circT" d="M 36 36 m -28 0 a 28 28 0 1 1 56 0 a 28 28 0 1 1 -56 0"/></defs>
    <text fontSize="9" fontFamily="var(--font-display)" fontWeight="500" letterSpacing="3" fill={color}>
      <textPath href="#circT">echowai · echowai · echowai · </textPath>
    </text>
    <circle cx="36" cy="36" r="6" fill={accent}/>
  </svg>
</$S8>);

// ─── 183. PIXEL DRIFT — letters dissolve into pixels on hover ───
const L_PixelDrift = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$S8 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:"inline-block",cursor:"pointer",filter:h?"url(#pxFilter)":"none",transition:"filter .3s"}}>
      <svg width="0" height="0"><filter id="pxFilter"><feFlood floodColor="transparent"/><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter></svg>
      <$W8 scale={scale} color={color} accent={accent}/>
    </span>
  </$S8>);
};

// ─── 184. LETTER FLIP — 3D card flip per letter on tick ───
const L_LetterFlip = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last } = useEmmy();
  const [k, setK] = React.useState(0);
  const prev = React.useRef(last);
  React.useEffect(()=>{if(prev.current!==last){setK(k+1);prev.current=last;}},[last]);
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex",perspective:200}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={`${k}-${i}`} style={{
          fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,
          color:i>=4?accent:color,display:"inline-block",
          animation:`letterFlipUp .6s var(--ease-out-quart) ${i*0.08}s`,transformOrigin:"center",
        }}>{c}</span>
      ))}
    </span>
  </$S8>);
};

// ─── 185. AMBIENT PARTICLES — soft floating particles around wordmark ───
const L_AmbientParticles = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(()=>{ let raf, s0=performance.now(); const loop=now=>{setT((now-s0)/1000); raf=requestAnimationFrame(loop);}; raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf); },[]);
  const parts = React.useMemo(()=>Array.from({length:14},(_,i)=>({
    bx:10+Math.random()*180, by:5+Math.random()*30, sp:0.4+Math.random()*0.8, ph:Math.random()*Math.PI*2,
  })),[]);
  return (<$S8 scale={scale}>
    <span style={{position:"relative",display:"inline-block",padding:"6px 12px"}}>
      <svg style={{position:"absolute",inset:0,pointerEvents:"none"}} viewBox="0 0 200 40" preserveAspectRatio="none">
        {parts.map((p,i)=>(
          <circle key={i} cx={p.bx + Math.cos(t*p.sp + p.ph)*8} cy={p.by + Math.sin(t*p.sp + p.ph)*4} r="0.8" fill={accent} opacity={0.3+Math.sin(t*p.sp)*0.3}/>
        ))}
      </svg>
      <$W8 scale={scale} color={color} accent={accent}/>
    </span>
  </$S8>);
};

// ─── 186. INKED — splotch grows from a clicked letter ───
const L_Inked = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [pos, setPos] = React.useState(null);
  return (<$S8 scale={scale}>
    <span style={{position:"relative",display:"inline-block",cursor:"crosshair"}}
      onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();setPos({x:e.clientX-r.left,y:e.clientY-r.top,id:Math.random()});setTimeout(()=>setPos(null),1200);}}>
      <$W8 scale={scale} color={color} accent={accent}/>
      {pos && <span key={pos.id} style={{
        position:"absolute",left:pos.x,top:pos.y,width:8,height:8,background:accent,borderRadius:"50%",
        transform:"translate(-50%,-50%)",animation:"shockwave 1.2s var(--ease-out-quart) forwards",mixBlendMode:"multiply",pointerEvents:"none",
      }}/>}
    </span>
  </$S8>);
};

// ─── 187. GRADIENT SHIMMER — moving shimmer across letters ───
const L_Shimmer = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span style={{
    display:"inline-block",
    backgroundImage:`linear-gradient(110deg, ${color} 30%, ${accent} 50%, ${color} 70%)`,
    backgroundSize:"200% 100%", WebkitBackgroundClip:"text", backgroundClip:"text",
    color:"transparent", animation:"shimmerSweep 2.4s linear infinite",
    fontFamily:"var(--font-display)",fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,
  }}>echowai</span>
</$S8>);

// ─── 188. CURSOR REPULSION — letters push away from cursor ───
const L_CursorRepulse = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const ref = React.useRef(null);
  const [m, setM] = React.useState(null);
  return (<$S8 scale={scale}>
    <span ref={ref} onMouseMove={(e)=>{const r=ref.current.getBoundingClientRect();setM({x:e.clientX-r.left,y:e.clientY-r.top});}} onMouseLeave={()=>setM(null)}
      style={{display:"inline-flex",cursor:"crosshair",padding:"4px 8px"}} className="serif">
      {"echowai".split("").map((c,i)=>{
        const lx = i*(18*scale)+9;
        let dx=0,dy=0;
        if(m){const ddx=lx-m.x,ddy=16-m.y,d=Math.hypot(ddx,ddy);if(d<60){const k=(60-d)/60*0.8;dx=ddx*k;dy=ddy*k;}}
        return <span key={i} style={{
          fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",
          transform:`translate(${dx}px,${dy}px)`,transition:"transform .25s cubic-bezier(.5,1.4,.5,1)",
        }}>{c}</span>;
      })}
    </span>
  </$S8>);
};

// ─── 189. NUMBER MORPH — wordmark slowly morphs into EMMY value ───
const L_NumberMorph = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last } = useEmmy();
  const [show, setShow] = React.useState("text");
  React.useEffect(()=>{
    const id = setInterval(()=>setShow(s=>s==="text"?"num":"text"), 3000);
    return ()=>clearInterval(id);
  },[]);
  return (<$S8 scale={scale}>
    <span style={{display:"inline-block",position:"relative",height:32*scale,width:160*scale}}>
      <span style={{position:"absolute",inset:0,opacity:show==="text"?1:0,transition:"opacity .6s var(--ease-out-quart)"}}>
        <$W8 scale={scale} color={color} accent={accent}/>
      </span>
      <span style={{position:"absolute",inset:0,opacity:show==="num"?1:0,transition:"opacity .6s var(--ease-out-quart)",fontFamily:"var(--font-display)",fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,color:emmyHue(useEmmy().trend)}}>
        {last.toFixed(2)} €
      </span>
    </span>
  </$S8>);
};

// ─── 190. PATH WRITE — wordmark draws itself via SVG path ───
const L_PathWrite = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$S8 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <svg key={k} width={180*scale} height={36*scale} viewBox="0 0 180 36">
        <text x="0" y="28" fontFamily="var(--font-display)" fontSize="32" fontWeight="500" letterSpacing="-1.2" fill="transparent" stroke={color} strokeWidth="1" strokeDasharray="600" strokeDashoffset="600" style={{animation:"traceLine 1.4s var(--ease-out-quart) forwards"}}>echo</text>
        <text x="74" y="28" fontFamily="var(--font-display)" fontSize="32" fontWeight="500" letterSpacing="-1.2" fill="transparent" stroke={accent} strokeWidth="1" strokeDasharray="400" strokeDashoffset="400" style={{animation:"traceLine 1.4s var(--ease-out-quart) .4s forwards"}}>wai</text>
      </svg>
    </button>
  </$S8>);
};

// ─── 191. RAIN DROPS — letters drop as raindrops ───
const L_RainDrops = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$S8 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer",height:40*scale,overflow:"hidden"}}>
      <span key={k} style={{display:"inline-flex"}} className="serif">
        {"echowai".split("").map((c,i)=>(
          <span key={i} style={{
            fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",
            animation:`dropSplash .6s cubic-bezier(.3,1.6,.4,1) ${i*0.05 + Math.random()*0.15}s both`,
          }}>{c}</span>
        ))}
      </span>
    </button>
  </$S8>);
};

// ─── 192. INVERTED MASK — bright text on dark slide reveal ───
const L_InvertMask = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [h, setH] = React.useState(false);
  return (<$S8 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:"inline-block",position:"relative",overflow:"hidden",padding:"4px 10px",cursor:"pointer"}}>
      <$W8 scale={scale} color={color} accent={accent} style={{position:"relative",zIndex:2,mixBlendMode:h?"difference":"normal",color:h?"#fff":color}}/>
      <span style={{position:"absolute",inset:0,background:"var(--ink)",transform:h?"translateX(0)":"translateX(-100%)",transition:"transform .4s cubic-bezier(.7,0,.3,1)"}}/>
    </span>
  </$S8>);
};

// ─── 193. ENERGY CHARGE — charging up animation that triggers a release ───
const L_EnergyCharge = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [charge, setCharge] = React.useState(0);
  const idRef = React.useRef(null);
  const start = () => { setCharge(0); idRef.current=setInterval(()=>setCharge(c=>Math.min(100,c+5)),50); };
  const stop = () => { clearInterval(idRef.current); setCharge(0); };
  return (<$S8 scale={scale}>
    <button onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
      style={{background:"transparent",border:0,padding:"12px 18px",cursor:"pointer",position:"relative",overflow:"hidden"}}>
      <$W8 scale={scale} color={color} accent={accent} style={{transform:`scale(${1+charge*0.003})`,transition:"transform .1s"}}/>
      <span style={{position:"absolute",bottom:4,left:12,right:12,height:2,background:"var(--card-3)",borderRadius:1,overflow:"hidden"}}>
        <span style={{display:"block",height:"100%",width:`${charge}%`,background:emmyHue(useEmmy().trend),transition:"width .05s"}}/>
      </span>
    </button>
  </$S8>);
};

// ─── 194. RAINBOW STROKE — outlined text with cycling colors ───
const L_RainbowStroke = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span className="serif" style={{
    fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:700,color:"transparent",
    WebkitTextStroke:"1.2px transparent",
    background:`linear-gradient(90deg, ${accent}, var(--st-valide), var(--st-controle), ${accent})`,
    backgroundSize:"300% 100%",
    WebkitBackgroundClip:"text",backgroundClip:"text",
    animation:"gradientFlow 6s linear infinite",
  }}>
    <span style={{WebkitTextStroke:`1.2px ${accent}`,color:"transparent"}}>echowai</span>
  </span>
</$S8>);

// ─── 195. SLIDE STAGGER — slides in from below in stagger ───
const L_SlideStagger = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$S8 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer",overflow:"hidden",display:"inline-block"}}>
      <span key={k} style={{display:"inline-flex"}} className="serif">
        {"echowai".split("").map((c,i)=>(
          <span key={i} style={{display:"inline-block",overflow:"hidden",height:32*scale}}>
            <span style={{display:"inline-block",fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,animation:`wipeUp .5s var(--ease-out-quart) ${i*0.07}s both`}}>{c}</span>
          </span>
        ))}
      </span>
    </button>
  </$S8>);
};

// ─── 196. CURSOR TRACE — cursor leaves a trace of "echo" mini-text ───
const L_CursorTrace = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const ref = React.useRef(null);
  const [traces, setTraces] = React.useState([]);
  const last = React.useRef(0);
  return (<$S8 scale={scale}>
    <div ref={ref} onMouseMove={(e)=>{const now=performance.now();if(now-last.current<80)return;last.current=now;const r=ref.current.getBoundingClientRect();const id=now;setTraces(t=>[...t.slice(-5),{id,x:e.clientX-r.left,y:e.clientY-r.top}]);setTimeout(()=>setTraces(t=>t.filter(p=>p.id!==id)),900);}}
      onMouseLeave={()=>setTraces([])}
      style={{display:"inline-block",position:"relative",padding:"8px 14px",cursor:"crosshair"}}>
      <$W8 scale={scale} color={color} accent={accent}/>
      {traces.map((tr,i)=>(
        <span key={tr.id} style={{
          position:"absolute",left:tr.x,top:tr.y,transform:"translate(-50%,-50%)",
          fontFamily:"var(--font-mono)",fontSize:8,color:accent,opacity:0.6-i*0.08,pointerEvents:"none",
          animation:"shockwave .9s linear forwards",
        }}>echo</span>
      ))}
    </div>
  </$S8>);
};

// ─── 197. SPLIT FLAP — airport-style split-flap reveal ───
const L_SplitFlap = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$S8 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <span key={k} style={{display:"inline-flex",gap:2,perspective:300}} className="serif">
        {"echowai".split("").map((c,i)=>(
          <span key={i} style={{
            display:"inline-block",fontFamily:"var(--font-mono)",fontSize:24*scale,fontWeight:600,
            background:"var(--ink)",color:i>=4?accent:"#fff",padding:"4px 6px",borderRadius:3,
            animation:`letterFlipUp .5s cubic-bezier(.7,0,.3,1) ${i*0.1}s both`,transformOrigin:"center",
          }}>{c.toUpperCase()}</span>
        ))}
      </span>
    </button>
  </$S8>);
};

// ─── 198. DUOTONE TEXT — half color top, half color bottom ───
const L_Duotone = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span style={{position:"relative",display:"inline-block",lineHeight:1}}>
    <span className="serif" style={{fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,color,clipPath:"polygon(0 0, 100% 0, 100% 50%, 0 50%)",display:"block"}}>echowai</span>
    <span className="serif" style={{fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,color:accent,clipPath:"polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",position:"absolute",top:0,left:0}}>echowai</span>
  </span>
</$S8>);

// ─── 199. EMMY GAUGE — semicircle gauge points to current price ───
const L_EmmyGauge = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last, trend } = useEmmy();
  const angle = -90 + emmyNorm(last)*180;
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center",gap:10}}>
      <svg width={36*scale} height={20*scale} viewBox="0 0 36 20">
        <path d="M 4 18 A 14 14 0 0 1 32 18" fill="none" stroke="var(--card-3)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 4 18 A 14 14 0 0 1 32 18" fill="none" stroke={emmyHue(trend)} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="44" strokeDashoffset={44 - emmyNorm(last)*44}
          style={{transition:"stroke-dashoffset .9s var(--ease-out-quart)"}}/>
        <g style={{transformOrigin:"18px 18px",transform:`rotate(${angle}deg)`,transition:"transform .9s var(--ease-out-quart)"}}>
          <line x1="18" y1="18" x2="18" y2="6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
        </g>
        <circle cx="18" cy="18" r="2" fill={color}/>
      </svg>
      <$W8 scale={scale} color={color} accent={accent}/>
    </span>
  </$S8>);
};

// ─── 200. KINETIC FOCUS — letter under cursor sharp, others blur ───
const L_KineticFocus = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const ref = React.useRef(null);
  const [focus, setFocus] = React.useState(-1);
  return (<$S8 scale={scale}>
    <span ref={ref} style={{display:"inline-flex",cursor:"crosshair"}} className="serif"
      onMouseLeave={()=>setFocus(-1)}>
      {"echowai".split("").map((c,i)=>(
        <span key={i} onMouseEnter={()=>setFocus(i)}
          style={{
            fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,
            color:i>=4?accent:color,display:"inline-block",
            filter: focus>=0 && focus!==i ? `blur(${Math.abs(i-focus)*1.5}px)` : "none",
            opacity: focus>=0 && focus!==i ? 0.5 : 1,
            transition:"all .25s var(--ease-out-quart)",
          }}>{c}</span>
      ))}
    </span>
  </$S8>);
};

// ─── 201. WRITING MACHINE — letters write/erase in cycle ───
const L_Writing = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [n, setN] = React.useState(0);
  const [phase, setPhase] = React.useState("write");
  React.useEffect(()=>{
    const id = setInterval(()=>{
      setN(c=>{
        if(phase==="write"){ if(c>=7){setPhase("erase");return c;} return c+1; }
        if(c<=0){setPhase("write");return c;} return c-1;
      });
    }, 220);
    return ()=>clearInterval(id);
  },[phase]);
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center"}} className="serif">
      {"echowai".split("").slice(0,n).map((c,i)=>(
        <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color}}>{c}</span>
      ))}
      <span style={{display:"inline-block",width:2,height:28*scale,background:accent,marginLeft:1,animation:"blink 1s steps(2) infinite"}}/>
    </span>
  </$S8>);
};

// ─── 202. RIPPLE FOLLOW — ripples that follow cursor with delay ───
const L_RippleFollow = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState({x:90,y:18});
  return (<$S8 scale={scale}>
    <div ref={ref} onMouseMove={(e)=>{const r=ref.current.getBoundingClientRect();setPos({x:e.clientX-r.left,y:e.clientY-r.top});}}
      style={{position:"relative",display:"inline-block",padding:"6px 12px",cursor:"crosshair",overflow:"hidden"}}>
      <span style={{position:"absolute",left:pos.x,top:pos.y,width:60,height:60,borderRadius:"50%",
        background:"radial-gradient(closest-side, var(--volt-glow), transparent 70%)",
        transform:"translate(-50%,-50%)",transition:"left .5s var(--ease-out-quart),top .5s var(--ease-out-quart)",pointerEvents:"none",mixBlendMode:"screen"}}/>
      <$W8 scale={scale} color={color} accent={accent}/>
    </div>
  </$S8>);
};

// ─── 203. EXPLODE LETTERS — click to scatter, click again to gather ───
const L_ExplodeGather = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [exp, setExp] = React.useState(false);
  return (<$S8 scale={scale}>
    <span onClick={()=>setExp(e=>!e)} style={{display:"inline-flex",cursor:"pointer"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} style={{
          fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",
          transform: exp ? `translate(${(i-3)*16}px, ${((i*7)%5-2)*8}px) rotate(${(i-3)*15}deg)` : "translate(0)",
          transition:"transform .6s cubic-bezier(.4,1.4,.4,1)",
        }}>{c}</span>
      ))}
    </span>
  </$S8>);
};

// ─── 204. AMBIENT GLOW — soft pulsing glow halo ───
const L_AmbientGlow = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span style={{display:"inline-block",animation:"glowPulse2 3s ease-in-out infinite"}}>
    <$W8 scale={scale} color={color} accent={accent}/>
  </span>
</$S8>);

// ─── 205. EMMY-SYNCED PULSE — color shift sync with tick ───
const L_TickPulse = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last, trend } = useEmmy();
  const [pulse, setPulse] = React.useState(false);
  const prev = React.useRef(last);
  React.useEffect(()=>{if(prev.current!==last){setPulse(true);setTimeout(()=>setPulse(false),600);prev.current=last;}},[last]);
  return (<$S8 scale={scale}>
    <$W8 scale={scale} color={color} accent={pulse?emmyHue(trend):accent} style={{transition:"all .6s"}}/>
  </$S8>);
};

// ─── 206. LETTER ROTATION DRIFT — letters slowly rotate at different rates ───
const L_RotationDrift = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(()=>{let raf,s0=performance.now();const loop=now=>{setT((now-s0)/2000);raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf);},[]);
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} style={{
          fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",
          transform:`rotate(${Math.sin(t+i*0.7)*4}deg)`,transformOrigin:"center bottom",
        }}>{c}</span>
      ))}
    </span>
  </$S8>);
};

// ─── 207. EMMY ECHO COPIES — N delayed copies trail behind on tick ───
const L_EchoTrails = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last } = useEmmy();
  return (<$S8 scale={scale}>
    <span style={{position:"relative",display:"inline-block"}}>
      {[3,2,1].map(i=>(
        <span key={`${last}-${i}`} style={{position:"absolute",inset:0,opacity:0.15*i,animation:`shimmerSweep ${1+i*0.5}s linear`,filter:`blur(${i*0.5}px)`,pointerEvents:"none"}}>
          <$W8 scale={scale} color={accent} accent={accent}/>
        </span>
      ))}
      <span style={{position:"relative"}}>
        <$W8 scale={scale} color={color} accent={accent}/>
      </span>
    </span>
  </$S8>);
};

// ─── 208. CIRCULAR INDICATOR — ring fills, EMMY-driven ───
const L_CircularInd = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last, trend } = useEmmy();
  const C = 2 * Math.PI * 16;
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center",gap:10}}>
      <svg width={40*scale} height={40*scale} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--card-3)" strokeWidth="3"/>
        <circle cx="20" cy="20" r="16" fill="none" stroke={emmyHue(trend)} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - emmyNorm(last))}
          transform="rotate(-90 20 20)" style={{transition:"stroke-dashoffset .9s var(--ease-out-quart)"}}/>
        <text x="20" y="24" fontSize="8" fontFamily="var(--font-mono)" fontWeight="600" fill={color} textAnchor="middle">{last.toFixed(1)}</text>
      </svg>
      <$W8 scale={scale} color={color} accent={accent}/>
    </span>
  </$S8>);
};

// ─── 209. WORD WRAP CYCLE — text changes between "echowai" / "echo" / "wai" ───
const L_WordCycle = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const words = ["echowai", "·echo·", "·wai·", "echowai"];
  const [i, setI] = React.useState(0);
  React.useEffect(()=>{const id=setInterval(()=>setI(x=>(x+1)%words.length),1800);return()=>clearInterval(id);},[]);
  return (<$S8 scale={scale}>
    <span key={i} className="serif" style={{
      display:"inline-block",fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,
      animation:"elasticIn .5s cubic-bezier(.5,1.5,.5,1)",
      color: i===0||i===3 ? color : accent,
    }}>{words[i]}</span>
  </$S8>);
};

// ─── 210. PRESSURE BUTTON — hold to see effect intensify ───
const L_Pressure = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [press, setPress] = React.useState(0);
  const idRef = React.useRef(null);
  return (<$S8 scale={scale}>
    <button onMouseDown={()=>{idRef.current=setInterval(()=>setPress(p=>Math.min(100,p+4)),40);}}
      onMouseUp={()=>{clearInterval(idRef.current);setPress(0);}}
      onMouseLeave={()=>{clearInterval(idRef.current);setPress(0);}}
      style={{background:"transparent",border:0,padding:"8px 12px",cursor:"pointer"}}>
      <$W8 scale={scale} color={color} accent={accent} style={{
        textShadow: `0 0 ${press*0.4}px ${accent}`,
        transform: `scale(${1+press*0.003})`,
        transition: "all .1s",
      }}/>
    </button>
  </$S8>);
};

// ─── 211. ECHO BLINKER — periodic strong blink ───
const L_Blinker = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span style={{display:"inline-block",animation:"glowPulse2 1.4s ease-in-out infinite"}}>
    <$W8 scale={scale} color={color} accent={accent}/>
  </span>
</$S8>);

// ─── 212. METRIC OVERLAY — shows multiple EMMY stats below ───
const L_MetricOverlay = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last, trend, series } = useEmmy();
  const max = Math.max(...series), min = Math.min(...series);
  return (<$S8 scale={scale}>
    <div style={{display:"inline-flex",flexDirection:"column",gap:4}}>
      <$W8 scale={scale} color={color} accent={accent}/>
      <div style={{display:"flex",gap:10,fontSize:9*scale,fontFamily:"var(--font-mono)",color:"var(--muted)"}}>
        <span>now <strong style={{color:emmyHue(trend)}}>{last.toFixed(2)}</strong></span>
        <span>max {max.toFixed(2)}</span>
        <span>min {min.toFixed(2)}</span>
      </div>
    </div>
  </$S8>);
};

// ─── 213. PILL TICKER — pill morphs to show price ───
const L_PillTicker = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last, trend } = useEmmy();
  const [h, setH] = React.useState(false);
  return (<$S8 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:999,
        background:h?accent:"var(--card-2)",border:`1px solid ${h?accent:"var(--rule-on)"}`,
        cursor:"pointer",transition:"all .25s var(--ease-out-quart)",
      }}>
      <$W8 scale={scale} color={h?"#fff":color} accent={h?"#fff":accent}/>
      {h && <span className="mono" style={{fontSize:11,color:"#fff"}}>{last.toFixed(2)} €</span>}
    </span>
  </$S8>);
};

// ─── 214. WORM TYPE — text bends like a worm ───
const L_Worm = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(()=>{let raf,s0=performance.now();const loop=now=>{setT((now-s0)/600);raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf);},[]);
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} style={{
          fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",
          transform:`translateY(${Math.sin(t*2 + i*1)*4}px) scaleY(${1+Math.sin(t*2+i*1)*0.1})`,
        }}>{c}</span>
      ))}
    </span>
  </$S8>);
};

// ─── 215. HOLOGRAM EFFECT — RGB shimmer + iridescence ───
const L_Hologram = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span style={{
    backgroundImage:"linear-gradient(110deg, #ff00aa, #00d4ff, #00ff88, #ff00aa)",
    backgroundSize:"300% 100%",
    WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",
    fontFamily:"var(--font-display)",fontSize:32*scale,letterSpacing:"-0.035em",fontWeight:500,
    animation:"gradientFlow 4s linear infinite",
    filter:"drop-shadow(0 0 2px rgba(255,255,255,0.3))",
  }}>echowai</span>
</$S8>);

// ─── 216. SECTION COLLAPSE — letters collapse to dot then expand ───
const L_Collapse = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (<$S8 scale={scale}>
    <span onClick={()=>setCollapsed(c=>!c)}
      style={{display:"inline-block",cursor:"pointer",width:collapsed?20*scale:160*scale,overflow:"hidden",transition:"width .6s var(--ease-out-quart)",height:32*scale}}>
      {collapsed ? <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:accent,verticalAlign:"middle",marginLeft:6,marginTop:10}} className="volt-dot"/> : <$W8 scale={scale} color={color} accent={accent}/>}
    </span>
  </$S8>);
};

// ─── 217. EMMY THERMOMETER — vertical bar that fills with price ───
const L_Thermo = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const { last, trend } = useEmmy();
  return (<$S8 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
      <div style={{width:6,height:32*scale,background:"var(--card-3)",borderRadius:3,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${emmyNorm(last)*100}%`,background:emmyHue(trend),transition:"height .9s var(--ease-out-quart)"}}/>
      </div>
      <$W8 scale={scale} color={color} accent={accent}/>
    </span>
  </$S8>);
};

// ─── 218. GLITCH PRESS — random char swaps on press ───
const L_GlitchPress = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [press, setPress] = React.useState(false);
  const [chars, setChars] = React.useState("echowai");
  React.useEffect(()=>{
    if(!press){setChars("echowai");return;}
    const id = setInterval(()=>setChars("echowai".split("").map(()=>String.fromCharCode(97+Math.floor(Math.random()*26))).join("")), 60);
    return()=>clearInterval(id);
  },[press]);
  return (<$S8 scale={scale}>
    <button onMouseDown={()=>setPress(true)} onMouseUp={()=>setPress(false)} onMouseLeave={()=>setPress(false)}
      style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <span style={{display:"inline-flex"}} className="serif">
        {chars.split("").map((c,i)=>(
          <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block"}}>{c}</span>
        ))}
      </span>
    </button>
  </$S8>);
};

// ─── 219. SVG TRACE GLYPH — drawn-in glyph + wordmark ───
const L_TraceGlyph = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => {
  const [k, setK] = React.useState(0);
  return (<$S8 scale={scale}>
    <button onMouseEnter={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <span style={{display:"inline-flex",alignItems:"center",gap:10}}>
        <svg key={k} width={28*scale} height={28*scale} viewBox="0 0 28 28">
          <path d="M 4 14 A 10 10 0 1 1 24 14" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round"
            strokeDasharray="40" strokeDashoffset="40" style={{animation:"traceLine 1s var(--ease-out-quart) forwards"}}/>
          <circle cx="24" cy="14" r="2.5" fill={accent}/>
        </svg>
        <$W8 scale={scale} color={color} accent={accent}/>
      </span>
    </button>
  </$S8>);
};

// ─── 220. INFINITE SCROLL — letters scroll horizontally forever ───
const L_InfiniteScroll = ({ scale=1, color="var(--ink)", accent="var(--volt)" }) => (<$S8 scale={scale}>
  <span style={{display:"inline-block",overflow:"hidden",maxWidth:160*scale,whiteSpace:"nowrap"}}>
    <span style={{display:"inline-flex",gap:24,animation:"shimmerSweep 8s linear infinite"}}>
      {[0,1,2,3].map(k=><$W8 key={k} scale={scale} color={color} accent={accent}/>)}
    </span>
  </span>
</$S8>);

const LOGOS_V8 = [
  { n:"171", name:"Mercury",       tagline:"Lettres en mercure liquide",      C:L_Mercury,         why:"Au survol, gooey filter SVG : les lettres fondent et se ré-agrègent comme du mercure." },
  { n:"172", name:"Sound Visualizer", tagline:"Barres EQ + lettres synchro",   C:L_SoundVis,        why:"Barres EQ qui dansent au-dessus de chaque lettre, alimentées par EMMY + sinusoïdes temps réel." },
  { n:"173", name:"Elastic Spring",   tagline:"Click : entrée élastique",      C:L_Elastic,         why:"Click déclenche un easing élastique 'overshoot' lettre par lettre. Physique satisfaisante." },
  { n:"174", name:"Glitch Slice",     tagline:"RGB split sur tick",            C:L_GlitchSlice,     why:"Chaque tick EMMY, 3 calques RGB (rouge/cyan/principal) glissent en glitch CRT." },
  { n:"175", name:"Squash & Stretch", tagline:"Physique cartoon",              C:L_SquashStretch,   why:"Survol : squash puis stretch comme une balle qui rebondit. Disney-grade." },
  { n:"176", name:"Kinetic Type",     tagline:"Chaque lettre flotte",          C:L_Kinetic,         why:"Chaque lettre flotte sur sa propre fréquence. Sensation de vie permanente, jamais agressive." },
  { n:"177", name:"Scan Line",        tagline:"Ligne laser balaye",            C:L_ScanLine,        why:"Une ligne fine + glow traverse le wordmark verticalement en boucle." },
  { n:"178", name:"Shockwave",        tagline:"Click : 3 ondes de choc",       C:L_Shockwave,       why:"Click émet 3 ondes décalées vers l'extérieur. Sensation d'impact." },
  { n:"179", name:"Parallax Depth",   tagline:"3 couches en parallaxe",        C:L_Parallax,        why:"3 couches du wordmark bougent à des vitesses différentes selon le curseur. Profondeur 3D." },
  { n:"180", name:"Liquid Fill",      tagline:"Texte rempli liquide animé",    C:L_LiquidFill,      why:"Niveau de remplissage = cours EMMY, surface ondule en sinusoïde temps réel. Très organique." },
  { n:"181", name:"Keyboard Keys",    tagline:"Touches physiques",             C:L_KeyboardKeys,    why:"Chaque lettre devient une touche de clavier 3D enfonçable. Tactile, ludique." },
  { n:"182", name:"Circular Text",    tagline:"Texte sur cercle",              C:L_CircularText,    why:"Wordmark courbé sur un cercle qui tourne lentement, point central." },
  { n:"183", name:"Pixel Drift",      tagline:"Dissolution en pixels au survol", C:L_PixelDrift,    why:"SVG displacement filter : au survol, les lettres se déforment en pixels comme un VHS." },
  { n:"184", name:"Letter Flip",      tagline:"Flip 3D par lettre · tick",     C:L_LetterFlip,      why:"À chaque tick EMMY, les lettres font un flip 3D en cascade. Spectaculaire et data-driven." },
  { n:"185", name:"Ambient Particles", tagline:"Particules orbitent doucement", C:L_AmbientParticles, why:"14 particules flottent autour du wordmark sur trajectoires sinusoïdales. Onirique." },
  { n:"186", name:"Inked",            tagline:"Click : tache d'encre",         C:L_Inked,           why:"Click sur le wordmark dépose une tache d'encre qui s'étale (mix-blend multiply)." },
  { n:"187", name:"Shimmer",          tagline:"Reflet doré qui balaye",        C:L_Shimmer,         why:"Gradient en mouvement permanent dans les lettres. Élégant, jamais clinquant." },
  { n:"188", name:"Cursor Repulse",   tagline:"Lettres fuient (forte amplitude)", C:L_CursorRepulse, why:"Variante plus forte du repulse. Easing avec overshoot. Très physique." },
  { n:"189", name:"Number Morph",     tagline:"Wordmark ↔ prix EMMY",          C:L_NumberMorph,     why:"Toutes les 3s, le wordmark se transforme en valeur EMMY actuelle et revient. Identité ET data." },
  { n:"190", name:"Path Write",       tagline:"Click : trace SVG",             C:L_PathWrite,       why:"Au clic, le wordmark se dessine via stroke-dashoffset SVG. Mark écrit à la main." },
  { n:"191", name:"Rain Drops",       tagline:"Gouttes de pluie",              C:L_RainDrops,       why:"Click : lettres tombent en pluie avec splash, délais aléatoires. Onirique." },
  { n:"192", name:"Invert Mask",      tagline:"Slide reveal navy",             C:L_InvertMask,      why:"Au survol, un bloc navy slide vers la droite et inverse les couleurs via mix-blend difference." },
  { n:"193", name:"Energy Charge",    tagline:"Hold pour charger",             C:L_EnergyCharge,    why:"Press & hold : le wordmark grossit et une barre de charge se remplit (teintée EMMY trend)." },
  { n:"194", name:"Rainbow Stroke",   tagline:"Contour multi-couleur",         C:L_RainbowStroke,   why:"Outline en gradient cyclique. Festif sans saturer." },
  { n:"195", name:"Slide Stagger",    tagline:"Lettres slide-up cascade",      C:L_SlideStagger,    why:"Click : chaque lettre remonte depuis le bas avec clip-path en cascade." },
  { n:"196", name:"Cursor Trace",     tagline:"Curseur dépose 'echo' fantômes", C:L_CursorTrace,    why:"Le curseur dépose des mini-mots 'echo' qui s'évanouissent. L'utilisateur écrit avec sa souris." },
  { n:"197", name:"Split-Flap",       tagline:"Style aéroport",                C:L_SplitFlap,       why:"Click : chaque lettre fait un flip 3D façon panneau d'affichage de gare/aéroport." },
  { n:"198", name:"Duotone",          tagline:"Bicolore vertical",             C:L_Duotone,         why:"Moitié haute encre, moitié basse bleu — coupe nette. Très éditorial." },
  { n:"199", name:"EMMY Gauge",       tagline:"Cadran semi-circulaire",        C:L_EmmyGauge,       why:"Gauge demi-cercle avec aiguille positionnée selon le cours EMMY. Hommage tableau de bord auto." },
  { n:"200", name:"Kinetic Focus",    tagline:"Curseur focalise une lettre",   C:L_KineticFocus,    why:"Lettre sous le curseur reste nette, les autres se floutent progressivement avec la distance." },
  { n:"201", name:"Writing Machine",  tagline:"Écriture + effacement boucle",  C:L_Writing,         why:"Boucle continue : écrit le mot, l'efface, recommence. Caret clignote en attendant." },
  { n:"202", name:"Ripple Follow",    tagline:"Halo suit le curseur",          C:L_RippleFollow,    why:"Un halo lumineux suit le curseur avec un delay easing. Mix-blend screen pour éclairer." },
  { n:"203", name:"Explode & Gather", tagline:"Click toggle dispersion",       C:L_ExplodeGather,   why:"Click : lettres se dispersent en rotation et translation. Re-click : elles reviennent." },
  { n:"204", name:"Ambient Glow",     tagline:"Halo doux qui respire",         C:L_AmbientGlow,     why:"Drop-shadow glow qui s'intensifie et s'atténue. Sensation de chaleur lumineuse." },
  { n:"205", name:"Tick Pulse",       tagline:"Couleur shift sur tick",        C:L_TickPulse,       why:"À chaque tick EMMY, l'accent prend brièvement la couleur de la tendance puis revient." },
  { n:"206", name:"Rotation Drift",   tagline:"Lettres tournent doucement",    C:L_RotationDrift,   why:"Chaque lettre oscille en rotation à sa propre fréquence. Très subtil, hypnotique." },
  { n:"207", name:"Echo Trails",      tagline:"3 copies fantômes sur tick",    C:L_EchoTrails,      why:"3 copies se détachent en flou et s'estompent à chaque tick EMMY. Littéralement écho." },
  { n:"208", name:"Circular Indicator", tagline:"Ring SVG + valeur",            C:L_CircularInd,     why:"Anneau qui se remplit + chiffre central, comme un tracker d'activité." },
  { n:"209", name:"Word Cycle",       tagline:"Mot change en boucle",          C:L_WordCycle,       why:"Cycle 'echowai' → '·echo·' → '·wai·' → 'echowai'. Décompose l'identité elle-même." },
  { n:"210", name:"Pressure",         tagline:"Maintenez pour intensifier",    C:L_Pressure,        why:"Press & hold : le glow s'intensifie + scale subtle. Réactif à la durée d'appui." },
  { n:"211", name:"Blinker",          tagline:"Pulse fort + glow",             C:L_Blinker,         why:"Pulsation forte et rythmée du glow. Plus 'enseigne' que ambient." },
  { n:"212", name:"Metric Overlay",   tagline:"Stats EMMY · now/max/min",      C:L_MetricOverlay,   why:"Sous le wordmark, mini-tableau de bord avec valeur actuelle, max et min de la session." },
  { n:"213", name:"Pill Ticker",      tagline:"Hover révèle le prix",          C:L_PillTicker,      why:"Au survol, la pill prend la couleur d'accent et affiche le cours EMMY à droite." },
  { n:"214", name:"Worm",             tagline:"Texte ondule comme un ver",     C:L_Worm,            why:"Lettres oscillent en Y + scale Y. Sensation organique, presque liquide." },
  { n:"215", name:"Hologram",         tagline:"Iridescence multi-couleur",     C:L_Hologram,        why:"Gradient holographique magenta/cyan/vert qui dérive. Sensation 'pass premium'." },
  { n:"216", name:"Collapse",         tagline:"Click : collapse en point",     C:L_Collapse,        why:"Click : le wordmark se réduit à un point pulsant. Re-click : il revient." },
  { n:"217", name:"Thermometer",      tagline:"Bar vertical · niveau EMMY",    C:L_Thermo,          why:"Thermomètre à côté du wordmark, niveau = cours EMMY, couleur = trend." },
  { n:"218", name:"Glitch Press",     tagline:"Hold : caractères aléatoires",  C:L_GlitchPress,     why:"Press & hold : les lettres swap en caractères aléatoires (60ms). Relâcher : retour." },
  { n:"219", name:"Trace Glyph",      tagline:"Hover : glyph se dessine",      C:L_TraceGlyph,      why:"Au survol, un mini-glyph arc se dessine à côté en stroke-dashoffset SVG. Élégant." },
  { n:"220", name:"Infinite Scroll",  tagline:"Wordmark défile à l'infini",    C:L_InfiniteScroll,  why:"Wordmark répété qui défile horizontalement. Esthétique ticker financier moderne." },
];

const LogoLab8Page = () => {
  const Card = window.LogoCardLite;
  return (
    <CeePriceProvider>
      <LogoStyles/>
      <LogoLab2Styles/>
      <LogoLab3Styles/>
      <LogoLab5Styles/>
      <LogoLab6Styles/>
      <LogoLab7Styles/>
      <LogoLab8Styles/>

      <section style={{position:"relative",overflow:"hidden"}}>
        <AuroraMesh intensity={0.7}/>
        <Orb size={620} color="var(--volt-glow)" style={{top:-160,right:-120}}/>
        <div className="r-padbox" style={{maxWidth:1320,margin:"0 auto",padding:"72px 32px 36px",position:"relative"}}>
          <div className="upper" style={{color:"var(--volt)"}}>Logo Lab · volume 8 · best-in-class</div>
          <h1 className="serif h1-fluid" style={{fontSize:96,lineHeight:0.96,letterSpacing:"-0.035em",margin:"14px 0 22px",color:"var(--ink)",fontWeight:500,maxWidth:1100}}>
            50 logos <em style={{color:"var(--volt)"}}>aux meilleures animations.</em>
          </h1>
          <p className="body-fluid" style={{fontSize:17,color:"var(--bone-soft)",lineHeight:1.55,maxWidth:880,margin:"0 0 18px"}}>
            Mercure liquide, glitch RGB, holographie, parallaxe 3D, split-flap d'aéroport, ondes de choc, gouttes de pluie, sonogram synchronisé EMMY… <strong style={{color:"var(--ink)"}}>Le meilleur des animations interactives que je peux créer en SVG/CSS pur</strong>. Survolez, cliquez, maintenez chaque mark.
          </p>
          <div style={{display:"inline-flex",padding:"10px 16px",background:"var(--card)",border:"1px solid var(--rule-on)",borderRadius:6,alignItems:"center",gap:14}}>
            <EmmyStatusInline/>
          </div>
        </div>
      </section>

      <section className="r-padbox section-pad" style={{maxWidth:1320,margin:"0 auto",padding:"32px 32px 80px"}}>
        <div className="r-cols-4" style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:16}}>
          {LOGOS_V8.map(({ n, name, tagline, why, C }) => (
            <Card key={n} n={n} name={name} tagline={tagline} why={why}><C/></Card>
          ))}
        </div>

        <div style={{marginTop:60,padding:40,background:"var(--ink)",color:"#fff",borderRadius:8}} className="on-ink">
          <div className="upper" style={{color:"var(--volt)"}}>Top 5 du volume 8</div>
          <div className="r-cols-3" style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:18,marginTop:14}}>
            {[
              {n:"180",t:"Le plus organique",d:"Liquid Fill"},
              {n:"181",t:"Le plus tactile",d:"Keyboard Keys"},
              {n:"184",t:"Le plus data-aware",d:"Letter Flip"},
              {n:"189",t:"Le plus malin",d:"Number Morph"},
              {n:"197",t:"Le plus iconique",d:"Split-Flap"},
            ].map(r=>(
              <div key={r.n} style={{padding:16,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:4}}>
                <span className="mono" style={{fontSize:11,color:"var(--volt)"}}>{r.n}</span>
                <div className="serif" style={{fontSize:18,color:"#fff",marginTop:6,fontWeight:500}}>{r.d}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.65)",marginTop:4,lineHeight:1.45}}>{r.t}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:13,color:"rgba(255,255,255,.65)",marginTop:24,lineHeight:1.55,maxWidth:720}}>
            <strong style={{color:"var(--volt)"}}>220 logos uniques</strong> au total sur 8 volumes. Donne-moi ta short-list finale (5 max) et j'installe.
          </p>
        </div>
      </section>
    </CeePriceProvider>
  );
};

Object.assign(window, { LogoLab8Page, LogoLab8Styles, LOGOS_V8 });
