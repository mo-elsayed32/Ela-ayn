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
   paths.forEach(p=>{const v=Math.max(0,Math.min(1,(t-Number(p.dataset.a)*1.75)/((Number(p.dataset.b)-Number(p.dataset.a))*1.75)));p.style.strokeDashoffset=p.getTotalLength()*(1-v)});
   if(t<3.5)requestAnimationFrame(frame);else {showHeroImage();resolve()}
  }requestAnimationFrame(frame);
 });
 await heroDelay(500);if(heroEntranceCanceled)return;
 heroRoot.classList.remove('hero-sequence-pending');
 const rest=document.querySelectorAll('#nav,.hero > :not(.h-content),.h-eyebrow,.h-divider');
 rest.forEach(el=>el.classList.add('hero-sequence-enter'));
 document.querySelectorAll('.h-eyebrow,.h-divider,.n-logo,.n-links a').forEach(el=>el.style.opacity='1');
 const cta=document.getElementById('h-discover'),sub=document.getElementById('h-snap-sub');
 // Keep CTA hidden until the 700ms entrance and separate 700ms pause finish.
 cta.style.visibility='hidden';sub.style.visibility='hidden';
 await heroDelay(1400);if(heroEntranceCanceled)return;
 cta.style.visibility='';sub.style.visibility='';cta.style.opacity='1';sub.style.opacity='1';
 cta.classList.add('hero-cta-enter');sub.classList.add('hero-cta-enter');
 document.getElementById('glass-disc-btn').style.opacity='1';
 document.querySelector('.glass-disc-label').textContent='اكتشف نصًّا';
 clearTimeout(window.heroSafetyTimer);
 startSnapCycle();
}
async function startHeroGoldSparkles(){
 const canvas=document.getElementById('gold-sparks'),ctx=canvas.getContext('2d');
 const source=document.querySelector('#calligraphy image');
 const img=new Image();img.src=source.getAttribute('href');await img.decode();
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
   const pt=p.getPointAtLength(p.getTotalLength()*v),rad=+p.getAttribute('stroke-width')*.5;
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
