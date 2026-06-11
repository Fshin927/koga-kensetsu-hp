// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxx"）
// 空文字のままではデモモードで動作します。
const CONTACT_ENDPOINT = "";

/* =========================================================
   ナビゲーション
   ========================================================= */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.classList.toggle('is-active', isOpen);
  });

  // メニュー項目クリックで閉じる
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// スクロール時にヘッダーに影を付ける
window.addEventListener('scroll', () => {
  const header = document.getElementById('site-header');
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
});

/* =========================================================
   施工実績 レンダリング
   ========================================================= */
function renderWorks() {
  const container = document.getElementById('works-grid');
  if (!container) return;

  WORKS.forEach((work, index) => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.setAttribute('data-index', index);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', work.title + ' 詳細を見る');

    const imgHtml = work.image
      ? `<img src="images/${work.image}" alt="${work.title}" loading="lazy">`
      : `<div class="work-placeholder" aria-hidden="true">${buildPlaceholderSVG(work.category)}</div>`;

    card.innerHTML = `
      <div class="work-img-wrap">${imgHtml}</div>
      <div class="work-body">
        <span class="work-category">${work.category}</span>
        <h3 class="work-title">${work.title}</h3>
        <p class="work-meta"><span>${work.place}</span><span>${work.date}</span></p>
      </div>
    `;

    card.addEventListener('click', () => openModal(index));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(index); }
    });

    container.appendChild(card);
  });
}

function buildPlaceholderSVG(category) {
  const colors = {
    '足場仮設':     ['#1a3a5c', '#2d6aa0'],
    '土工事':       ['#2c4a1a', '#4a7c2d'],
    'コンクリート工事': ['#3a3a4a', '#6a6a8a'],
    '外構工事':     ['#4a3010', '#8a6030'],
    '解体工事':     ['#4a1a1a', '#8a3030'],
  };
  const [c1, c2] = colors[category] || ['#1a3a5c', '#2d6aa0'];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
    <defs>
      <linearGradient id="pg${category.charCodeAt(0)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="240" fill="url(#pg${category.charCodeAt(0)})"/>
    <text x="200" y="110" text-anchor="middle" font-family="sans-serif" font-size="15" fill="rgba(255,255,255,0.5)" font-weight="bold">株式会社公雅建設</text>
    <text x="200" y="140" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(255,255,255,0.9)" font-weight="bold">${category}</text>
  </svg>`;
}

/* =========================================================
   施工実績 モーダル
   ========================================================= */
let currentModalIndex = -1;

function openModal(index) {
  const work    = WORKS[index];
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('modal');

  currentModalIndex = index;

  const imgHtml = work.image
    ? `<img src="images/${work.image}" alt="${work.title}">`
    : `<div class="modal-placeholder">${buildPlaceholderSVG(work.category)}</div>`;

  document.getElementById('modal-img').innerHTML    = imgHtml;
  document.getElementById('modal-category').textContent  = work.category;
  document.getElementById('modal-title').textContent     = work.title;
  document.getElementById('modal-place').textContent     = work.place;
  document.getElementById('modal-date').textContent      = work.date;
  document.getElementById('modal-description').textContent = work.description;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  modal.focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('is-open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const overlay    = document.getElementById('modal-overlay');
  const closeBtn   = document.getElementById('modal-close');
  const prevBtn    = document.getElementById('modal-prev');
  const nextBtn    = document.getElementById('modal-next');

  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
  }
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (prevBtn)   prevBtn.addEventListener('click', () => openModal((currentModalIndex - 1 + WORKS.length) % WORKS.length));
  if (nextBtn)   nextBtn.addEventListener('click', () => openModal((currentModalIndex + 1) % WORKS.length));

  document.addEventListener('keydown', e => {
    if (!document.getElementById('modal-overlay').classList.contains('is-open')) return;
    if (e.key === 'Escape')      closeModal();
    if (e.key === 'ArrowLeft')   openModal((currentModalIndex - 1 + WORKS.length) % WORKS.length);
    if (e.key === 'ArrowRight')  openModal((currentModalIndex + 1) % WORKS.length);
  });
});

/* =========================================================
   簡単見積もりツール
   ========================================================= */
const ESTIMATE_RATES = {
  '足場仮設':       { base: 800,  unit: '㎡' },
  '土工事':         { base: 3500, unit: '㎡' },
  'コンクリート工事': { base: 6000, unit: '㎡' },
  '外構工事':       { base: 12000, unit: '㎡' },
  '解体工事':       { base: 25000, unit: '㎡' },
};

const OPTION_MULTIPLIERS = {
  night:  0.35,  // 夜間工事 +35%
  urgent: 0.25,  // 急ぎ対応 +25%
};

function calcEstimate() {
  const type  = document.getElementById('est-type').value;
  const area  = parseFloat(document.getElementById('est-area').value) || 0;
  const night = document.getElementById('est-night').checked;
  const urgent= document.getElementById('est-urgent').checked;
  const result= document.getElementById('est-result');

  if (area <= 0) {
    result.innerHTML = '<p class="est-msg">規模（数値）を入力してください。</p>';
    return;
  }

  const rate = ESTIMATE_RATES[type] || ESTIMATE_RATES['足場仮設'];
  let base = rate.base * area;
  let optRate = 0;
  if (night)  optRate += OPTION_MULTIPLIERS.night;
  if (urgent) optRate += OPTION_MULTIPLIERS.urgent;
  const total = base * (1 + optRate);

  const low  = Math.floor(total * 0.85 / 10000) * 10000;
  const high = Math.ceil(total * 1.15 / 10000) * 10000;

  const fmt = n => n >= 10000
    ? (n / 10000).toLocaleString() + '万円'
    : n.toLocaleString() + '円';

  result.innerHTML = `
    <div class="est-output">
      <p class="est-label">概算金額（税抜）</p>
      <p class="est-amount">${fmt(low)} 〜 ${fmt(high)}</p>
      <p class="est-breakdown">${type} / ${area}${rate.unit}${night ? ' / 夜間工事' : ''}${urgent ? ' / 急ぎ対応' : ''}</p>
      <p class="est-note">※ あくまで目安です。現場状況・仕様により変動します。<br>正式なお見積もりはお問い合わせください。</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const calcBtn = document.getElementById('est-calc');
  if (calcBtn) calcBtn.addEventListener('click', calcEstimate);

  ['est-type', 'est-area', 'est-night', 'est-urgent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      if ((document.getElementById('est-area').value || '') !== '') calcEstimate();
    });
  });
});

/* =========================================================
   Googleマップ タブ切替
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.map-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.map-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.map-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
});

/* =========================================================
   お問い合わせフォーム
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const name    = form.querySelector('[name="name"]').value.trim();
    const company = form.querySelector('[name="company"]').value.trim();
    const tel     = form.querySelector('[name="tel"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    let hasError = false;

    if (!name)    { showError('name-error', 'お名前を入力してください。');     hasError = true; }
    if (!tel && !email) {
      showError('tel-error',   '電話番号またはメールアドレスを入力してください。');
      showError('email-error', '電話番号またはメールアドレスを入力してください。');
      hasError = true;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email-error', 'メールアドレスの形式が正しくありません。');
      hasError = true;
    }
    if (!message) { showError('message-error', 'お問い合わせ内容を入力してください。'); hasError = true; }

    if (hasError) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中…';

    if (CONTACT_ENDPOINT) {
      try {
        const resp = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, company, tel, email, message })
        });
        if (resp.ok) {
          showFormSuccess(form);
        } else {
          alert('送信に失敗しました。お手数ですが、お電話にてお問い合わせください。');
          submitBtn.disabled = false;
          submitBtn.textContent = '送信する';
        }
      } catch {
        alert('通信エラーが発生しました。お手数ですが、お電話にてお問い合わせください。');
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
      }
    } else {
      // デモモード
      setTimeout(() => {
        showFormSuccess(form, true);
      }, 600);
    }
  });
});

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function showFormSuccess(form, isDemo = false) {
  const msg = isDemo
    ? '（デモ）送信内容を確認しました。\n実運用時は CONTACT_ENDPOINT を設定してください。'
    : 'お問い合わせを受け付けました。\n担当者より2〜3営業日以内にご連絡いたします。';

  const success = document.getElementById('form-success');
  if (success) {
    success.textContent = msg.replace('\n', ' ');
    success.style.display = 'block';
  }
  form.style.display = 'none';
}

/* =========================================================
   スムーズスクロール（アンカーリンク）
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH = document.getElementById('site-header')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
});

/* =========================================================
   初期化
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
});
