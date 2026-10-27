// Shared motion + Rule of Thumb index helpers for the trailer variants.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipIntro = reduced || /[?&]nointro/.test(location.search);
  document.documentElement.classList.toggle('reduced', reduced);

  // Opening title card. Its length rides on a CSS animation so it stays in step with the
  // other intro keyframes; a click, Escape, Enter or Space skips it.
  const css = document.createElement('style');
  css.textContent = '@keyframes trailer-hold{to{opacity:1}} #intro.play{animation:trailer-hold var(--hold) linear forwards}';
  document.head.appendChild(css);
  function intro(ms) {
    const el = document.getElementById('intro');
    if (!el) return;
    const t0 = performance.now();
    const skip = () => { if (performance.now() - t0 > 1200) done(); };
    const done = () => { if (el.classList.contains('out')) return; el.classList.add('out'); document.documentElement.classList.add('started'); setTimeout(() => el.remove(), 700); };
    if (skipIntro) { el.remove(); document.documentElement.classList.add('started'); return; }
    el.style.setProperty('--hold', ms + 'ms');
    el.addEventListener('animationend', (e) => { if (e.target === el) done(); });
    el.classList.add('play');
    addEventListener('keydown', (e) => { if (['Escape', 'Enter', ' '].includes(e.key)) skip(); });
    el.addEventListener('click', skip);
  }

  // Cut-ins: [data-cut] gets .in once it enters the viewport.
  function cuts() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('[data-cut]').forEach((el) => io.observe(el));
    // Loops (marquees, sweeps) pause off-screen.
    const lo = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('paused', !e.isIntersecting)));
    document.querySelectorAll('[data-loop]').forEach((el) => lo.observe(el));
  }

  // Text decode: characters scramble, then settle left to right.
  const GLYPHS = 'アイウエオカキクケコサシスセソタチツテト01#%/<>';
  function scramble(el, text, ms = 420) {
    if (reduced) { el.textContent = text; return; }
    const start = performance.now();
    cancelAnimationFrame(el._raf);
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms), n = Math.floor(p * text.length);
      el.textContent = text.slice(0, n) + [...text.slice(n)].map((c) => (c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (p < 1) el._raf = requestAnimationFrame(tick); else el.textContent = text;
    };
    el._raf = requestAnimationFrame(tick);
  }

  // Typewriter for dialog boxes.
  function type(el, text, cps = 70) {
    clearInterval(el._ti);
    if (reduced) { el.textContent = text; return; }
    let i = 0; el.textContent = '';
    el._ti = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(el._ti); }, 1000 / cps);
  }

  // Count up a number when it is shown.
  function countUp(el, to, ms = 900, pad = 0) {
    const fmt = (v) => String(v).padStart(pad, '0');
    if (reduced) { el.textContent = fmt(to); return; }
    const s = performance.now();
    const f = (t) => { const p = Math.min(1, (t - s) / ms); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 4)))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  // Searchable, filterable index that holds up at 100+ rules.
  // opts: { root, list, search, chips, more, count, empty, pageSize, render(rule, i), chip(cat, n, active), onRender(items) }
  function index(opts) {
    const all = window.RULES_SORTED;
    const st = { q: '', cat: 'All', open: false };
    const counts = { All: all.length };
    window.RULE_CATS.forEach((c) => (counts[c] = all.filter((r) => r.cat === c).length));
    if (opts.chips) {
      opts.chips.innerHTML = ['All', ...window.RULE_CATS].map((c) => opts.chip(c, counts[c], c === 'All')).join('');
      opts.chips.addEventListener('click', (e) => {
        const b = e.target.closest('[data-cat]'); if (!b) return;
        st.cat = b.dataset.cat; st.open = false;
        opts.chips.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      });
    }
    if (opts.search) {
      opts.search.addEventListener('input', () => { st.q = opts.search.value.trim().toLowerCase(); st.open = false; draw(); });
      addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement !== opts.search) { e.preventDefault(); opts.search.focus(); } });
    }
    if (opts.more) opts.more.addEventListener('click', () => { st.open = !st.open; draw(); });
    function draw() {
      const items = all.filter((r) => (st.cat === 'All' || r.cat === st.cat) && (!st.q || (r.title + ' ' + r.sum + ' ' + r.cat).toLowerCase().includes(st.q)));
      const shown = st.open || !opts.pageSize ? items : items.slice(0, opts.pageSize);
      opts.list.innerHTML = shown.map((r, i) => opts.render(r, i)).join('');
      opts.list.classList.remove('dealt'); void opts.list.offsetWidth; opts.list.classList.add('dealt');
      if (opts.count) opts.count.textContent = items.length;
      if (opts.empty) { opts.empty.hidden = items.length > 0; opts.empty.querySelector('q') && (opts.empty.querySelector('q').textContent = st.q); }
      if (opts.more) { opts.more.hidden = !opts.pageSize || items.length <= opts.pageSize; opts.more.textContent = st.open ? 'Show fewer' : `Show all ${items.length}`; }
      opts.onRender && opts.onRender(shown, items);
    }
    draw();
    return { draw, st };
  }

  function clock(el) { if (!el) return; const t = () => (el.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).format(new Date())); t(); setInterval(t, 15000); }

  window.Trailer = { reduced, intro, cuts, scramble, type, countUp, index, clock };
})();
