// Formspree等のURLを設定すると実送信されます
// 例: const CONTACT_ENDPOINT = "https://formspree.io/f/xxxxxxxxxxx";
const CONTACT_ENDPOINT = "";

/* ============================================================
   UTILITY
============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   LOADING SCREEN
============================================================ */
window.addEventListener('load', () => {
  const loader = $('#loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 600);
    }, 1000);
  }
  initParticles();
  initCounters();
});

/* ============================================================
   HAMBURGER MENU
============================================================ */
const hamburger = $('#hamburger');
const navMenu = $('#nav-menu');
const navOverlay = $('#nav-overlay');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    navOverlay && navOverlay.classList.toggle('show');
    document.body.classList.toggle('nav-open');
  });
  navOverlay && navOverlay.addEventListener('click', closeMenu);
  $$('#nav-menu a').forEach(a => a.addEventListener('click', closeMenu));
}

function closeMenu() {
  hamburger && hamburger.classList.remove('active');
  navMenu && navMenu.classList.remove('open');
  navOverlay && navOverlay.classList.remove('show');
  document.body.classList.remove('nav-open');
}

/* ============================================================
   STICKY HEADER
============================================================ */
const header = $('header');
window.addEventListener('scroll', () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }
  updateActiveNav();
});

function updateActiveNav() {
  const sections = $$('section[id]');
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = $(`#nav-menu a[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}

/* ============================================================
   SMOOTH SCROLL
============================================================ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   PARTICLES (hero background)
============================================================ */
function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = canvas.offsetWidth;
  let H = canvas.height = canvas.offsetHeight;

  const PARTICLE_COUNT = 80;
  const particles = [];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = Math.random() > 0.5 ? '#00f5c4' : '#6c63ff';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 120) * 0.15;
          ctx.strokeStyle = '#00f5c4';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  });
}

/* ============================================================
   SCROLL ANIMATIONS (Intersection Observer)
============================================================ */
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

$$('.reveal, .reveal-left, .reveal-right, .reveal-up, .stagger-item').forEach(el => {
  revealObserver.observe(el);
});

/* ============================================================
   NUMBER COUNTER ANIMATION
============================================================ */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString() + suffix;
  }
  requestAnimationFrame(update);
}

/* ============================================================
   WORKS (施工実績) RENDERING
============================================================ */
function renderWorks() {
  const grid = $('#works-grid');
  if (!grid || typeof WORKS === 'undefined') return;

  WORKS.forEach((work, i) => {
    const card = document.createElement('div');
    card.className = 'work-card stagger-item glass-card';
    card.style.setProperty('--delay', `${i * 0.1}s`);
    card.innerHTML = `
      <div class="work-img" role="img" aria-label="${work.title}">
        ${work.image
          ? `<img src="images/${work.image}" alt="${work.title}" loading="lazy">`
          : generatePlaceholder(work.category)
        }
        <span class="work-category">${work.category}</span>
      </div>
      <div class="work-body">
        <h3 class="work-title">${work.title}</h3>
        <p class="work-meta"><span class="icon-pin">📍</span>${work.place} &nbsp;|&nbsp; <span class="icon-cal">📅</span>${work.date}</p>
        <p class="work-desc">${work.description}</p>
        <button class="btn-detail" data-index="${i}" aria-label="${work.title}の詳細を見る">詳細を見る <span>→</span></button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Re-observe new stagger items
  $$('.stagger-item').forEach(el => revealObserver.observe(el));

  // Detail button click → modal
  $$('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => openWorkModal(parseInt(btn.dataset.index)));
  });
}

function generatePlaceholder(category) {
  const gradients = {
    '足場仮設':    ['#0f2027', '#203a43', '#2c5364'],
    '杭打ち':      ['#1a0533', '#3d1a78', '#6c63ff'],
    '土工事':      ['#0a4d3a', '#00695c', '#00f5c4'],
    'コンクリート工事': ['#1c1c2e', '#2d2d44', '#4a4a6a'],
    '外構工事':    ['#0d2137', '#1565c0', '#00b0ff'],
    '解体工事':    ['#2d0000', '#7b1fa2', '#ff4081'],
  };
  const colors = gradients[category] || ['#0f2027', '#2c5364', '#00f5c4'];
  const svgContent = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="50%" stop-color="${colors[1]}"/>
          <stop offset="100%" stop-color="${colors[2]}"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="400" height="260" fill="url(#g)"/>
      <polygon points="40,220 80,140 120,180 160,100 200,150 240,80 280,130 320,60 360,110 360,220" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <text x="200" y="125" font-family="sans-serif" font-size="15" font-weight="bold" fill="rgba(255,255,255,0.9)" text-anchor="middle" filter="url(#glow)">${category}</text>
      <text x="200" y="148" font-family="sans-serif" font-size="11" fill="rgba(255,255,255,0.5)" text-anchor="middle">KOGA KENSETSU</text>
    </svg>
  `);
  return `<img src="data:image/svg+xml,${svgContent}" alt="${category}" style="width:100%;height:100%;object-fit:cover;">`;
}

/* ============================================================
   WORKS MODAL
============================================================ */
function openWorkModal(index) {
  const work = WORKS[index];
  if (!work) return;
  const modal = $('#work-modal');
  if (!modal) return;

  $('#modal-category').textContent = work.category;
  $('#modal-title').textContent = work.title;
  $('#modal-meta').innerHTML = `<span>📍 ${work.place}</span><span>📅 ${work.date}</span>`;
  $('#modal-desc').textContent = work.description;
  const imgBox = $('#modal-img');
  if (imgBox) {
    imgBox.innerHTML = work.image
      ? `<img src="images/${work.image}" alt="${work.title}">`
      : generatePlaceholder(work.category);
  }

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeWorkModal() {
  const modal = $('#work-modal');
  if (modal) modal.classList.remove('show');
  document.body.style.overflow = '';
}

// Modal close events
$('#modal-close') && $('#modal-close').addEventListener('click', closeWorkModal);
$('#work-modal') && $('#work-modal').addEventListener('click', e => {
  if (e.target === $('#work-modal')) closeWorkModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeWorkModal();
});

/* ============================================================
   ESTIMATE TOOL (簡単見積もり)
============================================================ */
const PRICE_BASE = {
  'scaffold':    { label: '足場仮設工事',       unit: 'm²', price: 1200,  min: 800,  max: 1600 },
  'earthwork':   { label: '土工事',             unit: 'm³', price: 8000,  min: 5000, max: 12000 },
  'concrete':    { label: 'コンクリート工事',   unit: 'm³', price: 45000, min: 35000, max: 60000 },
  'exterior':    { label: '外構工事',           unit: 'm²', price: 15000, min: 10000, max: 22000 },
  'demolition':  { label: '解体工事',           unit: 'm²', price: 20000, min: 15000, max: 30000 },
  'pile':        { label: '杭打ち工事',         unit: '本', price: 280000, min: 200000, max: 400000 },
};

const estimateForm = $('#estimate-form');
if (estimateForm) {
  estimateForm.addEventListener('input', calcEstimate);
  estimateForm.addEventListener('change', calcEstimate);
}

function calcEstimate() {
  const type = $('#est-type') ? $('#est-type').value : '';
  const size = parseFloat($('#est-size') ? $('#est-size').value : '0') || 0;
  const nightWork = $('#est-night') ? $('#est-night').checked : false;
  const urgent = $('#est-urgent') ? $('#est-urgent').checked : false;
  const floors = parseInt($('#est-floors') ? $('#est-floors').value : '1') || 1;
  const result = $('#estimate-result');
  if (!result) return;

  if (!type || size <= 0) {
    result.innerHTML = '<p class="est-hint">工事種別と規模を入力すると概算金額が表示されます。</p>';
    return;
  }

  const base = PRICE_BASE[type];
  let multiplier = 1;
  if (type === 'scaffold') multiplier = floors * 0.15 + 0.85;
  let lowPrice = base.min * size * multiplier;
  let highPrice = base.max * size * multiplier;
  if (nightWork) { lowPrice *= 1.25; highPrice *= 1.25; }
  if (urgent) { lowPrice *= 1.15; highPrice *= 1.15; }

  const fmt = n => Math.round(n / 10000) + '万円';

  result.innerHTML = `
    <div class="estimate-output">
      <div class="est-label">概算金額（目安）</div>
      <div class="est-price">${fmt(lowPrice)} 〜 ${fmt(highPrice)}</div>
      <div class="est-breakdown">
        <span>${base.label}</span>
        <span>${size.toLocaleString()} ${base.unit} × 単価 ${base.price.toLocaleString()}円</span>
        ${nightWork ? '<span class="opt-tag">夜間割増 +25%</span>' : ''}
        ${urgent ? '<span class="opt-tag">急ぎ割増 +15%</span>' : ''}
      </div>
      <p class="est-disclaimer">※ あくまで目安です。正式なお見積もりはお問い合わせください。現地調査・詳細仕様により大幅に変動する場合があります。</p>
    </div>
  `;
}

/* ============================================================
   MAP TABS
============================================================ */
$$('.map-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.map-tab-btn').forEach(b => b.classList.remove('active'));
    $$('.map-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.add('active');
  });
});

/* ============================================================
   CONTACT FORM
============================================================ */
const contactForm = $('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateContactForm()) return;

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '送信中...';

    const formData = new FormData(contactForm);

    if (CONTACT_ENDPOINT) {
      try {
        const res = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          showFormSuccess();
        } else {
          showFormError('送信に失敗しました。お電話でお問い合わせください。');
        }
      } catch {
        showFormError('通信エラーが発生しました。お電話でお問い合わせください。');
      }
    } else {
      // デモ動作: CONTACT_ENDPOINTが未設定の場合
      setTimeout(() => {
        showFormSuccess(true);
      }, 800);
    }

    btn.disabled = false;
    btn.textContent = '送信する';
  });
}

function validateContactForm() {
  let valid = true;
  $$('.form-error').forEach(el => el.textContent = '');

  const name = $('#f-name');
  const tel = $('#f-tel');
  const email = $('#f-email');
  const message = $('#f-message');

  if (name && !name.value.trim()) {
    setError(name, 'お名前を入力してください。');
    valid = false;
  }
  if (tel && !tel.value.trim()) {
    setError(tel, '電話番号を入力してください。');
    valid = false;
  } else if (tel && !/^[\d\-\+\(\)\s]{10,15}$/.test(tel.value.trim())) {
    setError(tel, '正しい電話番号を入力してください。');
    valid = false;
  }
  if (email && !email.value.trim()) {
    setError(email, 'メールアドレスを入力してください。');
    valid = false;
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    setError(email, '正しいメールアドレスを入力してください。');
    valid = false;
  }
  if (message && !message.value.trim()) {
    setError(message, 'お問い合わせ内容を入力してください。');
    valid = false;
  }
  return valid;
}

function setError(input, msg) {
  const errEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errEl) errEl.textContent = msg;
  input.classList.add('error');
  input.addEventListener('input', () => {
    input.classList.remove('error');
    const e = input.closest('.form-group')?.querySelector('.form-error');
    if (e) e.textContent = '';
  }, { once: true });
}

function showFormSuccess(isDemo = false) {
  const wrap = $('#contact-form-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="form-success">
      <div class="success-icon">✓</div>
      <h3>${isDemo ? '(デモ) 送信内容を確認しました。' : 'お問い合わせを受け付けました。'}</h3>
      <p>${isDemo
        ? '実運用時はCONTACT_ENDPOINTを設定してください。<br>ご入力いただいた内容は実際には送信されていません。'
        : '担当者より2営業日以内にご連絡いたします。'}</p>
    </div>
  `;
}

function showFormError(msg) {
  const existing = contactForm?.querySelector('.form-global-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'form-global-error';
  div.textContent = msg;
  contactForm?.prepend(div);
}

/* ============================================================
   HERO TYPEWRITER
============================================================ */
function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;
  const texts = ['足場仮設', '杭打ち工事', '土工事', 'コンクリート工事', '外構工事', '解体工事'];
  let idx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = texts[idx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        idx = (idx + 1) % texts.length;
      }
    }
    setTimeout(type, deleting ? 60 : 120);
  }
  type();
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
  initTypewriter();
  calcEstimate();
  updateActiveNav();
});
