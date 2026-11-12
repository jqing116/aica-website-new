/* AICA front page behaviour: mobile menu, footer accordion, scroll reveal, hero parallax . */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };

  /* ---------- mobile menu ---------- */
  var menuBtn = $('.menu-btn'), nav = $('#site-nav');
  if (menuBtn && nav) {
    var close = function () { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); };
    menuBtn.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('#site-nav a').forEach(function (a) { a.addEventListener('click', close); });
  }

  /* ---------- footer accordion (mobile) ---------- */
  $$('.accordion-head').forEach(function (h) {
    h.addEventListener('click', function () {
      if (matchMedia('(min-width: 1024px)').matches) return;
      var item = h.parentElement, open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      h.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- scroll reveal ---------- */
  var targets = $$('[data-animate],[data-animate-group]');
  $$('[data-animate-group]').forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i % 8); }); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- hero parallax (<=10% of image height) ---------- */
  var heroImg = $('.herobanner-img');
  if (heroImg && !reduced()) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.1) heroImg.style.transform = 'translateY(' + (y * 0.1) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }
  /* moments graphic: play once when it comes into view; Replay restarts it */
  (function () {
    var d = document.querySelector('.moment-demo'); if (!d) return;
    var play = function () { d.classList.remove('is-play'); void d.offsetWidth; d.classList.add('is-play'); };
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { play(); o.disconnect(); } }); }, { threshold: 0.4 });
      o.observe(d);
    } else { play(); }
    var r = d.querySelector('.md-replay'); if (r) r.addEventListener('click', play);
  })();
  /* domain- and organization-specific tests: pick a person and their use of AI; the question follows */
  (function () {
    var root = document.querySelector('.adq'); if (!root) return;
    var ICON = {
      'Healthcare': '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/>',
      'Office': '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
      'Finance': '<path d="M4 20h16"/><path d="M7 20v-6M12 20V9M17 20v-9"/>'
    };
    var F = {
      'Healthcare': {
        'Nurse': { doc: 'a patient’s notes', to: 'the next shift', when: 'before handover', det: 'medicines, doses and allergies', src: 'the patient record' },
        'Pharmacist': { doc: 'a new drug safety notice', to: 'the ward team', when: 'by the end of the day', det: 'drug names, doses and dates', src: 'the official notice' }
      },
      'Office': {
        'Admin officer': { doc: 'the notes from a supplier meeting', to: 'your manager', when: 'by the end of the day', det: 'decisions, dates and amounts', src: 'the meeting record' },
        'HR officer': { doc: 'a set of job applications', to: 'the hiring panel', when: 'before the panel meets', det: 'names, qualifications and dates', src: 'the applications' }
      },
      'Finance': {
        'Accountant': { doc: 'the monthly expense report', to: 'the finance manager', when: 'by Friday', det: 'totals, account codes and dates', src: 'the ledger' },
        'Finance manager': { doc: 'a budget proposal', to: 'the executive board', when: 'before the board meeting', det: 'figures and assumptions', src: 'the budget data' }
      }
    };
    var L = {
      'New to AI': {
        lvl: 'Foundation', n: 1,
        q: function (r) { return 'Your team has just started using an AI tool. A colleague gives you an AI summary of ' + r.doc + ' to pass to ' + r.to + ' ' + r.when + '. What should you do before passing it on?'; },
        o: function (r) { return ['Pass it on, since it looks complete', 'Ask the AI whether the summary is correct', 'Compare the ' + r.det + ' with ' + r.src + ' first', 'Refuse to use anything written by AI']; }
      },
      'Uses AI sometimes': {
        lvl: 'Applied', n: 2,
        q: function (r) { return 'You use AI to summarize ' + r.doc + ' for ' + r.to + ' ' + r.when + '. The summary reads well. What do you check first?'; },
        o: function (r) { return ['Nothing, the summary reads well', 'Run it again and keep the better version', 'Check the ' + r.det + ' against ' + r.src, 'Rewrite the whole summary by hand']; }
      },
      'Uses AI daily': {
        lvl: 'Advanced', n: 3,
        q: function (r) { return 'Your team now uses AI to summarize ' + r.doc + ' for ' + r.to + ' every week. What check should be part of the routine?'; },
        o: function (r) { return ['None, the tool has been reliable so far', 'Ask everyone to check every line, every time', 'A check of the ' + r.det + ' against ' + r.src + ', with a named person responsible', 'Stop using AI for this task']; }
      }
    };
    var PEOPLE = [];
    Object.keys(F).forEach(function (f) { Object.keys(F[f]).forEach(function (r) { PEOPLE.push({ field: f, role: r }); }); });
    var st = { person: 0, level: 'Uses AI sometimes' };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
    var $ = function (s) { return root.querySelector(s); };
    var AV = '<svg viewBox="0 0 64 64" fill="none" stroke="#DA5F8E" stroke-width="2.6" stroke-linecap="round"><circle cx="32" cy="24" r="10"/><path d="M14 54c1.5-10 8.5-16 18-16s16.5 6 18 16"/></svg>';
    var badge = function (f) { return '<span class="adq-badge"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICON[f] + '</svg></span>'; };
    $('[data-adq="person"]').innerHTML = PEOPLE.map(function (x, i) {
      return '<button type="button" class="adq-pp" data-i="' + i + '" aria-pressed="' + (i === st.person) + '"><span class="adq-pp-av">' + AV + badge(x.field) + '</span><span class="adq-pp-t"><b>' + esc(x.role) + '</b><small>' + esc(x.field) + '</small></span></button>';
    }).join('');
    $('[data-adq="level"]').innerHTML = Object.keys(L).map(function (v) { return '<button type="button" data-v="' + esc(v) + '" aria-pressed="' + (v === st.level) + '">' + esc(v) + '</button>'; }).join('');
    function render() {
      var x = PEOPLE[st.person], r = F[x.field][x.role], l = L[st.level];
      Array.prototype.forEach.call(root.querySelectorAll('.adq-pp'), function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-i') === st.person); });
      Array.prototype.forEach.call(root.querySelectorAll('[data-adq="level"] button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === st.level); });
      $('#adq-pname').textContent = x.role;
      $('#adq-pfield').textContent = x.field;
      $('#adq-plevel').textContent = st.level;
      $('#adq-badge').outerHTML = badge(x.field).replace('class="adq-badge"', 'class="adq-badge" id="adq-badge"');
      root.style.setProperty('--lvl', l.n);
      $('#adq-q').textContent = l.q(r);
      $('#adq-opts').innerHTML = l.o(r).map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('');
      root.classList.remove('is-swap'); void root.offsetWidth; root.classList.add('is-swap');
    }
    root.addEventListener('click', function (e) {
      var pp = e.target.closest('.adq-pp'); if (pp) { st.person = +pp.getAttribute('data-i'); render(); return; }
      var b = e.target.closest('[data-adq="level"] button'); if (b) { st.level = b.getAttribute('data-v'); render(); }
    });
    render();
  })();
  /* approach: knowledge field -> work-situation question */
  (function () {
    var root = document.querySelector('.kf'); if (!root) return;
    var P = [
      ['Checking the result', 'Check the important claims in an AI output against an authoritative source, rather than asking the same AI to confirm its own answer.', 'Problem solving with AI',
        '“Your manager wants an AI summary of a client contract by noon. What do you check before you send it?”'],
      ['Protecting data', 'Decide whether, and in what form, a piece of work data may go into a given AI tool, rather than assuming that what was fine for the last task is fine for this one.', 'Ethical and safe use',
        '“You want to paste a customer list into a free AI tool to tidy it up before a mailing. What do you decide first?”'],
      ['Keeping decisions human', 'Treat AI-assisted work as your own responsibility, rather than passing it to the tool or its vendor.', 'Human and AI collaboration',
        '“A reply you drafted with AI quoted the wrong date, and the client asks who is responsible. How do you respond?”'],
      ['Choosing the right tool', 'Choose whether AI should work from documents you provide, a live search or its own memory, based on whether the task needs specific, current information.', 'Foundations and tool use',
        '“A colleague asks an AI chatbot about your organization’s leave policy and gets a confident answer. Where should the answer have come from?”']
    ];
    var $ = function (s) { return root.querySelector(s); };
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-kf]'); if (!b) return;
      var x = P[+b.getAttribute('data-kf')];
      Array.prototype.forEach.call(root.querySelectorAll('[data-kf]'), function (o) { o.setAttribute('aria-pressed', o === b); });
      $('#kf-name').textContent = x[0]; $('#kf-text').textContent = x[1]; $('#kf-area').textContent = x[2]; $('#kf-q').textContent = x[3];
      root.classList.remove('is-swap'); void root.offsetWidth; root.classList.add('is-swap');
    });
  })();
  /* on-page nav: highlight the section in view */
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.page-nav a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) { links.forEach(function (a) { a.classList.remove('is-here'); }); map[e.target.id].classList.add('is-here'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();
})();
