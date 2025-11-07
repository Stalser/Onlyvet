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
