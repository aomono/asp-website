/* Asterio Strategy Partners — Structured Intelligence
   Vanilla JS + GSAP/ScrollTrigger + Lenis (all CDN). */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = { ink: '8,10,26', mist: '185,190,218', red: '196,30,58', redSoft: '224,86,110', paper: '230,232,244' };

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }
  // anchor links -> lenis scroll
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var el = document.querySelector(id); if (!el) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.2 }); else el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  var burger = document.getElementById('burger');
  function closeMenu() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---------- Reveal on scroll ---------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.reveal').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: 'top 86%',
        onEnter: function () { el.classList.add('in'); var p = el.closest('.problem'); if (p) p.classList.add('in'); }
      });
    });
    document.querySelectorAll('.problem').forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: 'top 82%', onEnter: function () { el.classList.add('in'); } });
    });
  } else {
    document.querySelectorAll('.reveal,.problem').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to')), dur = 1400, t0 = performance.now(), from = 0;
    if (reduce) { el.textContent = to; return; }
    function step(now) {
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('.count').forEach(function (el) {
    if (window.ScrollTrigger && !reduce) {
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { countUp(el); } });
    } else { el.textContent = el.getAttribute('data-to'); }
  });

  /* ============================================================
     HERO — issue tree (ISSUE -> structure -> ANSWER)
     ============================================================ */
  function heroTree(canvasId, opts) {
    opts = opts || {};
    var cv = document.getElementById(canvasId); if (!cv) return;
    var ctx = cv.getContext('2d'), W, H, DPR, t0 = performance.now();
    var mouse = { x: .5, y: .5 }, mt = { x: .5, y: .5 };
    var nodes = [], edges = [], particles = [];
    var anchorX = opts.anchorX || .66, anchorY = opts.anchorY || .5;
    var showLabels = opts.labels !== false;

    function addNode(x, y, d, root) { nodes.push({ x: x, y: y, d: d, root: !!root, ph: Math.random() * 6.28 }); return nodes.length - 1; }
    function build() {
      nodes = []; edges = [];
      var cx = anchorX, cy = anchorY, root = addNode(cx, cy, 0, true), b = 3, d1 = [];
      for (var i = 0; i < b; i++) { var y = cy + (i - (b - 1) / 2) * .23; var n = addNode(cx + .13, y, 1); edges.push([root, n]); d1.push(n); }
      d1.forEach(function (p) { for (var j = 0; j < 2; j++) { var y = nodes[p].y + (j - .5) * .12; var n = addNode(nodes[p].x + .135, y, 2); edges.push([p, n]); } });
    }
    function seed() { particles = []; for (var i = 0; i < 84; i++) particles.push({ x: Math.random(), y: Math.random(), drift: Math.random() * 6.28, spd: .0006 + Math.random() * .0012, target: i < nodes.length ? i : -1 }); }
    function resize() { DPR = Math.min(devicePixelRatio || 1, 2); var r = cv.getBoundingClientRect(); W = cv.width = r.width * DPR; H = cv.height = r.height * DPR; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; }
    addEventListener('resize', resize);
    addEventListener('mousemove', function (e) { mt.x = e.clientX / innerWidth; mt.y = e.clientY / innerHeight; });
    resize(); build(); seed();
    function nx(n) { return n.x * W; } function ny(n) { return n.y * H; }

    function frame(now) {
      var el = (now - t0) / 1000, form = reduce ? 1 : Math.min(el / 2.6, 1), ease = 1 - Math.pow(1 - form, 3);
      mouse.x += (mt.x - mouse.x) * .05; mouse.y += (mt.y - mouse.y) * .05;
      var px = (mouse.x - .5) * -26 * DPR, py = (mouse.y - .5) * -18 * DPR;
      ctx.clearRect(0, 0, W, H);
      var g = ctx.createRadialGradient(W * anchorX + px, H * anchorY + py, 0, W * anchorX + px, H * anchorY + py, W * .5);
      g.addColorStop(0, 'rgba(42,49,120,.2)'); g.addColorStop(1, 'rgba(8,10,26,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      particles.forEach(function (p) {
        var X, Y;
        if (p.target >= 0) { var n = nodes[p.target]; p.x += (n.x - p.x) * .09 * ease; p.y += (n.y - p.y) * .09 * ease; X = p.x * W + px; Y = p.y * H + py; }
        else { p.drift += p.spd * 60; p.x += Math.cos(p.drift) * .0004; p.y += Math.sin(p.drift * 1.3) * .0004; if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0; if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0; X = p.x * W + px; Y = p.y * H + py; }
        ctx.beginPath(); ctx.arc(X, Y, (p.target >= 0 ? 1.1 : .9) * DPR, 0, 6.2831);
        ctx.fillStyle = 'rgba(' + C.mist + ',' + (p.target >= 0 ? (.14 + .34 * ease) : .13) + ')'; ctx.fill();
      });

      edges.forEach(function (e2, i) {
        var seg = 1 / edges.length, local = Math.max(0, Math.min(1, (ease - i * seg * .6) / (seg * 1.6)));
        if (local <= 0) return;
        var a = nodes[e2[0]], b = nodes[e2[1]], ax = nx(a) + px, ay = ny(a) + py, bx = nx(b) + px, by = ny(b) + py, mx = ax + (bx - ax) * .5;
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.bezierCurveTo(mx, ay, mx, by, ax + (bx - ax) * local, ay + (by - ay) * local);
        ctx.strokeStyle = a.root ? 'rgba(' + C.red + ',' + (.48 * local) + ')' : 'rgba(' + C.mist + ',' + (.3 * local) + ')';
        ctx.lineWidth = (a.root ? 1.3 : 1) * DPR; ctx.stroke();
      });

      nodes.forEach(function (n) {
        var appear = Math.max(0, Math.min(1, (ease - n.d * .18) / .5)); if (appear <= 0) return;
        var X = nx(n) + px, Y = ny(n) + py, breathe = reduce ? 0 : Math.sin(now / 1000 * 1.1 + n.ph) * 1.2 * DPR;
        var r = (n.root ? 5.5 : n.d === 1 ? 3.4 : 2.4) * DPR * appear;
        ctx.beginPath(); ctx.arc(X, Y + breathe, r + 6 * DPR, 0, 6.2831); ctx.fillStyle = n.root ? 'rgba(' + C.red + ',' + (.1 * appear) + ')' : 'rgba(120,130,190,' + (.07 * appear) + ')'; ctx.fill();
        ctx.beginPath(); ctx.arc(X, Y + breathe, r + 2.5 * DPR, 0, 6.2831); ctx.strokeStyle = n.root ? 'rgba(' + C.redSoft + ',' + (.55 * appear) + ')' : 'rgba(' + C.mist + ',' + (.34 * appear) + ')'; ctx.lineWidth = 1 * DPR; ctx.stroke();
        ctx.beginPath(); ctx.arc(X, Y + breathe, r, 0, 6.2831); ctx.fillStyle = n.root ? 'rgba(' + C.redSoft + ',' + (.95 * appear) + ')' : 'rgba(' + C.paper + ',' + (.82 * appear) + ')'; ctx.fill();
      });

      if (showLabels && ease > .85) {
        var o = (ease - .85) / .15;
        ctx.font = (10.5 * DPR) + 'px "IBM Plex Mono", monospace'; ctx.textBaseline = 'middle';
        try { ctx.letterSpacing = (2.2 * DPR) + 'px'; } catch (e3) {}
        var root = nodes[0], last = nodes[nodes.length - 1];
        ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(' + C.mist + ',' + (.66 * o) + ')'; ctx.fillText('ISSUE', nx(root) + px - 15 * DPR, ny(root) + py);
        ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(' + C.redSoft + ',' + (.8 * o) + ')'; ctx.fillText('ANSWER', nx(last) + px + 15 * DPR, ny(last) + py);
        try { ctx.letterSpacing = '0px'; } catch (e4) {}
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  heroTree('tree', { anchorX: .66, anchorY: .5 });
  heroTree('tree-c', { anchorX: .32, anchorY: .46, labels: false });

  /* ============================================================
     MODEL VIZ — dependency (orbiting satellites) -> self-driving
     A central org node; on scroll-in, external "consultant" nodes
     detach and their capability is absorbed inward (arrows reverse).
     ============================================================ */
  function modelViz() {
    var cv = document.getElementById('viz'); if (!cv) return;
    var ctx = cv.getContext('2d'), W, H, DPR, prog = 0, t0 = null, started = false;
    function resize() { DPR = Math.min(devicePixelRatio || 1, 2); var r = cv.getBoundingClientRect(); W = cv.width = r.width * DPR; H = cv.height = r.height * DPR; }
    addEventListener('resize', function () { resize(); });
    resize();
    var ink = '15,19,56', slate = '90,96,121', red = '196,30,58';
    function draw(now) {
      if (started && t0 === null) t0 = now;
      if (started && !reduce) prog = Math.min((now - t0) / 2200, 1); else if (reduce && started) prog = 1;
      var e = 1 - Math.pow(1 - prog, 3);
      ctx.clearRect(0, 0, W, H);
      var cx = W * .5, cy = H * .5, R = Math.min(W, H) * .3;
      // rotating gentle
      var rot = reduce ? 0 : now / 3600;
      // core (the organization) grows as it becomes self-driving
      var coreR = (10 + 10 * e) * DPR;
      // satellites: consultants (start outside, detach/fade as e->1)
      var sat = 5;
      for (var i = 0; i < sat; i++) {
        var a = rot + i / sat * 6.2831;
        var dist = R * (1 + .15 * Math.sin(now / 900 + i));
        var sx = cx + Math.cos(a) * dist, sy = cy + Math.sin(a) * dist;
        // connection line: inbound (dependency) -> its opacity fades with e
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
        ctx.strokeStyle = 'rgba(' + slate + ',' + (.28 * (1 - e)) + ')'; ctx.lineWidth = 1 * DPR; ctx.stroke();
        // arrow head pointing INWARD early (knowledge flows out to consultant) -> reverses
        var satFade = 1 - e;
        ctx.beginPath(); ctx.arc(sx, sy, 3.5 * DPR * (0.4 + satFade), 0, 6.2831);
        ctx.fillStyle = 'rgba(' + slate + ',' + (.55 * satFade) + ')'; ctx.fill();
      }
      // inner capability ring that appears as e->1 (knowledge retained inside)
      var inner = 6;
      for (var j = 0; j < inner; j++) {
        var a2 = -rot * 1.4 + j / inner * 6.2831;
        var ir = R * (.42 + .04 * Math.sin(now / 700 + j)) * e;
        var ix = cx + Math.cos(a2) * ir, iy = cy + Math.sin(a2) * ir;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ix, iy);
        ctx.strokeStyle = 'rgba(' + red + ',' + (.32 * e) + ')'; ctx.lineWidth = 1 * DPR; ctx.stroke();
        ctx.beginPath(); ctx.arc(ix, iy, 3 * DPR * e, 0, 6.2831); ctx.fillStyle = 'rgba(' + red + ',' + (.7 * e) + ')'; ctx.fill();
      }
      // core
      ctx.beginPath(); ctx.arc(cx, cy, coreR + 5 * DPR, 0, 6.2831); ctx.fillStyle = 'rgba(' + red + ',' + (.08 + .08 * e) + ')'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, 6.2831);
      ctx.fillStyle = 'rgba(' + ink + ',' + (.9) + ')'; ctx.fill();
      ctx.strokeStyle = 'rgba(' + red + ',' + (.5 + .4 * e) + ')'; ctx.lineWidth = 1.4 * DPR; ctx.stroke();
      // labels
      ctx.font = (10 * DPR) + 'px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(' + ink + ',' + (.55) + ')';
      try { ctx.letterSpacing = (1.5 * DPR) + 'px'; } catch (e5) {}
      ctx.fillText(e < .5 ? 'DEPENDENT' : 'SELF-DRIVING', cx, H - 22 * DPR);
      try { ctx.letterSpacing = '0px'; } catch (e6) {}
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    if (window.ScrollTrigger) ScrollTrigger.create({ trigger: cv, start: 'top 78%', once: true, onEnter: function () { started = true; } });
    else started = true;
  }
  modelViz();

  /* ---------- Contact form (Formspree AJAX) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button'); var orig = btn.textContent;
      btn.disabled = true; btn.textContent = '送信中…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (r.ok) { form.style.display = 'none'; document.getElementById('thanks').classList.add('show'); }
          else { btn.disabled = false; btn.textContent = orig; alert('送信に失敗しました。時間をおいて再度お試しください。'); }
        })
        .catch(function () { btn.disabled = false; btn.textContent = orig; alert('送信に失敗しました。info@asterio-sp.com までご連絡ください。'); });
    });
  }
})();
