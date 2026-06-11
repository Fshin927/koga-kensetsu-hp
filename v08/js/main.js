// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxxxx"）
const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/edberg927@gmail.com"; // FormSubmit経由で edberg927@gmail.com に送信（初回送信時に届く認証メールのリンクをクリックで有効化）

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    hamburger.classList.toggle('active', open);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = document.getElementById('site-header')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   HEADER SCROLL EFFECT
   ============================================================ */
const siteHeader = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  if (siteHeader) {
    siteHeader.classList.toggle('scrolled', window.scrollY > 60);
  }
});

/* ============================================================
   WORKS RENDERING
   ============================================================ */
function getCategoryColor(cat) {
  const map = {
    '足場仮設':     '#c0392b',
    '土工事':       '#7f8c8d',
    '杭打ち':       '#2c3e50',
    'コンクリート工事': '#95a5a6',
    '解体工事':     '#e67e22',
    '外構工事':     '#27ae60',
  };
  return map[cat] || '#555';
}

function buildPlaceholder(category) {
  const color = getCategoryColor(category);
  // SVG データURI プレースホルダー
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#1a1a1a"/>
    <rect x="0" y="0" width="800" height="8" fill="${color}"/>
    <rect x="0" y="492" width="800" height="8" fill="${color}"/>
    <rect x="0" y="0" width="8" height="500" fill="${color}"/>
    <rect x="792" y="0" width="8" height="500" fill="${color}"/>
    <line x1="50" y1="50" x2="750" y2="450" stroke="${color}" stroke-width="1" opacity="0.15"/>
    <line x1="750" y1="50" x2="50" y2="450" stroke="${color}" stroke-width="1" opacity="0.15"/>
    <rect x="340" y="180" width="120" height="80" fill="none" stroke="${color}" stroke-width="3"/>
    <line x1="340" y1="180" x2="400" y2="130" stroke="${color}" stroke-width="3"/>
    <line x1="460" y1="180" x2="400" y2="130" stroke="${color}" stroke-width="3"/>
    <rect x="370" y="220" width="60" height="40" fill="${color}" opacity="0.5"/>
    <text x="400" y="310" text-anchor="middle" font-family="monospace" font-size="20" fill="${color}" opacity="0.9">${category}</text>
    <text x="400" y="340" text-anchor="middle" font-family="monospace" font-size="13" fill="#666">NO IMAGE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderWorks() {
  const grid = document.getElementById('works-grid');
  if (!grid || typeof WORKS === 'undefined') return;

  grid.innerHTML = '';
  WORKS.forEach((work, i) => {
    const imgSrc = work.image ? `images/${work.image}` : buildPlaceholder(work.category);
    const card = document.createElement('article');
    card.className = 'work-card';
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <div class="work-card__img-wrap">
        <img src="${imgSrc}" alt="${work.title}" loading="lazy">
        <span class="work-card__cat" style="background:${getCategoryColor(work.category)}">${work.category}</span>
      </div>
      <div class="work-card__body">
        <p class="work-card__meta">${work.date} ｜ ${work.place}</p>
        <h3 class="work-card__title">${work.title}</h3>
        <p class="work-card__desc">${work.description}</p>
      </div>
      <div class="work-card__footer">
        <button class="btn-detail" data-index="${i}" aria-label="${work.title}の詳細を見る">DETAIL →</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Detail button click -> modal
  grid.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => openWorkModal(Number(btn.dataset.index)));
  });
}

/* ============================================================
   WORK MODAL
   ============================================================ */
let modalOverlay = null;

function openWorkModal(index) {
  const work = WORKS[index];
  if (!work) return;

  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'work-modal-overlay';
    modalOverlay.innerHTML = `
      <div id="work-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button id="modal-close" aria-label="閉じる">✕ CLOSE</button>
        <div id="modal-inner"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
    document.getElementById('modal-close').addEventListener('click', closeWorkModal);
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeWorkModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeWorkModal();
    });
  }

  const imgSrc = work.image ? `images/${work.image}` : buildPlaceholder(work.category);
  document.getElementById('modal-inner').innerHTML = `
    <div class="modal-cat-bar" style="background:${getCategoryColor(work.category)}">
      <span class="modal-cat-label">${work.category}</span>
    </div>
    <img src="${imgSrc}" alt="${work.title}" class="modal-img">
    <div class="modal-content">
      <p class="modal-meta">${work.date} ｜ ${work.place}</p>
      <h2 id="modal-title">${work.title}</h2>
      <p class="modal-desc">${work.description}</p>
    </div>
  `;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
}

function closeWorkModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ============================================================
   MAP TAB SWITCHING
   ============================================================ */
function initMapTabs() {
  const tabs = document.querySelectorAll('.map-tab-btn');
  const panels = document.querySelectorAll('.map-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });
}

/* ============================================================
   ESTIMATE TOOL
   ============================================================ */
const UNIT_PRICES = {
  '足場仮設':         { base: 800,  unit: '㎡', label: '設置面積 (㎡)' },
  '土工事':           { base: 3500, unit: '㎥', label: '掘削・盛土量 (㎥)' },
  'コンクリート工事': { base: 45000, unit: '㎥', label: 'コンクリート量 (㎥)' },
  '外構工事':         { base: 15000, unit: '㎡', label: '施工面積 (㎡)' },
  '解体工事':         { base: 25000, unit: '㎡', label: '延べ床面積 (㎡)' },
  '杭打ち工事':       { base: 80000, unit: '本', label: '杭本数 (本)' },
};
const OPTION_RATES = {
  night:  0.30,
  urgent: 0.20,
};

function initEstimate() {
  const typeSelect  = document.getElementById('est-type');
  const unitLabel   = document.getElementById('est-unit-label');
  const scaleInput  = document.getElementById('est-scale');
  const calcBtn     = document.getElementById('est-calc');
  const resultArea  = document.getElementById('est-result');
  if (!typeSelect || !calcBtn) return;

  typeSelect.addEventListener('change', () => {
    const info = UNIT_PRICES[typeSelect.value];
    if (info && unitLabel) unitLabel.textContent = info.label;
  });
  // 初期値
  const initInfo = UNIT_PRICES[typeSelect.value];
  if (initInfo && unitLabel) unitLabel.textContent = initInfo.label;

  calcBtn.addEventListener('click', () => {
    const type   = typeSelect.value;
    const scale  = parseFloat(scaleInput?.value) || 0;
    const night  = document.getElementById('opt-night')?.checked;
    const urgent = document.getElementById('opt-urgent')?.checked;

    if (scale <= 0) {
      resultArea.innerHTML = `<p class="est-error">規模（数値）を入力してください。</p>`;
      return;
    }

    const info   = UNIT_PRICES[type];
    let rate     = 1.0;
    if (night)  rate += OPTION_RATES.night;
    if (urgent) rate += OPTION_RATES.urgent;

    const base   = info.base * scale * rate;
    const low    = Math.floor(base * 0.85 / 10000) * 10000;
    const high   = Math.ceil(base * 1.15 / 10000) * 10000;

    const fmtJP  = n => n >= 10000
      ? Math.round(n / 10000) + '万円'
      : n.toLocaleString() + '円';

    resultArea.innerHTML = `
      <div class="est-result-box">
        <p class="est-result-label">概算金額レンジ（税抜）</p>
        <p class="est-result-value">${fmtJP(low)} 〜 ${fmtJP(high)}</p>
        <ul class="est-result-detail">
          <li>工事種別：${type}</li>
          <li>規模：${scale}${info.unit}</li>
          ${night  ? '<li>夜間工事割増：＋30%</li>' : ''}
          ${urgent ? '<li>急ぎ対応割増：＋20%</li>' : ''}
        </ul>
        <p class="est-disclaimer">※あくまで目安です。正式なお見積もりはお問い合わせください。<br>現場状況・搬入条件・諸経費等により実費は大きく異なります。</p>
      </div>
    `;
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const name    = form.querySelector('[name="name"]');
    const tel     = form.querySelector('[name="tel"]');
    const email   = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');

    let valid = true;

    if (!name.value.trim()) {
      showError(name, 'お名前を入力してください。');
      valid = false;
    }
    if (!tel.value.trim()) {
      showError(tel, '電話番号を入力してください。');
      valid = false;
    } else if (!/^[\d\-\+\(\)\s]{7,15}$/.test(tel.value.trim())) {
      showError(tel, '正しい電話番号を入力してください。');
      valid = false;
    }
    if (!email.value.trim()) {
      showError(email, 'メールアドレスを入力してください。');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, '正しいメールアドレスを入力してください。');
      valid = false;
    }
    if (!message.value.trim()) {
      showError(message, 'お問い合わせ内容を入力してください。');
      valid = false;
    }

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    if (CONTACT_ENDPOINT) {
      try {
        const data = new FormData(form);
        const res  = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          showFormSuccess(form);
        } else {
          showFormError(form, '送信に失敗しました。しばらく後にお試しください。');
          submitBtn.disabled = false;
          submitBtn.textContent = '送信する';
        }
      } catch {
        showFormError(form, 'ネットワークエラーが発生しました。');
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
      }
    } else {
      // デモ動作
      setTimeout(() => {
        showFormSuccess(form, true);
      }, 600);
    }
  });
}

function showError(field, msg) {
  field.classList.add('input-error');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = msg;
  field.parentNode.appendChild(err);
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function showFormSuccess(form, isDemo = false) {
  const wrap = form.closest('.contact-form-wrap') || form.parentNode;
  wrap.innerHTML = `
    <div class="form-success">
      <p class="form-success__icon">▣</p>
      <h3>${isDemo ? '(デモ) 送信内容を確認しました。' : '送信が完了しました。'}</h3>
      <p>${isDemo
        ? '実運用時は CONTACT_ENDPOINT を Formspree 等のURLに設定してください。'
        : '担当者より2営業日以内にご連絡差し上げます。'}</p>
    </div>
  `;
}

function showFormError(form, msg) {
  const existing = form.querySelector('.form-global-error');
  if (existing) existing.remove();
  const err = document.createElement('p');
  err.className = 'form-global-error';
  err.textContent = msg;
  form.prepend(err);
}

/* ============================================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ============================================================
   HERO TICKER
   ============================================================ */
function initTicker() {
  const ticker = document.getElementById('ticker-track');
  if (!ticker) return;
  const clone = ticker.innerHTML;
  ticker.innerHTML += clone;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
  initMapTabs();
  initEstimate();
  initContactForm();
  initReveal();
  initTicker();
});
