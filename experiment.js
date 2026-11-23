(() => {
 'use strict';
 const root=document.documentElement,home=document.getElementById('page-home');
 const hero=document.getElementById('question-journey'),journey=document.getElementById('texts');
 const stations=[...document.querySelectorAll('.station')],washes=[...document.querySelectorAll('.station-wash>div')],stops=[...document.querySelectorAll('[data-stop]')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 let ticking=false;
 function metrics(){return {vh:innerHeight,span:Math.max(1,journey.offsetHeight-innerHeight),top:journey.getBoundingClientRect().top+scrollY}}
 // Hold each station long enough to read, then traverse the space between paintings.
 function position(t){const x=clamp(t)*3.1;return x<.5?0:x<1.3?smooth((x-.5)/.8):x<1.8?1:x<2.6?1+smooth((x-1.8)/.8):2}
 function render(){
  ticking=false;
  if(!home.classList.contains('active'))return;
  const reduced=reduce.matches, mobile=innerWidth<1100;
  const hr=hero.getBoundingClientRect(),hp=clamp(-hr.top/Math.max(1,hero.offsetHeight-innerHeight));
  hero.style.setProperty('--question-title-scale',reduced?1:1+hp*hp*(mobile?2.4:3.6));
  hero.style.setProperty('--question-title-opacity',reduced?1:1-smooth((hp-.35)/.6));
  hero.style.setProperty('--question-detail-opacity',reduced?1:1-smooth(hp/.42));
  hero.style.setProperty('--question-scale',reduced?1:1+hp*.7);
  hero.style.setProperty('--question-blur',reduced?'0px':Math.max(0,hp-.55)*7+'px');
  const m=metrics(),p=position((scrollY-m.top)/m.span),active=Math.round(p);
  stations.forEach((station,i)=>{
   const d=i-p,visibility=1-smooth(Math.abs(d)*2.7);
   station.querySelector('.station-art').style.opacity=reduced?.8:clamp(1-Math.max(0,Math.abs(d)-.45)/.55);
   station.style.transform=reduced?'none':`translate3d(${-d*(mobile?innerWidth*1.12:innerWidth*.74)}px,0,0)`;
   const copy=station.querySelector('.station-copy');copy.style.opacity=reduced?1:visibility;
   if(!reduced)copy.style.translate=`${d*-45}px 0`;
   station.inert=!reduced&&(i!==active||visibility<.2);
   station.setAttribute('aria-hidden',String(station.inert));
   washes[i].style.opacity=clamp(1-Math.abs(d));
   washes[i].style.transform=`translate3d(${d*-60}px,0,0) scale(1.15)`;
   stops[i].style.setProperty('--fill',clamp(1-Math.abs(d))*100+'%');
   stops[i].setAttribute('aria-current',String(i===active));
  });
 }
 function request(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});reduce.addEventListener('change',request);
 new MutationObserver(request).observe(home,{attributes:true,attributeFilter:['class']});
 const targets=[.08,.5,.91];
 stops.forEach((b,i)=>b.addEventListener('click',()=>{const m=metrics();scrollTo({top:m.top+m.span*targets[i],behavior:reduce.matches?'instant':'smooth'})}));
 document.querySelector('.journey-invite').addEventListener('click',e=>{e.preventDefault();const m=metrics();scrollTo({top:m.top,behavior:reduce.matches?'instant':'smooth'})});
 render();
})();
