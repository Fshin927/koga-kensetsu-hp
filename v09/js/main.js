// お問い合わせフォームの送信先エンドポイント
// Formspree等のURLを設定すると実送信されます（例: "https://formspree.io/f/xxxxxxxx"）
const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/edberg927@gmail.com"; // FormSubmit経由で edberg927@gmail.com に送信（初回送信時に届く認証メールのリンクをクリックで有効化）

// =============================================
// ハンバーガーメニュー
// =============================================
(function () {
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("global-nav");
  const overlay = document.getElementById("nav-overlay");

  function closeMenu() {
    btn.classList.remove("open");
    nav.classList.remove("open");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  btn.addEventListener("click", function () {
    const isOpen = btn.classList.toggle("open");
    nav.classList.toggle("open", isOpen);
    overlay.classList.toggle("active", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  overlay.addEventListener("click", closeMenu);

  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });
})();

// =============================================
// スムーススクロール
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: "smooth" });
  });
});

// =============================================
// ヘッダースクロール
// =============================================
(function () {
  const header = document.getElementById("site-header");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });
})();

// =============================================
// 施工実績カード描画
// =============================================
(function () {
  const CATEGORY_COLORS = {
    "足場仮設": { bg: "#FFF3E0", accent: "#FF8A00", icon: "🏗️" },
    "解体工事": { bg: "#FCE4EC", accent: "#E53935", icon: "🔨" },
    "外構工事": { bg: "#E8F5E9", accent: "#43A047", icon: "🌿" },
    "土工事": { bg: "#FFF8E1", accent: "#F9A825", icon: "⛏️" },
    "コンクリート工事": { bg: "#E3F2FD", accent: "#1E88E5", icon: "🪨" },
  };

  function makePlaceholderSVG(category, info) {
    const col = CATEGORY_COLORS[category] || { bg: "#F5F0E8", accent: "#8B6914", icon: "🔧" };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
      <rect width="400" height="260" fill="${col.bg}"/>
      <rect x="0" y="220" width="400" height="40" fill="${col.accent}" opacity="0.15"/>
      <circle cx="200" cy="105" r="52" fill="${col.accent}" opacity="0.12"/>
      <text x="200" y="118" font-size="48" text-anchor="middle" dominant-baseline="middle">${col.icon}</text>
      <text x="200" y="175" font-size="16" text-anchor="middle" fill="${col.accent}" font-weight="bold" font-family="sans-serif">${category}</text>
      <text x="200" y="198" font-size="12" text-anchor="middle" fill="#888" font-family="sans-serif">${info.place} | ${info.date}</text>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  const grid = document.getElementById("works-grid");
  if (!grid || typeof WORKS === "undefined") return;

  WORKS.forEach(function (w, i) {
    const imgSrc = w.image ? ("images/" + w.image) : makePlaceholderSVG(w.category, w);

    const card = document.createElement("article");
    card.className = "work-card";
    card.setAttribute("data-index", i);
    card.innerHTML = `
      <div class="work-card__img-wrap">
        <img src="${imgSrc}" alt="${w.title}" loading="lazy">
        <span class="work-card__badge">${w.category}</span>
      </div>
      <div class="work-card__body">
        <h3 class="work-card__title">${w.title}</h3>
        <p class="work-card__meta"><span class="work-card__place">📍 ${w.place}</span><span class="work-card__date">🗓 ${w.date}</span></p>
        <p class="work-card__desc">${w.description.slice(0, 50)}…</p>
      </div>
    `;
    card.addEventListener("click", function () { openModal(i); });
    grid.appendChild(card);
  });

  // モーダル
  const modal = document.getElementById("works-modal");
  const modalBody = document.getElementById("works-modal-body");
  const modalClose = document.getElementById("works-modal-close");

  function openModal(i) {
    const w = WORKS[i];
    const imgSrc = w.image ? ("images/" + w.image) : makePlaceholderSVG(w.category, w);
    modalBody.innerHTML = `
      <img src="${imgSrc}" alt="${w.title}" class="modal-img">
      <div class="modal-content-inner">
        <span class="modal-badge">${w.category}</span>
        <h2 class="modal-title">${w.title}</h2>
        <p class="modal-meta">📍 ${w.place} &nbsp;|&nbsp; 🗓 ${w.date}</p>
        <p class="modal-desc">${w.description}</p>
      </div>
    `;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();

// =============================================
// 簡単見積もり
// =============================================
(function () {
  const UNIT_PRICES = {
    "足場仮設":       { base: 1200,  unit: "㎡",  label: "足場面積" },
    "土工事":         { base: 8000,  unit: "㎥",  label: "掘削・土工量" },
    "コンクリート工事": { base: 15000, unit: "㎥",  label: "コンクリート量" },
    "外構工事":       { base: 18000, unit: "㎡",  label: "施工面積" },
    "解体工事":       { base: 25000, unit: "㎡",  label: "解体面積" },
  };
  const OPTION_MULTIPLIERS = {
    "夜間工事": 1.4,
    "急ぎ対応（2週間以内）": 1.25,
    "仮設電気・水道手配": 1.1,
  };

  const typeSelect = document.getElementById("est-type");
  const scaleInput = document.getElementById("est-scale");
  const scaleLabel = document.getElementById("est-scale-label");
  const scaleUnit  = document.getElementById("est-scale-unit");
  const optionChecks = document.querySelectorAll(".est-option-check");
  const resultArea  = document.getElementById("est-result");
  const calcBtn     = document.getElementById("est-calc-btn");

  if (!typeSelect || !calcBtn) return;

  typeSelect.addEventListener("change", function () {
    const info = UNIT_PRICES[this.value];
    if (info) {
      scaleLabel.textContent = info.label + "（" + info.unit + "）";
      scaleUnit.textContent  = info.unit;
    }
  });

  calcBtn.addEventListener("click", function () {
    const type  = typeSelect.value;
    const scale = parseFloat(scaleInput.value);
    if (!type) { showResult("工事種別を選択してください。", "warn"); return; }
    if (!scale || scale <= 0) { showResult("規模（数値）を入力してください。", "warn"); return; }

    const info = UNIT_PRICES[type];
    let multiplier = 1;
    optionChecks.forEach(function (cb) {
      if (cb.checked) multiplier *= (OPTION_MULTIPLIERS[cb.value] || 1);
    });

    const low  = Math.round(info.base * scale * multiplier * 0.85 / 1000) * 1000;
    const high = Math.round(info.base * scale * multiplier * 1.15 / 1000) * 1000;
    const fmt  = function (n) { return n.toLocaleString("ja-JP"); };

    showResult(
      `<strong>${type}</strong>（${scale}${info.unit}）の概算金額レンジ：<br>
      <span class="est-price">¥${fmt(low)} 〜 ¥${fmt(high)}</span>`,
      "ok"
    );
  });

  function showResult(html, type) {
    resultArea.innerHTML = html;
    resultArea.className = "est-result est-result--" + type;
    resultArea.style.display = "block";
  }
})();

// =============================================
// Googleマップ タブ切替
// =============================================
(function () {
  const tabs = document.querySelectorAll(".map-tab");
  const panels = document.querySelectorAll(".map-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      panels.forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });
})();

// =============================================
// お問い合わせフォーム
// =============================================
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name:    { el: document.getElementById("cf-name"),    msg: document.getElementById("cf-name-err"),    check: function(v){ return v.trim().length > 0; },  err: "お名前を入力してください。" },
    tel:     { el: document.getElementById("cf-tel"),     msg: document.getElementById("cf-tel-err"),     check: function(v){ return /^[\d\-\+\(\) ]{6,20}$/.test(v.trim()); }, err: "正しい電話番号を入力してください。" },
    email:   { el: document.getElementById("cf-email"),   msg: document.getElementById("cf-email-err"),   check: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, err: "正しいメールアドレスを入力してください。" },
    message: { el: document.getElementById("cf-message"), msg: document.getElementById("cf-message-err"), check: function(v){ return v.trim().length >= 10; }, err: "お問い合わせ内容を10文字以上ご入力ください。" },
  };

  // リアルタイムバリデーション
  Object.values(fields).forEach(function (f) {
    f.el.addEventListener("blur", function () { validateField(f); });
    f.el.addEventListener("input", function () {
      if (f.msg.textContent) validateField(f);
    });
  });

  function validateField(f) {
    const ok = f.check(f.el.value);
    f.msg.textContent = ok ? "" : f.err;
    f.el.classList.toggle("invalid", !ok);
    return ok;
  }

  function validateAll() {
    return Object.values(fields).map(validateField).every(Boolean);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateAll()) return;

    const btn = form.querySelector(".contact-submit");
    btn.disabled = true;
    btn.textContent = "送信中…";

    if (CONTACT_ENDPOINT) {
      const data = new FormData(form);
      fetch(CONTACT_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
        .then(function () { showFormSuccess(); })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = "送信する";
          alert("送信に失敗しました。お手数ですが、お電話にてご連絡ください。");
        });
    } else {
      setTimeout(function () {
        showFormSuccess();
        console.log("[デモ] 送信内容を確認しました。実運用時はCONTACT_ENDPOINTを設定してください。");
      }, 800);
    }
  });

  function showFormSuccess() {
    const successMsg = document.getElementById("contact-success");
    form.style.display = "none";
    successMsg.style.display = "block";
  }
})();

// =============================================
// スクロールアニメーション（Intersection Observer）
// =============================================
(function () {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".fade-in").forEach(function (el) {
    observer.observe(el);
  });
})();

// =============================================
// 現在年をフッターに表示
// =============================================
(function () {
  const el = document.getElementById("current-year");
  if (el) el.textContent = new Date().getFullYear();
})();
