/* 하이유플 리뉴얼 목업 — 첫 화면 · 휴대폰 목록 · 상품 화면 · 출시 전 상품 */
(function () {
  "use strict";
  var H = window.H, D = H.D, C = H.C;

  /* ---------- 첫 화면 ---------- */
  var HOME_SETS = {
    all: [
      { label: "아이폰", pid: 54, ci: 3, to: "#/phones?cat=iphone", f: { group: "iphone" } },
      { label: "갤럭시 S", pid: 37, ci: 0, to: "#/phones?cat=galaxy&series=s26", f: { cats: ["galaxy-s"] } },
      { label: "갤럭시 Z", pid: 51, ci: 0, to: "#/phones?cat=galaxy&series=z8", f: { cats: ["galaxy-z"] } }
    ],
    iphone: [
      { label: "아이폰 18 프로", badge: "pre", pid: 54, ci: 3, to: "#/phones?cat=iphone&series=iphone18", f: { series: "iphone18" } },
      { label: "아이폰 17", pid: 42, ci: 1, to: "#/phones?cat=iphone&series=iphone17", f: { series: "iphone17" } },
      { label: "아이폰 16", pid: 50, ci: 0, to: "#/phones?cat=iphone&series=iphone16", f: { series: "iphone16" } }
    ],
    galaxy: [
      { label: "갤럭시 Z 폴드8 · 플립8", badge: "new", pid: 53, ci: 0, to: "#/phones?cat=galaxy&series=z8", f: { series: "z8" } },
      { label: "갤럭시 S26", pid: 35, ci: 0, to: "#/phones?cat=galaxy&series=s26", f: { series: "s26" } },
      { label: "갤럭시 S25", pid: 47, ci: 0, to: "#/phones?cat=galaxy&series=s25", f: { series: "s25" } }
    ]
  };
  function lowest(f) {
    var list = H.ordered().filter(function (p) { return !p.launch && (!f.group || H.group(p) === f.group) && (!f.cats || f.cats.indexOf(p.cat) >= 0) && (!f.series || p.series === f.series); });
    var min = Infinity;
    list.forEach(function (p) { min = Math.min(min, H.listPrice(p).principal); });
    return { min: min, n: list.length };
  }
  /* 모바일은 두 칸씩이라 세 장이면 한 칸이 빈다 → 네 번째에 «전체 보기» 카드(PC는 시안대로 세 장) */
  var MORE = { all: ["휴대폰 전체 보기", "#/phones", null], iphone: ["아이폰 전체 보기", "#/phones?cat=iphone", "iphone"], galaxy: ["갤럭시 전체 보기", "#/phones?cat=galaxy", "galaxy"] };
  function moreCard(set) {
    var m = MORE[set], n = H.ordered().filter(function (p) { return !m[2] || H.group(p) === m[2]; }).length;
    return `<a class="cat-card cat-card--more mo-only" href="${m[1]}">
      <div class="cat-card__img"><span class="more-n"><b class="num">${n}</b>개 모델</span>${H.icon("arrow", "more-ic")}</div>
      <div class="cat-card__meta"><strong>${m[0]}</strong><span class="link-arrow">모두 보기${H.icon("arrow")}</span></div></a>`;
  }
  function catCards(set) {
    return HOME_SETS[set].map(function (c) {
      var p = H.prod(c.pid), m = lowest(c.f);
      var badge = c.badge ? '<span class="badge badge--' + c.badge + '">' + (c.badge === "pre" ? "사전예약" : "신제품") + "</span>" : "";
      return `<a class="cat-card" href="${c.to}">
        <div class="cat-card__img"><img src="${H.img(p, c.ci)}" alt=""></div>
        <div class="cat-card__meta"><strong>${c.label}${badge}</strong><span class="link-arrow">조건 보기${H.icon("arrow")}</span>
          <p class="cat-card__price prop prop--block">${m.n}개 모델 · 실구매가 <b class="num">${H.won(m.min)}</b>부터</p></div></a>`;
    }).join("") + moreCard(set);
  }

  /* ---------- 첫 화면 배너 — 5초마다 넘김 · 아래 가운데 [‹][멈춤 · 점][›]
   * 모양은 하이폰 · 하이스테이션에 대표가 고른 «② 타이머 캡슐»과 같게. 지금 점 안 막대가 5초 차면 넘어간다 ---------- */
  var BANNERS = [
    { key: "fold8", name: "갤럭시 Z 폴드8 · 시안 첫 배너" },
    { key: "iphone18", name: "아이폰 18 프로 사전예약", theme: "ink", to: "#/phone/54", eyebrow: "사전예약", title: "아이폰 18 프로,<br>지금 예약할 수 있어요", sub: "정식 사전예약 기간에만 받아요.<br>월 납부 금액까지 바로 확인하세요.", pill: "예약하기", img: function () { return H.img(H.prod(54), 3); } },
    { key: "together", name: "휴대폰 + 인터넷 결합", theme: "lav", to: "#/together", eyebrow: "휴대폰 + 인터넷", title: "인터넷도 같이 하면<br>결합 할인이 따로 있어요", sub: "휴대폰 가격은 그대로, 인터넷 요금은<br>속도에 따라 월 5,500~13,200원 할인(3년 약정).", pill: "결합 혜택 보기", icon: "wifi" },
    { key: "partners", name: "하이유플 파트너스", theme: "plum", to: "#/partner", eyebrow: "하이유플 파트너스", title: "링크 하나로<br>소개하고 수수료 받기", sub: "개통 1건당 20,000원 · 가입비 없음", pill: "파트너스 보기", big: "20,000원" }
  ];
  function slideHtml(b, i, n) {
    var head = `<div class="bn__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${n}">`;
    if (b.key === "fold8") {
      return head + `<div class="wrap bn__pc"><section class="hero-card"><div class="hero-card__txt">
    <h1>제품은 새로워도,<br>사는 건 복잡할 필요 없으니까.</h1>
    <p>Galaxy Fold8 Ultra · Wide · Flip8<br>복잡한 조건은 덜고, 필요한 기준만 명확하게.</p>
    <a class="pill" href="#/phones?cat=galaxy&series=z8">구매하기</a></div></section></div>
  <section class="hero-m bn__mo"><div class="hero-m__txt">
    <h1>제품은 새로워도,<br>사는 건 복잡할 필요<br>없으니까.</h1>
    <p>Fold8 Ultra · Wide · Flip8<br>복잡한 조건은 덜고, 필요한 기준만 명확하게.</p>
    <a class="pill" href="#/phones?cat=galaxy&series=z8">구매하기</a></div>
    <img src="img/hero-mo.jpg" width="1080" height="891" alt="라벤더 색 갤럭시 Z 폴드8을 든 손"></section></div>`;
    }
    var art = b.img ? `<img class="bn-img" src="${b.img()}" alt="">` : b.icon ? H.icon(b.icon, "bn-ic") : `<span class="bn-big num" aria-hidden="true">${b.big}</span>`;
    var txt = `<p class="bn-eyebrow">${b.eyebrow}</p><h2>${b.title}</h2><p class="bn-sub">${b.sub}</p><span class="pill">${b.pill}</span>`;
    return head + `<div class="wrap bn__pc"><a class="bn-card bn--${b.theme}" href="${b.to}"><div class="bn-card__txt">${txt}</div>${art}</a></div>
  <a class="bn-m bn__mo bn--${b.theme}" href="${b.to}">${txt}${art}</a></div>`;
  }
  H.BANNERS = BANNERS;
  H.bannerHtml = function () {
    var off = H.state.bannerOff || [], list = BANNERS.filter(function (b) { return off.indexOf(b.key) < 0; });
    if (!list.length) list = BANNERS;
    var n = list.length;
    return `<section class="bn" id="bn" aria-roledescription="carousel" aria-label="이번 달 소식">
  <div class="bn__track" id="bnTrack">${list.map(function (b, i) { return slideHtml(b, i, n); }).join("")}</div>
  <div class="bn-ctl">
    <button type="button" class="bn-arrow" data-act="bnStep" data-v="-1" aria-label="이전 배너">${H.icon("chev-l")}</button>
    <div class="bn-cap"><button type="button" class="bn-pause" data-act="bnPause" aria-label="자동 넘김 멈추기">${H.icon("pause", "ic--pause")}${H.icon("play", "ic--play")}</button>${list.map(function (b, i) {
      return `<button type="button" class="bn-dot" data-act="bnGo" data-v="${i}" aria-label="${i + 1}번째 배너 보기"><span><i></i></span></button>`;
    }).join("")}</div>
    <button type="button" class="bn-arrow" data-act="bnStep" data-v="1" aria-label="다음 배너">${H.icon("chev-r")}</button>
  </div>
</section>`;
  };
  var bn = { i: 0 };
  function bnShow(i) {
    var root = H.$("#bn");
    if (!root) return;
    var slides = H.$$(".bn__slide", root), n = slides.length;
    bn.i = ((i % n) + n) % n;
    H.$("#bnTrack").style.transform = "translateX(" + -100 * bn.i + "%)";
    slides.forEach(function (s, k) {
      s.setAttribute("aria-hidden", String(k !== bn.i));
      H.$$("a, button", s).forEach(function (a) { if (k === bn.i) a.removeAttribute("tabindex"); else a.setAttribute("tabindex", "-1"); });
    });
    H.$$(".bn-dot", root).forEach(function (d, k) {
      d.classList.remove("is-on");
      d.setAttribute("aria-current", String(k === bn.i));
      if (k === bn.i) { void d.offsetWidth; d.classList.add("is-on"); }
    });
  }
  H.initBanner = function () {
    var root = H.$("#bn");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "1";
    bn.i = 0;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) root.classList.add("is-paused");
    root.addEventListener("animationend", function (e) { if (e.animationName === "bnFill") bnShow(bn.i + 1); });
    var track = H.$("#bnTrack"), x0 = null, moved = false;
    track.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; moved = false; root.classList.add("is-held"); }, { passive: true });
    track.addEventListener("touchmove", function (e) { if (x0 != null && Math.abs(e.touches[0].clientX - x0) > 10) moved = true; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      root.classList.remove("is-held");
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) bnShow(bn.i + (dx < 0 ? 1 : -1));
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    bnShow(0);
  };
  H.acts.bnStep = function (el) { bnShow(bn.i + Number(el.dataset.v)); };
  H.acts.bnGo = function (el) { bnShow(Number(el.dataset.v)); };
  H.acts.bnPause = function (el) {
    var on = H.$("#bn").classList.toggle("is-paused");
    el.setAttribute("aria-label", on ? "자동 넘김 다시 켜기" : "자동 넘김 멈추기");
  };

  H.views.home = function () {
    var set = H.homeSet || "all";
    var guides = H.guideList().filter(function (g) { return g.home; });
    var chips = [["all", "전체"], ["iphone", "아이폰"], ["galaxy", "갤럭시"]].map(function (c) {
      return `<button type="button" class="chip" data-act="homeSet" data-v="${c[0]}" aria-pressed="${set === c[0]}">${c[1]}</button>`;
    }).join("");
    return {
      html: `
${H.bannerHtml()}
<div class="wrap">
  <ul class="trust prop prop--flex" aria-label="하이유플 약속">
    <li>${H.icon("shield")}LG U+ 공식 인증 대리점</li><li>${H.icon("check")}전화 없이 개통까지</li><li>${H.icon("won")}보이는 가격 그대로</li>
  </ul>

  <section class="sec" aria-labelledby="findT">
    <div class="sec-hd">
      <div><h2 id="findT">어떤 휴대폰을 찾으세요?</h2><p class="sub">내 조건으로 확인</p></div>
      <div class="chips home-chips" role="group" aria-label="휴대폰 종류">${chips}</div>
    </div>
    <div class="cat-grid" id="catGrid">${catCards(set)}</div>
  </section>

  <section class="gcard" aria-labelledby="gcT">
    <div class="gcard__head">
      <span class="gcard__pill">하유 가이드</span>
      <h2 id="gcT">헷갈리는 조건을<br>쉬운 말로 풀어드려요.</h2>
      <a class="link-arrow" href="#/guide">전체 글 보기${H.icon("arrow")}</a>
    </div>
    <div class="gcard__list">${guides.map(function (g) {
      return `<a class="gc-item" href="#/guide/${g.slug}"><span class="gc-item__txt"><small>${H.esc(g.cat)}</small><b>${H.esc(g.title)}</b></span>${H.icon("arrow", "gc-item__go")}</a>`;
    }).join("")}</div>
  </section>

  <section class="band" aria-labelledby="bandT">
    ${H.icon("mail", "band__ic")}
    <div><h3 id="bandT">아이폰 사전알림</h3><p>새로운 아이폰 소식을<br class="mo-only"> 가장 먼저 받아보세요.</p></div>
    <button type="button" class="btn btn--mg" data-act="alert" data-pid="56">알림 신청하기${H.icon("arrow")}</button>
  </section>

  <section class="sec" aria-labelledby="rvT">
    <div class="sec-hd"><h2 id="rvT">먼저 산 손님의 이야기</h2><a class="link-arrow" href="#/reviews">구매후기 보기${H.icon("arrow")}</a></div>
    <div class="rv-row" tabindex="0" aria-label="후기, 옆으로 밀어서 더 보기">${H.homeReviews().map(H.reviewCard).join("")}</div>
  </section>
</div>`
    };
  };
  H.acts.homeSet = function (el) {
    H.homeSet = el.dataset.v;
    H.$$(".home-chips .chip").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === H.homeSet)); });
    H.$("#catGrid").innerHTML = catCards(H.homeSet);
  };

  /* ---------- 휴대폰 목록 ---------- */
  H.group = function (p) { return p.cat === "iphone" ? "iphone" : "galaxy"; };
  H.productCard = function (p) {
    var s = H.defaults(p);
    var head = `<div class="p-card__img">${H.badge(p)}<img src="${H.img(p, s.color)}" alt="" loading="lazy"></div><p class="p-card__name">${p.name}</p>`;
    if (p.launch) {
      return `<a class="p-card" href="#/phone/${p.id}">${head}<p class="p-card__plan">출시 전 · 알림 신청 받는 중</p><span class="p-card__alert">${H.icon("bell")}출시 알림 받기</span></a>`;
    }
    var r = H.price(p, s);
    return `<a class="p-card" href="#/phone/${p.id}">${head}
      <p class="p-card__plan">${r.plan.name} · ${H.methodLabel(s.method)}${s.discount === "select" ? " · 선택약정" : ""}</p>
      <div class="p-card__price num"><span class="k">실구매가</span><span class="v">${H.won(r.principal)}</span><span class="m">월 ${H.won(r.monthlyTotal)} · 24개월</span></div></a>`;
  };
  function carrierSeg() {
    var c = H.state.carrier;
    return `<div class="seg" role="group" aria-label="지금 쓰는 통신사">
      <button type="button" data-act="setCarrier" data-v="lgu" aria-pressed="${c === "lgu"}">네, 써요</button>
      <button type="button" data-act="setCarrier" data-v="other" aria-pressed="${c === "other"}">아니요</button></div>`;
  }
  /* 휴대폰 메뉴는 아이폰 · 갤럭시 두 개. 그 안은 시리즈 제목으로 나눈다(갤럭시 Z · S · A 는 갤럭시 안으로) */
  H.views.phones = function (r) {
    var q = r.q.cat || "", last = H.prod(H.state.recent[0]);
    var group = q === "iphone" ? "iphone" : q && q !== "all" ? "galaxy" : last ? H.group(last) : "iphone";
    var cat = D.cats.find(function (k) { return k.key === group; });
    var c = H.state.carrier;
    var small = c === "lgu" ? "기기변경 금액으로 보여드려요" : c === "other" ? "SKT · KT · 알뜰폰에서 옮기는 번호이동 금액이에요" : "고르기 전에는 번호이동 금액으로 보여드려요";
    var tabs = D.cats.map(function (k) {
      return `<a class="brand-tab" href="#/phones?cat=${k.key}"${k.key === group ? ' aria-current="true"' : ""}>${k.label}</a>`;
    }).join("");
    var total = 0;
    var sections = cat.series.map(function (sk) {
      var list = H.ordered().filter(function (p) { return p.series === sk; });
      total += list.length;
      if (!list.length) return "";
      return `<section class="series" id="s-${sk}" aria-labelledby="st-${sk}"><h2 class="series__t" id="st-${sk}">${D.series[sk]}<small class="num">${list.length}</small></h2><div class="p-grid">${list.map(H.productCard).join("")}</div></section>`;
    }).join("");
    return {
      title: "휴대폰",
      html: `
<div class="wrap">
  <header class="ph"><h1>휴대폰</h1><p>LG U+ 공식 인증 대리점 · 보이는 가격 그대로</p></header>
  <nav class="brand-tabs" aria-label="휴대폰 종류">${tabs}</nav>
  <div class="cond"><p class="cond__q">지금 LG U+ 쓰세요?<small>${small}</small></p>${carrierSeg()}</div>
  <p class="list-count num">${cat.label} ${total}개</p>
  ${sections}
</div>`
    };
  };
  H.after.phones = function (r) {
    if (!r.q.series) return;
    var el = H.$("#s-" + r.q.series);
    if (!el) return;
    var hdr = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hdr"), 10) || 60;
    setTimeout(function () { window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - hdr - 12); }, 40);
  };
  H.acts.setCarrier = function (el) {
    H.state.carrier = el.dataset.v;
    H.save();
    if (H.viewKey === "product") { H.refreshProduct(); H.refocus(el); }
    else { var y = window.scrollY; H.render(); window.scrollTo(0, y); H.refocus(el); }
    H.toast(el.dataset.v === "lgu" ? "LG U+ 기기변경 금액으로 바꿨어요" : "번호이동 금액으로 바꿨어요");
  };
  H.refocus = function (el) {
    var sel = '[data-act="' + el.dataset.act + '"]' + (el.dataset.k ? '[data-k="' + el.dataset.k + '"]' : "") + (el.dataset.v ? '[data-v="' + el.dataset.v + '"]' : "");
    var again = H.$(sel);
    if (again) again.focus({ preventScroll: true });
  };

  /* ---------- 상품 화면 ---------- */
  function optCarrier(p) {
    var c = H.state.carrier;
    var hint = !c ? "먼저 골라 주세요" : c === "lgu" && !p.change ? "이 상품은 기기변경이 안 돼요" : H.method(p) === "change" ? "LG U+ 기기변경으로 계산했어요" : "번호이동으로 계산했어요";
    return `<div class="opt"><div class="opt__t"><h2>지금 쓰는 통신사${c ? "" : "<em>필수</em>"}</h2><span class="hint">${hint}</span></div>
      <div class="opt__body choice-row">
        <button type="button" class="choice" data-act="setCarrier" data-v="lgu" aria-pressed="${c === "lgu"}"${p.change ? "" : " disabled"}>LG U+ 써요<small>${p.change ? "기기변경 · 번호 그대로" : "기기변경이 안 되는 상품이에요"}</small></button>
        <button type="button" class="choice" data-act="setCarrier" data-v="other" aria-pressed="${c === "other"}">다른 통신사예요<small>SKT · KT · 알뜰폰 → 번호이동</small></button>
      </div></div>`;
  }
  function optVol(p, s) {
    if (p.vols.length < 2) return `<div class="opt"><div class="opt__t"><h2>용량</h2><span class="hint num">${p.vols[0][0]} · 출고가 ${H.won(p.vols[0][1])}</span></div></div>`;
    return `<div class="opt"><div class="opt__t"><h2>용량</h2></div><div class="opt__body choice-row${p.vols.length > 2 ? " choice-row--3" : ""}">${p.vols.map(function (v, i) {
      return `<button type="button" class="choice choice--center" data-act="setOpt" data-k="vol" data-v="${i}" aria-pressed="${s.vol === i}">${v[0]}<small class="num">${H.won(v[1])}</small></button>`;
    }).join("")}</div></div>`;
  }
  /* 색상 — 휴대폰에서는 동그라미만 한 줄로 두고, 고른 색 이름만 제목 옆에 보여준다(이름을 다 늘어놓지 않는다) */
  H.colorPicker = function (p, ci, act) {
    var c = p.colors[ci] || p.colors[0];
    return `<div class="opt opt--color"><div class="opt__t"><h2>색상</h2><span class="sw-name" aria-live="polite"><i style="background:${c[1]}"></i>${c[0]}</span></div>
      <div class="opt__body swatches" role="radiogroup" aria-label="색상">${p.colors.map(function (x, i) {
        return `<button type="button" class="sw" role="radio" aria-checked="${ci === i}" aria-label="${x[0]}" title="${x[0]}" data-act="${act}" data-k="color" data-v="${i}"><i style="background:${x[1]}"></i><span class="sw__t">${x[0]}</span></button>`;
      }).join("")}</div></div>`;
  };
  function optColor(p, s) { return H.colorPicker(p, s.color, "setOpt"); }
  function optPlan(p, s, r) {
    var pl = r.plan;
    return `<div class="opt"><div class="opt__t"><h2>요금제</h2><span class="hint">${p.rows.length}개 중에서 고르기</span></div>
      <div class="opt__body"><button type="button" class="plan-btn" data-act="planSheet"><span><b>${pl.name}</b><small>데이터 ${pl.data}${pl.after ? " · 다 쓰면 " + pl.after : ""} · 통화 ${pl.voice}</small></span><span class="fee num">월 ${H.won(pl.fee)}${H.icon("chev-r", "ic--sm")}</span></button>
      <p class="plan-note">${H.icon("info")}185일 이후 월 47,000원까지 낮출 수 있어요<a href="#/guide/plan-down">자세히</a></p></div></div>`;
  }
  /* 상세 구역 — 우리 자료로만 만든다(색상·용량·값). 제조사 사양을 지어내지 않는다.
   * 대표 지시 2026-09-16 «등록된상세정보가 없다고 하는데 그것도 만들어서 보여줘» */
  function detailBlock(p, s) {
    var cols = p.colors.map(function (c, i) {
      return `<button type="button" class="dt-col" data-act="setOpt" data-k="color" data-v="${i}" aria-pressed="${s.color === i}">
        <span class="dt-col__img"><img src="${c[2]}" alt="" loading="lazy"></span>
        <span class="dt-col__n"><i style="background:${c[1]}"></i>${H.esc(c[0])}</span></button>`;
    }).join("");
    var rows = p.vols.map(function (v, i) {
      var r = H.price(p, Object.assign({}, s, { vol: i }));
      return `<tr${s.vol === i ? ' class="on"' : ''}><th>${v[0]}</th><td class="num">${H.won(v[1])}</td><td class="num">${H.won(r.principal)}</td><td class="num">${r.months ? "월 " + H.won(r.monthlyTotal) : "일시불"}</td></tr>`;
    }).join("");
    return `<div class="dt">
      <h3>색상 ${p.colors.length}가지</h3>
      <div class="dt-cols">${cols}</div>
      <h3>용량별로 얼마인가요?</h3>
      <div class="tbl-wrap"><table class="dt-tbl"><thead><tr><th>용량</th><th>출고가</th><th>실구매가</th><th>월 납부</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="asof">지금 고르신 조건(${H.esc(H.plan(s.planId) ? H.plan(s.planId).name : "요금제")} · ${H.methodLabel(s.method)} · ${H.discountLabel(s.discount)}) 기준이에요. 위에서 조건을 바꾸면 이 표도 같이 바뀌어요.</p>
    </div>`;
  }

  function optDiscount(p, s) {
    var both = !!(p.official && p.select && p.rows.length);
    var canDown = both && H.price(p, s).planFeeBase > H.DOWN.fee;
    var down = canDown && H.state.cmpDown === true;
    var best = H.cheaper(p, s, down), when = down ? "185일 뒤 월 47,000원으로 낮추면 24개월 동안" : "24개월 동안";
    var btn = function (key, label, sub, ok) {
      return `<button type="button" class="choice" data-act="setOpt" data-k="discount" data-v="${key}" aria-pressed="${s.discount === key}"${ok ? "" : " disabled"}>${best && best.key === key ? '<span class="save">덜 내요</span>' : ""}${label}<small>${ok ? sub : "이 상품은 안 돼요"}</small></button>`;
    };
    var basis = canDown ? `<div class="cmp-basis" role="group" aria-label="비교 기준"><button type="button" data-act="cmpBasis" data-v="keep" aria-pressed="${!down}">요금제 그대로</button><button type="button" data-act="cmpBasis" data-v="down" aria-pressed="${down}">요금을 낮출 생각이면</button></div>` : "";
    var line = "";
    if (best && best.key !== s.discount) line = `<p class="save-line">${H.icon("spark")}<span>이 조건에선 <b>${best.label}</b>이 ${when} <b class="num">${H.won(best.diff)}</b> 덜 내요.</span><button type="button" data-act="setOpt" data-k="discount" data-v="${best.key}">바꾸기</button></p>`;
    else if (best) line = `<p class="save-line">${H.icon("check")}<span>지금 고른 <b>${best.label}</b>이 ${when} <b class="num">${H.won(best.diff)}</b> 덜 내요.</span></p>`;
    else if (both) line = `<p class="save-line">${H.icon("info")}<span>${down ? "185일 뒤 월 47,000원으로 낮춰도 " : ""}두 방법의 24개월 합계가 같아요.</span></p>`;
    var more = both ? `<button type="button" class="more-btn" data-act="cmpSheet">24개월 합계 자세히 보기${H.icon("chev-r")}</button>` : "";
    return `<div class="opt"><div class="opt__t"><h2>할인 방법</h2><a class="hint" href="#/guide/support-or-select">어느 쪽이 나아요?</a></div>
      <div class="opt__body"><div class="choice-row">${btn("official", "이통사지원금", "기기값에서 한 번에 할인", p.official)}${btn("select", "선택약정", "매달 요금 25% 할인", p.select)}</div>${basis}${line}${more}</div></div>`;
  }
  H.acts.cmpBasis = function (el) {
    H.state.cmpDown = el.dataset.v === "down";
    H.save();
    H.refreshProduct();
    H.refocus(el);
  };
  function cmpTable(p, s, down) {
    var so = Object.assign({}, s, { discount: "official" }), ss = Object.assign({}, s, { discount: "select" });
    var ro = H.price(p, so), rs = H.price(p, ss);
    var co = down ? H.costDown(p, so) : H.cost(p, so), cs = down ? H.costDown(p, ss) : H.cost(p, ss);
    var k = H.DOWN.keep, rest = 24 - k, low = Math.min(ro.planFeeBase, H.DOWN.fee);
    var row = function (label, a, b) { return `<tr><td>${label}</td><td class="num">${a}</td><td class="num">${b}</td></tr>`; };
    var fees = down
      ? row(`요금 1~${k}개월<br><small>월 ${H.won(ro.planFeeBase)}</small>`, H.won(ro.planFee * k), H.won(rs.planFee * k)) + row(`요금 ${k + 1}~24개월<br><small>월 47,000원</small>`, H.won(low * rest), H.won(Math.round(low * 0.75) * rest))
      : row("요금 24개월", H.won(ro.planFee * 24), H.won(rs.planFee * 24));
    var win = co === cs ? "" : co < cs ? "a" : "b";
    return `<table class="cmp-tbl"><thead><tr><th></th><th>이통사지원금</th><th>선택약정</th></tr></thead><tbody>
      ${row("할부원금", H.won(ro.principal), H.won(rs.principal))}${row("할부 이자", H.won(ro.totalInterest), H.won(rs.totalInterest))}${fees}
      <tr class="tot"><td>24개월 합계</td><td class="num${win === "a" ? " win" : ""}">${H.won(co)}</td><td class="num${win === "b" ? " win" : ""}">${H.won(cs)}</td></tr></tbody></table>
      ${win ? `<p class="cmp-res">${win === "a" ? "이통사지원금" : "선택약정"}이 <span class="num">${H.won(Math.abs(co - cs))}</span> 덜 내요.</p>` : ""}`;
  }
  H.acts.cmpSheet = function () {
    var p = H.prod(H.route.parts[1]), s = H.selFor(p), r = H.price(p, s), canDown = r.planFeeBase > H.DOWN.fee;
    H.openSheet({
      title: "할인 방법 24개월 합계", wide: true,
      body: `<p class="plan-note plan-note--top">${H.icon("info")}${p.name} ${p.vols[s.vol][0]} · ${r.plan.name} · ${H.methodLabel(s.method)} · ${r.months ? r.months + "개월 할부" : "일시불"} 기준</p>
        <section class="cmp-sec"><h3>요금제를 24개월 그대로 쓰면</h3>${cmpTable(p, s, false)}</section>
        ${canDown ? `<section class="cmp-sec"><h3>185일 뒤 월 47,000원 요금제로 낮추면</h3>${cmpTable(p, s, true)}<p class="help-t">185일은 개통일부터 세요. 185일이 지나는 ${H.DOWN.keep}개월째까지는 고른 요금제, ${H.DOWN.keep + 1}개월째부터 월 47,000원 요금제(${H.DOWN.name})로 계산했어요. 47,000원보다 낮추면 위약금이 생길 수 있어요.</p></section>` : `<p class="help-t">고른 요금제가 월 47,000원 이하라 낮추는 경우는 따로 계산하지 않았어요.</p>`}
        <p class="help-t">24개월 합계 = 할부원금 + 할부 이자 + 요금. 선택약정 25% 할인은 바꾼 요금제 기준으로 이어져요. 하이유플 ${D.asOf.replace(/-/g, ".")} 가격 기준이에요.</p>`
    });
  };
  function optPay(s) {
    var cur = s.payment === "installment" ? String(s.months) : "0";
    return `<div class="opt"><div class="opt__t"><h2>구매 방식</h2><span class="hint">할부 이자 연 5.9%</span></div><div class="opt__body choice-row choice-row--3">${[["0", "일시불"], ["24", "24개월 할부"], ["30", "30개월 할부"]].map(function (o) {
      return `<button type="button" class="choice choice--center" data-act="setOpt" data-k="pay" data-v="${o[0]}" aria-pressed="${cur === o[0]}">${o[1]}</button>`;
    }).join("")}</div></div>`;
  }
  function priceBox(p, s, r) {
    var conds = ["부가서비스", "카드발급", "기존폰 반납", "인터넷 가입"];
    return `<div class="pbox" aria-live="polite">
      <div class="pbox__main"><span class="k">나의 실구매가</span><span class="v num">${H.won(r.principal)}</span></div>
      <div class="pbox__conds">${conds.map(function (c) { return `<span class="cond-pill">${c}<b>${H.icon("check")}없음</b></span>`; }).join("")}</div>
      <div class="pbox__month"><span class="k">월 납부 금액 (VAT 포함)</span><span class="v num">${H.won(r.monthlyTotal)}</span></div>
      <p class="pbox__note">지금 보시는 금액이 최종 결제 금액이에요. 추가 청구는 없어요. 할부를 고른 경우에만 연 5.9% 이자가 붙어요.</p>
      <div class="pbox__rows">${H.priceRows(p, s, r)}</div></div>`;
  }
  H.productPanel = function (p) {
    var s = H.selFor(p), r = H.price(p, s);
    return optColor(p, s) + optCarrier(p) + optVol(p, s) + optPlan(p, s, r) + optDiscount(p, s) + optPay(s) + priceBox(p, s, r) +
      `<div class="pd-cta pc-only"><button type="button" class="btn btn--mg btn--block" data-act="order">주문하기</button>
        <div class="pd-cta__sub"><button type="button" data-act="callback">${H.icon("call")}번호만 남기고 상담받기</button><button type="button" data-act="chat">${H.icon("spark")}AI에게 물어보기</button></div></div>
      <div class="pd-cta__sub pd-sub-mo mo-only"><button type="button" data-act="callback">${H.icon("call")}번호만 남기고 상담받기</button><button type="button" data-act="chat">${H.icon("spark")}AI에게 물어보기</button></div>`;
  };
  H.productBar = function (p) {
    var s = H.selFor(p), r = H.price(p, s);
    return `<div class="bar__price"><small class="num">실구매가 ${H.won(r.principal)} · ${r.months ? r.months + "개월 할부" : "일시불"}</small><b class="num">월 ${H.won(r.monthlyTotal)}</b></div><button type="button" class="btn btn--mg" data-act="order">주문하기</button>`;
  };
  H.refreshProduct = function () {
    var p = H.prod(H.route.parts[1]);
    if (!p || p.launch) return;
    var s = H.selFor(p), panel = H.$("#pdPanel"), bar = H.$("#bar"), img = H.$("#pdImg img");
    if (panel) panel.innerHTML = H.productPanel(p);
    if (bar) bar.innerHTML = H.productBar(p);
    if (img && img.getAttribute("src") !== H.img(p, s.color)) img.src = H.img(p, s.color);
  };

  H.views.product = function (r) {
    var p = H.prod(r.parts[1]);
    if (!p) return { title: "상품", html: `<div class="wrap"><p class="empty">상품을 찾을 수 없어요.<br><br><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a></p></div>` };
    var s = H.selFor(p);
    var tabs = [["pdBenefit", "구매혜택"], ["pdGuide", "주문 안내"], ["pdReviews", "구매후기"], ["pdFaq", "자주 묻는 질문"]];
    return {
      title: p.name, tab: false, bar: H.productBar(p),
      html: `
<div class="wrap">
  <a class="back mo-only" href="#/phones?cat=${H.group(p)}&series=${p.series}">${H.icon("chev-l")}휴대폰</a>
  <div class="pd">
    <div class="pd-gallery">
      <div class="pd-img" id="pdImg">${H.badge(p)}<img src="${H.img(p, s.color)}" alt="${p.name}"></div>
      <div class="pd-colors-pc pc-only" aria-hidden="true">${p.colors.map(function (c) { return `<i style="background:${c[1]}"></i>`; }).join("")}</div>
    </div>
    <div class="pd-main">
      <div class="pd-head"><h1>${p.name}</h1><p>${p.maker} · LG U+ ${p.series === "a" ? "LTE" : "5G"}</p></div>
      <div id="pdPanel">${H.productPanel(p)}</div>
    </div>
  </div>
  <div class="pd-lower">
    <nav class="pd-tabs" aria-label="상품 안내">${tabs.map(function (t, i) { return `<button type="button" data-act="jump" data-id="${t[0]}" class="${i === 0 ? "on" : ""}">${t[1]}</button>`; }).join("")}</nav>
    <section class="pd-sec" id="pdBenefit">
      <h2>구매혜택</h2>
      <p class="lead">조건 없이, 보이는 금액 그대로 사는 방법이에요.</p>
      <ul class="bf-grid">
        <li class="bf">${H.icon("shield")}<b>조건 4가지 없음</b><span>부가서비스 · 기존폰 반납 · 제휴카드 · 인터넷 결합</span></li>
        <li class="bf">${H.icon("won")}<b>택배비 무료</b><span>번호이동은 유심비 7,700원만 따로 내요</span></li>
        <li class="bf">${H.icon("spark")}<b>가입하면 1만 포인트</b><span>주문할 때 할인으로 바로 써요</span></li>
        <li class="bf">${H.icon("chat")}<b>전화 없이 개통까지</b><span>신청서 · 가입내역 확인 · 개통 · 배송</span></li>
      </ul>
      <div class="nocond-card">
        <p class="nocond-card__eyebrow">NO CONDITION</p>
        <h3>이 네 가지, 하나도 걸지 않아요</h3>
        <ul class="nocond">${["부가서비스 가입 조건", "기존폰 반납 조건", "제휴카드 발급 · 실적 조건", "인터넷 결합 조건"].map(function (t) { return `<li>${H.icon("check")}<span>${t}</span><b>없음</b></li>`; }).join("")}</ul>
        <p class="nocond-card__foot">위 금액표에서 네 항목이 모두 «없음»으로 보여요. 직접 확인하고 주문하세요.</p>
      </div>
      <div class="info-cards">
        <article class="info-card"><small>추가 청구 없음</small><h3>지금 보시는 월 납부 금액이 마지막 금액이에요</h3><p>개통 후에 다른 명목으로 더 청구하지 않아요. 할부를 고른 경우에만 연 5.9% 이자가 따로 붙어요.</p></article>
        <article class="info-card"><small>요금제</small><h3>요금제는 185일 뒤에 낮출 수 있어요</h3><p>개통일 기준 185일이 지나면 월 47,000원 이상 요금제로 바꿀 수 있어요. 그보다 낮추면 위약금이 생길 수 있어요.</p><a class="link-arrow" href="#/guide/plan-down">자세히 보기${H.icon("arrow")}</a></article>
      </div>
      ${H.netAskCard("선택 혜택", "인터넷도 같이 하면 결합 할인", "휴대폰 가격은 그대로, LG U+ 참 쉬운 가족 결합으로 인터넷 요금이 월 5,500~13,200원 내려가요(3년 약정).")}</a>
      ${detailBlock(p, s)}
    </section>
    <section class="pd-sec" id="pdGuide">
      <h2>주문부터 개통까지, 네 단계</h2>
      <ol class="steps">${C.process.map(function (st, i) { return `<li class="step"><i>${i + 1}</i><div><b>${st[0]}</b><p>${st[1]}</p></div></li>`; }).join("")}</ol>
      <h2 class="pd-sec__h">주문 전에 확인해 주세요</h2>
      <dl class="kv">${C.orderGuide.map(function (k) { return `<div><dt>${k[0]}</dt><dd>${k[1]}</dd></div>`; }).join("")}</dl>
    </section>
    <section class="pd-sec" id="pdReviews">
      <h2>구매후기</h2>
      <div class="rv-list rv-list--2">${H.homeReviews().slice(0, 2).map(H.reviewCard).join("")}</div>
      <a class="link-arrow pd-more" href="#/reviews">구매후기 전체 보기${H.icon("arrow")}</a>
    </section>
    <section class="pd-sec" id="pdFaq"><h2>자주 묻는 질문</h2>${H.faqHtml()}${H.helpBox()}</section>
  </div>
</div>`
    };
  };
  H.after.product = function (r) {
    var id = Number(r.parts[1]);
    H.state.recent = [id].concat(H.state.recent.filter(function (x) { return x !== id; })).slice(0, 8);
    H.save();
  };

  H.acts.setOpt = function (el) {
    var p = H.prod(H.route.parts[1]), s = H.selFor(p), k = el.dataset.k, v = el.dataset.v;
    if (k === "vol" || k === "color") s[k] = Number(v);
    if (k === "discount") s.discount = v;
    if (k === "pay") { if (v === "0") { s.payment = "lump"; } else { s.payment = "installment"; s.months = Number(v); } }
    H.refreshProduct();
    H.refocus(el);
  };
  H.acts.planSheet = function () {
    var p = H.prod(H.route.parts[1]), s = H.selFor(p);
    var body = `<p class="plan-note plan-note--top">${H.icon("info")}${H.methodLabel(s.method)} · ${H.discountLabel(s.discount)} · ${s.payment === "installment" ? s.months + "개월 할부" : "일시불"} 기준이에요</p>` +
      p.rows.map(function (row) {
        var pl = H.plan(row[0]), r = H.price(p, Object.assign({}, s, { planId: row[0] }));
        return `<button type="button" class="plan-opt" data-act="pickPlan" data-v="${row[0]}" aria-pressed="${s.planId === row[0]}">
          <b>${pl.name}</b><span class="fee num">월 ${H.won(pl.fee)}</span>
          <small>데이터 ${pl.data}${pl.after ? " · 다 쓰면 " + pl.after : ""} · 통화 ${pl.voice} +${pl.extra} · 문자 ${pl.sms}</small>
          <span class="mo"><span>이 요금제로 월 납부 금액</span><b class="num">${H.won(r.monthlyTotal)}</b></span></button>`;
      }).join("");
    H.openSheet({ title: "요금제 고르기", body: body });
  };
  H.acts.pickPlan = function (el) {
    var p = H.prod(H.route.parts[1]);
    H.selFor(p).planId = Number(el.dataset.v);
    H.closeSheet();
    H.refreshProduct();
    H.toast(H.plan(Number(el.dataset.v)).name + "(으)로 바꿨어요");
  };
  H.acts.order = function () {
    var p = H.prod(H.route.parts[1]);
    if (!p) return;
    H.state.draft = { pid: p.id, sel: Object.assign({}, H.selFor(p)) };
    H.form = null;
    H.save();
    if (!H.state.loggedIn) { H.acts.login(null, "#/order"); return; }
    H.go("#/order");
  };
  H.acts.jump = function (el) {
    var t = H.$("#" + el.dataset.id);
    if (!t) return;
    H.$$(".pd-tabs button").forEach(function (b) { b.classList.toggle("on", b === el); });
    var hdr = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hdr"), 10) || 60;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - hdr - 50, behavior: "smooth" });
  };
  H.acts.callback = function () {
    var ph = H.state.loggedIn ? H.state.user.phone : "";
    H.openSheet({
      title: "번호만 남기고 상담받기",
      body: `<p class="help-t help-t--lead">지금 고른 조건을 함께 전해 드려요. 이 번호로 상담원이 연락드려요.</p>
        <div class="field"><label for="cbPhone">휴대폰 번호<span class="req">*</span></label><input id="cbPhone" class="input" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="${ph}" data-focus></div>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="callbackSend">상담 요청하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 전달되지 않아요</p>`
    });
  };
  H.acts.callbackSend = function () {
    var v = (H.$("#cbPhone") || {}).value || "";
    if (v.replace(/\D/g, "").length < 10) { H.toast("휴대폰 번호를 끝까지 적어 주세요"); return; }
    H.setSheet(`<div class="ok"><div class="ok__ic">${H.icon("check")}</div><h3>상담 요청을 받았어요</h3><p>${H.esc(v)} 번호로 연락드릴게요.<br>평일 10:00–20:00 · 토요일 11:00–20:00</p></div>`,
      `<button type="button" class="btn btn--ink btn--block" data-act="closeSheet">확인</button>`);
  };

  /* ---------- 출시 전 상품 ---------- */
  H.views.launch = function (r) {
    var p = H.prod(r.parts[1]), ci = H.sel["L" + p.id] || 0;
    return {
      title: p.name, tab: false,
      bar: `<div class="bar__price"><small>${p.name}</small><b>출시 알림 받기</b></div><button type="button" class="btn btn--mg" data-act="alert" data-pid="${p.id}">알림 신청하기</button>`,
      html: `
<div class="wrap">
  <a class="back mo-only" href="#/phones?cat=${H.group(p)}&series=${p.series}">${H.icon("chev-l")}휴대폰</a>
  <div class="pd">
    <div class="pd-gallery"><div class="pd-img" id="pdImg">${H.badge(p)}<img src="${H.img(p, ci)}" alt="${p.name} ${p.colors[ci][0]}"></div></div>
    <div class="pd-main">
      <div class="pd-head"><h1>${p.name}</h1><p>${p.maker} · 출시 전 · 알림 신청 받는 중</p></div>
      ${H.colorPicker(p, ci, "launchColor")}
      <div class="opt"><div class="opt__t"><h2>용량 · 가격</h2><span class="hint">출시 후 안내</span></div></div>
      <div class="pbox">
        <div class="pbox__main"><span class="k">가격</span><span class="v v--sm">출시 후 안내</span></div>
        <p class="pbox__note">출시 일정과 혜택이 준비되면 알림톡으로 가장 먼저 알려드려요. 사전예약은 정식 기간에만 받을 수 있어서, 알림을 받아 두면 예약이 열리는 날 바로 신청할 수 있어요.</p>
        <a class="link-arrow" href="#/guide/alert-vs-preorder">사전알림과 사전예약 차이 보기${H.icon("arrow")}</a>
      </div>
      <div class="pd-cta pc-only"><button type="button" class="btn btn--mg btn--block" data-act="alert" data-pid="${p.id}">알림 신청하기</button></div>
    </div>
  </div>
</div>`
    };
  };
  H.acts.launchColor = function (el) {
    var p = H.prod(H.route.parts[1]), y = window.scrollY;
    H.sel["L" + p.id] = Number(el.dataset.v);
    H.render();
    window.scrollTo(0, y);
    H.refocus(el);
  };
})();
