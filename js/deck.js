const VN_SOURCE="<!DOCTYPE html>\n"+document.documentElement.outerHTML;
/* VoltNexus I/O deck: shapes, the gliding hero circle, network map, counter, playback */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const el=(p,t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e;};
  const C={b:'#2D4F4F',y:'#C5B358',g:'#6F8F8A',c:'#3E3E42',d:'#CFCFD3'};
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

  /* [type, colour, x, y, w, h, rotation, ring width] */
  const S={
    1:[['pill','y',120,110,260,90,-20],['q','g',60,470,200,200,0],['ring','c',980,90,120,120,0,14],['dots','d',140,560,160,120,0],['circle','c',220,300,46,46,0],['half','b',1050,250,140,70,0]],
    2:[['ring','y',1040,480,150,150,0,16],['pill','c',1000,120,220,70,25],['dots','d',80,480,180,140,0],['sq','g',1150,330,70,70,15],['circle','y',220,560,40,40,0]],
    3:[['half','c',40,560,160,80,0],['dots','d',1080,560,160,120,0],['pill','y',60,150,160,56,-15],['circle','g',1180,540,36,36,0]],
    4:[['ring','y',80,100,90,90,0,10],['circle','c',1170,120,34,34,0],['pill','g',1080,590,120,44,-30],['q','y',70,500,110,110,90],['dots','d',1060,440,140,100,0],['sq','c',250,610,50,50,20]],
    5:[['pill','c',60,140,200,64,20],['ring','b',80,500,120,120,0,12],['dots','d',1080,120,160,120,0],['circle','y',1100,300,40,40,0]],
    6:[['ring','y',1100,90,130,130,0,14],['pill','g',1080,600,180,60,-15],['dots','d',40,120,160,120,0],['circle','c',1190,330,34,34,0]],
    7:[['q','y',0,540,180,180,0],['ring','g',1110,520,140,140,0,14],['dots','d',60,140,140,120,0],['pill','c',1080,170,150,52,25],['circle','b',150,480,30,30,0]],
    8:[['half','y',20,600,160,80,0],['ring','c',40,90,120,120,0,12],['dots','d',1000,80,160,110,0],['circle','g',160,230,34,34,0]],
    9:[['pill','y',60,130,200,64,-20],['ring','c',1090,100,130,130,0,14],['circle','g',90,380,40,40,0],['dots','d',1110,420,140,140,0]],
    10:[['q','g',1100,540,180,180,270],['ring','y',1080,80,140,140,0,14],['pill','c',80,580,200,60,15],['dots','d',560,560,160,100,0]],
    11:[['ring','y',515,65,250,250,0,4],['pill','c',230,160,200,70,-20],['q','g',1000,480,180,180,0],['dots','d',120,480,160,130,0],['circle','b',1060,150,50,50,0],['sq','c',220,560,60,60,15]]
  };

  const scenes=[...document.querySelectorAll('#mainScroll .io .scene')];
  let prev=null;
  scenes.forEach((sc,k)=>{
    const [x,y,d]=sc.dataset.orb.split(',').map(Number),o=document.createElement('div');
    o.className='orb'+(prev?'':' first');
    const p=prev||[x,y,d];
    o.style.cssText=`--x:${x}px;--y:${y}px;--d:${d}px;--px:${p[0]}px;--py:${p[1]}px;--pd:${p[2]}px`;
    sc.insertBefore(o,sc.firstChild);prev=[x,y,d];
    (S[k+1]||[]).forEach((s,i)=>{const e=document.createElement('i');e.className='shp '+s[0];
      const col=C[s[1]],dx=(s[2]+s[4]/2<640?-1:1)*40,dy=(s[3]+s[5]/2<360?-1:1)*30;
      /* large solid shapes shrink to about 70%, kept centred where they were; thin rings and dot grids stay */
      const k=(s[0]==='dots'||(s[0]==='ring'&&s[7]<=4))?1:Math.max(s[4],s[5])>150?.68:Math.max(s[4],s[5])>90?.8:1;
      const w=s[4]*k,h=s[5]*k,lx=s[2]+(s[4]-w)/2,ty=s[3]+(s[5]-h)/2;
      e.style.cssText=`left:${lx}px;top:${ty}px;width:${w}px;height:${h}px;--r:${s[6]}deg;${s[7]?'--bw:'+Math.round(s[7]*Math.max(k,.75))+'px;':''}`;
      e.style.cssText+=`--r:${s[6]}deg;--i:${i};--dx:${dx}px;--dy:${dy}px;--bd:${6+i*1.3}s;color:${col};background:${col};`;
      sc.insertBefore(e,o.nextSibling);});
  });

  /* 9: homes as dots; joined homes light up and link, rippling outward */
  (function(){
    const svg=document.getElementById('map');let s=17;const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
    const P=[],cx=450,cy=160,cols=[C.b,C.g,C.y,C.c];
    for(let row=0;row<10;row++)for(let col=0;col<30;col++){const x=col*30+15+(r()-.5)*8,y=row*32+16+(r()-.5)*8;
      if(Math.hypot((x-cx)/1.6,y-cy)<40)continue;P.push({x,y,on:r()<.5,c:cols[(r()*4)|0]});}
    const on=P.filter(p=>p.on),seen=new Set(),g=el(svg,'g',{});
    const dl=(x,y)=>(.4+Math.hypot((x-cx)/1.6,y-cy)/280*1.8).toFixed(2)+'s';
    on.forEach((a,i)=>{on.map((b,j)=>[j,Math.hypot(a.x-b.x,a.y-b.y)]).filter(q=>q[0]!==i&&q[1]<66).sort((p,q)=>p[1]-q[1]).slice(0,2).forEach(([j])=>{
      const k=i<j?i+'-'+j:j+'-'+i;if(seen.has(k))return;seen.add(k);const b=on[j];
      const l=el(g,'line',{class:'lk',x1:a.x.toFixed(1),y1:a.y.toFixed(1),x2:b.x.toFixed(1),y2:b.y.toFixed(1),pathLength:1,stroke:a.c});
      l.style.setProperty('--dl',dl((a.x+b.x)/2,(a.y+b.y)/2));});});
    P.forEach(p=>{const c=el(svg,'circle',{class:'pt'+(p.on?' on':''),cx:p.x.toFixed(1),cy:p.y.toFixed(1),r:p.on?4:2.6});
      if(p.on){c.setAttribute('fill',p.c);c.style.setProperty('--dl',dl(p.x,p.y));}});
    el(svg,'circle',{class:'plant',cx,cy,r:22});
    const t=el(svg,'text',{x:cx,y:cy+48,'text-anchor':'middle','font-size':14,fill:'#8A8A8E','font-family':'Google Sans,-apple-system,Helvetica Neue,Arial,sans-serif'});t.textContent='Central plant';
  })();

  /* 7: the bill counts down to zero */
  const hooks={'slide-7':(function(){
    const n=document.getElementById('count');let raf=0,t0=0;
    function loop(ts){if(!t0)t0=ts;const t=(ts-t0)/1000-1;
      if(t<0)n.textContent='$400';else if(t<4){n.textContent='$'+Math.round(400*(1-Math.pow(t/4,2.6)));}else{n.textContent='$0';return;}
      raf=requestAnimationFrame(loop);}
    return{start(){cancelAnimationFrame(raf);t0=0;n.textContent='$400';raf=requestAnimationFrame(loop);},stop(){cancelAnimationFrame(raf);n.textContent='$0';}};
  })()};

  /* standalone player: one frame at a time, each frame plays on arrival */
  const wraps=[...document.querySelectorAll('#mainScroll .slide-wrap')],stage=document.getElementById('stage'),num=document.getElementById('num'),ui=document.getElementById('ui'),hint=document.getElementById('hint');
  let cur=-1;
  function fit(){stage.style.setProperty('--k',Math.min(innerWidth/1280,innerHeight/720));}
  function show(i){i=Math.max(0,Math.min(wraps.length-1,i));if(i===cur)return;
    if(cur>=0){const w=wraps[cur],cv=w.querySelector('.slide-canvas'),h=hooks[w.id];cv.classList.remove('live');w.classList.remove('on');h&&h.stop();}
    cur=i;const w=wraps[i],cv=w.querySelector('.slide-canvas'),h=hooks[w.id];
    w.classList.add('on');void cv.offsetWidth;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{cv.classList.add('live');h&&h.start();}));
    num.textContent=(i+1)+' / '+wraps.length;history.replaceState(null,'','#slide-'+(i+1));}
  function full(){const d=document;if(!d.fullscreenElement)d.documentElement.requestFullscreen&&d.documentElement.requestFullscreen();else d.exitFullscreen&&d.exitFullscreen();}
  addEventListener('keydown',e=>{const k=e.key;
    if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(k)){e.preventDefault();show(cur+1);}
    else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(k)){e.preventDefault();show(cur-1);}
    else if(k==='Home')show(0);else if(k==='End')show(wraps.length-1);
    else if(k==='f'||k==='F')full();
    else if(k==='d'||k==='D')save();});
  document.getElementById('prev').onclick=e=>{e.stopPropagation();show(cur-1);};
  document.getElementById('next').onclick=e=>{e.stopPropagation();show(cur+1);};
  document.getElementById('fs').onclick=e=>{e.stopPropagation();full();};
  function save(){const b=new Blob([VN_SOURCE],{type:'text/html'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='VoltNexus.html';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);}
  document.getElementById('dl').onclick=e=>{e.stopPropagation();save();};
  stage.addEventListener('click',()=>show(cur+1));
  let idle=0;addEventListener('mousemove',()=>{ui.classList.add('show');document.body.classList.remove('idle');clearTimeout(idle);idle=setTimeout(()=>{ui.classList.remove('show');document.body.classList.add('idle');},2200);});
  setTimeout(()=>{hint.style.opacity=0;},3800);
  addEventListener('resize',fit);fit();
  const m=location.hash.match(/slide-(\d+)/);show(m?(+m[1]-1):0);
})();
