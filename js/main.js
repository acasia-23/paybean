(function () {
  "use strict";

  /* ============ Utilities ============ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const toManwon = (n) => {
    const man = n / 10000;
    return (Number.isInteger(man) ? man : Math.round(man * 10) / 10) + "만원";
  };

  /* ============ Mobile navigation ============ */
  const navToggle = $("#navToggle");
  const mobileNav = $("#mobileNav");
  const navScrim = $("#navScrim");

  function closeNav() {
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    navScrim.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function openNav() {
    navToggle.setAttribute("aria-expanded", "true");
    mobileNav.classList.add("is-open");
    navScrim.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeNav() : openNav();
    });
    navScrim.addEventListener("click", closeNav);
    $$("#mobileNav a").forEach((a) => a.addEventListener("click", closeNav));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ============ Top promo strip dismiss ============ */
  const topStrip = $("#topStrip");
  const topStripClose = $("#topStripClose");
  if (topStrip && topStripClose) {
    topStripClose.addEventListener("click", () => topStrip.classList.add("is-hidden"));
  }

  /* ============ Active nav link (current page) ============ */
  const currentFile = (location.pathname.split("/").pop() || "index.html") || "index.html";
  $$(".main-nav a, .mobile-nav a, .app-tabbar-item").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const hrefFile = href.split("/").pop();
    if (hrefFile === currentFile || (currentFile === "" && hrefFile === "index.html")) {
      a.classList.add("is-active");
    }
  });

  /* ============ Sticky header shrink shadow on scroll ============ */
  const header = $("#siteHeader");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        header.style.boxShadow = window.scrollY > 8 ? "0 4px 20px rgba(23,62,43,.06)" : "none";
      },
      { passive: true }
    );
  }

  /* ============ Scroll reveal ============ */
  const revealEls = $$(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ============ Scroll to top button ============ */
  const scrollTopBtn = $("#scrollTop");
  if (scrollTopBtn) {
    window.addEventListener(
      "scroll",
      () => {
        scrollTopBtn.classList.toggle("is-visible", window.scrollY > 480);
      },
      { passive: true }
    );
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============ Benefit calculator (+ syncs sticky bottom bar) ============ */
  const rentSlider = $("#rentSlider");
  const rentValueLabel = $("#rentValueLabel");
  const incomeSelect = $("#incomeSelect");
  const totalBenefitEl = $("#totalBenefit");
  const taxCreditValueEl = $("#taxCreditValue");
  const cardBenefitValueEl = $("#cardBenefitValue");
  const taxCreditRow = $("#taxCreditRow");
  const calcDisclaimer = $("#calcDisclaimer");
  const stickyBarValue = $("#stickyBarValue");

  const RENT_TAX_CREDIT_CAP = 10000000; // 연간 월세 세액공제 인정 한도(국세청 기준)
  const CARD_BENEFIT_RATE = 0.05; // 예시 카드 적립률

  function pulse(el) {
    if (!el) return;
    el.classList.remove("is-pulsing");
    void el.offsetWidth;
    el.classList.add("is-pulsing");
  }

  function calculateBenefit() {
    if (!rentSlider || !incomeSelect) return;
    const rent = Number(rentSlider.value);
    const currentRate = Number(incomeSelect.value);
    if (rentValueLabel) rentValueLabel.textContent = toManwon(rent);

    const annualRent = Math.min(rent * 12, RENT_TAX_CREDIT_CAP);
    const taxCredit = currentRate > 0 ? annualRent * (currentRate / 100) : 0;
    const cardBenefit = rent * 12 * CARD_BENEFIT_RATE;
    const total = taxCredit + cardBenefit;

    if (totalBenefitEl) totalBenefitEl.textContent = toManwon(total);
    if (cardBenefitValueEl) cardBenefitValueEl.textContent = toManwon(cardBenefit);
    if (stickyBarValue) stickyBarValue.textContent = toManwon(total);

    if (taxCreditRow && taxCreditValueEl && calcDisclaimer) {
      if (currentRate > 0) {
        taxCreditRow.classList.remove("is-muted");
        taxCreditValueEl.textContent = toManwon(taxCredit);
        calcDisclaimer.textContent =
          "위 금액은 국세청 월세 세액공제 기준과 예시 카드 적립률(5%)로 계산한 참고용 수치이며, 카드사·소득 조건에 따라 실제 혜택은 달라질 수 있어요.";
      } else {
        taxCreditValueEl.textContent = "해당없음";
        taxCreditRow.classList.add("is-muted");
        calcDisclaimer.textContent =
          "총급여 8,000만원 초과 구간은 월세 세액공제 대상이 아니며, 대신 신용카드 등 사용액 소득공제를 활용할 수 있어요. 위 카드 혜택은 예시 적립률(5%) 기준 참고용 수치예요.";
      }
    }

    pulse(totalBenefitEl);
    pulse(stickyBarValue);
  }

  if (rentSlider && incomeSelect) {
    rentSlider.addEventListener("input", calculateBenefit);
    incomeSelect.addEventListener("change", calculateBenefit);
    calculateBenefit();
  }

  /* ============ Count-up numbers on scroll reveal ============ */
  const countEls = $$("[data-count-to]");
  if (countEls.length && "IntersectionObserver" in window) {
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          countIo.unobserve(el);
          const target = Number(el.dataset.countTo);
          const suffix = el.dataset.suffix || "";
          const duration = 900;
          const start = performance.now ? performance.now() : Date.now();
          function tick(now) {
            const elapsed = (now - start) / duration;
            const progress = Math.min(1, elapsed);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = (target * eased).toFixed(1);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    countEls.forEach((el) => countIo.observe(el));
  }

  /* ============ Reviews (sample data, clearly labeled as design samples) ============ */
  const reviewsTrack = $("#reviewsTrack");
  if (reviewsTrack) {
    const sampleReviews = [
      {
        tag: "월세페이",
        stars: 5,
        date: "2026.07.20",
        text: "계산기 두드리는 걸 좋아하는 성격이라 시작 전에 시뮬레이션부터 돌렸습니다. 월세 62만에 수수료 약 3만, 카드 적립만 넣으면 근소하게 마이너스였는데 실적으로 연회비 면제받는 것까지 넣으니 플러스로 뒤집히더라고요.",
        meta: "ai****님 후기 중",
      },
      {
        tag: "월세페이",
        stars: 5,
        date: "2026.07.18",
        text: "엄마 환갑 여행 보내드리느라 3월에 지출이 컸는데, 마침 그 달에 자동차 보험 갱신까지 겹쳤습니다. 집주인 눈치 볼 필요 없이 내 카드로 조용히 해결된다는 게 이 서비스의 본질인 듯.",
        meta: "nr****님 후기 중",
      },
      {
        tag: "인건비·대금페이",
        stars: 5,
        date: "2026.07.15",
        text: "프리랜서라 인건비 정산할 때마다 엑셀로 따로 정리하는 게 귀찮았는데, 카드결제 내역이 그대로 남으니 세무사한테 넘길 자료 만들기가 훨씬 수월해졌어요.",
        meta: "pk****님 후기 중",
      },
      {
        tag: "인건비·대금페이",
        stars: 4,
        date: "2026.07.11",
        text: "거래처 대금 620만원을 카드로 돌렸는데 무이자 할부 3개월로 나눠서 자금 압박이 덜했습니다. 세금계산서 처리가 살짝 헷갈렸는데 고객센터 답변은 빠르게 왔어요.",
        meta: "js****님 후기 중",
      },
      {
        tag: "카드단말기",
        stars: 5,
        date: "2026.07.05",
        text: "가맹점으로 신청해서 카드단말기 설치받았는데, 온라인·오프라인 결제 건이 대시보드 하나에서 다 보이니 마감 정산이 훨씬 빨라졌어요. 정산도 10분 안에 들어와서 자금 회전이 편해졌습니다.",
        meta: "cy****님 후기 중",
      },
    ];

    const personIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>';

    reviewsTrack.innerHTML = sampleReviews
      .map(
        (r) => `
        <div class="review-item">
          <span class="review-tag-pill">${r.tag}</span>
          <div class="review-top">
            <span class="review-stars" aria-label="${r.stars}점">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span>
            <span class="review-date">${r.date}</span>
          </div>
          <p class="review-text">${r.text}</p>
          <p class="review-meta">${personIcon}${r.meta}</p>
        </div>`
      )
      .join("");
  }

  /* ============ FAQ accordion ============ */
  $$(".accordion-item").forEach((item) => {
    const trigger = $(".accordion-trigger", item);
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      $$(".accordion-item").forEach((other) => {
        other.classList.remove("is-open");
        $(".accordion-trigger", other).setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
