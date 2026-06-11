// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxxxx"）
const CONTACT_ENDPOINT = "";

/* ============================================================
   ナビゲーション
============================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-overlay');
const navLinks = document.querySelectorAll('.nav-link');

function openMenu() {
  hamburger.classList.add('is-active');
  navMenu.classList.add('is-open');
  navOverlay.classList.add('is-visible');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('is-active');
  navMenu.classList.remove('is-open');
  navOverlay.classList.remove('is-visible');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', () => {
  hamburger.classList.contains('is-active') ? closeMenu() : openMenu();
});

if (navOverlay) navOverlay.addEventListener('click', closeMenu);

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

/* スクロール時ヘッダー制御 */
const siteHeader = document.getElementById('site-header');
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 80) {
    siteHeader.classList.add('scrolled');
  } else {
    siteHeader.classList.remove('scrolled');
  }
  if (scrollY > lastScrollY && scrollY > 200) {
    siteHeader.classList.add('hidden');
  } else {
    siteHeader.classList.remove('hidden');
  }
  lastScrollY = scrollY;
}, { passive: true });

/* ============================================================
   スクロールアニメーション（Intersection Observer）
============================================================ */
const revealElements = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

/* ============================================================
   施工実績 カード描画 & モーダル
============================================================ */
const worksGrid = document.getElementById('works-grid');

function buildPlaceholder(category) {
  const colors = {
    '足場仮設':    ['#1a2b3c', '#2e4a6b'],
    '土工事':      ['#2b1a0f', '#6b3a1a'],
    '外構工事':    ['#0f2b1a', '#1a6b3a'],
    'コンクリート工事': ['#1a1a2b', '#3a3a6b'],
    '解体工事':    ['#2b0f0f', '#6b1a1a'],
  };
  const [c1, c2] = colors[category] || ['#1c1c1c', '#3a3a3a'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <line x1="0" y1="0" x2="600" y2="400" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="600" y1="0" x2="0" y2="400" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <text x="300" y="185" font-family="serif" font-size="14" fill="rgba(255,255,255,0.35)" text-anchor="middle" letter-spacing="4">${category}</text>
    <text x="300" y="215" font-family="serif" font-size="11" fill="rgba(255,255,255,0.2)" text-anchor="middle" letter-spacing="2">KOGA KENSETSU</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderWorks() {
  if (!worksGrid || typeof WORKS === 'undefined') return;
  worksGrid.innerHTML = '';
  WORKS.forEach((work, i) => {
    const imgSrc = work.image ? `images/${work.image}` : buildPlaceholder(work.category);
    const card = document.createElement('article');
    card.className = 'work-card';
    card.setAttribute('data-reveal', '');
    card.style.transitionDelay = `${i * 0.07}s`;
    card.innerHTML = `
      <div class="work-card__img-wrap">
        <img src="${imgSrc}" alt="${work.title}" loading="lazy">
        <span class="work-card__cat">${work.category}</span>
      </div>
      <div class="work-card__body">
        <p class="work-card__meta">${work.date} &nbsp;|&nbsp; ${work.place}</p>
        <h3 class="work-card__title">${work.title}</h3>
      </div>
    `;
    card.addEventListener('click', () => openWorksModal(work));
    worksGrid.appendChild(card);
  });

  // Observe newly added elements
  worksGrid.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
}

/* モーダル */
const worksModal = document.getElementById('works-modal');
const worksModalClose = document.getElementById('works-modal-close');
const worksModalBody = document.getElementById('works-modal-body');

function openWorksModal(work) {
  const imgSrc = work.image ? `images/${work.image}` : buildPlaceholder(work.category);
  worksModalBody.innerHTML = `
    <img src="${imgSrc}" alt="${work.title}" class="modal-img">
    <div class="modal-content-inner">
      <span class="modal-cat">${work.category}</span>
      <h2 class="modal-title">${work.title}</h2>
      <dl class="modal-meta">
        <dt>施工場所</dt><dd>${work.place}</dd>
        <dt>施工時期</dt><dd>${work.date}</dd>
      </dl>
      <p class="modal-desc">${work.description}</p>
    </div>
  `;
  worksModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeWorksModal() {
  worksModal.classList.remove('is-open');
  document.body.style.overflow = '';
}

if (worksModalClose) worksModalClose.addEventListener('click', closeWorksModal);
if (worksModal) worksModal.addEventListener('click', e => {
  if (e.target === worksModal) closeWorksModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeWorksModal();
});

/* ============================================================
   簡単見積もりツール
============================================================ */
const estForm = document.getElementById('estimate-form');
const estResult = document.getElementById('estimate-result');

const UNIT_PRICES = {
  '足場仮設':        { base: 800,  unit: '㎡',  label: '架設面積' },
  '土工事':          { base: 3500, unit: '㎡',  label: '掘削面積' },
  'コンクリート工事': { base: 6500, unit: '㎥',  label: 'コンクリート打設量' },
  '外構工事':        { base: 9000, unit: '㎡',  label: '施工面積' },
  '解体工事':        { base: 5000, unit: '㎡',  label: '解体面積' },
};

function calcEstimate() {
  if (!estForm) return;
  const type = document.getElementById('est-type').value;
  const scale = parseFloat(document.getElementById('est-scale').value);
  const night = document.getElementById('est-night').checked;
  const urgent = document.getElementById('est-urgent').checked;

  if (!type || isNaN(scale) || scale <= 0) {
    estResult.innerHTML = '<p class="est-error">工事種別と規模を正しく入力してください。</p>';
    return;
  }

  const price = UNIT_PRICES[type];
  let base = price.base * scale;
  let lo = base * 0.85;
  let hi = base * 1.25;
  if (night)  { lo *= 1.2; hi *= 1.2; }
  if (urgent) { lo *= 1.15; hi *= 1.15; }

  const fmt = n => Math.round(n / 1000) * 1000;
  const yen = n => n.toLocaleString('ja-JP') + '円';

  let opts = [];
  if (night)  opts.push('夜間工事割増');
  if (urgent) opts.push('急ぎ対応割増');

  estResult.innerHTML = `
    <div class="est-result-box">
      <p class="est-result-label">概算金額（税込）</p>
      <p class="est-result-range">${yen(fmt(lo))} 〜 ${yen(fmt(hi))}</p>
      ${opts.length ? `<p class="est-result-opts">オプション: ${opts.join('、')}</p>` : ''}
      <p class="est-disclaimer">※あくまで目安です。正式なお見積もりはお問い合わせください。<br>現地調査・詳細設計後に正確な金額をご提示いたします。</p>
    </div>
  `;
}

if (estForm) {
  estForm.addEventListener('submit', e => { e.preventDefault(); calcEstimate(); });
  document.getElementById('est-type').addEventListener('change', function() {
    const price = UNIT_PRICES[this.value];
    if (price) {
      document.getElementById('est-scale-label').textContent = `${price.label}（${price.unit}）`;
    }
  });
}

/* ============================================================
   Googleマップ タブ切替
============================================================ */
const mapTabs = document.querySelectorAll('.map-tab');
const mapPanels = document.querySelectorAll('.map-panel');

mapTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    mapTabs.forEach(t => t.classList.remove('is-active'));
    mapPanels.forEach(p => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    document.getElementById(tab.dataset.target).classList.add('is-active');
  });
});

/* ============================================================
   お問い合わせフォーム バリデーション & 送信
============================================================ */
const contactForm = document.getElementById('contact-form');
const contactMsg = document.getElementById('contact-msg');

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  const err = document.getElementById(`${id}-error`);
  if (el) el.classList.add('is-error');
  if (err) { err.textContent = msg; err.style.display = 'block'; }
}

function clearFieldError(id) {
  const el = document.getElementById(id);
  const err = document.getElementById(`${id}-error`);
  if (el) el.classList.remove('is-error');
  if (err) { err.style.display = 'none'; }
}

function validateContact() {
  let valid = true;
  const fields = ['cf-name', 'cf-tel', 'cf-email', 'cf-message'];
  fields.forEach(f => clearFieldError(f));

  const name = document.getElementById('cf-name').value.trim();
  const tel  = document.getElementById('cf-tel').value.trim();
  const mail = document.getElementById('cf-email').value.trim();
  const msg  = document.getElementById('cf-message').value.trim();

  if (!name) { showFieldError('cf-name', 'お名前を入力してください'); valid = false; }
  if (!tel)  { showFieldError('cf-tel',  '電話番号を入力してください'); valid = false; }
  else if (!/^[\d\-\+\(\)\s]+$/.test(tel)) { showFieldError('cf-tel', '正しい電話番号を入力してください'); valid = false; }
  if (!mail) { showFieldError('cf-email', 'メールアドレスを入力してください'); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { showFieldError('cf-email', '正しいメールアドレスを入力してください'); valid = false; }
  if (!msg)  { showFieldError('cf-message', 'お問い合わせ内容を入力してください'); valid = false; }

  return valid;
}

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateContact()) return;

    const btn = contactForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = '送信中…';

    if (CONTACT_ENDPOINT) {
      try {
        const formData = new FormData(contactForm);
        const res = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          contactMsg.className = 'contact-msg success';
          contactMsg.textContent = 'お問い合わせを受け付けました。担当者より2営業日以内にご連絡いたします。';
          contactForm.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        contactMsg.className = 'contact-msg error';
        contactMsg.textContent = '送信に失敗しました。お手数ですが、お電話にてお問い合わせください。';
      }
    } else {
      // デモモード
      contactMsg.className = 'contact-msg success';
      contactMsg.textContent = '（デモ）送信内容を確認しました。実運用時は CONTACT_ENDPOINT を設定してください。';
      contactForm.reset();
    }

    contactMsg.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '送信する';
  });
}

/* ============================================================
   初期化
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
});

// DOMContentLoaded 前に読み込まれた場合の fallback
if (document.readyState !== 'loading') {
  renderWorks();
}
