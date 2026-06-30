/* ── cursor ── */
const curEl = document.getElementById('cur');
const curR  = document.getElementById('cur-r');
const isMob = window.matchMedia('(hover:none)').matches;
let mx=0,my=0,rx=0,ry=0;

// Fallback: لو فشل أي حاجة في الـ cursor system، نرجع cursor الافتراضي
function activateCursorFallback() {
  document.body.classList.add('cursor-fallback');
}

if (!isMob) {
  try {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      curEl.style.left = mx+'px'; curEl.style.top = my+'px';
    });

    (function loop() {
      rx += (mx-rx)*.1; ry += (my-ry)*.1;
      curR.style.left = rx+'px'; curR.style.top = ry+'px';
      requestAnimationFrame(loop);
    })();

    // الـ interactive selector موسّع ليشمل كل العناصر القابلة للتفاعل
    const INTERACTIVE = '[onclick], .text-item, .next-poem, .btn, .footer-links a, a, button, input, textarea, select, label, .cm-btn, .disc-btn-read, .disc-btn-again, .env-btn-read, .env-btn-again, .env-envelope, .env-close, .glass-disc-btn, .flash-expandable, #flash-close, .disc-close, #theme-toggle, .n-logo, .n-back';

    document.addEventListener('mouseover', e => {
      if (e.target.closest(INTERACTIVE)) {
        curEl.style.transform = 'translate(-50%,-50%) scale(3)';
        curR.style.opacity = '.15';
        curR.style.transform = 'translate(-50%,-50%) scale(1.4)';
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(INTERACTIVE)) {
        curEl.style.transform = 'translate(-50%,-50%) scale(1)';
        curR.style.opacity = '.5';
        curR.style.transform = 'translate(-50%,-50%) scale(1)';
      }
    });

  } catch(err) {
    activateCursorFallback();
  }
}

// لو المؤشر اختفى عن الـ window بالكامل (edge case)
document.addEventListener('mouseleave', () => {
  curEl.style.opacity = '0'; curR.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  curEl.style.opacity = '1'; curR.style.opacity = '.5';
});

/* ── floating letters ── */
const lbox = document.getElementById('h-ltrs');

function spawnLetter() {
  if (!lbox) return;
  const el = document.createElement('span');
  el.className = 'ltr';
  el.textContent = lchars[Math.floor(Math.random()*lchars.length)];
  const s = Math.random()*55+18;
  el.style.cssText = `right:${Math.random()*100}%;bottom:-${s}px;font-size:${s}px;animation-duration:${Math.random()*14+12}s;animation-delay:${Math.random()*3}s;`;
  lbox.appendChild(el);
  setTimeout(() => el.remove(), 19000);
}
setInterval(spawnLetter, 1800);

/* ── progress bar ── */
const progBar = document.getElementById('prog');
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 75);
  const ap = document.querySelector('.page.active');
  if (ap && ap.id !== 'page-home') {
    const total = document.body.scrollHeight - innerHeight;
    progBar.style.width = (total > 0 ? (scrollY / total) * 100 : 0) + '%';
  } else {
    progBar.style.width = '0';
  }
}, { passive: true });

/* ── navigation ── */
function goTo(page) {
  const from = document.querySelector('.page.active');
  from.style.transition = 'opacity .28s ease, transform .28s ease';
  from.style.opacity = '0';
  from.style.transform = 'translateY(-8px)';
  cleanPainting(); /* إخفاء الصور فوراً قبل الـ transition */
  setTimeout(() => {
    document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.cssText = ''; });
    const to = document.getElementById('page-' + page);
    if (to) {
      to.classList.add('active');
      to.style.opacity = '0';
      to.style.transform = 'translateY(10px)';
      to.style.transition = 'opacity .38s ease, transform .38s ease';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        to.style.opacity = '1'; to.style.transform = 'translateY(0)';
      }));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    setNav(page);
    progBar.style.width = '0';
    /* الصور تظهر بعد الصفحة كاملاً — مش أثناء الـ transition */
    setTimeout(() => {
      initReveals();
      const pkey = page.replace('poem-','');
      if (paintings[pkey]) initPainting(pkey);
    }, 500);
  }, 280);
}

function goToSection(page, id) {
  goTo(page);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 680);
}

/* ── nav ── */


function setNav(page) {
  const nl = document.getElementById('nav-l');
  const nc = document.getElementById('nav-c');
  const nr = document.getElementById('nav-r');
  const nav = document.getElementById('nav');
  nav.classList.remove('scrolled');

  if (page === 'home') {
    nav.classList.add('was-on-poem');
    nav.classList.remove('on-poem');
    nl.innerHTML = `<span class="n-logo" onclick="goTo('home')">إلى أين؟</span>`;
    nc.textContent = '';
    nr.innerHTML = `<div style="display:flex;align-items:center;gap:1.5rem;"><ul class="n-links"><li><a onclick="goToSection('home','texts')">النصوص</a></li><li><a onclick="goToSection('home','about')">عن المشروع</a></li><li><a onclick="goToSection('home','contact')">تواصل</a></li></ul>${toggleBtnHTML}</div>`;
  } else {
    nav.classList.add('on-poem');
    nav.classList.remove('was-on-poem');

    nl.innerHTML = `<span class="n-back" onclick="goTo('home')" aria-label="الرئيسية"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg></span>`;
    nc.textContent = poemTitles[page] || '';
    nr.innerHTML = `<div style="display:flex;align-items:center;gap:1.2rem;"><span class="n-num">${poemNums[page]||''}</span>${toggleBtnHTML}</div>`;
  }
}

/* ── scroll reveal ── */
function initReveals() {
  const els = document.querySelectorAll('.page.active .reveal, .page.active .stanza');
  els.forEach(el => el.classList.remove('on'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = parseInt(e.target.dataset.d || 0);
        setTimeout(() => e.target.classList.add('on'), d);
        io.unobserve(e.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  els.forEach(el => io.observe(el));

  ['sig-teen','sig-lahyaa','sig-qadiya'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('on');
    new IntersectionObserver(ens => {
      ens.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
    }, { threshold: .2 }).observe(el);
  });
}

/* ── touch feedback ── */
document.querySelectorAll('.text-item, .next-poem').forEach(el => {
  el.addEventListener('touchstart', () => el.style.background = 'rgba(200,184,152,.05)', { passive: true });
  el.addEventListener('touchend',   () => setTimeout(() => el.style.background = '', 300), { passive: true });
});

/* ── contact form ── */
const cform = document.getElementById('contact-form');
if (cform) {

  // ── validation helpers ──
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
  }

  function showFormMsg(msg, color, btn, btnLabel) {
    const msgEl = document.getElementById('form-msg');
    msgEl.textContent = msg;
    msgEl.style.color = color;
    msgEl.style.opacity = '1';
    if (btn && btnLabel) btn.textContent = btnLabel;
    return msgEl;
  }

  function showSuccessOverlay() {
    // رسالة تأكيد أنيقة فوق الفورم
    const existing = document.getElementById('form-success-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'form-success-overlay';
    overlay.style.cssText = [
      'position:absolute;inset:0;display:flex;flex-direction:column',
      'align-items:center;justify-content:center;gap:1.2rem',
      'background:var(--bg);opacity:0',
      'transition:opacity .55s cubic-bezier(.16,1,.3,1)',
      'z-index:10;text-align:center;padding:2rem',
    ].join(';');
    overlay.innerHTML = `
      <div style="font-family:'Amiri',serif;font-size:2rem;color:var(--gold);opacity:.8;animation:breathe 3s ease-in-out infinite;">✦</div>
      <p style="font-family:'Amiri',serif;font-size:1.15rem;color:var(--text);line-height:2;">وصلت الرسالة</p>
      <p style="font-family:'Amiri',serif;font-style:italic;font-size:.88rem;color:var(--text3);line-height:1.9;">شكراً على تواصلك — هردّ عليك في أقرب وقت.</p>
      <div style="width:32px;height:1px;background:var(--gold);opacity:.4;margin:.4rem 0;"></div>
      <button onclick="this.closest('#form-success-overlay').remove();document.getElementById('contact-form').style.opacity='1';"
        style="font-family:'Tajawal',sans-serif;font-size:.72rem;letter-spacing:.16em;color:var(--text3);background:transparent;border:none;cursor:pointer;opacity:.6;margin-top:.4rem;transition:opacity .3s;"
        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.6'">
        إغلاق
      </button>
    `;
    const wrap = cform.parentElement;
    wrap.style.position = 'relative';
    wrap.appendChild(overlay);
    requestAnimationFrame(() => requestAnimationFrame(() => { overlay.style.opacity = '1'; }));
    cform.style.opacity = '0';
    cform.style.pointerEvents = 'none';
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        cform.style.opacity = '1';
        cform.style.pointerEvents = '';
      }, 560);
    }, 6000);
  }

  cform.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn    = document.getElementById('btn-txt');
    const msgEl  = document.getElementById('form-msg');
    const cmEl   = document.getElementById('cm');   // textarea الرسالة

    // ── 1. التحقق من حقل الرسالة ──
    if (!cmEl || !cmEl.value.trim()) {
      showFormMsg('اكتب رسالتك الأول 🙂', 'var(--text3)', btn, null);
      cmEl && cmEl.focus();
      setTimeout(() => { msgEl.style.opacity = '0'; }, 3500);
      return;
    }

    // ── 2. التحقق من البريد الإلكتروني (لو اختار email كطريقة تواصل) ──
    const channelEl = document.getElementById('contact_channel');
    const ceEl      = document.getElementById('ce');
    if (channelEl && channelEl.value === 'email' && ceEl && ceEl.value.trim()) {
      if (!isValidEmail(ceEl.value)) {
        showFormMsg('البريد الإلكتروني مش صحيح', 'var(--text3)', btn, null);
        ceEl.focus();
        setTimeout(() => { msgEl.style.opacity = '0'; }, 3500);
        return;
      }
    }

    // ── 3. إرسال ──
    btn.textContent = '..';
    msgEl.style.opacity = '0';

    try {
      const res = await fetch(cform.action, {
        method: 'POST',
        body: new FormData(cform),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        btn.textContent = '✓';
        cform.reset();
        showSuccessOverlay();
        setTimeout(() => { btn.textContent = 'ابعت'; }, 6500);
      } else {
        throw new Error();
      }
    } catch {
      showFormMsg('في مشكلة، حاول تاني', 'var(--text3)', btn, 'ابعت');
      setTimeout(() => { msgEl.style.opacity = '0'; }, 4000);
    }
  });
}

/* ── painting parallax ── */
function initPaintings() {
  for (const k in paintings) paintings[k].el = document.getElementById('painting-' + k);
}
function initPainting(key) {
  const p = paintings[key]; if (!p || !p.el) return;
  /* الصورة تظهر ببطء وأناقة بعد ما الصفحة تتلود */
  setTimeout(() => {
    p.el.style.transition = 'opacity 2.2s ease';
    p.el.style.opacity = '0.85';
  }, 200);
  if (!p._scrollHandler) {
    p._scrollHandler = () => onPaintingScroll(key);
    window.addEventListener('scroll', p._scrollHandler, { passive: true });
  }
}
function onPaintingScroll(key) {
  const p = paintings[key]; if (!p || !p.el) return;
  const cover = document.getElementById('cover-' + key);
  if (!cover) return;
  const rect = cover.getBoundingClientRect();
  const progress = -rect.top / window.innerHeight;
  const y = Math.min(Math.max(progress * 28, 0), 40);
  p.el.style.backgroundPositionY = 'calc(' + p.pos + ' + ' + y + 'px)';
}
function cleanPainting() {
  for (const k in paintings) {
    if (paintings[k].el) {
      paintings[k].el.style.transition = 'opacity 0.15s ease';
      paintings[k].el.style.opacity = '0';
    }
  }
}


/* ── من الطريق — flash cards ── */


let flashCard, flashTextEl;
let flashTimer = null;
let flashUsed = [];
let flashActive = false;

function initFlash() {
  flashCard   = document.getElementById('flash-card');
  flashTextEl = document.getElementById('flash-text');
}


function showFlash() {
  if (!flashCard) flashCard = document.getElementById('flash-card');
  if (!flashTextEl) flashTextEl = document.getElementById('flash-text');
  if (!flashCard || !flashTextEl) return;
  if (flashActive) return;
  if (flashUsed.length === flashTexts.length) flashUsed = [];

  // Pick unused random text
  let idx;
  do { idx = Math.floor(Math.random() * flashTexts.length); }
  while (flashUsed.includes(idx));
  flashUsed.push(idx);

  const entry = flashTexts[idx];
  const isExpanded = Array.isArray(entry) && entry[0] && entry[0].expanded;

  if (isExpanded) {
    const e = entry[0];
    flashTextEl.innerHTML =
      '<span class="flash-expandable" onclick="expandFlash(this)" data-detail="' +
      e.detail.replace(/"/g, '&quot;') + '">' +
      e.quote +
      '<span class="flash-expand-hint">↓</span></span>';
  } else {
    flashTextEl.innerHTML = entry.map((l,i) =>
      i === 0 ? l : '<em>' + l + '</em>'
    ).join('<br>');
  }

  // Pick random corner
  const corner = flashCorners[Math.floor(Math.random() * flashCorners.length)];
  Object.assign(flashCard.style, { top:'', bottom:'', left:'', right:'' });
  Object.assign(flashCard.style, corner);

  flashCard.classList.remove('hiding');
  flashCard.classList.add('visible');
  flashActive = true;

  // Auto-hide based on text length (7s–20s)
  const textLen = flashTextEl.innerText.length;
  const duration = Math.min(20000, Math.max(7000, textLen * 80));
  clearTimeout(flashTimer);
  flashTimer = setTimeout(hideFlash, duration);
}

function expandFlash(el) {
  const detail = el.getAttribute('data-detail');
  el.innerHTML = el.innerHTML.replace('<span class="flash-expand-hint">↓</span>', '');
  const detailDiv = document.createElement('div');
  detailDiv.className = 'flash-detail';
  detailDiv.innerHTML = detail.replace(/\n/g, '<br>');
  el.parentNode.appendChild(detailDiv);
  el.onclick = null;
  el.style.cursor = 'default';
  // extend auto-hide
  clearTimeout(flashTimer);
  flashTimer = setTimeout(hideFlash, 14000);
}

function hideFlash() {
  flashCard.classList.add('hiding');
  setTimeout(() => {
    flashCard.classList.remove('visible','hiding');
    flashActive = false;
  }, 650);
}

// Show first flash after 25s, then every 40-60s
setTimeout(() => {
  showFlash();
  setInterval(() => {
    const delay = 40000 + Math.random() * 20000;
    setTimeout(showFlash, delay);
  }, 60000);
}, 25000);


/* ── INTRO SEQUENCE ── */
function runIntro() {
  const overlay   = document.getElementById('intro-overlay');
  const typer     = document.getElementById('intro-typewriter');
  const eyebrow   = document.getElementById('h-eyebrow');
  const sub       = document.getElementById('h-sub');
  const title     = document.getElementById('h-title');
  const qmMark    = document.getElementById('h-qm-mark');
  const hqmark    = document.getElementById('h-qmark');
  const divider   = document.getElementById('h-divider');
  const cta       = document.getElementById('h-cta');
  const scroll    = document.getElementById('h-scroll');
  const navLogo   = document.querySelector('.n-logo');
  const navLinks  = document.querySelectorAll('.n-links a');

  // Full intro text (typewriter)
  const line1 = 'في زمن كلّه ماشي';
  const line2 = 'حد لسا بيسأل..';
  const fullText = line1 + '\n' + line2;

  let charIdx = 0;
  let blinkCount = 0;
  const CHAR_DELAY = 72; // ms per character

  function typeChar() {
    if (charIdx < fullText.length) {
      const ch = fullText[charIdx];
      if (ch === '\n') {
        typer.innerHTML += '<br>';
      } else {
        typer.innerHTML += ch;
      }
      charIdx++;
      setTimeout(typeChar, ch === '\n' ? CHAR_DELAY * 4 : CHAR_DELAY);
    } else {
      // Typing done — blink the last dot
      startBlink();
    }
  }

  function startBlink() {
    const html_before = typer.innerHTML;
    // Remove last char (.) and wrap in blink span
    const last = typer.innerHTML.slice(-1);
    typer.innerHTML = typer.innerHTML.slice(0, -1) +
      '<span id="blink-dot" style="opacity:1;">' + last + '</span>';
    const dot = document.getElementById('blink-dot');
    let visible = true;
    let count = 0;
    const blink = setInterval(() => {
      visible = !visible;
      dot.style.opacity = visible ? '1' : '0';
      count++;
      if (count >= 5) {
        clearInterval(blink);
        dot.style.opacity = '1';
        // Small pause then reveal title
        setTimeout(revealHero, 400);
      }
    }, 280);
  }

  function fadeEl(el, props, duration, delay) {
    if (!el) return;
    setTimeout(() => {
      el.style.transition = 'opacity ' + duration + 'ms cubic-bezier(.16,1,.3,1), transform ' + duration + 'ms cubic-bezier(.16,1,.3,1)';
      Object.assign(el.style, props);
    }, delay);
  }

  function revealHero() {

    /* ════════════════════════════════════════════════════
       TIMELINE (ms from call)
       ─────────────────────────────────────────────────
        0        overlay يبدأ يتلاشى (1100ms)
        80       العنوان "إلى أين" يطلع (950ms → ينهي ~1030)
        680      علامة "؟" تظهر — قبل ما العنوان يخلص (750ms)
        1100     divider "بورتفوليو أدبي" يظهر (600ms → ينهي ~1700)
        1480     eyebrow "مشروع أدبي" يظهر — قبل divider يخلص (580ms)
        1850     زرار "اكتشف" يظهر — قبل eyebrow يخلص
        2800     nav يظهر في الآخر
       ════════════════════════════════════════════════════ */

    /* ── overlay ── */
    overlay.style.transition = 'opacity 1100ms cubic-bezier(.4,0,.2,1)';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 1100);

    /* ── background ؟ كبيرة — تبرز بهدوء ── */
    setTimeout(() => {
      hqmark.style.transition = 'opacity 2s ease';
      hqmark.style.opacity = '.025';
    }, 600);

    /* ── ١: العنوان "إلى أين" ── */
    title.style.transform = 'translateY(40px) scale(0.97)';
    title.style.opacity   = '0';
    fadeEl(title, { opacity:'1', transform:'translateY(0) scale(1)' }, 950, 80);

    /* ── ٢: علامة "؟" — بتنزل وبتستقر كأنها بتكمّل السؤال ── */
    setTimeout(() => {
      qmMark.style.display    = 'inline-block';
      qmMark.style.transition = 'none';
      qmMark.style.opacity    = '0';
      qmMark.style.transform  = 'translateY(-18px) rotate(-12deg) scale(0.78)';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        qmMark.style.transition = [
          'opacity 600ms ease',
          'transform 780ms cubic-bezier(.34,1.48,.64,1)',
        ].join(',');
        qmMark.style.opacity   = '1';
        qmMark.style.transform = 'translateY(0) rotate(0deg) scale(1)';
      }));
    }, 680);

    /* ── ٣: divider "بورتفوليو أدبي" ── */
    divider.style.transform = 'translateY(16px)';
    divider.style.opacity   = '0';
    fadeEl(divider, { opacity:'1', transform:'translateY(0)' }, 600, 1100);

    /* ── ٤: eyebrow "مشروع أدبي لمحمد السيد" ── */
    eyebrow.style.transform = 'translateY(14px)';
    eyebrow.style.opacity   = '0';
    fadeEl(eyebrow, { opacity:'1', transform:'translateY(0)' }, 580, 1480);

    /* ── ٥: زرار "اكتشف" + مجموعته ── */
    setTimeout(() => {
      const hDisc    = document.getElementById('h-discover');
      const discBtn  = document.getElementById('glass-disc-btn');
      const discIcon = discBtn.querySelector('.glass-disc-icon');
      const discLbl  = discBtn.querySelector('.glass-disc-label');
      const discSub  = discBtn.querySelector('.glass-disc-sub');
      const snapSub  = document.getElementById('h-snap-sub');

      hDisc.style.opacity = '1';

      discLbl.style.opacity    = '0';
      discLbl.style.width      = '0';
      discLbl.style.overflow   = 'hidden';
      discLbl.style.whiteSpace = 'nowrap';
      if (discSub)  discSub.style.opacity  = '0';
      if (snapSub)  snapSub.style.opacity  = '0';

      /* Phase 1 — نقطة ضوء */
      discBtn.style.transition = 'none';
      discBtn.style.opacity    = '1';
      discBtn.style.transform  = 'scaleX(0.13) scaleY(0.72)';
      discBtn.style.filter     = 'brightness(4.5) blur(2px)';
      discBtn.style.boxShadow  = '0 0 36px 16px rgba(192,155,90,.75), 0 0 80px 24px rgba(192,155,90,.30)';

      requestAnimationFrame(() => requestAnimationFrame(() => {

        /* Phase 2 — الزرار بيتمدد */
        discBtn.style.transition = [
          'transform 1.0s cubic-bezier(.16,1,.3,1)',
          'filter    1.0s ease',
          'box-shadow 1.0s ease',
        ].join(',');
        discBtn.style.transform = 'scaleX(1) scaleY(1)';
        discBtn.style.filter    = 'brightness(1.55) blur(0px)';
        discBtn.style.boxShadow = '0 0 36px 12px rgba(192,155,90,.22)';

        /* Phase 3 — تايبرايتر */
        setTimeout(() => {
          const labelText = 'اكتشف نصًّا';
          discLbl.style.transition = 'opacity .01s, width .38s cubic-bezier(.16,1,.3,1)';
          discLbl.style.opacity    = '1';
          discLbl.style.width      = discLbl.scrollWidth + 'px';
          setTimeout(() => { discLbl.style.width = 'auto'; discLbl.style.overflow = 'visible'; }, 400);
          discLbl.textContent = '';
          Array.from(labelText).forEach((ch, i) => {
            setTimeout(() => { discLbl.textContent += ch; }, i * 60);
          });
        }, 460);

        /* Phase 4 — glow يستقر، snap cycle يبدأ */
        setTimeout(() => {
          discBtn.style.transition = '';
          discBtn.style.filter     = 'brightness(1)';
          discBtn.style.boxShadow  = '';
          discIcon.classList.add('ember-pulsing');
          if (discSub) {
            discSub.style.transition = 'opacity .75s ease';
            discSub.style.opacity    = '0.7';
          }
          if (snapSub) {
            snapSub.style.transition = 'opacity .6s ease';
            snapSub.style.opacity    = '1';
          }
          setTimeout(startSnapCycle, 200);
        }, 1080);

      }));
    }, 1850);

    /* ── ٦: nav — في الآخر ── */
    setTimeout(() => {
      if (navLogo) {
        navLogo.style.transition = 'none';
        navLogo.style.transform  = 'translateX(16px)';
        navLogo.style.opacity    = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          navLogo.style.transition = 'opacity 700ms ease, transform 700ms cubic-bezier(.16,1,.3,1)';
          navLogo.style.opacity    = '1';
          navLogo.style.transform  = 'translateX(0)';
        }));
      }
      navLinks.forEach((a, i) => {
        a.style.transition = 'none';
        a.style.transform  = 'translateX(-14px)';
        a.style.opacity    = '0';
        setTimeout(() => {
          requestAnimationFrame(() => requestAnimationFrame(() => {
            a.style.transition = 'opacity 600ms ease, transform 600ms cubic-bezier(.16,1,.3,1), color .3s, border-color .3s, letter-spacing .3s';
            a.style.opacity    = '1';
            a.style.transform  = 'translateX(0)';
          }));
        }, i * 100);
      });
    }, 2800);
  }

  // Start typing after brief pause
  setTimeout(typeChar, 500);
}

/* ── init ── */
/* ── CONTACT METHOD SELECTOR ── */
function selectMethod(method) {
  document.querySelectorAll('.cm-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.cm-btn[data-method="' + method + '"]');
  if (btn) btn.classList.add('active');

  const wrap  = document.getElementById('cm-input-wrap');
  const input = document.getElementById('ce');
  const label = document.getElementById('cm-input-label');
  const chan  = document.getElementById('contact_channel');

  const labels = {
    whatsapp: 'رقم الواتساب',
    telegram: 'يوزر التليجرام',
    email:    'البريد الإلكتروني'
  };
  const types = { whatsapp:'tel', telegram:'text', email:'email' };

  chan.value   = method;
  label.textContent = labels[method];
  input.type   = types[method];
  input.value  = '';
  wrap.style.display = 'block';
}

/* ── THEME TOGGLE + VIEW TRANSITION RIPPLE ── */
function toggleTheme() {
  const btn     = document.getElementById('theme-toggle');
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next    = (current === 'light') ? 'dark' : 'light';

  const rect = btn ? btn.getBoundingClientRect() : { left: window.innerWidth/2, top: 60, width: 32, height: 32 };
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const maxR = Math.hypot(
    Math.max(cx, window.innerWidth  - cx),
    Math.max(cy, window.innerHeight - cy)
  );

  const EXPAND_MS = 1280;

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ilayna-theme', next);
  }

  function showHint() {
    if (next !== 'light') return;
    setTimeout(function() {
      var hint = document.getElementById('theme-hint');
      var tb   = document.getElementById('theme-toggle');
      if (!hint || !tb) return;
      var r = tb.getBoundingClientRect();
      hint.style.top   = (r.bottom + 10) + 'px';
      hint.style.left  = (r.left + r.width/2 - 20) + 'px';
      hint.style.right = 'auto';
      hint.classList.add('visible');
      clearTimeout(hint._hideTimer);
      function dismissHint() {
        hint.classList.remove('visible');
        clearTimeout(hint._hideTimer);
      }
      document.addEventListener('click', dismissHint, { once: true });
      hint._hideTimer = setTimeout(dismissHint, 6000);
    }, 1000);
  }

  /* ── View Transitions API — الحل الصح:
     بياخد snapshot للصفحة القديمة والجديدة،
     والـ clip-path بيشتغل على الـ snapshot نفسه —
     فكل عنصر بيظهر بلونه الجديد لما الدايرة تعدي عليه بالظبط ── */
  if (!document.startViewTransition) {
    /* fallback للمتصفحات اللي مش بتدعم View Transitions */
    applyTheme();
    showHint();
    return;
  }

  /* نحط الـ clip-path keyframes في CSS قبل الـ transition */
  const style = document.createElement('style');
  style.id = '__theme-ripple-style';
  style.textContent = `
    ::view-transition-old(root) {
      animation: none;
      mix-blend-mode: normal;
    }
    ::view-transition-new(root) {
      animation: theme-ripple-in ${EXPAND_MS}ms cubic-bezier(.22,1,.36,1) both;
      mix-blend-mode: normal;
    }
    @keyframes theme-ripple-in {
      from { clip-path: circle(0px at ${cx}px ${cy}px); }
      to   { clip-path: circle(${maxR}px at ${cx}px ${cy}px); }
    }
  `;
  document.head.appendChild(style);

  const transition = document.startViewTransition(() => {
    applyTheme();
  });

  transition.finished.then(() => {
    const s = document.getElementById('__theme-ripple-style');
    if (s) s.remove();
    showHint();
  });
}

// تطبيق الثيم المحفوظ عند الفتح — الافتراضي dark
(function(){
  const saved = localStorage.getItem('ilayna-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

  /* ══════════════════════════════════
   اكتشف نصًا — Discovery Modal
══════════════════════════════════ */
/* ═══════════════════════════════════════════════
   ENVELOPE DISCOVER EXPERIENCE
   ═══════════════════════════════════════════════ */



/* أيقونة لكل نوع */
function envIcon(item) {
  if (item.type === 'poem') return '✦';
  return '◦';
}

/* state */
let envSessionItems = [];
let envOpenedSet    = new Set();
let envChosenIdx    = -1;
let envAnimating    = false;
let envFirstOpen    = true;
let envEntryTimers  = [];
let envPocketItems  = [];
let envPocketOpen   = false;

function buildEnvSession() {
  const pool = [...discoverPool];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  envSessionItems = pool.slice(0, 7);
  envOpenedSet.clear();
  envChosenIdx = -1;
}

function buildEnvelopes(instant) {
  envEntryTimers.forEach(clearTimeout);
  envEntryTimers = [];

  const stage = document.getElementById('env-stage');
  stage.innerHTML = '';

  const toShow = envSessionItems
    .map(function(item, i) { return { item: item, i: i }; })
    .filter(function(o) { return !envOpenedSet.has(o.i); });

  toShow.forEach(function(o, rank) {
    const dir = ENV_DIRECTIONS[o.i];
    const el  = document.createElement('div');
    el.className   = 'env-envelope';
    el.dataset.idx = o.i;
    el.innerHTML   = '<div class="env-body-wrap"><div class="env-icon">' + envIcon(o.item) + '</div></div><div class="env-flap"><div class="env-flap-inner"></div></div>';

    el.addEventListener('click', function() {
      /* إلغاء أي timers دخول معلّقة وظهور الباقي فوراً */
      envEntryTimers.forEach(clearTimeout);
      envEntryTimers = [];
      stage.querySelectorAll('.env-envelope').forEach(function(e) {
        if (parseFloat(e.style.opacity) < 1) {
          const d = ENV_DIRECTIONS[parseInt(e.dataset.idx)];
          e.style.transition = 'none';
          e.style.transform  = d.to;
          e.style.opacity    = '1';
        }
      });
      onEnvelopeClick(o.i);
    });
    stage.appendChild(el);

    if (instant) {
      el.style.transform  = dir.to;
      el.style.opacity    = '0';
      el.style.transition = 'none';
      const t = setTimeout(function() {
        el.style.transition = 'opacity .55s ease';
        el.style.opacity    = '1';
      }, rank * 80);
      envEntryTimers.push(t);
    } else {
      el.style.transform  = dir.from;
      el.style.opacity    = '0';
      el.style.transition = 'none';
      const t = setTimeout(function() {
        el.style.transition = 'transform .85s cubic-bezier(.16,1,.3,1), opacity .6s ease';
        el.style.transform  = dir.to;
        el.style.opacity    = '1';
      }, 800 + rank * 500);
      envEntryTimers.push(t);
      /* tagline بعد آخر ظرف */
      if (rank === toShow.length - 1) {
        const tagT = setTimeout(function() {
          const tl = document.getElementById('env-tagline');
          if (tl && !tl.classList.contains('hide')) tl.classList.add('show');
        }, 800 + rank * 500 + 700);
        envEntryTimers.push(tagT);
      }
    }
  });
}

function onEnvelopeClick(idx) {
  if (envAnimating) return;
  envAnimating = true;
  envChosenIdx = idx;
  envOpenedSet.add(idx);

  const tagline   = document.getElementById('env-tagline');
  const envScreen = document.getElementById('env-screen');
  const envelopes = envScreen.querySelectorAll('.env-envelope');

  tagline.classList.add('hide');
  tagline.classList.remove('show');

  envelopes.forEach(function(el) {
    if (parseInt(el.dataset.idx) !== idx) {
      const dir = ENV_DIRECTIONS[parseInt(el.dataset.idx)];
      el.style.transition = 'opacity .35s ease, transform .35s ease';
      el.style.opacity    = '0';
      el.style.transform  = dir.to + ' scale(.9)';
    }
  });

  const chosen = envScreen.querySelector('[data-idx="' + idx + '"]');
  if (!chosen) { envAnimating = false; return; }
  chosen.classList.add('opened');

  const r      = chosen.getBoundingClientRect();
  const startX = r.left + r.width  / 2;
  const startY = r.top  + r.height / 2;

  setTimeout(function() {
    chosen.style.position   = 'fixed';
    chosen.style.left       = startX + 'px';
    chosen.style.top        = startY + 'px';
    chosen.style.marginLeft = (-r.width  / 2) + 'px';
    chosen.style.marginTop  = (-r.height / 2) + 'px';
    chosen.style.transition = 'none';
    requestAnimationFrame(function() {
      const dx = window.innerWidth  / 2 - startX;
      const dy = window.innerHeight / 2 - startY;
      chosen.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1), opacity .45s ease .45s';
      chosen.style.transform  = 'translate(' + dx + 'px,' + dy + 'px) scale(4)';
      chosen.style.opacity    = '0';
    });
  }, 300);

  setTimeout(function() {
    showEnvContent(envSessionItems[idx]);
    envAnimating = false;
  }, 950);
}

function showEnvContent(item) {
  const label      = document.getElementById('env-type-label');
  const body       = document.getElementById('env-body');
  const actions    = document.getElementById('env-actions');
  const envContent = document.getElementById('env-content');

  if (item.type === 'poem') {
    label.textContent = 'قصيدة';
    body.innerHTML = '<h2 class="env-poem-title">' + item.title + '</h2>' +
      '<div class="env-excerpt">' + item.excerpt.map(function(l){ return '<span>'+l+'</span>'; }).join('') + '</div>';
    actions.innerHTML =
      '<button class="env-btn-read" onclick="closeEnvScreen();goTo(\'' + item.page + '\')"><span>اقرأ القصيدة كاملاً</span></button>' +
      '<button class="env-btn-again" onclick="onEnvAgain()">اكتشف نصًّا آخر ↩</button>';
  } else {
    label.textContent = 'من الطريق';
    body.innerHTML = '<div class="env-flash-text">' + item.lines.map(function(l,i){ return i===0?l:'<em>'+l+'</em>'; }).join('<br>') + '</div>';
    actions.innerHTML = '<span></span><button class="env-btn-again" onclick="onEnvAgain()">اكتشف نصًّا آخر ↩</button>';
  }
  envContent.classList.add('show');
}

function collapseEnvelope(idx, cb) {
  document.getElementById('env-content').classList.remove('show');
  setTimeout(cb || function(){}, 480);
}

/* ── الجيب ── */
function renderEnvPocket(withGlow) {
  const pocket = document.getElementById('env-pocket');
  if (!pocket) return;

  if (!envPocketItems.length) {
    pocket.classList.remove('visible');
    setTimeout(function() { pocket.style.display = 'none'; }, 550);
    return;
  }

  pocket.innerHTML = '';

  const arrow = document.createElement('button');
  arrow.className   = 'env-pocket-arrow';
  arrow.textContent = '‹';
  arrow.onclick = function() {
    envPocketOpen = !envPocketOpen;
    arrow.textContent = envPocketOpen ? '›' : '‹';
    itemsEl.style.maxHeight = envPocketOpen ? (envPocketItems.length * 52 + 16) + 'px' : '0';
    itemsEl.classList.toggle('open', envPocketOpen);
  };
  pocket.appendChild(arrow);

  const itemsEl = document.createElement('div');
  itemsEl.className = 'env-pocket-items';
  pocket.appendChild(itemsEl);

  envPocketItems.forEach(function(pItem) {
    const mini = document.createElement('div');
    mini.className = 'env-pocket-item';
    mini.title     = pItem.type === 'poem' ? pItem.title : 'من الطريق';
    mini.innerHTML = '<div class="env-pocket-body"><div class="env-pocket-flap"></div><div class="env-pocket-icon">' + envIcon(pItem) + '</div></div>';
    mini.addEventListener('click', function() {
      if (envAnimating) return;
      envChosenIdx = -2;
      document.getElementById('env-stage').innerHTML = '';
      document.getElementById('env-tagline').classList.remove('show');
      showEnvContent(pItem);
    });
    itemsEl.appendChild(mini);
  });

  pocket.style.display = 'flex';
  requestAnimationFrame(function() { pocket.classList.add('visible'); });

  if (withGlow) {
    setTimeout(function() {
      /* فتح الجيب تلقائياً */
      envPocketOpen = true;
      arrow.textContent = '›';
      itemsEl.style.maxHeight = (envPocketItems.length * 52 + 16) + 'px';
      itemsEl.classList.add('open');
      /* glow على آخر ظرف */
      setTimeout(function() {
        const minis = itemsEl.querySelectorAll('.env-pocket-item');
        const last  = minis[minis.length - 1];
        if (!last) return;
        last.classList.add('glow');
        setTimeout(function() { last.classList.remove('glow'); }, 1400);
      }, 300);
    }, 450);
  }
}

function openEnvScreen() {
  if (envAnimating) return;
  const screen  = document.getElementById('env-screen');
  const instant = !envFirstOpen;

  buildEnvSession();
  buildEnvelopes(instant);
  screen.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (envFirstOpen) envFirstOpen = false;

  /* الجيب */
  const pocket = document.getElementById('env-pocket');
  if (pocket) {
    if (envPocketItems.length) {
      pocket.style.display = 'flex';
      requestAnimationFrame(function() { pocket.classList.add('visible'); });
    } else {
      pocket.style.display = 'none';
      pocket.classList.remove('visible');
    }
  }

  /* instant — tagline يظهر بسرعة */
  if (instant) {
    setTimeout(function() {
      document.getElementById('env-tagline').classList.add('show');
    }, 300);
  }
}

function closeEnvScreen() {
  if (envAnimating) return;
  const screen     = document.getElementById('env-screen');
  const tagline    = document.getElementById('env-tagline');
  const envContent = document.getElementById('env-content');
  if (envChosenIdx >= 0) {
    collapseEnvelope(envChosenIdx, function() { exitEnvelopes(screen, tagline, envContent); });
  } else {
    exitEnvelopes(screen, tagline, envContent);
  }
}

function exitEnvelopes(screen, tagline, envContent) {
  envAnimating = true;
  tagline.classList.remove('show', 'hide');
  envContent.classList.remove('show');

  const fixedEnv = screen.querySelector('.env-envelope[style*="position: fixed"], .env-envelope[style*="position:fixed"]');
  if (fixedEnv) fixedEnv.style.opacity = '0';

  const envelopes = screen.querySelectorAll('.env-envelope:not([style*="position: fixed"]):not([style*="position:fixed"])');
  envelopes.forEach(function(el, i) {
    const idx = parseInt(el.dataset.idx);
    const dir = ENV_DIRECTIONS[idx];
    setTimeout(function() {
      el.style.transition = 'transform 1s cubic-bezier(.4,0,.6,1), opacity .7s ease';
      el.style.transform  = dir.from;
      el.style.opacity    = '0';
    }, i * 150);
  });

  const delay = Math.max(envelopes.length, 1) * 150 + 1000;
  setTimeout(function() {
    screen.classList.remove('open');
    document.body.style.overflow = '';
    envAnimating = false;
    envChosenIdx = -1;
  }, delay);
}

function onEnvAgain() {
  if (envAnimating) return;
  envAnimating = true;
  const envContent = document.getElementById('env-content');
  const tagline    = document.getElementById('env-tagline');
  const stage      = document.getElementById('env-stage');

  envContent.classList.remove('show');

  /* كل الظروف تختفي */
  stage.querySelectorAll('.env-envelope').forEach(function(el) {
    el.style.transition = 'opacity .3s ease';
    el.style.opacity    = '0';
  });

  /* الظرف المختار للجيب */
  if (envChosenIdx >= 0 && envSessionItems[envChosenIdx]) {
    envPocketItems.push(envSessionItems[envChosenIdx]);
    renderEnvPocket(true);
  }

  /* ظروف جديدة بـ fade */
  setTimeout(function() {
    if (envOpenedSet.size >= 7) buildEnvSession();
    buildEnvelopes(false);
    envChosenIdx = -1;
    tagline.classList.remove('hide');
    envAnimating = false;
  }, 480);
}

/* backwards compat — لو في كود تاني بيستدعي openDiscover */
function openDiscover()  { openEnvScreen(); }
function closeDiscover() { closeEnvScreen(); }

document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeEnvScreen(); });
  
/* ═══════════════════════════════════════════════
   TELEGRAM-STYLE CANVAS PARTICLE SYSTEM
   Physics loop: velocity + gravity + friction + glow
═══════════════════════════════════════════════ */
(function() {

  /* ── canvas setup ── */
  var cvs = document.createElement('canvas');
  cvs.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1000;';
  document.body.appendChild(cvs);
  var ctx = cvs.getContext('2d');
  var W, H;
  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── particle pool ── */
  var particles = [];

  /* ── RAF loop ── */
  var running = false;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    var alive = false;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (p.life <= 0) continue;
      alive = true;

      /* physics */
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x  += p.vx;
      p.y  += p.vy;
      p.life -= p.decay;
      p.size *= 0.992;

      var a = Math.max(0, p.life);

      /* glow pass */
      ctx.save();
      ctx.globalAlpha = a * 0.35;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = p.glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = p.glow;
      ctx.fill();
      ctx.restore();

      /* core dot */
      ctx.save();
      ctx.globalAlpha = a;
      ctx.beginPath();
      if (p.round) {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        ctx.restore();
      }
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    if (alive) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      ctx.clearRect(0, 0, W, H);
    }
  }

  /* ── burst — Telegram star-reaction style ── */
  window.tgBurst = function(x, y, count, big) {
    var palette = burstPalette;
    count = count || 38;
    for (var i = 0; i < count; i++) {
      var col = palette[Math.floor(Math.random() * palette.length)];
      var angle  = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;
      var speed  = big
        ? (3.5 + Math.random() * 5.5)
        : (1.8 + Math.random() * 3.2);
      var sz     = big
        ? (1.4 + Math.random() * 2.8)
        : (0.9 + Math.random() * 1.8);
      particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (big ? 0.6 : 0.2),
        size:    sz,
        color:   col.c,
        glow:    col.g,
        life:    0.72 + Math.random() * 0.28,
        decay:   big ? (0.016 + Math.random() * 0.012) : (0.022 + Math.random() * 0.016),
        friction: 0.955,
        gravity:  big ? 0.055 : 0.028,
        round:   Math.random() > 0.35,
        angle:   Math.random() * Math.PI,
      });
    }
    if (!running) { running = true; requestAnimationFrame(loop); }
  };

})();


/* ─────────────────────────────────────────
   CHARACTER PHYSICS DISSOLVE  (Telegram-style)
   Each character flies off independently with
   velocity · gravity · rotation · fade
   + canvas sparkles per char
───────────────────────────────────────── */
function tgDissolveText(el, onDone) {
  var text = el.textContent.trim();
  if (!text) { if (onDone) onDone(); return; }

  /* measure each character */
  el.innerHTML = '';
  var chars = Array.from(text);
  var spans = chars.map(function(ch) {
    var s = document.createElement('span');
    s.textContent = ch;
    s.style.cssText = 'display:inline-block;white-space:pre;';
    el.appendChild(s);
    return s;
  });
  var rects = spans.map(function(s) { return s.getBoundingClientRect(); });

  /* clones — fixed, zIndex below modals */
  var clones = spans.map(function(s, i) {
    var r = rects[i];
    var clone = document.createElement('span');
    clone.textContent = s.textContent;
    clone.style.cssText = [
      'position:fixed',
      'left:'   + r.left + 'px',
      'top:'    + r.top  + 'px',
      'font-family:Amiri,serif',
      'font-style:italic',
      'font-size:.78rem',
      'letter-spacing:.18em',
      'color:var(--text3)',
      'pointer-events:none',
      'z-index:1001',
      'display:inline-block',
      'white-space:pre',
      'will-change:transform,opacity,filter',
      'transition:none',
    ].join(';');
    document.body.appendChild(clone);
    return clone;
  });

  el.style.opacity = '0';
  el.innerHTML = '';

  /* stagger RTL — index 0 (rightmost) first */
  var STAGGER  = 42;   /* ms between chars */
  var DURATION = 680;  /* ms per char animation */
  var maxDelay = (chars.length - 1) * STAGGER;

  clones.forEach(function(clone, i) {
    var delay = i * STAGGER;

    setTimeout(function() {
      /* small random drift: gentle, not explosive */
      var driftX = (Math.random() - 0.5) * 6;
      var riseY  = -(14 + Math.random() * 10);

      clone.style.transition = [
        'transform '  + DURATION + 'ms cubic-bezier(.25,.46,.45,.94)',
        'opacity '    + DURATION + 'ms cubic-bezier(.4,0,1,1)',
        'filter '     + DURATION + 'ms ease',
      ].join(',');

      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          clone.style.transform = 'translate(' + driftX + 'px,' + riseY + 'px) scale(.88)';
          clone.style.opacity   = '0';
          clone.style.filter    = 'blur(2.5px)';
        });
      });

      setTimeout(function() { clone.remove(); }, DURATION + 60);
    }, delay);
  });

  var doneDt = maxDelay + DURATION * 0.45;
  setTimeout(function() { if (onDone) onDone(); }, doneDt);
}


/* ─────────────────────────────────────────
   SUBTITLE CYCLING
───────────────────────────────────────── */
var _snapIdx    = 0;

function startSnapCycle() {
  _snapIdx = 0;
  _runSnapStep();
}

function _runSnapStep() {
  var subEl = document.getElementById('snap-sub-text');
  if (!subEl) return;

  var text = _snapTexts[_snapIdx % _snapTexts.length];
  _snapIdx++;

  /* slide-in from below */
  subEl.textContent = text;
  subEl.style.transition = 'none';
  subEl.style.opacity    = '0';
  subEl.style.transform  = 'translateY(9px)';

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      subEl.style.transition = 'opacity .4s cubic-bezier(.16,1,.3,1), transform .48s cubic-bezier(.16,1,.3,1)';
      subEl.style.opacity    = '1';
      subEl.style.transform  = 'translateY(0)';

      /* hold, then character-dissolve exit */
      setTimeout(function() {
        tgDissolveText(subEl, function() {
          /* reset for next word */
          subEl.style.opacity   = '0';
          subEl.style.transform = 'translateY(9px)';
          setTimeout(_runSnapStep, 120);
        });
      }, 3800);
    });
  });
}

/* button entrance — single big burst centered on button */
window._btnBurst = function() {
  var btn = document.getElementById('glass-disc-btn');
  if (!btn) return;
  var r = btn.getBoundingClientRect();
  tgBurst(r.left + r.width / 2, r.top + r.height / 2, 52, true);
};

initPaintings();
initFlash();
setNav('home');
initReveals();
runIntro();

/* ── نسب المؤلف عند النسخ ── */
document.addEventListener('copy', function(e) {
  var sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  var text = sel.toString();
  if (!text.trim()) return;
  e.clipboardData.setData('text/plain', text + '\n— محمد السيد');
  e.preventDefault();
});

/* ── نسخ نص الومضة ── */
function copyFlashText() {
  var el  = document.getElementById('flash-text');
  var btn = document.querySelector('.flash-copy');
  if (!el || !btn) return;

  var text = el.innerText.trim() + '\n— محمد السيد';

  var svgCopy = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var svgDone = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';

  function onCopied() {
    btn.classList.add('copied');
    btn.innerHTML = svgDone;
    setTimeout(function() {
      btn.classList.remove('copied');
      btn.innerHTML = svgCopy;
    }, 2200);
  }

  function fallbackCopy() {
    try {
      var t = document.createElement('textarea');
      t.value = text;
      t.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(t);
      t.focus();
      t.select();
      document.execCommand('copy');
      t.remove();
      onCopied();
    } catch(e) {}
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onCopied, fallbackCopy);
  } else {
    fallbackCopy();
  }
}

/* ── cards entrance ready ── */

/* ════════════════════════════════════════════════════════
   QMARK LIVING LAYER — السؤال الكبير ككائن حي هادئ
   ──────────────────────────────────────────────────────
   حركة شبه غير مرئية: تتبع خفيف جداً للماوس (parallax)،
   واستجابة بطيئة جداً لتوقف الزائر دون حركة. لا تعمل على
   الموبايل، وتُعطَّل تماماً إذا فضّل الزائر تقليل الحركة.
   ════════════════════════════════════════════════════════ */
(function () {
  try {
    const qmark = document.querySelector('.h-qmark');
    if (!qmark) return;
    if (window.matchMedia('(max-width: 1099px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let qx = 0, qy = 0;       // الموضع الحالي (مُلَطَّف)
    let tx = 0, ty = 0;       // الموضع المستهدف (من الماوس)
    let idleTimer = null;
    let idleDepth = 0;        // يزيد كل ما الزائر فضل واقف بدون حركة

    window.addEventListener('mousemove', (e) => {
      // تتبّع خفيف جداً — أقصى إزاحة لا تتجاوز ٨px تقريباً
      const nx = (e.clientX / window.innerWidth  - 0.5);
      const ny = (e.clientY / window.innerHeight - 0.5);
      tx = nx * 10;
      ty = ny * 8;

      idleDepth = 0;
      clearTimeout(idleTimer);
      // لو الزائر وقف بدون حركة لفترة، السؤال "يلاحظ" ذلك
      // بانكماش/تمدد شبه غير محسوس — جزء يختفي ثم يعود بهدوء
      idleTimer = setTimeout(() => { idleDepth = 1; }, 3200);
    }, { passive: true });

    function loop() {
      qx += (tx - qx) * 0.02;
      qy += (ty - qy) * 0.02;
      const t = Date.now() / 1000;
      // تنفّس بطيء جداً (دورة ~26 ثانية) + استجابة خفيفة جداً للتوقف
      const breathe = Math.sin(t * (2 * Math.PI / 26)) * 0.012;
      const idleNudge = idleDepth ? Math.sin(t / 7) * 0.006 : 0;
      const scale = 1 + breathe + idleNudge;
      const opacity = 0.024 + breathe * 0.6;
      qmark.style.transform = `translate(${qx.toFixed(2)}px, ${qy.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      qmark.style.opacity = opacity.toFixed(4);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  } catch (e) { /* فشل صامت — السؤال يبقى ثابتاً بحركة التنفس الأساسية فقط */ }
})();
