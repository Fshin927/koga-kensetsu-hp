// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/XXXXXXXX"）
const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/edberg927@gmail.com"; // FormSubmit経由で edberg927@gmail.com に送信（初回送信時に届く認証メールのリンクをクリックで有効化）

// ============================================================
// ナビゲーション
// ============================================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', isOpen);
  hamburger.classList.toggle('is-active', isOpen);
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', false);
    hamburger.classList.remove('is-active');
  });
});

// スクロール時ヘッダー背景
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// アクティブリンクのハイライト
const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => observer.observe(s));

// ============================================================
// 施工実績カード描画
// ============================================================
function categoryColor(cat) {
  const map = {
    '足場仮設':   ['#e8f0f2', '#1a5f7a'],
    '杭打ち':     ['#e8ece8', '#3a5a3a'],
    '外構工事':   ['#f0ece8', '#6b4226'],
    '解体工事':   ['#eeeeee', '#444444'],
    'コンクリート工事': ['#e8eef4', '#1a3d5f'],
    '土工事':     ['#f0ede6', '#5a4a20'],
  };
  return map[cat] || ['#f0f0f0', '#333'];
}

function makePlaceholder(category) {
  const [bg, fg] = categoryColor(category);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${bg}"/>
    <text x="300" y="190" font-family="sans-serif" font-size="15" fill="${fg}" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${category}</text>
    <text x="300" y="220" font-family="sans-serif" font-size="11" fill="${fg}" text-anchor="middle" opacity="0.6">画像準備中</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function renderWorks() {
  const grid = document.getElementById('works-grid');
  if (!grid) return;
  WORKS.forEach((work, i) => {
    const imgSrc = work.image ? `images/${work.image}` : makePlaceholder(work.category);
    const card = document.createElement('article');
    card.className = 'work-card';
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <div class="work-card__img-wrap">
        <img src="${imgSrc}" alt="${work.title}" loading="lazy">
        <span class="work-card__category">${work.category}</span>
      </div>
      <div class="work-card__body">
        <p class="work-card__date">${work.date}</p>
        <h3 class="work-card__title">${work.title}</h3>
        <p class="work-card__place">${work.place}</p>
      </div>`;
    card.addEventListener('click', () => openModal(i));
    grid.appendChild(card);
  });
}

// ============================================================
// モーダル
// ============================================================
const modal = document.getElementById('works-modal');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalCategory = document.getElementById('modal-category');
const modalDate = document.getElementById('modal-date');
const modalTitle = document.getElementById('modal-title');
const modalPlace = document.getElementById('modal-place');
const modalDesc = document.getElementById('modal-desc');

function openModal(index) {
  const work = WORKS[index];
  const imgSrc = work.image ? `images/${work.image}` : makePlaceholder(work.category);
  modalImg.src = imgSrc;
  modalImg.alt = work.title;
  modalCategory.textContent = work.category;
  modalDate.textContent = work.date;
  modalTitle.textContent = work.title;
  modalPlace.textContent = work.place;
  modalDesc.textContent = work.description;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ============================================================
// 簡単見積もりツール
// ============================================================
const estimateForm = document.getElementById('estimate-form');
const estimateResult = document.getElementById('estimate-result');

const BASE_UNIT = {
  '足場仮設':       { unit: '㎡', low: 600,  high: 1200 },
  '土工事':         { unit: '㎥', low: 2500, high: 5000 },
  'コンクリート工事':{ unit: '㎥', low: 15000,high: 28000},
  '外構工事':       { unit: '㎡', low: 8000, high: 18000},
  '解体工事':       { unit: '㎡', low: 5000, high: 10000},
};

const OPTION_RATE = {
  night:  0.30,
  urgent: 0.20,
};

function calcEstimate() {
  const type = document.getElementById('est-type').value;
  const scale = parseFloat(document.getElementById('est-scale').value);
  const night = document.getElementById('est-night').checked;
  const urgent = document.getElementById('est-urgent').checked;

  if (!type || isNaN(scale) || scale <= 0) {
    estimateResult.innerHTML = '<p class="est-error">工事種別と規模（正の数）を入力してください。</p>';
    estimateResult.classList.add('visible');
    return;
  }

  const base = BASE_UNIT[type];
  let low = base.low * scale;
  let high = base.high * scale;
  let additions = [];

  if (night) {
    low  *= 1 + OPTION_RATE.night;
    high *= 1 + OPTION_RATE.night;
    additions.push('夜間工事割増 +30%');
  }
  if (urgent) {
    low  *= 1 + OPTION_RATE.urgent;
    high *= 1 + OPTION_RATE.urgent;
    additions.push('急ぎ対応割増 +20%');
  }

  const fmt = n => Math.round(n / 1000) * 1000;
  const addTxt = additions.length ? `<p class="est-additions">適用オプション: ${additions.join(' / ')}</p>` : '';

  estimateResult.innerHTML = `
    <p class="est-type-label">${type}（${scale}${base.unit}）</p>
    ${addTxt}
    <p class="est-range">概算金額レンジ</p>
    <p class="est-amount">${fmt(low).toLocaleString()}円 〜 ${fmt(high).toLocaleString()}円</p>
    <p class="est-note">※ 上記はあくまで目安です。現地条件・仕様により大きく変動します。正式なお見積もりはお問い合わせください。</p>`;
  estimateResult.classList.add('visible');
}

if (estimateForm) {
  estimateForm.addEventListener('submit', e => {
    e.preventDefault();
    calcEstimate();
  });
  // リアルタイム計算
  ['est-type','est-scale','est-night','est-urgent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      if (document.getElementById('est-scale').value) calcEstimate();
    });
  });
}

// ============================================================
// お問い合わせフォームバリデーション
// ============================================================
const contactForm = document.getElementById('contact-form');
const contactMsg  = document.getElementById('contact-message');

function showError(fieldId, msg) {
  const el = document.getElementById(fieldId + '-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePhone(v) { return /^[\d\-\+\(\)\s]{7,}$/.test(v); }

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const name    = contactForm.querySelector('[name="name"]').value.trim();
    const phone   = contactForm.querySelector('[name="phone"]').value.trim();
    const email   = contactForm.querySelector('[name="email"]').value.trim();
    const message = contactForm.querySelector('[name="message"]').value.trim();

    let valid = true;
    if (!name)  { showError('name', 'お名前を入力してください。'); valid = false; }
    if (!phone) { showError('phone', '電話番号を入力してください。'); valid = false; }
    else if (!validatePhone(phone)) { showError('phone', '正しい電話番号を入力してください。'); valid = false; }
    if (!email) { showError('email', 'メールアドレスを入力してください。'); valid = false; }
    else if (!validateEmail(email)) { showError('email', '正しいメールアドレスを入力してください。'); valid = false; }
    if (!message) { showError('message', 'お問い合わせ内容を入力してください。'); valid = false; }
    if (!valid) return;

    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    if (CONTACT_ENDPOINT) {
      try {
        const res = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, phone, email,
            company: contactForm.querySelector('[name="company"]').value.trim(),
            message }),
        });
        if (res.ok) {
          contactMsg.textContent = 'お問い合わせを受け付けました。担当者より2〜3営業日以内にご連絡いたします。';
          contactMsg.className = 'contact-msg success';
          contactForm.reset();
        } else {
          throw new Error('送信エラー');
        }
      } catch {
        contactMsg.textContent = '送信に失敗しました。お手数ですがお電話でお問い合わせください。';
        contactMsg.className = 'contact-msg error';
      }
    } else {
      // CONTACT_ENDPOINT未設定時のデモ動作
      contactMsg.textContent = '（デモ）送信内容を確認しました。実運用時は CONTACT_ENDPOINT を設定してください。';
      contactMsg.className = 'contact-msg demo';
      contactForm.reset();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = '送信する';
    contactMsg.style.display = 'block';
  });
}

// ============================================================
// 会社概要マップ タブ切替
// ============================================================
const mapTabs = document.querySelectorAll('.map-tab');
const mapPanels = document.querySelectorAll('.map-panel');

mapTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    mapTabs.forEach(t => t.classList.remove('active'));
    mapPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById(tab.dataset.target);
    if (target) target.classList.add('active');
  });
});

// ============================================================
// スクロールフェードイン
// ============================================================
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => fadeObserver.observe(el));

// ============================================================
// 初期化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
});
renderWorks();
