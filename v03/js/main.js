// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxxxx"）
const CONTACT_ENDPOINT = "";

/* ============================================================
   ナビゲーション
============================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-overlay');

function openNav() {
  hamburger.classList.add('active');
  navMenu.classList.add('open');
  navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('open');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  navMenu.classList.contains('open') ? closeNav() : openNav();
});
navOverlay.addEventListener('click', closeNav);

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeNav);
});

// スクロールで header に背景色を追加
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* ============================================================
   施工実績 描画
============================================================ */
function getPlaceholderSVG(category) {
  const colors = {
    '足場仮設': ['#1a1a1a', '#FFD700'],
    '土工事':   ['#2a1a00', '#FF8C00'],
    'コンクリート工事': ['#2a2a2a', '#C0C0C0'],
    '外構工事': ['#001a00', '#4CAF50'],
    '解体工事': ['#1a0000', '#FF4444'],
  };
  const [bg, fg] = colors[category] || ['#1a1a1a', '#FFD700'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
    <rect width="400" height="240" fill="${bg}"/>
    <line x1="0" y1="0" x2="400" y2="240" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="40" y1="0" x2="400" y2="280" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="80" y1="0" x2="400" y2="280" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="0" y1="40" x2="360" y2="280" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="0" y1="80" x2="320" y2="280" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="0" y1="120" x2="280" y2="280" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="120" y1="0" x2="400" y2="240" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="160" y1="0" x2="400" y2="200" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <line x1="200" y1="0" x2="400" y2="160" stroke="${fg}" stroke-width="2" opacity="0.15"/>
    <text x="200" y="105" font-family="Arial Black, sans-serif" font-size="15" fill="${fg}" text-anchor="middle" font-weight="900" letter-spacing="2">${category}</text>
    <text x="200" y="135" font-family="Arial Black, sans-serif" font-size="11" fill="${fg}" text-anchor="middle" opacity="0.7">KOGA KENSETSU</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function renderWorks() {
  const grid = document.getElementById('works-grid');
  if (!grid || typeof WORKS === 'undefined') return;

  WORKS.forEach((work, i) => {
    const imgSrc = work.image ? `images/${work.image}` : getPlaceholderSVG(work.category);
    const card = document.createElement('div');
    card.className = 'work-card';
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <div class="work-card__img">
        <img src="${imgSrc}" alt="${work.title}" loading="lazy">
        <span class="work-card__cat">${work.category}</span>
      </div>
      <div class="work-card__body">
        <p class="work-card__date">${work.date} / ${work.place}</p>
        <h3 class="work-card__title">${work.title}</h3>
        <p class="work-card__desc">${work.description.substring(0, 60)}…</p>
        <button class="work-card__btn btn-sub">詳細を見る</button>
      </div>
    `;
    card.querySelector('.work-card__btn').addEventListener('click', () => openModal(i));
    grid.appendChild(card);
  });
}

/* ============================================================
   モーダル
============================================================ */
const modal = document.getElementById('work-modal');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalCat = document.getElementById('modal-cat');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalDesc = document.getElementById('modal-desc');

function openModal(index) {
  const w = WORKS[index];
  const imgSrc = w.image ? `images/${w.image}` : getPlaceholderSVG(w.category);
  modalImg.src = imgSrc;
  modalImg.alt = w.title;
  modalCat.textContent = w.category;
  modalTitle.textContent = w.title;
  modalMeta.textContent = `${w.date} ／ ${w.place}`;
  modalDesc.textContent = w.description;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ============================================================
   簡単見積もり
============================================================ */
const ESTIMATE_RATES = {
  '足場仮設':       { base: 800,  unit: '㎡',  label: '面積（㎡）' },
  '土工事':         { base: 3500, unit: '㎡',  label: '掘削面積（㎡）' },
  'コンクリート工事': { base: 12000, unit: '㎥', label: '打設量（㎥）' },
  '外構工事':       { base: 15000, unit: '㎡',  label: '施工面積（㎡）' },
  '解体工事':       { base: 25000, unit: '㎡',  label: '床面積（㎡）' },
};

const estType  = document.getElementById('est-type');
const estScale = document.getElementById('est-scale');
const estScaleLabel = document.getElementById('est-scale-label');
const estNight = document.getElementById('est-night');
const estUrgent = document.getElementById('est-urgent');
const estBtn   = document.getElementById('est-btn');
const estResult = document.getElementById('est-result');
const estAmount = document.getElementById('est-amount');

function updateScaleLabel() {
  const rate = ESTIMATE_RATES[estType.value];
  if (rate) {
    estScaleLabel.textContent = rate.label;
    estScale.placeholder = `例: 100`;
  }
}

estType.addEventListener('change', updateScaleLabel);
updateScaleLabel();

estBtn.addEventListener('click', () => {
  const rate = ESTIMATE_RATES[estType.value];
  const scale = parseFloat(estScale.value);
  if (!scale || scale <= 0 || !rate) {
    alert('工事種別と規模（数値）を入力してください。');
    return;
  }
  let base = rate.base * scale;
  if (estNight.checked)  base *= 1.25;
  if (estUrgent.checked) base *= 1.20;
  const lo = Math.floor(base * 0.85 / 10000) * 10000;
  const hi = Math.ceil(base * 1.15 / 10000) * 10000;
  estAmount.textContent = `${lo.toLocaleString()}円 〜 ${hi.toLocaleString()}円（税抜き概算）`;
  estResult.style.display = 'block';
  estResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ============================================================
   マップタブ切替
============================================================ */
document.querySelectorAll('.map-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.map-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.map-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

/* ============================================================
   お問い合わせフォーム バリデーション & 送信
============================================================ */
const contactForm = document.getElementById('contact-form');
const formMsg = document.getElementById('form-msg');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  formMsg.className = 'form-msg';

  const name    = document.getElementById('f-name').value.trim();
  const tel     = document.getElementById('f-tel').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const content = document.getElementById('f-content').value.trim();

  const errors = [];
  if (!name)    errors.push('お名前を入力してください。');
  if (!tel && !email) errors.push('電話番号またはメールアドレスのどちらかを入力してください。');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('メールアドレスの形式が正しくありません。');
  if (tel && !/^[0-9\-\+\(\)\s]{10,15}$/.test(tel)) errors.push('電話番号の形式が正しくありません。');
  if (!content) errors.push('お問い合わせ内容を入力してください。');

  if (errors.length > 0) {
    formMsg.textContent = errors.join('\n');
    formMsg.classList.add('form-msg--error');
    return;
  }

  if (CONTACT_ENDPOINT) {
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name,
          company: document.getElementById('f-company').value.trim(),
          tel,
          email,
          content
        })
      });
      if (res.ok) {
        formMsg.textContent = 'お問い合わせを受け付けました。担当者よりご連絡いたします。';
        formMsg.classList.add('form-msg--success');
        contactForm.reset();
      } else {
        throw new Error('送信失敗');
      }
    } catch {
      formMsg.textContent = '送信に失敗しました。お電話でお問い合わせください。';
      formMsg.classList.add('form-msg--error');
    }
  } else {
    // デモモード
    formMsg.textContent = '（デモ）送信内容を確認しました。実運用時はCONTACT_ENDPOINTを設定してください。';
    formMsg.classList.add('form-msg--demo');
    contactForm.reset();
  }
  formMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ============================================================
   初期化
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
});
renderWorks();
