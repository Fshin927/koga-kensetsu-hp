// ============================================================
// 株式会社公雅建設 コーポレートサイト 共通スクリプト
// ============================================================

// お問い合わせフォームの送信先。
// Formspree等のURL（例: "https://formspree.io/f/xxxxxxxx"）を設定すると実送信されます。
// 空のままの場合はデモ動作（送信内容の確認メッセージ表示）になります。
const CONTACT_ENDPOINT = "";

initLoader();

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initNav();
  initReveal();
  initHeroSlideshow();
  initWorks();
  initModal();
  initForm();
});

// ------------------------------------------------------------
// ローディング演出（クレーンがロゴを吊り上げる）
// 同一セッション中の2ページ目以降はスキップ
// ------------------------------------------------------------
function initLoader() {
  const run = () => {
    const loader = document.getElementById("loader");
    if (!loader) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = !!sessionStorage.getItem("kougaLoaded"); } catch (e) { /* プライベートモード等 */ }
    if (seen || reduced) {
      loader.remove();
      document.body.classList.remove("is-loading");
      return;
    }
    document.body.classList.add("is-loading");
    try { sessionStorage.setItem("kougaLoaded", "1"); } catch (e) { /* 無視 */ }
    setTimeout(() => {
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      setTimeout(() => loader.remove(), 800);
    }, 2400);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}

// ------------------------------------------------------------
// ヒーロー スライドショー（クロスフェード＋ゆっくりズーム）
// ------------------------------------------------------------
function initHeroSlideshow() {
  const slides = document.querySelectorAll(".hero__slide");
  if (slides.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
  }, 6500);
}

// ------------------------------------------------------------
// ヘッダー: スクロールで紙色の背景に切り替え
// ------------------------------------------------------------
function initHeader() {
  const header = document.querySelector(".header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ------------------------------------------------------------
// ナビゲーション: ハンバーガー開閉 + 現在ページのハイライト
// ------------------------------------------------------------
function initNav() {
  const btn = document.querySelector(".menu-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".gnav a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("nav-open"))
    );
  }
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".gnav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current) a.classList.add("is-current");
  });
}

// ------------------------------------------------------------
// スクロール表示アニメーション
// ------------------------------------------------------------
function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((t) => io.observe(t));
}

// ------------------------------------------------------------
// 施工実績: works-data.js の WORKS 配列から描画
//   #works-grid        … 一覧（施工実績ページ / data-limit で件数制限可）
//   .works-filter      … カテゴリ絞り込みボタン（施工実績ページ）
// ------------------------------------------------------------
function placeholderImage(category) {
  // 画像未登録の実績用: カテゴリ名入りのプレースホルダーを生成（和紙トーン）
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">` +
    `<rect width="640" height="400" fill="#2e2820"/>` +
    `<g stroke="#f2e9d6" stroke-opacity=".07"><path d="M0 100H640M0 200H640M0 300H640M107 0V400M214 0V400M321 0V400M428 0V400M535 0V400"/></g>` +
    `<path d="M320 150 L354 184 L320 218 L286 184 Z" fill="none" stroke="#b3492e" stroke-width="4"/>` +
    `<text x="320" y="262" text-anchor="middle" fill="#f2e9d6" fill-opacity=".9" font-family="serif" font-size="24" font-weight="bold">${category}</text>` +
    `<text x="320" y="292" text-anchor="middle" fill="#f2e9d6" fill-opacity=".45" font-family="serif" font-size="13">株式会社公雅建設</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function workImageSrc(w) {
  return w.image ? "images/" + w.image : placeholderImage(w.category);
}

function workMeta(w) {
  return [w.place, w.date].filter(Boolean).join("｜");
}

function initWorks() {
  const grid = document.getElementById("works-grid");
  if (!grid || typeof WORKS === "undefined") return;

  const limit = parseInt(grid.dataset.limit || "0", 10);
  const render = (category) => {
    let list = WORKS.slice();
    if (category && category !== "all") list = list.filter((w) => w.category === category);
    if (limit > 0) list = list.slice(0, limit);
    grid.innerHTML = list
      .map(
        (w) => `
      <button type="button" class="work-card reveal is-visible" data-work-index="${WORKS.indexOf(w)}">
        <div class="work-card__img"><img src="${workImageSrc(w)}" alt="${w.title}" loading="lazy"></div>
        <div class="work-card__body">
          <span class="work-card__cat">${w.category}</span>
          <h3 class="work-card__title">${w.title}</h3>
          <p class="work-card__meta">${workMeta(w)}</p>
        </div>
      </button>`
      )
      .join("");
  };
  render("all");

  const filter = document.querySelector(".works-filter");
  if (filter) {
    // カテゴリボタンを WORKS のデータから自動生成
    const cats = [...new Set(WORKS.map((w) => w.category))];
    filter.innerHTML =
      `<button type="button" class="is-active" data-cat="all">すべて</button>` +
      cats.map((c) => `<button type="button" data-cat="${c}">${c}</button>`).join("");
    filter.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-cat]");
      if (!btn) return;
      filter.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render(btn.dataset.cat);
    });
  }
}

// ------------------------------------------------------------
// 実績詳細モーダル
// ------------------------------------------------------------
function initModal() {
  const modal = document.getElementById("work-modal");
  if (!modal) return;
  const img = modal.querySelector(".modal__img img");
  const cat = modal.querySelector(".modal__cat");
  const title = modal.querySelector(".modal__title");
  const meta = modal.querySelector(".modal__meta");
  const desc = modal.querySelector(".modal__desc");

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".work-card");
    if (card) {
      const w = WORKS[parseInt(card.dataset.workIndex, 10)];
      if (!w) return;
      img.src = workImageSrc(w);
      img.alt = w.title;
      cat.textContent = w.category;
      title.textContent = w.title;
      meta.textContent = workMeta(w);
      desc.textContent = w.description;
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      return;
    }
    if (e.target.closest(".modal__close") || e.target.classList.contains("modal__overlay")) {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  });
}

// ------------------------------------------------------------
// お問い合わせフォーム: バリデーション + 送信
// ------------------------------------------------------------
function initForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const result = form.querySelector(".form__result");

  const validators = {
    name: (v) => (v.trim() ? "" : "お名前を入力してください。"),
    tel: (v) => {
      if (!v.trim()) return "電話番号を入力してください。";
      return /^[0-9+\-() ]{10,15}$/.test(v.trim()) ? "" : "電話番号の形式が正しくありません。";
    },
    email: (v) => {
      if (!v.trim()) return "メールアドレスを入力してください。";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "メールアドレスの形式が正しくありません。";
    },
    message: (v) => (v.trim() ? "" : "お問い合わせ内容を入力してください。"),
  };

  const validateField = (field) => {
    const row = field.closest(".form__row");
    const fn = validators[field.name];
    if (!fn || !row) return true;
    const msg = fn(field.value);
    row.classList.toggle("has-error", !!msg);
    const err = row.querySelector(".form__error");
    if (err) err.textContent = msg;
    return !msg;
  };

  form.querySelectorAll("input, textarea").forEach((f) =>
    f.addEventListener("blur", () => validateField(f))
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("input, textarea").forEach((f) => {
      if (!validateField(f)) ok = false;
    });
    if (!ok) {
      form.querySelector(".has-error input, .has-error textarea")?.focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    if (CONTACT_ENDPOINT) {
      try {
        const res = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error("send failed");
        showResult(result, "お問い合わせありがとうございます。内容を確認のうえ、担当者よりご連絡いたします。", false);
        form.reset();
      } catch {
        showResult(result, "送信に失敗しました。お手数ですが、時間をおいて再度お試しいただくか、メールにて直接ご連絡ください。", true);
      }
    } else {
      // デモ動作
      showResult(
        result,
        "（デモ）送信内容を確認しました。実運用時は js/main.js の CONTACT_ENDPOINT にフォーム送信先URLを設定してください。",
        false
      );
      form.reset();
    }
    btn.disabled = false;
  });
}

function showResult(el, message, isError) {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("is-error", isError);
  el.classList.add("is-visible");
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
