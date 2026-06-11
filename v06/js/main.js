// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxxxx"）
// 未設定のままではデモ用確認メッセージが表示されます。
const CONTACT_ENDPOINT = "";

/* =====================================================
   ナビゲーション / ハンバーガーメニュー
===================================================== */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-overlay');

function openMenu() {
  hamburger.classList.add('active');
  navMenu.classList.add('active');
  navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  if (navMenu.classList.contains('active')) {
    closeMenu();
  } else {
    openMenu();
  }
});

navOverlay.addEventListener('click', closeMenu);

document.querySelectorAll('#nav-menu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

/* =====================================================
   スクロール時ヘッダー縮小
===================================================== */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* =====================================================
   スムーススクロール
===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* =====================================================
   施工実績カード描画
===================================================== */
const CATEGORY_COLORS = {
  '足場仮設':     { bg: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)', icon: '🏗️' },
  '土工事':       { bg: 'linear-gradient(135deg, #5c4033 0%, #a1887f 100%)', icon: '⛏️' },
  'コンクリート工事': { bg: 'linear-gradient(135deg, #455a64 0%, #90a4ae 100%)', icon: '🧱' },
  '外構工事':     { bg: 'linear-gradient(135deg, #388e3c 0%, #81c784 100%)', icon: '🌿' },
  '解体工事':     { bg: 'linear-gradient(135deg, #bf360c 0%, #ff8a65 100%)', icon: '🔨' },
};

function buildPlaceholder(category) {
  const c = CATEGORY_COLORS[category] || { bg: 'linear-gradient(135deg, #2d6a4f, #95d5b2)', icon: '🏢' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2d6a4f"/>
        <stop offset="100%" style="stop-color:#95d5b2"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#g)"/>
    <text x="200" y="115" font-size="52" text-anchor="middle" dominant-baseline="middle">${c.icon}</text>
    <text x="200" y="168" font-size="18" fill="white" text-anchor="middle" font-family="sans-serif" font-weight="bold">${category}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function renderWorks(filterCategory = 'all') {
  const grid = document.getElementById('works-grid');
  grid.innerHTML = '';

  const filtered = filterCategory === 'all'
    ? WORKS
    : WORKS.filter(w => w.category === filterCategory);

  filtered.forEach((work, idx) => {
    const imgSrc = work.image ? `images/${work.image}` : buildPlaceholder(work.category);
    const card = document.createElement('article');
    card.className = 'work-card';
    card.setAttribute('data-index', WORKS.indexOf(work));
    card.innerHTML = `
      <div class="work-card__img-wrap">
        <img src="${imgSrc}" alt="${work.title}" loading="lazy">
        <span class="work-card__cat">${work.category}</span>
      </div>
      <div class="work-card__body">
        <p class="work-card__date">${work.date}</p>
        <h3 class="work-card__title">${work.title}</h3>
        <p class="work-card__place">📍 ${work.place}</p>
      </div>
    `;
    card.addEventListener('click', () => openModal(WORKS.indexOf(work)));
    grid.appendChild(card);
  });
}

/* カテゴリフィルター */
document.querySelectorAll('.works-filter__btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.works-filter__btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderWorks(this.dataset.cat);
  });
});

/* =====================================================
   モーダル
===================================================== */
const modal = document.getElementById('work-modal');
const modalClose = document.getElementById('modal-close');

function openModal(index) {
  const work = WORKS[index];
  if (!work) return;
  const imgSrc = work.image ? `images/${work.image}` : buildPlaceholder(work.category);
  document.getElementById('modal-img').src = imgSrc;
  document.getElementById('modal-img').alt = work.title;
  document.getElementById('modal-cat').textContent = work.category;
  document.getElementById('modal-title').textContent = work.title;
  document.getElementById('modal-place').innerHTML = `📍 ${work.place}`;
  document.getElementById('modal-date').innerHTML = `🗓️ ${work.date}`;
  document.getElementById('modal-desc').textContent = work.description;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* =====================================================
   簡単見積もりツール
===================================================== */
const ESTIMATE_RATES = {
  '足場仮設':       { base: 800,  unit: '㎡',  label: '足場面積' },
  '土工事':         { base: 3500, unit: '㎥',  label: '掘削量' },
  'コンクリート工事': { base: 25000, unit: '㎥', label: 'コンクリート量' },
  '外構工事':       { base: 15000, unit: '㎡', label: '施工面積' },
  '解体工事':       { base: 12000, unit: '㎡', label: '延床面積' },
};

const FLOOR_FACTOR = 1.2; // 階数によるファクター増分/階

function calcEstimate() {
  const type    = document.getElementById('est-type').value;
  const size    = parseFloat(document.getElementById('est-size').value) || 0;
  const floors  = parseInt(document.getElementById('est-floors').value) || 1;
  const night   = document.getElementById('est-night').checked ? 1.25 : 1;
  const urgent  = document.getElementById('est-urgent').checked ? 1.15 : 1;

  const rate = ESTIMATE_RATES[type];
  if (!rate || size <= 0) {
    document.getElementById('est-result').innerHTML = '<p class="est-result__hint">規模を入力してください。</p>';
    return;
  }

  const floorFactor = 1 + (floors - 1) * 0.08;
  const base = rate.base * size * floorFactor * night * urgent;
  const low  = Math.round(base * 0.85 / 1000) * 1000;
  const high = Math.round(base * 1.15 / 1000) * 1000;

  document.getElementById('est-result').innerHTML = `
    <div class="est-result__box">
      <p class="est-result__label">概算金額レンジ</p>
      <p class="est-result__amount">
        <span>${low.toLocaleString()}</span> 〜 <span>${high.toLocaleString()}</span> 円
      </p>
      <ul class="est-result__conditions">
        <li>工事種別: <strong>${type}</strong></li>
        <li>${rate.label}: <strong>${size} ${rate.unit}</strong></li>
        <li>階数: <strong>${floors}階</strong></li>
        ${night > 1 ? '<li>夜間工事割増: <strong>+25%</strong></li>' : ''}
        ${urgent > 1 ? '<li>急ぎ対応割増: <strong>+15%</strong></li>' : ''}
      </ul>
      <p class="est-result__disclaimer">※あくまで目安です。正式なお見積もりはお問い合わせください。</p>
    </div>
  `;
}

document.getElementById('est-type').addEventListener('change', updateUnitLabel);
document.getElementById('est-calc-btn').addEventListener('click', calcEstimate);

function updateUnitLabel() {
  const type = document.getElementById('est-type').value;
  const rate = ESTIMATE_RATES[type];
  if (rate) {
    document.getElementById('est-size-label').textContent = `${rate.label}（${rate.unit}）`;
  }
}
updateUnitLabel();

/* =====================================================
   Googleマップ タブ切替
===================================================== */
document.querySelectorAll('.map-tab__btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.map-tab__btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.map-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById(this.dataset.panel).classList.add('active');
  });
});

/* =====================================================
   お問い合わせフォーム
===================================================== */
const contactForm = document.getElementById('contact-form');
const contactResult = document.getElementById('contact-result');

contactForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  // バリデーション
  const name    = document.getElementById('cf-name').value.trim();
  const phone   = document.getElementById('cf-phone').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  const errors  = [];

  if (!name)    errors.push('お名前を入力してください。');
  if (!phone && !email) errors.push('電話番号またはメールアドレスを入力してください。');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('メールアドレスの形式が正しくありません。');
  if (!message) errors.push('お問い合わせ内容を入力してください。');

  if (errors.length > 0) {
    contactResult.innerHTML = `<div class="form-result form-result--error"><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul></div>`;
    return;
  }

  const submitBtn = contactForm.querySelector('.contact-form__submit');
  submitBtn.disabled = true;
  submitBtn.textContent = '送信中…';

  if (CONTACT_ENDPOINT) {
    // 実送信
    try {
      const formData = new FormData(contactForm);
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactResult.innerHTML = `<div class="form-result form-result--success">✅ お問い合わせを受け付けました。担当者よりご連絡いたします。</div>`;
        contactForm.reset();
      } else {
        throw new Error('送信失敗');
      }
    } catch {
      contactResult.innerHTML = `<div class="form-result form-result--error">送信に失敗しました。お電話にてお問い合わせください。</div>`;
    }
  } else {
    // デモモード
    contactResult.innerHTML = `<div class="form-result form-result--demo">（デモ）送信内容を確認しました。実運用時は CONTACT_ENDPOINT を設定してください。<br>お名前: ${name} / 内容: ${message.slice(0, 30)}…</div>`;
    contactForm.reset();
  }

  submitBtn.disabled = false;
  submitBtn.textContent = '送信する';
});

/* =====================================================
   スクロールアニメーション（Intersection Observer）
===================================================== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* =====================================================
   初期化
===================================================== */
renderWorks();
