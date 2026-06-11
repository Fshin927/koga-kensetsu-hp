// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxxxx"）
const CONTACT_ENDPOINT = "";

/* ============================================================
   ナビゲーション
   ============================================================ */
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

// スクロールでヘッダー背景変更
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ハンバーガーメニュー
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

// メニューリンク押下で閉じる
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

/* ============================================================
   スクロールフェードイン (Intersection Observer)
   ============================================================ */
const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeElements.forEach(el => fadeObserver.observe(el));

/* ============================================================
   施工実績の描画
   ============================================================ */
const CATEGORY_COLORS = {
  '足場仮設':       '#b8892a',
  '杭打ち':         '#7a9e7e',
  '解体工事':       '#8b4513',
  '外構工事':       '#4a6fa5',
  '土工事':         '#7b7b4a',
  'コンクリート工事': '#6b6b8a',
};

function makePlaceholderSVG(category) {
  const color = CATEGORY_COLORS[category] || '#888';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#1a1a1a"/>
    <rect x="0" y="0" width="600" height="4" fill="${color}"/>
    <rect x="0" y="396" width="600" height="4" fill="${color}"/>
    <text x="300" y="185" font-family="sans-serif" font-size="48" fill="${color}" text-anchor="middle" opacity="0.6">⚙</text>
    <text x="300" y="240" font-family="sans-serif" font-size="18" fill="#ccc" text-anchor="middle">${category}</text>
    <text x="300" y="270" font-family="sans-serif" font-size="13" fill="#777" text-anchor="middle">画像準備中</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function renderWorks() {
  const grid = document.getElementById('works-grid');
  if (!grid) return;

  WORKS.forEach((work, i) => {
    const imgSrc = work.image ? `images/${work.image}` : makePlaceholderSVG(work.category);
    const card = document.createElement('article');
    card.className = 'work-card fade-in';
    card.style.transitionDelay = `${(i % 3) * 0.1}s`;
    card.innerHTML = `
      <div class="work-card__img-wrap">
        <img src="${imgSrc}" alt="${work.title}" loading="lazy">
        <span class="work-card__category">${work.category}</span>
      </div>
      <div class="work-card__body">
        <p class="work-card__date">${work.date} ／ ${work.place}</p>
        <h3 class="work-card__title">${work.title}</h3>
        <p class="work-card__desc">${work.description}</p>
      </div>
    `;
    card.addEventListener('click', () => openModal(work));
    grid.appendChild(card);
  });

  // 追加したカードにもオブザーバー適用
  document.querySelectorAll('.work-card.fade-in').forEach(el => fadeObserver.observe(el));
}

/* ============================================================
   モーダル
   ============================================================ */
const modal = document.getElementById('work-modal');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalCategory = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalDesc = document.getElementById('modal-desc');

function openModal(work) {
  const imgSrc = work.image ? `images/${work.image}` : makePlaceholderSVG(work.category);
  modalImg.src = imgSrc;
  modalImg.alt = work.title;
  modalCategory.textContent = work.category;
  modalTitle.textContent = work.title;
  modalMeta.textContent = `${work.date}　|　${work.place}`;
  modalDesc.textContent = work.description;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal() {
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ============================================================
   簡単見積もりツール
   ============================================================ */
const ESTIMATE_RATES = {
  '足場仮設':       { unit: '㎡', basePrice: 800,  label: '設置面積' },
  '土工事':         { unit: '㎡', basePrice: 3500, label: '掘削面積' },
  'コンクリート工事':{ unit: '㎥', basePrice: 45000,label: '打設量' },
  '外構工事':       { unit: '㎡', basePrice: 12000, label: '施工面積' },
  '解体工事':       { unit: '㎡', basePrice: 15000, label: '解体面積' },
  '杭打ち工事':     { unit: '本', basePrice: 180000,label: '本数' },
};

const estimateType = document.getElementById('estimate-type');
const estimateUnit = document.getElementById('estimate-unit');
const estimateSize = document.getElementById('estimate-size');
const estimateSizeLabel = document.getElementById('estimate-size-label');
const estimateNight = document.getElementById('estimate-night');
const estimateUrgent = document.getElementById('estimate-urgent');
const estimateResult = document.getElementById('estimate-result');
const estimateRange = document.getElementById('estimate-range');
const estimateBtn = document.getElementById('estimate-btn');

function updateEstimateUnit() {
  const rate = ESTIMATE_RATES[estimateType.value];
  if (rate) {
    estimateUnit.textContent = rate.unit;
    estimateSizeLabel.textContent = rate.label + '（' + rate.unit + '）';
  }
}

estimateType.addEventListener('change', () => {
  updateEstimateUnit();
  estimateResult.style.display = 'none';
});

estimateBtn.addEventListener('click', () => {
  const type = estimateType.value;
  const size = parseFloat(estimateSize.value);
  if (!size || size <= 0) {
    estimateSize.focus();
    estimateSize.classList.add('error');
    return;
  }
  estimateSize.classList.remove('error');

  const rate = ESTIMATE_RATES[type];
  let base = rate.basePrice * size;
  if (estimateNight.checked) base *= 1.3;
  if (estimateUrgent.checked) base *= 1.2;

  const low = Math.round(base * 0.85 / 10000) * 10000;
  const high = Math.round(base * 1.15 / 10000) * 10000;

  estimateRange.textContent =
    low.toLocaleString() + '円 〜 ' + high.toLocaleString() + '円（税抜）';
  estimateResult.style.display = 'block';
  estimateResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

updateEstimateUnit();

/* ============================================================
   Googleマップ タブ切替
   ============================================================ */
const mapTabs = document.querySelectorAll('.map-tab');
const mapPanels = document.querySelectorAll('.map-panel');

mapTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    mapTabs.forEach(t => t.classList.remove('active'));
    mapPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

/* ============================================================
   お問い合わせフォームバリデーション
   ============================================================ */
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

function validateForm(data) {
  const errors = [];
  if (!data.name.trim()) errors.push('お名前を入力してください。');
  if (!data.phone.trim() && !data.email.trim())
    errors.push('電話番号またはメールアドレスのいずれかを入力してください。');
  if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push('メールアドレスの形式が正しくありません。');
  if (data.phone.trim() && !/^[\d\-\(\)\+\s]{7,15}$/.test(data.phone))
    errors.push('電話番号の形式が正しくありません。');
  if (!data.message.trim()) errors.push('お問い合わせ内容を入力してください。');
  return errors;
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name:    contactForm.name.value,
    company: contactForm.company.value,
    phone:   contactForm.phone.value,
    email:   contactForm.email.value,
    message: contactForm.message.value,
  };

  const errors = validateForm(data);
  if (errors.length) {
    showStatus('error', errors.join('\n'));
    return;
  }

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '送信中…';

  if (!CONTACT_ENDPOINT) {
    // デモモード
    setTimeout(() => {
      showStatus('success',
        '（デモ）送信内容を確認しました。実運用時はCONTACT_ENDPOINTを設定してください。');
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }, 800);
    return;
  }

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showStatus('success', 'お問い合わせを受け付けました。\n担当者より折り返しご連絡いたします。');
      contactForm.reset();
    } else {
      throw new Error('送信失敗');
    }
  } catch {
    showStatus('error', '送信に失敗しました。時間をおいて再度お試しください。\nまたはお電話にてお問い合わせください。');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = '送信する';
});

function showStatus(type, message) {
  contactStatus.className = 'contact-status ' + type;
  contactStatus.textContent = message;
  contactStatus.style.display = 'block';
  contactStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   初期化
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderWorks();
});
