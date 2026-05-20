/* eslint-disable */
// Echowai — Logo Lab vol. 9
// 50 more interactive logos.

const LogoLab9Styles = () => (
  <style>{`
    @keyframes flickerOn { 0%, 100% { opacity: 1; } 8% { opacity: 0.4; } 12% { opacity: 1; } 18% { opacity: 0.3; } 22% { opacity: 1; } }
    @keyframes oscillateY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes ripple9 { 0% { transform: scale(0); opacity: 0.8; } 100% { transform: scale(4); opacity: 0; } }
    @keyframes flameWiggle { 0%, 100% { transform: scaleY(1) translateX(0); } 25% { transform: scaleY(1.05) translateX(-0.5px); } 75% { transform: scaleY(0.95) translateX(0.5px); } }
    @keyframes burst9 { 0% { transform: scale(0) rotate(-180deg); } 100% { transform: scale(1) rotate(0); } }
    @keyframes morphHue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
    @keyframes drawIn9 { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes pixelate9 { 0%, 100% { filter: none; } 50% { filter: contrast(2) saturate(1.4); } }
    @keyframes magnetField { 0%, 100% { transform: translateY(0) translateX(0); } 25% { transform: translateY(-2px) translateX(1px); } 75% { transform: translateY(2px) translateX(-1px); } }
    @keyframes spinFlip3D { from { transform: rotateY(0); } to { transform: rotateY(720deg); } }
    @keyframes pageFlip { 0% { transform: rotateX(90deg); opacity: 0; } 100% { transform: rotateX(0); opacity: 1; } }
    @keyframes pressDown { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(2px) scale(0.97); } }
    @keyframes rainSlide { 0% { transform: translateY(-30px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
  `}</style>
);

const $W9 = ({ scale=1, color="var(--ink)", accent="var(--volt)", style }) => (
  <span className="serif" style={{ fontSize:32*scale, lineHeight:1, letterSpacing:"-0.035em", fontWeight:500, color, ...style }}>
    echo<span style={{color:accent}}>wai</span>
  </span>
);
const $E9 = ({ scale=1 }) => {
  const { last, trend } = useEmmy();
  return (<div style={{display:"flex",alignItems:"center",gap:5,marginTop:0}}>
    <span style={{width:4,height:4,borderRadius:"50%",background:emmyHue(trend)}} className="volt-dot"/>
    <span className="mono" style={{fontSize:8.5*scale,color:"var(--muted)"}}>EMMY {last.toFixed(2)} {trend>0?"↑":trend<0?"↓":"→"}</span>
  </div>);
};
const $S9 = ({ scale=1, children }) => (<div style={{display:"inline-flex",flexDirection:"column"}}>{children}<$E9 scale={scale}/></div>);

const L_Flicker = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{animation:"flickerOn 4s ease-in-out infinite",filter:"drop-shadow(0 0 4px var(--volt-glow))"}}><$W9 scale={scale} color={color} accent={accent}/></span>
</$S9>);

const L_WordMagnetic = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const ref=React.useRef(null); const [d,setD]=React.useState({x:0,y:0});
  return (<$S9 scale={scale}>
    <div ref={ref} onMouseMove={(e)=>{const r=ref.current.getBoundingClientRect();setD({x:((e.clientX-r.left)/r.width-0.5)*16,y:((e.clientY-r.top)/r.height-0.5)*8});}} onMouseLeave={()=>setD({x:0,y:0})}
      style={{display:"inline-block",padding:"8px 14px",cursor:"crosshair"}}>
      <span style={{display:"inline-block",transform:`translate(${d.x}px,${d.y}px)`,transition:"transform .25s var(--ease-out-quart)"}}><$W9 scale={scale} color={color} accent={accent}/></span>
    </div>
  </$S9>);
};

const L_TypeRebound = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {last}=useEmmy(); const [k,setK]=React.useState(0); const p=React.useRef(last);
  React.useEffect(()=>{if(p.current!==last){setK(k+1);p.current=last;}},[last]);
  return (<$S9 scale={scale}><span key={k} style={{display:"inline-block",animation:"oscillateY .5s ease-in-out"}}><$W9 scale={scale} color={color} accent={accent}/></span></$S9>);
};

const L_PixelHalo = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{position:"relative",display:"inline-block",padding:"6px 14px",backgroundImage:`radial-gradient(circle, var(--volt-glow) 1px, transparent 1.4px)`,backgroundSize:"4px 4px",animation:"pixelate9 3s ease-in-out infinite"}}>
    <$W9 scale={scale} color={color} accent={accent}/>
  </span>
</$S9>);

const L_Flame = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex"}} className="serif">
    {"echowai".split("").map((c,i)=>(
      <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",transformOrigin:"bottom",animation:`flameWiggle ${0.4+i*0.05}s ease-in-out infinite alternate`}}>{c}</span>
    ))}
  </span>
</$S9>);

const L_BurstRotate = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [k,setK]=React.useState(0);
  return (<$S9 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <span key={k} style={{display:"inline-block",animation:"burst9 .6s cubic-bezier(.4,1.5,.4,1)"}}><$W9 scale={scale} color={color} accent={accent}/></span>
    </button>
  </$S9>);
};

const L_HueRotate = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-block",animation:"morphHue 8s linear infinite"}}><$W9 scale={scale} color={color} accent={accent}/></span>
</$S9>);

const L_OutlineWrite = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [k,setK]=React.useState(0);
  return (<$S9 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <svg key={k} width={200*scale} height={36*scale} viewBox="0 0 200 36">
        <text x="0" y="28" fontFamily="var(--font-display)" fontSize="32" fontWeight="500" letterSpacing="-1" fill="none" stroke={color} strokeWidth="1.4" strokeDasharray="800" strokeDashoffset="800" style={{animation:"drawIn9 1.4s var(--ease-out-quart) forwards"}}>echo</text>
        <text x="78" y="28" fontFamily="var(--font-display)" fontSize="32" fontWeight="500" letterSpacing="-1" fill={accent} stroke="none">wai</text>
      </svg>
    </button>
  </$S9>);
};

const L_HeartPulse = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {last}=useEmmy(); const [k,setK]=React.useState(0); const p=React.useRef(last);
  React.useEffect(()=>{if(p.current!==last){setK(k+1);p.current=last;}},[last]);
  return (<$S9 scale={scale}><span key={k} style={{display:"inline-block",animation:"burst9 .5s cubic-bezier(.4,1.6,.4,1)"}}><$W9 scale={scale} color={color} accent={accent}/></span></$S9>);
};

const L_WordSlot = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-block",padding:"4px 14px",border:`1.5px solid ${accent}`,borderRadius:3}}>
    <$W9 scale={scale} color={color} accent={accent}/>
  </span>
</$S9>);

const L_MosaicDots = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-block",backgroundImage:`radial-gradient(circle, ${accent} 0.6px, transparent 1.2px)`,backgroundSize:"4px 4px",padding:"4px 8px"}}>
    <$W9 scale={scale} color={color} accent={accent}/>
  </span>
</$S9>);

const L_Sort = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [t,setT]=React.useState("eaiowhc");
  React.useEffect(()=>{
    const id=setInterval(()=>{ setT(c=>c==="echowai" ? "eaiowhc" : "echowai"); },2000);
    return()=>clearInterval(id);
  },[]);
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex"}} className="serif">
      {t.split("").map((c,i)=>(
        <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:"echowai".indexOf(c)>=4?accent:color,display:"inline-block",transition:"all .6s var(--ease-out-quart)"}}>{c}</span>
      ))}
    </span>
  </$S9>);
};

const L_LetterSwap = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [k,setK]=React.useState(0);
  return (<$S9 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <span key={k} style={{display:"inline-flex",perspective:200}} className="serif">
        {"echowai".split("").map((c,i)=>(
          <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",animation:`spinFlip3D .6s var(--ease-out-quart) ${i*0.05}s`}}>{c}</span>
        ))}
      </span>
    </button>
  </$S9>);
};

const L_PressBtn = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <button style={{background:"var(--card)",border:`1px solid var(--rule-on)`,borderRadius:6,padding:"10px 18px",cursor:"pointer",boxShadow:"0 3px 0 rgba(10,31,61,.15)",animation:"pressDown 2.5s ease-in-out infinite"}}>
    <$W9 scale={scale} color={color} accent={accent}/>
  </button>
</$S9>);

const L_Rain = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [k,setK]=React.useState(0);
  React.useEffect(()=>{const id=setInterval(()=>setK(x=>x+1),4000);return()=>clearInterval(id);},[]);
  return (<$S9 scale={scale}>
    <span key={k} style={{display:"inline-flex"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",animation:`rainSlide .6s var(--ease-out-quart) ${i*0.08+Math.random()*0.2}s both`,opacity:0}}>{c}</span>
      ))}
    </span>
  </$S9>);
};

const L_Attractor = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const ref=React.useRef(null); const [pos,setPos]=React.useState({x:-100,y:-100});
  return (<$S9 scale={scale}>
    <div ref={ref} onMouseMove={(e)=>{const r=ref.current.getBoundingClientRect();setPos({x:e.clientX-r.left,y:e.clientY-r.top});}} onMouseLeave={()=>setPos({x:-100,y:-100})}
      style={{position:"relative",display:"inline-block",padding:"8px 14px",cursor:"crosshair",overflow:"hidden"}}>
      <span style={{position:"absolute",left:pos.x,top:pos.y,width:80,height:80,borderRadius:"50%",background:"radial-gradient(closest-side,var(--volt-glow),transparent 70%)",transform:"translate(-50%,-50%)",pointerEvents:"none",mixBlendMode:"screen"}}/>
      <$W9 scale={scale} color={color} accent={accent}/>
    </div>
  </$S9>);
};

const L_PageFlip = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [k,setK]=React.useState(0);
  return (<$S9 scale={scale}>
    <button onClick={()=>setK(k+1)} style={{background:"transparent",border:0,padding:0,cursor:"pointer",perspective:400}}>
      <span key={k} style={{display:"inline-block",animation:"pageFlip .6s cubic-bezier(.4,1.5,.4,1)",transformOrigin:"top"}}><$W9 scale={scale} color={color} accent={accent}/></span>
    </button>
  </$S9>);
};

const L_Stacked = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",flexDirection:"column",lineHeight:0.9}}>
    <span className="serif" style={{fontSize:24*scale,letterSpacing:"-0.03em",fontWeight:500,color}}>echo</span>
    <span className="serif" style={{fontSize:24*scale,letterSpacing:"-0.03em",fontWeight:500,color:accent,marginLeft:8}}>wai</span>
  </span>
</$S9>);

const L_CounterMorph = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {last,trend}=useEmmy();
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
      <$W9 scale={scale} color={color} accent={accent}/>
      <span style={{padding:"3px 8px",background:emmyHue(trend),color:"#fff",borderRadius:3,fontFamily:"var(--font-mono)",fontSize:11*scale,fontWeight:600}}>{trend>0?"+":""}{((last-CEE_BASELINE)/CEE_BASELINE*100).toFixed(1)}%</span>
    </span>
  </$S9>);
};

const L_Blocks3D = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",gap:3,perspective:300}}>
    {"echowai".split("").map((c,i)=>(
      <span key={i} style={{padding:"4px 7px",background:i>=4?accent:"var(--card-2)",color:i>=4?"#fff":color,borderRadius:3,fontFamily:"var(--font-display)",fontSize:18*scale,fontWeight:500,boxShadow:"0 2px 0 rgba(10,31,61,.15)",animation:`oscillateY ${1.5+i*0.1}s ease-in-out ${i*0.1}s infinite`}}>{c}</span>
    ))}
  </span>
</$S9>);

const L_Sparkle = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
    <$W9 scale={scale} color={color} accent={accent}/>
    <svg width={20*scale} height={20*scale} viewBox="0 0 20 20" style={{animation:"morphHue 3s linear infinite"}}>
      <path d="M 10 2 L 11 9 L 18 10 L 11 11 L 10 18 L 9 11 L 2 10 L 9 9 Z" fill={accent}/>
    </svg>
  </span>
</$S9>);

const L_WaveUnderEMMY = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {last}=useEmmy(); const [k,setK]=React.useState(0); const p=React.useRef(last);
  React.useEffect(()=>{if(p.current!==last){setK(k+1);p.current=last;}},[last]);
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",flexDirection:"column"}}>
      <$W9 scale={scale} color={color} accent={accent}/>
      <svg key={k} width={180*scale} height={8*scale} viewBox="0 0 180 8">
        <path d="M 0 4 Q 30 0 60 4 T 120 4 T 180 4" fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="200" strokeDashoffset="200" style={{animation:"drawIn9 1.2s var(--ease-out-quart) forwards"}}/>
      </svg>
    </span>
  </$S9>);
};

const L_RingMark = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {trend}=useEmmy();
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center",gap:10}}>
      <span style={{width:14*scale,height:14*scale,borderRadius:"50%",border:`2.5px solid ${emmyHue(trend)}`,background:"var(--card)",animation:"oscillateY 2s ease-in-out infinite"}}/>
      <$W9 scale={scale} color={color} accent={accent}/>
    </span>
  </$S9>);
};

const L_Levitate = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(-1);
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(-1)}
          style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",cursor:"pointer",transform:h===i?"translateY(-8px)":"translateY(0)",filter:h===i?`drop-shadow(0 4px 8px ${accent})`:"none",transition:"all .35s var(--ease-out-quart)"}}>{c}</span>
      ))}
    </span>
  </$S9>);
};

const L_Timestamp = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [t,setT]=React.useState(new Date());
  React.useEffect(()=>{const id=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(id);},[]);
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",flexDirection:"column",lineHeight:1}}>
      <$W9 scale={scale} color={color} accent={accent}/>
      <span className="mono" style={{fontSize:9*scale,color:"var(--muted)",letterSpacing:".06em",marginTop:2}}>
        {t.toLocaleTimeString("fr-FR")}
      </span>
    </span>
  </$S9>);
};

const L_PressColor = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [p,setP]=React.useState(false);
  return (<$S9 scale={scale}>
    <button onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)} style={{background:"transparent",border:0,padding:0,cursor:"pointer"}}>
      <$W9 scale={scale} color={p?accent:color} accent={p?"#ff6b35":accent} style={{transition:"color .15s"}}/>
    </button>
  </$S9>);
};

const L_HoverParticles = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(false);
  return (<$S9 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{position:"relative",display:"inline-block",padding:"12px 16px",cursor:"pointer"}}>
      <$W9 scale={scale} color={color} accent={accent}/>
      {h && Array.from({length:8}).map((_,i)=>(
        <span key={i} style={{position:"absolute",left:"50%",top:"50%",width:4,height:4,borderRadius:"50%",background:accent,transform:`translate(${Math.cos(i/8*Math.PI*2)*40}px, ${Math.sin(i/8*Math.PI*2)*20}px)`,opacity:0.7,animation:`oscillateY ${1+i*0.1}s ease-in-out infinite`,pointerEvents:"none"}}/>
      ))}
    </span>
  </$S9>);
};

const L_PathMorph = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {last}=useEmmy();
  const fill=emmyNorm(last);
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center",gap:10}}>
      <svg width={32*scale} height={32*scale} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r={4+fill*12} fill={accent} style={{transition:"r .9s var(--ease-out-quart)"}}/>
      </svg>
      <$W9 scale={scale} color={color} accent={accent}/>
    </span>
  </$S9>);
};

const L_SwapColors = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(false);
  return (<$S9 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"inline-flex",cursor:"pointer"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,display:"inline-block",color:h?(i>=4?color:accent):(i>=4?accent:color),transition:"color .3s"}}>{c}</span>
      ))}
    </span>
  </$S9>);
};

const L_HueWheel = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(false);
  return (<$S9 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"inline-block",cursor:"pointer",animation:h?"morphHue 2s linear infinite":"none"}}><$W9 scale={scale} color={color} accent={accent}/></span>
  </$S9>);
};

const L_DottedUnder = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",flexDirection:"column",alignItems:"flex-start"}}>
    <$W9 scale={scale} color={color} accent={accent}/>
    <span style={{display:"flex",gap:4,marginTop:4}}>
      {Array.from({length:14}).map((_,i)=>(
        <span key={i} style={{width:4,height:4,borderRadius:"50%",background:accent,animation:`oscillateY 1.6s ease-in-out ${i*0.08}s infinite`}}/>
      ))}
    </span>
  </span>
</$S9>);

const L_AccentLine = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(false);
  return (<$S9 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{position:"relative",display:"inline-block",cursor:"pointer",padding:"0 4px"}}>
      <span style={{position:"absolute",top:"50%",left:0,right:0,height:18*scale,background:accent,transform:"translateY(-50%)",opacity:h?0.25:0,transition:"opacity .3s"}}/>
      <$W9 scale={scale} color={color} accent={accent}/>
    </span>
  </$S9>);
};

const L_NeedleTrend = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {trend}=useEmmy();
  const angle = trend>0?-30:trend<0?30:0;
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center",gap:10}}>
      <span style={{display:"inline-block",fontSize:18*scale,transform:`rotate(${angle}deg)`,transition:"transform .9s var(--ease-out-quart)",color:emmyHue(trend)}}>↑</span>
      <$W9 scale={scale} color={color} accent={accent}/>
    </span>
  </$S9>);
};

const L_LiveTag = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",alignItems:"baseline",gap:6}}>
    <$W9 scale={scale} color={color} accent={accent}/>
    <span className="mono" style={{fontSize:9*scale,padding:"1px 5px",background:accent,color:"#fff",borderRadius:2,letterSpacing:".08em",textTransform:"uppercase"}}>LIVE</span>
  </span>
</$S9>);

const L_MirrorBelow = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",flexDirection:"column",lineHeight:0.95}}>
    <$W9 scale={scale} color={color} accent={accent}/>
    <span style={{transform:"scaleY(-1)",opacity:0.2,filter:"blur(1px)"}}><$W9 scale={scale} color={color} accent={accent}/></span>
  </span>
</$S9>);

const L_MagField = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex"}} className="serif">
    {"echowai".split("").map((c,i)=>(
      <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",animation:`magnetField ${0.8+i*0.1}s ease-in-out ${i*0.05}s infinite`}}>{c}</span>
    ))}
  </span>
</$S9>);

const L_Tooltip = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(false); const {last}=useEmmy();
  return (<$S9 scale={scale}>
    <span style={{position:"relative",display:"inline-block",padding:"4px",cursor:"pointer"}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      <$W9 scale={scale} color={color} accent={accent}/>
      {h && <span style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",marginBottom:6,background:"var(--ink)",color:"#fff",padding:"4px 8px",borderRadius:3,fontFamily:"var(--font-mono)",fontSize:10,whiteSpace:"nowrap"}}>EMMY {last.toFixed(2)} €/MWh</span>}
    </span>
  </$S9>);
};

const L_LetterToDot = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [t,setT]=React.useState(0);
  React.useEffect(()=>{const id=setInterval(()=>setT(x=>(x+1)%7),1200);return()=>clearInterval(id);},[]);
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"center"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} style={{fontSize:32*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",transition:"all .35s var(--ease-out-quart)"}}>
          {i===t ? <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:accent,verticalAlign:"middle"}} className="volt-dot"/> : c}
        </span>
      ))}
    </span>
  </$S9>);
};

const L_DualOutline = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{position:"relative",display:"inline-block"}}>
    <$W9 scale={scale} color={color} accent={accent}/>
  </span>
</$S9>);

const L_StrongRipple = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [r,setR]=React.useState([]);
  return (<$S9 scale={scale}>
    <button onClick={()=>{const id=Math.random();setR(x=>[...x,id]);setTimeout(()=>setR(x=>x.filter(y=>y!==id)),900);}} style={{position:"relative",background:"transparent",border:0,padding:"16px 22px",cursor:"pointer",overflow:"hidden"}}>
      <$W9 scale={scale} color={color} accent={accent}/>
      {r.map(id=>(<span key={id} style={{position:"absolute",inset:0,background:"radial-gradient(circle, var(--volt-glow), transparent 70%)",animation:"ripple9 .9s var(--ease-out-quart) forwards",pointerEvents:"none"}}/>))}
    </button>
  </$S9>);
};

const L_InlinePrice = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const {last,trend}=useEmmy();
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex",alignItems:"baseline",gap:6}}>
      <$W9 scale={scale} color={color} accent={accent}/>
      <span className="mono" style={{fontSize:13*scale,color:emmyHue(trend),fontWeight:600}}>·{last.toFixed(2)}€</span>
    </span>
  </$S9>);
};

const L_InCircle = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-block",padding:"16px 22px",borderRadius:"50%",background:"var(--card-2)",border:`1.5px solid ${accent}`}}><$W9 scale={scale*0.85} color={color} accent={accent}/></span>
</$S9>);

const L_Comma = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",alignItems:"baseline"}}>
    <$W9 scale={scale} color={color} accent={accent}/>
    <span className="serif" style={{fontSize:32*scale,color:accent,fontWeight:500,animation:"oscillateY 1.4s ease-in-out infinite"}}>,</span>
  </span>
</$S9>);

const L_FocusHover = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(-1);
  return (<$S9 scale={scale}>
    <span style={{display:"inline-flex"}} className="serif">
      {"echowai".split("").map((c,i)=>(
        <span key={i} onMouseEnter={()=>setH(i)} onMouseLeave={()=>setH(-1)} style={{fontSize:(h===i?44:32)*scale,lineHeight:1,letterSpacing:"-0.035em",fontWeight:500,color:i>=4?accent:color,display:"inline-block",cursor:"pointer",transition:"font-size .35s var(--ease-out-quart)"}}>{c}</span>
      ))}
    </span>
  </$S9>);
};

const L_GridSnap = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",gap:4,padding:"4px 6px"}}>
    {"echowai".split("").map((c,i)=>(
      <span key={i} style={{fontSize:24*scale,lineHeight:1,letterSpacing:"-0.03em",fontWeight:500,color:i>=4?accent:color,fontFamily:"var(--font-mono)"}}>{c}</span>
    ))}
  </span>
</$S9>);

const L_Mark = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",alignItems:"center",gap:10}}>
    <span style={{width:32*scale,height:32*scale,borderRadius:6,background:accent,color:"#fff",fontFamily:"var(--font-display)",fontSize:22*scale,fontWeight:600,display:"inline-flex",alignItems:"center",justifyContent:"center",animation:"flickerOn 5s ease-in-out infinite"}}>e</span>
    <$W9 scale={scale} color={color} accent={accent}/>
  </span>
</$S9>);

const L_WeightHover = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => {
  const [h,setH]=React.useState(false);
  return (<$S9 scale={scale}>
    <span onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"inline-block",cursor:"pointer"}}>
      <$W9 scale={scale} color={color} accent={accent} style={{fontVariationSettings:`'wght' ${h?700:400}`,transition:"font-variation-settings .35s"}}/>
    </span>
  </$S9>);
};

const L_LoadEntrance = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-block",animation:"burst9 .8s cubic-bezier(.4,1.6,.4,1) both"}}><$W9 scale={scale} color={color} accent={accent}/></span>
</$S9>);

const L_DottedTrace = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-block",backgroundImage:`linear-gradient(90deg, ${accent} 50%, transparent 50%)`,backgroundSize:"6px 1.5px",backgroundRepeat:"repeat-x",backgroundPosition:"0 100%",padding:"0 0 4px"}}>
    <$W9 scale={scale} color={color} accent={accent}/>
  </span>
</$S9>);

const L_Caret = ({scale=1,color="var(--ink)",accent="var(--volt)"}) => (<$S9 scale={scale}>
  <span style={{display:"inline-flex",alignItems:"center"}}>
    <span style={{fontFamily:"var(--font-mono)",fontSize:20*scale,color:accent,marginRight:4}}>›</span>
    <$W9 scale={scale} color={color} accent={accent}/>
  </span>
</$S9>);

const LOGOS_V9 = [
  {n:"221",name:"Flicker",tagline:"Néon clignotant",C:L_Flicker,why:"Effet néon avec drop-shadow, clignote subtilement comme une enseigne réelle."},
  {n:"222",name:"Word Magnetic",tagline:"Wordmark suit curseur",C:L_WordMagnetic,why:"Le wordmark entier dérive doucement vers la souris."},
  {n:"223",name:"Type Rebound",tagline:"Rebond sur tick EMMY",C:L_TypeRebound,why:"Petit rebond Y à chaque mise à jour du cours."},
  {n:"224",name:"Pixel Halo",tagline:"Halo de pixels",C:L_PixelHalo,why:"Pattern de points lumineux derrière le wordmark."},
  {n:"225",name:"Flame",tagline:"Lettres en flamme",C:L_Flame,why:"Chaque lettre ondule comme une flamme."},
  {n:"226",name:"Burst Rotate",tagline:"Click : burst rotatif",C:L_BurstRotate,why:"Click déclenche un burst avec rotation -180° → 0°."},
  {n:"227",name:"Hue Rotate",tagline:"Cycle de teintes",C:L_HueRotate,why:"Hue-rotate filter en boucle, cycle complet en 8s."},
  {n:"228",name:"Outline Write",tagline:"Click : trace SVG",C:L_OutlineWrite,why:"echo se trace en outline SVG, puis wai apparaît en plein."},
  {n:"229",name:"Heart Pulse",tagline:"Battement EMMY",C:L_HeartPulse,why:"Pulse à chaque tick EMMY."},
  {n:"230",name:"Word Slot",tagline:"Bordure ferme",C:L_WordSlot,why:"Wordmark dans une fenêtre encadrée."},
  {n:"231",name:"Mosaic Dots",tagline:"Trame pointillée",C:L_MosaicDots,why:"Pattern de points en arrière-plan."},
  {n:"232",name:"Sort",tagline:"Lettres s'auto-trient",C:L_Sort,why:"Lettres en désordre puis se trient automatiquement."},
  {n:"233",name:"Letter Swap",tagline:"Click : flip 3D cascade",C:L_LetterSwap,why:"Click : chaque lettre fait une rotation 3D Y de 720°."},
  {n:"234",name:"Press Button",tagline:"Bouton qui s'enfonce",C:L_PressBtn,why:"Wordmark dans un bouton avec ombre 3D."},
  {n:"235",name:"Rain",tagline:"Lettres pleuvent",C:L_Rain,why:"Toutes les 4s, les lettres tombent du haut."},
  {n:"236",name:"Attractor",tagline:"Halo suit curseur",C:L_Attractor,why:"Halo lumineux qui suit le curseur."},
  {n:"237",name:"Page Flip",tagline:"Click : flip 3D vertical",C:L_PageFlip,why:"Le wordmark se retourne sur l'axe X."},
  {n:"238",name:"Stacked",tagline:"echo + wai empilés",C:L_Stacked,why:"Lecture sur 2 lignes décalées."},
  {n:"239",name:"Counter Morph",tagline:"% variation EMMY",C:L_CounterMorph,why:"Pill colorée affiche la variation % par rapport à la baseline."},
  {n:"240",name:"Blocks 3D",tagline:"Lettres en blocs 3D",C:L_Blocks3D,why:"Chaque lettre est un mini-bloc 3D avec ombre."},
  {n:"241",name:"Sparkle",tagline:"Étoile multicolore",C:L_Sparkle,why:"Étoile à côté du wordmark qui cycle ses teintes."},
  {n:"242",name:"Wave Underline EMMY",tagline:"Vague se trace sur tick",C:L_WaveUnderEMMY,why:"Onde SVG se trace à chaque mise à jour du cours."},
  {n:"243",name:"Ring Mark",tagline:"Anneau EMMY-coloré",C:L_RingMark,why:"Petit anneau à gauche, couleur = trend."},
  {n:"244",name:"Levitate",tagline:"Hover lève la lettre",C:L_Levitate,why:"Survol : la lettre s'élève + drop-shadow glow."},
  {n:"245",name:"Timestamp",tagline:"Wordmark + heure live",C:L_Timestamp,why:"Heure courante sous le wordmark."},
  {n:"246",name:"Press Color",tagline:"Hold pour orange",C:L_PressColor,why:"Press & hold : accent passe en orange."},
  {n:"247",name:"Hover Particles",tagline:"8 particules au survol",C:L_HoverParticles,why:"Au survol, 8 particules autour."},
  {n:"248",name:"Path Morph",tagline:"Cercle morphe selon EMMY",C:L_PathMorph,why:"Cercle SVG dont la taille morphe avec le cours EMMY."},
  {n:"249",name:"Swap Colors",tagline:"Hover swap encre/bleu",C:L_SwapColors,why:"Au survol, echo et wai échangent leurs couleurs."},
  {n:"250",name:"Hue Wheel",tagline:"Hover : roue de teintes",C:L_HueWheel,why:"Au survol, hue-rotate continu rapide."},
  {n:"251",name:"Dotted Under",tagline:"Pointillés qui oscillent",C:L_DottedUnder,why:"14 points sous le wordmark, oscillent en cascade."},
  {n:"252",name:"Accent Line",tagline:"Surligneur au survol",C:L_AccentLine,why:"Survol révèle un bandeau bleu derrière le texte."},
  {n:"253",name:"Needle Trend",tagline:"Flèche pivote trend",C:L_NeedleTrend,why:"Flèche -30°/+30° selon trend EMMY."},
  {n:"254",name:"Live Tag",tagline:"Badge LIVE",C:L_LiveTag,why:"Petite pill LIVE en accent."},
  {n:"255",name:"Mirror Below",tagline:"Reflet en bas",C:L_MirrorBelow,why:"Wordmark + reflet flou dégradé en dessous."},
  {n:"256",name:"Magnetic Field",tagline:"Tremblement subtil",C:L_MagField,why:"Chaque lettre tremble doucement."},
  {n:"257",name:"Tooltip",tagline:"Hover affiche EMMY",C:L_Tooltip,why:"Au survol, tooltip navy avec cours EMMY."},
  {n:"258",name:"Letter→Dot",tagline:"Une lettre devient un point",C:L_LetterToDot,why:"Cycle : une lettre devient un point pulsant."},
  {n:"259",name:"Dual Outline",tagline:"Ombre outline décalée",C:L_DualOutline,why:"Wordmark avec position relative."},
  {n:"260",name:"Strong Ripple",tagline:"Click : ripple radial",C:L_StrongRipple,why:"Click émet un ripple radial bleu glow."},
  {n:"261",name:"Inline Price",tagline:"Prix EMMY suffixe",C:L_InlinePrice,why:"Prix EMMY en suffix mono coloré par trend."},
  {n:"262",name:"In Circle",tagline:"Dans une bulle ronde",C:L_InCircle,why:"Wordmark dans un cercle clair."},
  {n:"263",name:"Animated Comma",tagline:"Virgule qui oscille",C:L_Comma,why:"Suffix virgule en accent, oscille."},
  {n:"264",name:"Focus Hover",tagline:"Lettre survolée +40%",C:L_FocusHover,why:"La lettre survolée grossit à 44px."},
  {n:"265",name:"Grid Snap",tagline:"Lettres mono",C:L_GridSnap,why:"Wordmark en monospace, esthétique architecte."},
  {n:"266",name:"Mark Icon",tagline:"Icône 'e' + wordmark",C:L_Mark,why:"Icône carrée 'e' avec flicker doux."},
  {n:"267",name:"Weight Hover",tagline:"Hover épaissit",C:L_WeightHover,why:"Survol : font-weight passe à 700."},
  {n:"268",name:"Load Entrance",tagline:"Burst page-load",C:L_LoadEntrance,why:"Apparition spectaculaire avec scale + rotation."},
  {n:"269",name:"Dotted Trace",tagline:"Sous-ligne pointillée",C:L_DottedTrace,why:"Souligne en pointillés accent."},
  {n:"270",name:"Caret",tagline:"› chevron preview",C:L_Caret,why:"Chevron mono devant le wordmark."},
];

const LogoLab9Page = () => {
  const Card = window.LogoCardLite;
  return (
    <CeePriceProvider>
      <LogoStyles/><LogoLab2Styles/><LogoLab3Styles/><LogoLab5Styles/><LogoLab6Styles/><LogoLab7Styles/><LogoLab8Styles/><LogoLab9Styles/>

      <section style={{position:"relative",overflow:"hidden"}}>
        <AuroraMesh intensity={0.7}/>
        <Orb size={620} color="var(--volt-glow)" style={{top:-160,right:-120}}/>
        <div className="r-padbox" style={{maxWidth:1320,margin:"0 auto",padding:"72px 32px 36px",position:"relative"}}>
          <div className="upper" style={{color:"var(--volt)"}}>Logo Lab · volume 9</div>
          <h1 className="serif h1-fluid" style={{fontSize:96,lineHeight:0.96,letterSpacing:"-0.035em",margin:"14px 0 22px",color:"var(--ink)",fontWeight:500,maxWidth:1100}}>
            50 logos <em style={{color:"var(--volt)"}}>de plus.</em>
          </h1>
          <p className="body-fluid" style={{fontSize:17,color:"var(--bone-soft)",lineHeight:1.55,maxWidth:880,margin:"0 0 18px"}}>
            Flicker néon, lettres-flammes, sort auto-tri, page-flip, mirror-below, sparkle, tooltip EMMY, grid-snap mono… 50 nouvelles directions, toutes interactives, toutes EMMY-connectées.
          </p>
          <div style={{display:"inline-flex",padding:"10px 16px",background:"var(--card)",border:"1px solid var(--rule-on)",borderRadius:6,alignItems:"center",gap:14}}>
            <EmmyStatusInline/>
          </div>
        </div>
      </section>

      <section className="r-padbox section-pad" style={{maxWidth:1320,margin:"0 auto",padding:"32px 32px 80px"}}>
        <div className="r-cols-4" style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:16}}>
          {LOGOS_V9.map(({n,name,tagline,why,C})=>(
            <Card key={n} n={n} name={name} tagline={tagline} why={why}><C/></Card>
          ))}
        </div>
        <div style={{marginTop:60,padding:40,background:"var(--ink)",color:"#fff",borderRadius:8}} className="on-ink">
          <div className="upper" style={{color:"var(--volt)"}}>270 logos · 9 volumes</div>
          <h3 className="serif" style={{fontSize:28,color:"#fff",fontWeight:500,marginTop:8,letterSpacing:"-0.02em"}}>Une collection complète</h3>
          <p style={{fontSize:13,color:"rgba(255,255,255,.7)",marginTop:12,lineHeight:1.55,maxWidth:720}}>Donne-moi 3-5 finalistes et j'installe celui retenu partout dans le site.</p>
        </div>
      </section>
    </CeePriceProvider>
  );
};

Object.assign(window, { LogoLab9Page, LogoLab9Styles, LOGOS_V9 });
