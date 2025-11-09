document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const mobile = document.getElementById('mobile-menu');
  if(hamburger && mobile){ hamburger.addEventListener('click',()=> mobile.classList.toggle('open')); }

  // FAQ toggle
  document.querySelectorAll('#faq .faq-q').forEach(q => q.addEventListener('click', ()=> q.parentElement.classList.toggle('open')));

  // Modal handlers
  const modal = document.getElementById('modal-book');
  const openers = document.querySelectorAll('.open-book, #btn-book, #btn-book-hero');
  const closer = document.getElementById('close-book');
  openers.forEach(b => b.addEventListener('click', ()=> { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }));
  if(closer){ closer.addEventListener('click', ()=> { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }); }
  modal.addEventListener('click', (e)=> { if(e.target === modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); } });

  // Consent logic
  const pdn = document.getElementById('pdn');
  const submitBtn = document.querySelector('#contact-form button[type="submit"]');
  submitBtn.disabled = true;
  pdn.addEventListener('change', () => { submitBtn.disabled = !pdn.checked; });

  // Demo submit
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  form.addEventListener('submit', (e)=> {
    e.preventDefault();
    if(!pdn.checked){
      status.textContent = 'Поставьте галочку согласия на обработку ПДн.';
      status.style.color = 'var(--danger)';
      return;
    }
    status.textContent = 'Заявка отправлена (демо). Подключим CRM — и заявки пойдут в Vetmanager.';
    status.style.color = 'var(--accent)';
    form.reset();
    submitBtn.disabled = true;
  });

  // Cookie banner
  const cookie = document.getElementById('cookie-banner');
  const cookieBtn = document.getElementById('cookie-accept');
  if(localStorage.getItem('onlyvet_cookie_ok') === '1'){ cookie.classList.add('hide'); }
  cookieBtn.addEventListener('click', ()=>{ localStorage.setItem('onlyvet_cookie_ok','1'); cookie.classList.add('hide'); });

  // === Services carousel enablement ===
  (function(){
    const grid = document.querySelector('#services .grid-3');
    if(!grid) return;
    const items = grid.querySelectorAll('.service');
    if (items.length > 3) {
      grid.classList.add('is-carousel');
      // Build nav buttons
      const nav = document.createElement('div');
      nav.className = 'services-nav';
      nav.innerHTML = '<button class="sc-btn prev" aria-label="Назад">‹</button><button class="sc-btn next" aria-label="Вперёд">›</button>';
      grid.insertAdjacentElement('afterend', nav);
      const prev = nav.querySelector('.prev');
      const next = nav.querySelector('.next');
      // Define scroll helpers
      function scrollByCard(dir){
        const first = grid.querySelector('.service');
        if(!first) return;
        const style = getComputedStyle(grid);
        const gap = parseFloat(style.columnGap || style.gap || 16);
        const w = first.getBoundingClientRect().width + gap;
        grid.scrollBy({left: dir * w, behavior: 'smooth'});
      }
      nav.querySelector('.prev').addEventListener('click', ()=>scrollByCard(-1));
      nav.querySelector('.next').addEventListener('click', ()=>scrollByCard(1));
    }
  })();

// === REVIEWS CLEAN v2 — arrows only, no dots, autoplay forward, stop at last (no wrap) ===
(function(){
  const section = document.querySelector('#reviews');
  if (!section || section.dataset.rvCleanV2 === '1') return;
  let grid = section.querySelector('.grid-3');
  if (!grid) return;

  // Slides
  let slides = Array.from(grid.children).filter(el => el.classList && el.classList.contains('review'));
  if (slides.length < 2) return;
  section.dataset.rvCleanV2 = '1';

  // Clone grid to drop any previous listeners from earlier code
  const clone = grid.cloneNode(true);
  const prevLeft = grid.scrollLeft;
  grid.parentNode.replaceChild(clone, grid);
  grid = clone;
  grid.scrollLeft = prevLeft;
  slides = Array.from(grid.children).filter(el => el.classList && el.classList.contains('review'));

  // Step = viewport width
  function step(){ return grid.clientWidth; }
  const clamp = (n,a,b)=> Math.max(a, Math.min(b,n));
  function index(){ const s=step(); return clamp(Math.round(grid.scrollLeft/s), 0, slides.length-1); }
  function setIndex(i, smooth=true){
    const s=step(); const k=clamp(i, 0, slides.length-1);
    grid.scrollTo({ left: k*s, behavior: smooth ? 'smooth':'auto' });
    sync();
  }
  function atStart(){ return index() <= 0; }
  function atEnd(){ return index() >= slides.length-1; }

  // Arrows
  const prev = section.querySelector('.reviews-btn.prev');
  const next = section.querySelector('.reviews-btn.next');
  function sync(){ if(prev) prev.disabled = atStart(); if(next) next.disabled = atEnd(); }

  if (prev) prev.addEventListener('click', (e)=>{ e.preventDefault(); e.stopImmediatePropagation(); if(!atStart()) setIndex(index()-1); });
  if (next) next.addEventListener('click', (e)=>{ e.preventDefault(); e.stopImmediatePropagation(); if(!atEnd()) setIndex(index()+1); });

  // Scroll sync
  grid.addEventListener('scroll', ()=>{
    if (grid.__rv_tick) return;
    grid.__rv_tick = true;
    requestAnimationFrame(()=>{ sync(); grid.__rv_tick=false; });
  }, {passive:true});

  // Autoplay (forward only, stop at last; pauses on hover/focus/hidden)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 5200;
  let timer = null;
  function tick(){ if (atEnd()){ stop(); return; } setIndex(index()+1, !reduce); }
  function start(){ if(timer || section.matches(':hover') || section.matches(':focus-within')) return; timer = setInterval(tick, INTERVAL); }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }
  section.addEventListener('mouseenter', stop);
  section.addEventListener('mouseleave', start);
  section.addEventListener('focusin', stop);
  section.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stop(); else start(); });

  // Init
  setIndex(index(), false);
  start();
})();




// === SERVICES: external square buttons + autoplay forward (no wrap) ===
(function(){
  const section = document.querySelector('#services');
  if (!section || section.dataset.svSquare === '1') return;
  const grid = section.querySelector('.grid-3');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll('.service'));
  if (items.length < 2) return;
  const prevBtn = document.getElementById('services-prev');
  const nextBtn = document.getElementById('services-next');
  if (!prevBtn || !nextBtn) return;
  section.dataset.svSquare = '1';

  function cardStep(){
    const first = items[0];
    const rect = first.getBoundingClientRect();
    const cs = getComputedStyle(grid);
    const gap = parseFloat(cs.columnGap || cs.gap || 16);
    return rect.width + (isNaN(gap) ? 16 : gap);
  }
  let STEP = cardStep();
  const ro = new ResizeObserver(()=> { STEP = cardStep(); });
  ro.observe(grid);

  function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
  function maxLeft(){ return Math.max(0, grid.scrollWidth - grid.clientWidth); }
  function idx(){ return clamp(Math.round(grid.scrollLeft / STEP), 0, items.length-1); }
  function setIndex(i, smooth=true){
    const k = clamp(i, 0, items.length-1);
    grid.scrollTo({ left: k*STEP, behavior: smooth ? 'smooth' : 'auto' });
    sync();
  }
  function atStart(){ return grid.scrollLeft <= 2; }
  function atEnd(){ return grid.scrollLeft >= maxLeft() - 2; }

  function sync(){ prevBtn.disabled = atStart(); nextBtn.disabled = atEnd(); }

  prevBtn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopImmediatePropagation(); if(!atStart()) setIndex(idx()-1); });
  nextBtn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopImmediatePropagation(); if(!atEnd())   setIndex(idx()+1); });

  grid.addEventListener('scroll', ()=>{
    if (grid.__sv_sq_tick) return;
    grid.__sv_sq_tick = true;
    requestAnimationFrame(()=>{ sync(); grid.__sv_sq_tick = false; });
  }, {passive:true});

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 5200;
  let timer=null;
  function tick(){ if (atEnd()){ stop(); return; } setIndex(idx()+1, !reduce); }
  function start(){ if (timer || section.matches(':hover') || section.matches(':focus-within')) return; timer = setInterval(tick, INTERVAL); }
  function stop(){ if (timer){ clearInterval(timer); timer=null; } }
  section.addEventListener('mouseenter', stop);
  section.addEventListener('mouseleave', start);
  section.addEventListener('focusin', stop);
  section.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stop(); else start(); });

  setIndex(idx(), false);
  start();
})();


// === TEXTAREA AUTOSIZE (grow/shrink to content, restore to base) ===
(function(){
  const ta = document.querySelector('#contact-form textarea');
  if(!ta) return;

  const style = window.getComputedStyle(ta);
  const baseMin = parseFloat(style.minHeight || '120'); // baseline from CSS
  function autosize(){
    ta.style.height = 'auto';                // сброс до авто
    const next = Math.min(ta.scrollHeight, window.innerHeight * 0.5); // не выше 50vh
    ta.style.height = Math.max(next, baseMin) + 'px';
  }

  // Инициализация и события
  autosize();
  ['input','change'].forEach(ev=> ta.addEventListener(ev, autosize));
  // Пересчитать при изменении шрифтов/размеров
  window.addEventListener('resize', autosize);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(autosize); }
})();


// === CONTACT FORM: require valid email + PDN to enable submit ===
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;
  const email = form.querySelector('#email');
  const pdn = document.getElementById('pdn');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!email || !pdn || !submitBtn) return;

  function isEmailValid(v){
    if (!v) return false;
    // use browser validity first
    if (email.validity) return email.validity.valid;
    // fallback simple regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function updateState(){
    const ok = pdn.checked && isEmailValid(email.value.trim());
    submitBtn.disabled = !ok;
  }

  ['input','change','blur'].forEach(ev=> email.addEventListener(ev, updateState));
  pdn.addEventListener('change', updateState);
  // init
  updateState();
})();








// === REVIEWS PATCH v7: compact default, grow on expand, collapse back to clamp ===
(function(){
  const section = document.querySelector('#reviews');
  if(!section || section.dataset.rvPatchV7==='1') return;
  section.dataset.rvPatchV7='1';
  const grid = section.querySelector('.grid-3'); if(!grid) return;
  const cards = Array.from(grid.querySelectorAll('.review')); if(!cards.length) return;

  const LINES = 8;
  const THRESH = 6;

  function clampHeightPx(p){
    const lh = parseFloat(getComputedStyle(p).lineHeight || '18');
    return Math.round(lh * LINES + 2);
  }
  function naturalHeight(content){
    const prev = content.style.maxHeight;
    content.style.maxHeight = 'none';
    const h = content.scrollHeight;
    content.style.maxHeight = prev;
    return h;
  }

  function setup(card){
    const content = card.querySelector('.review-content');
    const p = content ? content.querySelector('p') : null;
    if(!content || !p) return;

    // Reset state
    content.classList.remove('expanded');
    card.dataset.expanded = '0';
    content.style.maxHeight = 'none';

    const clampPx = clampHeightPx(p);
    // Apply clamp for measuring overflow
    content.style.maxHeight = clampPx + 'px';

    // Need toggle only if overflow inside clamped content
    const need = p.scrollHeight > p.clientHeight + THRESH;

    let btn = content.querySelector('.review-toggle');
    if(!need){
      if(btn) btn.remove();
      // short review: allow natural height (no clamp)
      content.style.maxHeight = 'none';
      return;
    }

    // Need toggle
    if(!btn){
      btn = document.createElement('button');
      btn.className = 'review-toggle'; btn.type='button'; btn.textContent='Читать отзыв';
      content.appendChild(btn);
    } else {
      const clone = btn.cloneNode(true); btn.replaceWith(clone); btn = clone;
    }

    function apply(){
      const exp = card.dataset.expanded === '1';
      if(exp){
        content.classList.add('expanded');
        content.style.maxHeight = naturalHeight(content) + 'px';
        btn.textContent = 'Свернуть';
      }else{
        content.classList.remove('expanded');
        content.style.maxHeight = clampPx + 'px';
        btn.textContent = 'Читать отзыв';
      }
    }
    btn.addEventListener('click', ()=>{
      card.dataset.expanded = (card.dataset.expanded==='1') ? '0' : '1';
      apply();
    });

    // Re-evaluate on resize / fonts ready
    let t;
    function recompute(){
      const newClamp = clampHeightPx(p);
      const exp = card.dataset.expanded === '1';
      content.style.maxHeight = (exp ? naturalHeight(content) : newClamp) + 'px';
      // If viewport change made text short, remove toggle and clear clamp
      const stillOverflow = p.scrollHeight > p.clientHeight + THRESH;
      if(!stillOverflow){
        if(btn) btn.remove();
        content.style.maxHeight = 'none';
        card.dataset.expanded = '0';
      }
    }
    window.addEventListener('resize', ()=>{ clearTimeout(t); t=setTimeout(recompute, 120); });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(recompute); }

    apply();
  }

  cards.forEach(setup);
})();


// === REVIEWS PATCH v8: collapse non-current card on slide change ===
(function(){
  const section = document.querySelector('#reviews');
  if(!section || section.dataset.rvPatchV8==='1') return;
  section.dataset.rvPatchV8='1';
  const grid = section.querySelector('.grid-3'); if(!grid) return;
  const cards = Array.from(grid.querySelectorAll('.review')); if(!cards.length) return;

  function step(){
    const f = cards[0]; const r = f.getBoundingClientRect();
    const cs = getComputedStyle(grid);
    const gap = parseFloat(cs.columnGap || cs.gap || 16);
    return r.width + (isNaN(gap)?16:gap);
  }
  function currentIndex(){
    return Math.max(0, Math.min(cards.length-1, Math.round(grid.scrollLeft / step())));
  }

  grid.addEventListener('scroll', ()=>{
    if (grid.__rv_collapse_tick) return;
    grid.__rv_collapse_tick = true;
    requestAnimationFrame(()=>{
      const idx = currentIndex();
      // свернуть все карты, кроме текущей, если они развернуты
      cards.forEach((card, i)=>{
        if (i !== idx && card.dataset && card.dataset.expanded === '1'){
          card.dataset.expanded = '0';
          // найти контент и применить высоту clamp (в v7 логика в apply отсутствует вне области,
          // поэтому рассчитаем заново на месте)
          const content = card.querySelector('.review-content');
          const p = content ? content.querySelector('p') : null;
          if(content && p){
            const lh = parseFloat(getComputedStyle(p).lineHeight || '18');
            const clampPx = Math.round(lh * 8 + 2);
            content.classList.remove('expanded');
            content.style.maxHeight = clampPx + 'px';
            const btn = content.querySelector('.review-toggle');
            if(btn) btn.textContent = 'Читать отзыв';
          }
        }
      });
      grid.__rv_collapse_tick = false;
    });
  }, {passive:true});
})();




// === DOCTORS CAROUSEL — like services (multi-cards), arrows + autoplay forward, stop at last ===
(function(){
  const section = document.querySelector('#doctors');
  if (!section || section.dataset.docCarousel2==='1') return;
  let grid = section.querySelector('.grid-3.is-carousel');
  if (!grid) return;

  let slides = Array.from(grid.children).filter(el => el.classList && el.classList.contains('doctor'));
  if (slides.length < 2) return;
  section.dataset.docCarousel2 = '1';

  // Clone grid to drop previous listeners if any (safe)
  const clone = grid.cloneNode(true);
  const prevLeft = grid.scrollLeft;
  grid.parentNode.replaceChild(clone, grid);
  grid = clone; grid.scrollLeft = prevLeft;
  slides = Array.from(grid.children).filter(el => el.classList && el.classList.contains('doctor'));

  const clamp = (n,a,b)=> Math.max(a, Math.min(b,n));
  function cardStep(){
    const first = grid.querySelector('.doctor');
    if(!first) return 300;
    const rect = first.getBoundingClientRect();
    const cs = getComputedStyle(grid);
    const gap = parseFloat(cs.columnGap || cs.gap || 16);
    return rect.width + (isNaN(gap) ? 16 : gap);
  }
  let STEP = cardStep();
  const ro = new ResizeObserver(()=> { STEP = cardStep(); });
  ro.observe(grid);

  const index = ()=> clamp(Math.round(grid.scrollLeft / STEP), 0, slides.length-1);
  const setIndex = (i, smooth=true)=>{
    const k = clamp(i, 0, slides.length-1);
    grid.scrollTo({ left: k*STEP, behavior: smooth ? 'smooth' : 'auto' });
    sync();
  };
  const atStart = ()=> grid.scrollLeft <= 2;
  const atEnd   = ()=> grid.scrollLeft >= (grid.scrollWidth - grid.clientWidth - 2);

  const prev = section.querySelector('.doctors-nav .prev');
  const next = section.querySelector('.doctors-nav .next');
  const sync = ()=>{ if(prev) prev.disabled = atStart(); if(next) next.disabled = atEnd(); };

  if (prev) prev.addEventListener('click', e=>{ e.preventDefault(); e.stopImmediatePropagation(); if(!atStart()) setIndex(index()-1); });
  if (next) next.addEventListener('click', e=>{ e.preventDefault(); e.stopImmediatePropagation(); if(!atEnd())   setIndex(index()+1); });

  grid.addEventListener('scroll', ()=>{
    if (grid.__doc_tick) return;
    grid.__doc_tick = true;
    requestAnimationFrame(()=>{ sync(); grid.__doc_tick=false; });
  }, {passive:true});

  // Autoplay forward, stop at last (pause on hover/focus/hidden)
  const reduce   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 5200;
  let timer = null;
  const tick  = ()=> { if (atEnd()){ stop(); return; } setIndex(index()+1, !reduce); };
  const start = ()=> { if(timer || section.matches(':hover') || section.matches(':focus-within')) return; timer = setInterval(tick, INTERVAL); };
  const stop  = ()=> { if (timer){ clearInterval(timer); timer=null; } };
  section.addEventListener('mouseenter', stop);
  section.addEventListener('mouseleave', start);
  section.addEventListener('focusin', stop);
  section.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stop(); else start(); });

  // Init
  sync();
  setIndex(index(), false);
  start();
})();


// === HOWTO COLLAPSIBLE: smooth expand/collapse ===
(function(){
  const section = document.getElementById('howto');
  if (!section || section.dataset.howtoCollapse === '1') return;
  section.dataset.howtoCollapse = '1';

  const toggle = section.querySelector('#howto-toggle');
  const box = section.querySelector('#howto-collapsible');
  if (!toggle || !box) return;

  function setMax(to){
    box.style.maxHeight = to + 'px';
  }
  function natural(){
    const prev = box.style.maxHeight;
    box.style.maxHeight = 'none';
    const h = box.scrollHeight;
    box.style.maxHeight = prev;
    return h;
  }

  // init collapsed
  setMax(0);
  toggle.setAttribute('aria-expanded','false');
  toggle.textContent = 'Развернуть раздел';
  setMax(natural());
  toggle.setAttribute('aria-expanded','true');

  let t;
  function onResize(){
    clearTimeout(t);
    t = setTimeout(()=>{
      if (toggle.getAttribute('aria-expanded') === 'true'){
        setMax(natural());
      }
    }, 120);
  }
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready){ document.fonts.ready.then(onResize); }

  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded){
      // collapse
      setMax(natural()); // ensure correct current height for animation start
      requestAnimationFrame(()=>{ setMax(0); });
      toggle.setAttribute('aria-expanded','false');
      toggle.textContent = 'Развернуть раздел';
    } else {
      // expand
      const h = natural();
      setMax(0); // start from 0 to animate
      requestAnimationFrame(()=>{ setMax(h); });
      toggle.setAttribute('aria-expanded','true');
      toggle.textContent = 'Свернуть раздел';
    }
  });
})();


// === HOWTO: force collapsed by default & correct button label ===
(function(){
  const t = document.querySelector('#howto #howto-toggle');
  const b = document.querySelector('#howto #howto-collapsible');
  if(!t || !b) return;
  function collapse(){
    b.style.maxHeight = '0px';
    t.setAttribute('aria-expanded','false');
    t.textContent = 'Развернуть раздел';
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', collapse);
  } else {
    collapse();
  }
})();

// === CONTACT SPOILER (scoped, smooth) ===
(function(){
  const root = document.querySelector('#contact #feedback') || document.querySelector('#contact');
  if(!root || root.dataset.contactSpoiler==='1') return;
  root.dataset.contactSpoiler = '1';
  const btn = root.querySelector('#contact-toggle');
  const box = root.querySelector('#contact-collapse');
  if(!btn || !box) return;

  function natural(h){
    const prev = h.style.maxHeight;
    h.style.maxHeight = 'none';
    const res = h.scrollHeight;
    h.style.maxHeight = prev || '0px';
    return res;
  }
  function expand(){
    box.classList.add('opening');
    box.style.maxHeight = natural(box) + 'px';
    btn.textContent = 'Свернуть';
    btn.setAttribute('aria-expanded','true');
    const onEnd = ()=>{
      box.classList.remove('opening');
      box.classList.add('open');
      box.removeEventListener('transitionend', onEnd);
    };
    box.addEventListener('transitionend', onEnd);
  }
  function collapse(){
    box.classList.remove('open');
    box.style.maxHeight = '0px';
    btn.textContent = 'Развернуть раздел';
    btn.setAttribute('aria-expanded','false');
  }

  // start collapsed
  collapse();

  btn.addEventListener('click', ()=>{
    (btn.getAttribute('aria-expanded')==='true') ? collapse() : expand();
  });

  // keep height on resize if opened
  let t;
  window.addEventListener('resize', ()=>{
    if(btn.getAttribute('aria-expanded')==='true'){
      clearTimeout(t);
      t = setTimeout(()=>{ box.style.maxHeight = natural(box)+'px'; }, 120);
    }
  });
})();