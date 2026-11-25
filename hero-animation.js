/* Gold artwork reveal, scoped to the home hero. */
let heroInkAt=0;
let heroEntranceCanceled=false;
const heroRoot=document.documentElement;
heroRoot.classList.add('hero-title-pending');
function heroDelay(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function showHeroImage(){
 const image=document.getElementById('hero-gold-image');image.removeAttribute('mask');
 heroRoot.classList.remove('hero-title-pending');
}
function finishHeroEntrance(){
 heroEntranceCanceled=true;
 clearTimeout(window.heroSafetyTimer);
 if(cancelHeroButtonReveal)cancelHeroButtonReveal();
 heroRoot.classList.remove('hero-choreography');
 const cta=document.getElementById('h-discover'),sub=document.getElementById('h-snap-sub');if(cta)cta.style.visibility='';if(sub)sub.style.visibility='';
 heroRoot.classList.remove('hero-sequence-pending','hero-title-pending');
 showHeroImage();
 const overlay=document.getElementById('intro-overlay');if(overlay)overlay.style.display='none';
 document.querySelectorAll('.h-eyebrow,.h-divider,.n-logo,.n-links a,#h-discover,#glass-disc-btn,#h-snap-sub').forEach(el=>el.style.opacity='1');
 const canvas=document.getElementById('gold-sparks');if(canvas)canvas.getContext('2d').clearRect(0,0,950,614);
}
async function playHeroEntrance(){
 if(heroEntranceCanceled)return;
 const image=document.getElementById('hero-gold-image'),title=document.getElementById('h-title');
 const loader=new Image();loader.src=image.getAttribute('href');
 try { await Promise.race([loader.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('image timeout')),5000))]); }
 catch(e){title.classList.add('image-unavailable');}
 if(heroEntranceCanceled)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 image.setAttribute('mask','url(#trace-mask)');heroRoot.classList.remove('hero-title-pending');
 const paths=[...document.querySelectorAll('.ink-trace')];
 paths.forEach(p=>p.style.setProperty('--length',p.getTotalLength()));
 heroInkAt=performance.now();
 if(!reduce&&!title.classList.contains('image-unavailable'))startHeroGoldSparkles().catch(()=>{});
 await new Promise(resolve=>{
  function frame(now){
   if(heroEntranceCanceled){resolve();return}
   const t=reduce?3.5:(now-heroInkAt)/1000;
   paths.forEach(p=>{const v=Math.max(0,Math.min(1,(t-Number(p.dataset.a)*1.75)/((Number(p.dataset.b)-Number(p.dataset.a))*1.75)));p.style.strokeDashoffset=p.getTotalLength()*(1-(v*v*(3-2*v)))});
   if(t<3.5)requestAnimationFrame(frame);else {showHeroImage();resolve()}
  }requestAnimationFrame(frame);
 });
 // The title finishes first. All supporting elements then fade together,
 // completing within1.5s rather than a chain of delayed visibility changes.
 if(heroEntranceCanceled)return;
 heroRoot.classList.add('hero-choreography','hero-stage-project','hero-stage-author','hero-stage-scene','hero-stage-words','hero-stage-letters','hero-stage-button');
 heroRoot.classList.remove('hero-sequence-pending');
 document.querySelector('.h-divider').style.opacity='1';
 document.querySelector('.h-eyebrow').style.opacity='1';
 document.querySelectorAll('.n-logo,.n-links a').forEach(el=>el.style.opacity='1');
 document.getElementById('h-qmark').style.opacity='.12';
 document.getElementById('h-snap-sub').style.opacity='1';startSnapCycle();
 document.querySelector('.glass-disc-label').textContent='اكتشف نصًّا';
 document.getElementById('glass-disc-btn').style.opacity='1';
 document.getElementById('h-discover').style.opacity='1';
 if(!reduce)await Promise.all([revealHeroButton(),heroDelay(1500)]);
 if(heroEntranceCanceled)return;
 clearTimeout(window.heroSafetyTimer);heroRoot.classList.remove('hero-choreography');
}

// Reveal the real DOM button. The light is an SVG curve on the exact moving
// capsule edge, not a brightened screenshot rectangle or an overlay beam.
let cancelHeroButtonReveal=null;
async function revealHeroButton(){
 const btn=document.getElementById('glass-disc-btn'),host=document.getElementById('h-discover');
 const rect=btn.getBoundingClientRect(),parent=host.getBoundingClientRect();
 const W=rect.width,H=rect.height,ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
 svg.classList.add('hero-button-edge');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('aria-hidden','true');
 Object.assign(svg.style,{width:W+'px',height:H+'px',left:(rect.left-parent.left)+'px',top:(rect.top-parent.top)+'px'});
 path.setAttribute('fill','none');path.setAttribute('stroke','#f4ce80');path.setAttribute('stroke-width','1.5');svg.append(path);
 host.append(svg);btn.style.clipPath='inset(0 0 0 100% round 999px)';
 await new Promise(resolve=>{
  let raf=0,done=false;const start=performance.now();
  const cleanup=()=>{if(done)return;done=true;cancelAnimationFrame(raf);clearTimeout(safety);window.removeEventListener('resize',cleanup);btn.removeEventListener('focus',cleanup);svg.remove();btn.style.clipPath='';cancelHeroButtonReveal=null;resolve()};
  const safety=setTimeout(cleanup,2000);cancelHeroButtonReveal=cleanup;
  window.addEventListener('resize',cleanup,{once:true});btn.addEventListener('focus',cleanup,{once:true});
  function frame(now){
   if(heroEntranceCanceled){cleanup();return}
   const t=Math.min(1,(now-start)/1250),p=1-Math.pow(1-t,2.4),left=W*(1-p),r=Math.min(H/2,(W-left)/2),y=H/2;
   btn.style.clipPath=`inset(0 0 0 ${left}px round ${r}px)`;
   path.setAttribute('d',`M ${left+r} 1 Q ${left+1} 1 ${left+1} ${Math.max(r,1)} L ${left+1} ${H-r} Q ${left+1} ${H-1} ${left+r} ${H-1}`);
   svg.style.opacity=String(Math.min(1,t*9)*Math.min(1,(1-t)*5));
   if(t<1)raf=requestAnimationFrame(frame);else cleanup();
  }raf=requestAnimationFrame(frame);
 });
}

async function startHeroGoldSparkles(){
 const canvas=document.getElementById('gold-sparks'),ctx=canvas.getContext('2d');
 const source=document.querySelector('#calligraphy image');
 const img=new Image();img.crossOrigin='anonymous';img.src=source.getAttribute('href');await img.decode();
 const map=document.createElement('canvas');map.width=1226;map.height=614;
 const mx=map.getContext('2d',{willReadFrequently:true});mx.drawImage(img,0,0);
 const pixels=mx.getImageData(0,0,1226,614).data;
 const paths=[...document.querySelectorAll('.ink-trace')],particles=[];
 let seed=4345;
 function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
 function isGold(x,y){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=1226||y>=614)return false;let n=(y*1226+x)*4;return pixels[n]>110&&pixels[n+1]>55&&pixels[n]>pixels[n+2]*1.5}
 let last=performance.now();
 function draw(now){
  const t=(now-heroInkAt)/1000,dt=Math.max(0,Math.min(.04,(now-last)/1000));last=now;
  ctx.clearRect(0,0,950,614);
  for(const p of paths){const a=+p.dataset.a*1.75,b=+p.dataset.b*1.75,v=(t-a)/(b-a);if(v<0||v>1)continue;
   const u=v*v*(3-2*v),pt=p.getPointAtLength(p.getTotalLength()*u),rad=+p.getAttribute('stroke-width')*.5;
   for(let k=0;k<36;k++){let x=pt.x+(rand()-.5)*rad*1.8,y=pt.y+(rand()-.5)*rad*1.8;if(!isGold(x,y))continue;
    particles.push({x:x-100,y,age:0,life:.22+rand()*.30,r:1.6+rand()*3.1,vx:(rand()-.5)*10,vy:-8-rand()*15,star:rand()>.79});
   }
   // A short-lived highlight at the forming gold edge, not a full-image flash.
   for(let k=0;k<8;k++){let x=pt.x+(rand()-.5)*rad,y=pt.y+(rand()-.5)*rad;if(!isGold(x,y))continue;
    let g=ctx.createRadialGradient(x-100,y,0,x-100,y,23);g.addColorStop(0,'rgba(255,237,151,.55)');g.addColorStop(.3,'rgba(255,181,49,.22)');g.addColorStop(1,'rgba(255,160,20,0)');ctx.fillStyle=g;ctx.fillRect(x-123,y-23,46,46);
   }
  }
  for(let i=particles.length-1;i>=0;i--){let q=particles[i];q.age+=dt;if(q.age>q.life){particles.splice(i,1);continue}q.x+=q.vx*dt;q.y+=q.vy*dt;const alpha=Math.sin(Math.PI*q.age/q.life);
   ctx.shadowColor='#ffc45d';ctx.shadowBlur=9;ctx.fillStyle='rgba(255,236,167,'+alpha*.95+')';ctx.beginPath();ctx.arc(q.x,q.y,q.r*alpha,0,Math.PI*2);ctx.fill();
   if(q.star){ctx.shadowBlur=9;ctx.strokeStyle='rgba(255,243,200,'+alpha*.9+')';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(q.x-12*alpha,q.y);ctx.lineTo(q.x+12*alpha,q.y);ctx.moveTo(q.x,q.y-16*alpha);ctx.lineTo(q.x,q.y+16*alpha);ctx.stroke()}
  }ctx.shadowBlur=0;
  if(!heroEntranceCanceled && (t<4.2||particles.length))requestAnimationFrame(draw);else ctx.clearRect(0,0,950,614);
 }requestAnimationFrame(draw);
}
