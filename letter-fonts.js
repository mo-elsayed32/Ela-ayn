/* Decorative letters only. Locally hosted OFL subsets, loaded after the entrance. */
(() => {
 'use strict';
 const box=document.getElementById('h-ltrs');
 if(!box||!('FontFace' in window))return;
 const files=['arefruqaa','reemkufi','lalezar','lemonada','rakkas','jomhuria','katibeh','mirza','harmattan','markazitext','lateef','scheherazadenew','mada','changa','elmessiri','almarai','cairo','tajawal','notonaskharabic','notonastaliqurdu'];
 const fonts=new Map();let next=0,visible=true;
 const permitted=()=>visible&&!document.hidden&&document.documentElement.classList.contains('hero-stage-letters');
 function decorate(letter){
  if(!permitted()||!letter.classList.contains('ltr'))return;
  const i=next++%files.length;
  if(!fonts.has(i)){
   const face=new FontFace(`IlaynaLetter${i}`,`url(assets/letter-fonts/${files[i]}.woff2)`,{display:'swap',weight:'400'});
   fonts.set(i,face.load().then(f=>{document.fonts.add(f);return f.family}).catch(()=>null));
  }
  fonts.get(i).then(family=>{if(family&&letter.isConnected)letter.style.fontFamily=`"${family}", "Amiri", serif`});
 }
 new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting)},{threshold:0}).observe(box);
 new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)decorate(node)}).observe(box,{childList:true});
 const ready=new MutationObserver(()=>{if(permitted()){box.querySelectorAll('.ltr').forEach(decorate);ready.disconnect()}});
 ready.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 if(permitted())box.querySelectorAll('.ltr').forEach(decorate);
})();
