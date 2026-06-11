// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxxxx"）
const CONTACT_ENDPOINT = "";

/* ============================================================
   ナビゲーション / ハンバーガーメニュー
   ============================================================ */
(function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.nav-link');

  function openMenu() {
    hamburger.classList.add('active');
    navMenu.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', function () {
    if (navMenu.classList.contains('open')) closeMenu();
    else openMenu();
  });

  if (overlay) overlay.addEventListener('click', closeMenu);

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // スクロールでヘッダー背景変化
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
})();

/* ============================================================
   施工実績 描画
   ============================================================ */
(function () {
  const container = document.getElementById('works-grid');
  if (!container || typeof WORKS === 'undefined') return;

  // カテゴリ別カラー（和色）
  const categoryColors = {
    '足場仮設':     { bg: '#4a3728', text: '#f5f0e8' },
    '土工事':       { bg: '#5c4a1e', text: '#f5f0e8' },
    'コンクリート工事': { bg: '#2d3a2e', text: '#f5f0e8' },
    '外構工事':     { bg: '#1a3a4a', text: '#f5f0e8' },
    '解体工事':     { bg: '#4a2828', text: '#f5f0e8' },
  };

  // プレースホルダーSVG生成
  function makePlaceholder(category) {
    const col = categoryColors[category] || { bg: '#3a3530', text: '#f5f0e8' };
    const bg = col.bg;
    const fg = col.text;
    // SVGをBase64 Data URIに
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="${bg}"/>
  <text x="300" y="180" font-family="serif" font-size="28" fill="${fg}" text-anchor="middle" opacity="0.7">${category}</text>
  <text x="300" y="230" font-family="serif" font-size="16" fill="${fg}" text-anchor="middle" opacity="0.5">施工実績</text>
  <line x1="200" y1="260" x2="400" y2="260" stroke="${fg}" stroke-width="1" opacity="0.3"/>
</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  WORKS.forEach(function (work, idx) {
    const imgSrc = work.image ? ('images/' + work.image) : makePlaceholder(work.category);
    const card = document.createElement('article');
    card.className = 'work-card';
    card.setAttribute('data-idx', idx);
    card.innerHTML = `
      <div class="work-card__img-wrap">
        <img src="${imgSrc}" alt="${work.title}" loading="lazy">
        <span class="work-card__cat">${work.category}</span>
      </div>
      <div class="work-card__body">
        <p class="work-card__date">${work.date}</p>
        <h3 class="work-card__title">${work.title}</h3>
        <p class="work-card__place"><span class="icon-pin">📍</span>${work.place}</p>
      </div>
    `;
    card.addEventListener('click', function () { openModal(idx); });
    container.appendChild(card);
  });

  // モーダル
  const modal = document.getElementById('works-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCat = document.getElementById('modal-cat');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');

  function openModal(idx) {
    const work = WORKS[idx];
    const imgSrc = work.image ? ('images/' + work.image) : makePlaceholder(work.category);
    modalImg.src = imgSrc;
    modalImg.alt = work.title;
    modalCat.textContent = work.category;
    modalTitle.textContent = work.title;
    modalMeta.textContent = work.date + '　' + work.place;
    modalDesc.textContent = work.description;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();

/* ============================================================
   簡単見積もりツール
   ============================================================ */
(function () {
  const form = document.getElementById('estimate-form');
  const resultBox = document.getElementById('estimate-result');
  if (!form || !resultBox) return;

  // 単価テーブル（円/㎡ or 円/階）
  const unitPrices = {
    '足場仮設':       { unit: '㎡', price: 1200,  label: '足場面積' },
    '土工事':         { unit: '㎡', price: 3500,  label: '施工面積' },
    'コンクリート工事': { unit: 'm³', price: 35000, label: '打設量' },
    '外構工事':       { unit: '㎡', price: 8000,  label: '施工面積' },
    '解体工事':       { unit: '㎡', price: 15000, label: '延床面積' },
  };
  const optionMultipliers = {
    '夜間工事': 1.3,
    '急ぎ対応': 1.2,
    '高所作業（10m以上）': 1.15,
  };

  // フォームの工事種別に応じて単位ラベルを動的変更
  const typeSelect = document.getElementById('est-type');
  const scaleLabel = document.getElementById('est-scale-label');
  const scaleInput = document.getElementById('est-scale');

  if (typeSelect) {
    typeSelect.addEventListener('change', function () {
      const info = unitPrices[typeSelect.value];
      if (info && scaleLabel) scaleLabel.textContent = info.label + '（' + info.unit + '）';
    });
    // 初期化
    const initInfo = unitPrices[typeSelect.value];
    if (initInfo && scaleLabel) scaleLabel.textContent = initInfo.label + '（' + initInfo.unit + '）';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const type = typeSelect ? typeSelect.value : '';
    const scale = parseFloat(scaleInput ? scaleInput.value : 0) || 0;
    const optionCheckboxes = form.querySelectorAll('.est-option:checked');

    const info = unitPrices[type];
    if (!info || scale <= 0) {
      resultBox.innerHTML = '<p class="est-warn">工事種別と規模を正しく入力してください。</p>';
      resultBox.classList.add('visible');
      return;
    }

    let multiplier = 1.0;
    let selectedOpts = [];
    optionCheckboxes.forEach(function (cb) {
      const m = optionMultipliers[cb.value];
      if (m) { multiplier *= m; selectedOpts.push(cb.value); }
    });

    const base = scale * info.price;
    const low  = Math.round(base * multiplier * 0.85 / 1000) * 1000;
    const high = Math.round(base * multiplier * 1.15 / 1000) * 1000;

    const fmt = function (n) { return n.toLocaleString('ja-JP'); };

    resultBox.innerHTML = `
      <div class="est-result-inner">
        <p class="est-label">概算見積り金額（税込目安）</p>
        <p class="est-amount">¥${fmt(Math.round(low*1.1))} 〜 ¥${fmt(Math.round(high*1.1))}</p>
        <p class="est-detail">工事種別：${type}　／　規模：${scale}${info.unit}${selectedOpts.length ? '　／　オプション：' + selectedOpts.join('・') : ''}</p>
        <p class="est-disclaimer">※あくまで目安です。現場状況・仕様・工期等により変動します。<br>正式なお見積もりはお問い合わせください。</p>
      </div>
    `;
    resultBox.classList.add('visible');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();

/* ============================================================
   お問い合わせフォーム
   ============================================================ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('[name="name"]'),    msg: '氏名を入力してください。' },
    tel:     { el: form.querySelector('[name="tel"]'),     msg: '電話番号を入力してください。' },
    email:   { el: form.querySelector('[name="email"]'),   msg: 'メールアドレスを正しく入力してください。' },
    content: { el: form.querySelector('[name="content"]'), msg: 'お問い合わせ内容を入力してください。' },
  };

  function showError(el, msg) {
    const err = el.parentElement.querySelector('.field-error');
    if (err) { err.textContent = msg; err.style.display = 'block'; }
    el.classList.add('input-error');
  }
  function clearError(el) {
    const err = el.parentElement.querySelector('.field-error');
    if (err) { err.textContent = ''; err.style.display = 'none'; }
    el.classList.remove('input-error');
  }

  // リアルタイムクリア
  Object.values(fields).forEach(function (f) {
    if (f.el) f.el.addEventListener('input', function () { clearError(f.el); });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    let valid = true;

    // 氏名
    if (!fields.name.el.value.trim()) { showError(fields.name.el, fields.name.msg); valid = false; }
    else clearError(fields.name.el);

    // 電話
    if (!fields.tel.el.value.trim()) { showError(fields.tel.el, fields.tel.msg); valid = false; }
    else clearError(fields.tel.el);

    // メール
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(fields.email.el.value.trim())) { showError(fields.email.el, fields.email.msg); valid = false; }
    else clearError(fields.email.el);

    // 内容
    if (!fields.content.el.value.trim()) { showError(fields.content.el, fields.content.msg); valid = false; }
    else clearError(fields.content.el);

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中…';

    if (CONTACT_ENDPOINT) {
      try {
        const data = new FormData(form);
        const res = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          showSuccess();
        } else {
          alert('送信に失敗しました。お手数ですが、お電話にてご連絡ください。');
          submitBtn.disabled = false;
          submitBtn.textContent = '送信する';
        }
      } catch (err) {
        alert('通信エラーが発生しました。お手数ですが、お電話にてご連絡ください。');
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
      }
    } else {
      // デモ動作
      setTimeout(function () {
        showSuccess('（デモ）送信内容を確認しました。実運用時は CONTACT_ENDPOINT を設定してください。');
      }, 800);
    }
  });

  function showSuccess(msg) {
    const successEl = document.getElementById('contact-success');
    if (successEl) {
      successEl.textContent = msg || 'お問い合わせを承りました。担当者よりご連絡いたします。';
      successEl.style.display = 'block';
    }
    form.style.display = 'none';
  }
})();

/* ============================================================
   Googleマップ タブ切替
   ============================================================ */
(function () {
  const tabs = document.querySelectorAll('.map-tab');
  const panes = document.querySelectorAll('.map-pane');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panes.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });
})();

/* ============================================================
   スクロールアニメーション（Intersection Observer）
   ============================================================ */
(function () {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   現在年をフッターに表示
   ============================================================ */
(function () {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
