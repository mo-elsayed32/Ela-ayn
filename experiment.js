(() => {
 'use strict';
 let inGallery=false;
 const root=document.documentElement,home=document.getElementById('page-home');
 const hero=document.getElementById('question-journey'),journey=document.getElementById('texts');
 const stations=[...document.querySelectorAll('.station')],washes=[...document.querySelectorAll('.station-wash>div')],stops=[...document.querySelectorAll('[data-stop]')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 let ticking=false,staticMode=false;
 const readingButton=document.querySelector('.reading-mode');
 readingButton.addEventListener('click',()=>{
  const current=Math.max(0,stations.findIndex(s=>s.getAttribute('aria-hidden')==='false'));
  staticMode=!staticMode;journey.classList.toggle('is-static',staticMode);
  readingButton.setAttribute('aria-pressed',String(staticMode));readingButton.textContent=staticMode?'عرض متحرك':'عرض ثابت';
  render();
  if(staticMode){stations[current].scrollIntoView({behavior:'instant',block:'center'});stations[current].querySelector('.station-read').focus({preventScroll:true})}
  else {const m=metrics();scrollTo({top:m.top+m.span*targets[current],behavior:'instant'})}
 });
 function metrics(){return {vh:innerHeight,span:Math.max(1,journey.offsetHeight-innerHeight),top:journey.getBoundingClientRect().top+scrollY}}
 // Hold each station long enough to read, then traverse the space between paintings.
 function position(t){const x=clamp(t)*3.1;return x<.5?0:x<1.3?smooth((x-.5)/.8):x<1.8?1:x<2.6?1+smooth((x-1.8)/.8):2}
 function render(){
  ticking=false;
  if(!home.classList.contains('active'))return;
  const reduced=reduce.matches||staticMode, mobile=innerWidth<1100;
  const m=metrics();
  // Keep the painted room stable. Only rebalance its contents inside the
  // currently visible viewport, never beneath expanded browser chrome.
  const world=journey.querySelector('.station-world');
  const safeHeight=world.offsetHeight;
  const visibleHeight=window.visualViewport?visualViewport.height:innerHeight;
  const extra=reduced?0:Math.max(0,Math.min(visibleHeight-safeHeight,stageHeight()-safeHeight));
  journey.style.setProperty('--station-visible-extra',extra+'px');
  const hr=hero.getBoundingClientRect(),hp=clamp(-hr.top/Math.max(1,m.top-(hr.top+scrollY)));
  hero.style.setProperty('--question-depth',reduce.matches?'0px':hp*hp*(mobile?560:650)+'px');
  hero.style.setProperty('--question-title-opacity',reduce.matches?1:1-smooth((hp-.35)/.6));
  hero.style.setProperty('--question-detail-opacity',reduce.matches?1:1-smooth(hp/.42));
  hero.querySelector('.hero').inert=!reduce.matches&&hp>.6;
  hero.style.setProperty('--question-scale',reduced?1:1+hp*.7);
  hero.style.setProperty('--question-blur',reduced?'0px':Math.max(0,hp-.55)*7+'px');
  journey.style.setProperty('--gallery-entry',reduce.matches||staticMode?1:smooth((hp-.5)/.5));
  journey.inert=!reduced&&hp<.85;
  // A genuine fixed screen plane before the gallery's normal sticky interval.
  // No inverse Y transform is raced against native compositor scrolling.
  const entry=reduced?1:smooth((hp-.18)/.82);
  const stage=journey.querySelector('.station-stage');
  // Scroll offsets may round just below a fractional gallery boundary.
  const approach=!reduced&&scrollY<m.top-1;
  stage.classList.toggle('is-approaching',approach);
  stage.style.transform='none';
  journey.style.setProperty('--gallery-entry',entry);
  journey.style.setProperty('--station-camera-scale',String(.55+.45*entry));
  const galleryVisible=scrollY>=m.top-innerHeight*.2&&scrollY<m.top+journey.offsetHeight-innerHeight*.2;
  if(galleryVisible!==inGallery){inGallery=galleryVisible;root.classList.toggle('in-station-gallery',galleryVisible);if(galleryVisible&&typeof dismissFlashImmediately==='function')dismissFlashImmediately()}
  const p=position((scrollY-m.top)/m.span),active=Math.round(p);
  stations.forEach((station,i)=>{
   const d=i-p,visibility=1-smooth(Math.abs(d)*1.9);
   const sceneAlpha=1-smooth(Math.abs(d));
   const sceneScale=d>=0?1-.24*smooth(d):1+.18*smooth(-d);
   station.querySelector('.station-art').style.opacity=reduced?.8:1;
   station.style.opacity=reduced?'1':String(sceneAlpha);
   station.style.transform=reduced?'none':`scale(${sceneScale})`;
   const copy=station.querySelector('.station-copy');copy.style.opacity=reduced?1:visibility;
   copy.style.translate='none';
   station.inert=!reduced&&(i!==active||visibility<.2);
   station.setAttribute('aria-hidden',String(station.inert));
   washes[i].style.opacity=clamp(1-Math.abs(d));
   washes[i].style.transform='scale(1.1)';
   stops[i].style.setProperty('--fill',clamp(1-Math.abs(d))*100+'%');
   stops[i].setAttribute('aria-current',String(i===active));
  });
 }
 function stageHeight(){return journey.querySelector('.station-stage').offsetHeight}
 if(window.visualViewport)visualViewport.addEventListener('resize',request,{passive:true});
 function request(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});reduce.addEventListener('change',request);
 new MutationObserver(request).observe(home,{attributes:true,attributeFilter:['class']});
 // A closed discovery dialog must not retain keyboard focus targets.
 const dialog=document.getElementById('env-screen');
 const syncDialog=()=>{dialog.inert=dialog.getAttribute('aria-hidden')==='true'};
 new MutationObserver(syncDialog).observe(dialog,{attributes:true,attributeFilter:['aria-hidden']});syncDialog();
 const targets=[.08,.5,.91];
 stops.forEach((b,i)=>b.addEventListener('click',()=>{const m=metrics();scrollTo({top:m.top+m.span*targets[i],behavior:reduce.matches?'instant':'smooth'})}));
 document.querySelector('.journey-invite').addEventListener('click',e=>{e.preventDefault();const m=metrics();scrollTo({top:m.top,behavior:reduce.matches?'instant':'smooth'})});
 render();
})();
