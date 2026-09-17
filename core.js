/* 하이유플 리뉴얼 목업 — 공통: 상태 · 가격 계산 · 길 찾기 · 머리/탭/바닥글 · 창 */
(function () {
  "use strict";
  var D = window.HIU, C = window.HIU_CONTENT, N = window.HIU_NOTES;
  var H = (window.H = { D: D, C: C, N: N, views: {}, acts: {}, inputs: {}, after: {}, sel: {} });

  /* ---------- 작은 도구 ---------- */
  H.$ = function (s, r) { return (r || document).querySelector(s); };
  H.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  H.esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  H.num = function (n) { return Math.round(n).toLocaleString("ko-KR"); };
  H.won = function (n) { return H.num(n) + "원"; };
  H.icon = function (name, cls) { return '<svg class="ic ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; };
  H.prod = function (id) { return D.products.find(function (p) { return p.id === Number(id); }); };
  H.plan = function (id) { return D.plans[id]; };
  H.img = function (p, ci) {
    var c = p.colors[ci || 0];
    if (c && c[2]) return c[2];
    var f = p.colors.find(function (x) { return x[2]; });
    return f ? f[2] : "";
  };
  H.ordered = function () { return D.order.map(H.prod).filter(Boolean); };
  H.badge = function (p) {
    var cls = { "사전예약": "pre", "신제품": "new", "알림 신청": "alert", "추천": "rec" }[p.badge];
    return cls ? '<span class="badge badge--' + cls + '">' + p.badge + "</span>" : "";
  };
  H.stars = function (n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += H.icon("star");
    return '<span class="stars" aria-label="별점 ' + n + '점">' + s + "</span>";
  };
  H.guide = function (slug) { return C.guides.find(function (g) { return g.slug === slug; }); };

  /* ---------- 상태(이 브라우저에만 저장) ---------- */
  var KEY = "hiu-renewal-mock-v2";
  var initial = {
    loggedIn: false, user: { id: "hayu95", name: "김하유", birth: "19950312", phone: "010-1234-5678", joined: "2026.09.15" },
    carrier: null, orders: [], alerts: [], recent: [], searches: [], myReviews: [], draft: null,
    proposals: false, memoHidden: false, mileage: 10000, tour: null, welcomed: false,
    feedPosts: [], feedMod: {}, guideEdits: {}, guideNew: [], guideHidden: [], partner: null
  };
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
  H.state = Object.assign({}, initial, saved);
  H.save = function () { try { localStorage.setItem(KEY, JSON.stringify(H.state)); } catch (e) { /* 저장 못 해도 화면은 돈다 */ } };
  H.reset = function () { try { localStorage.removeItem(KEY); } catch (e) {} H.state = Object.assign({}, initial); H.sel = {}; };

  /* ---------- 가격 계산 — 지금 사이트(priceCalc.ts · supportCalc.ts)와 같은 식 ---------- */
  var K24 = 0.059 * 1.0295 * 1.0295; // 24개월 총 이자 비율 ≈ 6.25%
  H.method = function (p) { return H.state.carrier === "lgu" && p.change ? "change" : "move"; };
  H.defaults = function (p) {
    var row = p.rows.find(function (r) { return r[0] === p.preset; }) || p.rows[0];
    var ci = p.colors.findIndex(function (c) { return c[2]; });
    return { vol: 0, color: ci < 0 ? 0 : ci, planId: row ? row[0] : null, method: H.method(p), discount: p.official ? "official" : "select", payment: "installment", months: 24 };
  };
  H.selFor = function (p) {
    if (!H.sel[p.id]) H.sel[p.id] = H.defaults(p);
    H.sel[p.id].method = H.method(p);
    return H.sel[p.id];
  };
  H.price = function (p, s) {
    var row = p.rows.find(function (r) { return r[0] === s.planId; }) || p.rows[0];
    var release = (p.vols[s.vol] || p.vols[0])[1];
    if (!row) return { release: release, carrierSupport: 0, self: 0, principal: release, months: 0, monthlyDevice: 0, interest: 0, totalInterest: 0, planFee: 0, planFeeBase: 0, selectMonthly: 0, monthlyTotal: 0, plan: null, planId: null };
    var ch = s.method === "change", off = s.discount === "official";
    var carrierSupport = off ? (ch ? row[3] : row[2]) : 0;
    var rebate = off ? (ch ? row[5] : row[4]) : (ch ? row[7] : row[6]);
    var margin = ch ? row[9] : row[8];
    var self = Math.min(Math.max(0, rebate - margin), Math.max(0, release - carrierSupport)); // 자체할인은 남은 기기값까지만
    var principal = Math.max(0, Math.round(release - carrierSupport - self));
    var months = s.payment === "installment" ? s.months : 0;
    var raw = months && principal > 0 ? (principal * (1 + K24 * (months / 24))) / months : 0;
    var monthlyDevice = raw > 0 ? Math.ceil(raw) : 0;
    var interest = raw > 0 ? Math.ceil(raw) - Math.ceil(principal / months) : 0;
    var totalInterest = monthlyDevice > 0 ? monthlyDevice * months - principal : 0;
    var planFee = off ? row[1] : Math.round(row[1] * 0.75);
    return {
      release: release, carrierSupport: carrierSupport, self: self, principal: principal, months: months,
      monthlyDevice: monthlyDevice, interest: interest, totalInterest: totalInterest,
      planFee: planFee, planFeeBase: row[1], selectMonthly: row[1] - planFee,
      /* 월 납부 금액의 기기 분도 올림 — 옛 사이트는 내림이라 «할부금+요금»과 1원 어긋났다.
       * 대표 2026-09-17 «올림으로 맞추고» → 이제 표의 월 할부금 + 월 통신 요금 = 월 납부 금액 */
      monthlyTotal: monthlyDevice + planFee, plan: H.plan(row[0]), planId: row[0]
    };
  };
  /* 24개월 동안 내는 돈 = 기기값 + 할부 이자 + 요금 24개월 */
  H.cost = function (p, s) { var r = H.price(p, s); return r.principal + r.totalInterest + r.planFee * 24; };
  /* 185일 뒤 월 47,000원 요금제로 낮추는 경우 — 185일이 지나는 7개월째까지 고른 요금제, 8개월째부터 47,000원(자비스웹 요금제표 «데이터플랜9GB»)
   * 선택약정 25%는 바꾼 요금제에도 이어진다. 기기값 · 할부 이자는 그대로 */
  H.DOWN = { fee: 47000, name: "데이터플랜9GB", keep: 7 };
  H.feeTotal = function (p, s, down) {
    var r = H.price(p, s);
    if (!down) return r.planFee * 24;
    var low = Math.min(r.planFeeBase, H.DOWN.fee), rate = s.discount === "select" ? 0.75 : 1;
    return r.planFee * H.DOWN.keep + Math.round(low * rate) * (24 - H.DOWN.keep);
  };
  H.costDown = function (p, s) { var r = H.price(p, s); return r.principal + r.totalInterest + H.feeTotal(p, s, true); };
  H.cheaper = function (p, s, down) {
    if (!(p.official && p.select) || !p.rows.length) return null;
    var f = down ? H.costDown : H.cost;
    var a = f(p, Object.assign({}, s, { discount: "official" }));
    var b = f(p, Object.assign({}, s, { discount: "select" }));
    if (a === b) return null;
    return { key: a < b ? "official" : "select", label: a < b ? "이통사지원금" : "선택약정", diff: Math.abs(a - b) };
  };
  /* 인터넷 같이 상담 — 상품 화면 · 결합 화면 · 주문서 세 곳이 같은 값을 쓴다 (대표 지시 2026-09-16
   * «설명화면으로 넘어가고 설명화면 에도 설명화면 누르기전에도 체크 하는게 있어야되») */
  H.netAsk = function () { return H.state.netAsk === true; };
  H.acts.netAskToggle = function () { H.state.netAsk = !H.state.netAsk; H.save(); H.render(); };
  /* noMore=true 면 체크 칸만 (결합 화면 위·아래에 쓴다).
   * 아니면 «얼마나 내려가는지 보러 가는 줄»을 위에 크게 얹는다 — 체크만 있으면 그냥 지나친다는
   * 대표 지적 (2026-09-17 «투게더 할인 추가 확인 하기 같은 식으로 해서 고객 클릭 유도») */
  H.netAskCard = function (_eyebrow, title, desc, noMore) {
    var on = H.netAsk();
    var chk = `<button type="button" class="bf-net__chk" data-act="netAskToggle" aria-pressed="${on}">
        <span class="box">${H.icon("check")}</span>
        <span class="bf-net__t"><b>${H.esc(title)}</b><small>${H.esc(desc)}</small></span></button>`;
    if (noMore) return `<div class="bf-net${on ? " on" : ""}">${chk}</div>`;
    return `<div class="bf-net bf-net--go${on ? " on" : ""}">
      <a class="bf-net__go" href="#/together"><span class="bf-net__got"><b>투게더 결합 할인 추가로 확인하기</b><small>가족 4명이 모이면 인터넷까지 매달 91,000원 내려가요</small></span>${H.icon("arrow")}</a>
      ${chk}</div>`;
  };

  H.listPrice = function (p) { var s = H.defaults(p); return Object.assign(H.price(p, s), { sel: s }); };
  H.methodLabel = function (m) { return m === "change" ? "기기변경" : "번호이동"; };
  H.discountLabel = function (d) { return d === "select" ? "선택약정" : "이통사지원금"; };

  /* 금액표 줄 — 이름은 지금 사이트 그대로 */
  H.priceRows = function (p, s, r) {
    var out = '<div class="row"><span>출고가</span><b class="num">' + H.won(r.release) + "</b></div>";
    if (s.discount === "official") out += '<div class="row"><span>이통사지원금 할인</span><b class="num minus">- ' + H.won(r.carrierSupport) + "</b></div>";
    out += '<div class="row"><span>하이유플 자체할인</span><b class="num minus">- ' + H.won(r.self) + "</b></div>";
    out += '<div class="row"><span>할부원금</span><b class="num">' + H.won(r.principal) + "</b></div>";
    if (r.months) {
      out += '<div class="row"><span>월 휴대폰 할부금 (' + r.months + '개월)</span><b class="num">' + H.won(r.monthlyDevice) + "</b></div>";
      out += '<div class="row row--sub"><span>통신사 할부 이자 (연 5.9%)</span><b class="num">' + H.won(r.interest) + "</b></div>";
      out += '<div class="row row--sub"><span>' + r.months + '개월 총 할부이자</span><b class="num">' + H.won(r.totalInterest) + "</b></div>";
    }
    out += '<div class="row"><span>월 통신 요금 (VAT 포함)</span><b class="num">' + H.won(r.planFee) + "</b></div>";
    if (s.discount === "select") out += '<div class="row row--sub"><span>선택약정 할인 (월 ' + H.num(r.selectMonthly) + '원 × 24개월)</span><b class="num">- ' + H.won(r.selectMonthly * 24) + "</b></div>";
    return out;
  };

  /* ---------- 길 찾기 ---------- */
  H.parse = function () {
    var h = location.hash.replace(/^#\/?/, "");
    var i = h.indexOf("?");
    var path = i < 0 ? h : h.slice(0, i), qs = i < 0 ? "" : h.slice(i + 1);
    var parts = path.split("/").filter(Boolean).map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    var q = {};
    new URLSearchParams(qs).forEach(function (v, k) { q[k] = v; });
    return { path: parts[0] || "", parts: parts, q: q, hash: location.hash || "#/" };
  };
  var ROUTES = { "": "home", phones: "phones", order: "order", done: "done", my: "my", guide: "guides", reviews: "reviews", review: "review", cs: "cs", search: "search", signup: "signup", screens: "screens", tour: "tour", partner: "partner", admin: "admin", together: "together", receipt: "receipt", chat: "chat" };
  function viewKey(r) {
    if (r.path === "guide" && r.parts[1]) return "guide";
    if (r.path === "phone") { var p = H.prod(r.parts[1]); return p && p.launch ? "launch" : "product"; }
    if (r.path === "my" && r.parts[1]) return "my-" + r.parts[1];
    if (r.path === "signup" && r.parts[1]) return "signup-" + r.parts[1];
    if (r.path === "partner" && r.parts[1]) return "partner-" + r.parts[1];
    if (r.path === "admin") return "admin-" + (r.parts[1] || "home");
    return ROUTES[r.path] || "home";
  }
  H.go = function (hash) {
    H._forceTop = true;
    if (location.hash === hash) { H.render(); window.scrollTo(0, 0); } else { location.hash = hash; }
  };

  function header(r) {
    var cur = r.path === "phone" ? "phones" : r.path === "review" ? "reviews" : r.path;
    var nav = [["phones", "휴대폰", "#/phones"], ["guide", "하유 가이드", "#/guide"], ["reviews", "구매후기", "#/reviews"]];
    var me = H.state.loggedIn ? "내정보" : "로그인";
    return '<header class="hdr"><div class="wrap hdr__in">' +
      '<a class="logo" href="#/" aria-label="하이유플 첫 화면"><img src="img/logo-white.svg" alt="HIU+"></a>' +
      '<nav class="hdr__nav pc-only" aria-label="주 메뉴">' + nav.map(function (n) {
        return '<a href="' + n[2] + '"' + (cur === n[0] ? ' aria-current="page"' : "") + ">" + n[1] + "</a>";
      }).join("") + "</nav>" +
      '<div class="hdr__act">' +
      '<a class="hdr__btn pc-only" href="#/my">' + H.icon("user") + "<span>" + me + "</span></a>" +
      '<a class="hdr__btn pc-only" href="#/search" aria-label="검색">' + H.icon("search") + "</a>" +
      '<a class="hdr__btn mo-only orig" href="#/my" aria-label="' + me + '">' + H.icon("user") + "</a>" +
      '<a class="hdr__btn mo-only prop prop--flex" href="#/search" aria-label="검색">' + H.icon("search") + "</a>" +
      '<button class="hdr__btn mo-only" type="button" data-act="menu" aria-label="전체 메뉴">' + H.icon("menu") + "</button>" +
      "</div></div></header>";
  }
  function tabbar(key) {
    var cur = { home: "home", phones: "phones", product: "phones", launch: "phones", guides: "guide", guide: "guide", my: "my" }[key] || (/^(my|signup|partner)/.test(key) ? "my" : "");
    return [["home", "홈", "#/", "home"], ["phones", "휴대폰", "#/phones", "phone"], ["guide", "하유 가이드", "#/guide", "doc"], ["my", "내정보", "#/my", "user"]]
      .map(function (t) { return '<a href="' + t[2] + '"' + (cur === t[0] ? ' aria-current="page"' : "") + ">" + H.icon(t[3]) + "<span>" + t[1] + "</span></a>"; })
      .join("");
  }
  function footer() {
    var cs = C.cs, soon = "시안: 약관 화면은 지금 사이트 것을 그대로 써요";
    return '<footer class="ftr"><div class="wrap">' +
      '<div class="ftr__top"><img src="img/logo-black.svg" alt="HIU+">' +
      '<nav class="ftr__links" aria-label="바닥 메뉴"><a href="#/guide">하유 가이드</a><a href="#/cs">고객센터</a><a href="#/partner">파트너스</a>' +
      '<button type="button" data-act="toast" data-msg="' + soon + '">이용약관</button><button type="button" data-act="toast" data-msg="' + soon + '">개인정보 처리방침</button></nav>' +
      '<p class="ftr__tag">좋은 선택이 더 특별한 일상이 되는 곳, HIU+</p></div>' +
      '<p class="ftr__biz"><span>이 페이지는 하이유플 리뉴얼 시안이에요 · 실제 주문은 hiuplus.com</span><span>' + cs.biz + "</span><span>" + cs.addr + "</span><span>고객센터 " + cs.phone + "</span></p>" +
      "</div></footer>";
  }

  H.render = function () {
    var r = (H.route = H.parse());
    var key = (H.viewKey = viewKey(r));
    if (key === "tour" && H.runTour) { H.runTour(r); return; }
    var v = (H.views[key] || H.views.home)(r) || {};
    var b = document.body.classList;
    b.toggle("has-tab", v.tab !== false);
    b.toggle("no-tab", v.tab === false);
    b.toggle("has-bar", !!v.bar);
    b.toggle("proposals", !!H.state.proposals);
    b.toggle("memo-hidden", !!H.state.memoHidden);
    b.toggle("has-tour", !!H.state.tour);
    H.$("#app").innerHTML = header(r) + '<main id="main">' + (v.html || "") + "</main>" + (v.footer === false ? "" : footer()) + (v.bar ? '<div class="bar" id="bar">' + v.bar + "</div>" : "");
    H.$("#tab").innerHTML = tabbar(key);
    var tb = H.$("#tourBar");
    if (tb) tb.innerHTML = H.tourBar ? H.tourBar() : "";
    document.title = (v.title ? v.title + " — " : "") + "하이유플 리뉴얼 목업";
    if (H.after[key]) H.after[key](r);
    watchBar();
    if (H._tourAfter) { var fn = H._tourAfter; H._tourAfter = null; setTimeout(fn, 80); }
  };

  /* PC 아래 띠 — 오른쪽 칸의 주문 단추가 화면 밖으로 나가면 띠를 올린다.
   * 휴대폰은 띠가 늘 떠 있어 이 값과 상관없다 (대표 2026-09-17
   * «스크롤되다가 사라지면 다시 마우스로 드래그를 해야 되니 편하게 바꿔 달라») */
  function watchBar() {
    if (H._barOff) { H._barOff(); H._barOff = null; }
    document.body.classList.remove("bar-up");
    /* 화면이 바뀌면 띠 위 금액칸은 내려 둔다. 손잡이가 나와 있는 화면만 본문을 더 띄운다 */
    if (H.pdSheet) H.pdSheet(false);
    document.body.classList.toggle("bar-lip", !!H.$("#pdSheet"));
    if (!H.$("#bar")) return;
    var sel = ".pd-cta.pc-only .btn, .order-submit.pc-only .btn";
    var tick = function () {
      var cta = H.$(sel); // 옵션을 고치면 칸이 다시 그려지니 그때그때 찾는다
      if (!cta) { document.body.classList.add("bar-up"); return; }
      /* ★위로 지나갔을 때만 올린다 — 화면 맨 위(단추가 아직 아래에 있을 때)에서는 띠를 띄우지
       * 않는다 (대표 2026-09-17 «상단 화면에 주문하기 띠 나오는 건 없애줘») */
      var r = cta.getBoundingClientRect();
      document.body.classList.toggle("bar-up", r.bottom <= 24);
    };
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    H._barOff = function () { removeEventListener("scroll", tick); removeEventListener("resize", tick); };
    tick();
  }

  /* ---------- 창 · 서랍 · 알림 ---------- */
  var sheetToken = 0, drawerToken = 0, toastTimer = 0;
  H.openSheet = function (o) {
    o = o || {};
    var sh = H.$("#sheet"), dim = H.$("#dim"), f = H.$("#sheetFoot");
    sheetToken++;
    H.$("#sheetTitle").textContent = o.title || "";
    H.$("#sheetBody").innerHTML = o.body || "";
    f.innerHTML = o.foot || ""; f.hidden = !o.foot;
    sh.classList.toggle("sheet--wide", !!o.wide);
    if (sh.hidden) H._lastFocus = document.activeElement;
    sh.hidden = false; dim.hidden = false;
    requestAnimationFrame(function () { sh.classList.add("on"); dim.classList.add("on"); });
    document.body.style.overflow = "hidden";
    H.$("#sheetBody").scrollTop = 0;
    setTimeout(function () { var el = sh.querySelector("[data-focus]") || sh.querySelector(".sheet__x"); if (el) el.focus({ preventScroll: true }); }, 80);
  };
  H.setSheet = function (body, foot) {
    H.$("#sheetBody").innerHTML = body;
    if (foot !== undefined) { var f = H.$("#sheetFoot"); f.innerHTML = foot || ""; f.hidden = !foot; }
    H.$("#sheetBody").scrollTop = 0;
  };
  H.closeSheet = function (instant) {
    var sh = H.$("#sheet"), dim = H.$("#dim"), t = sheetToken;
    if (sh.hidden) return;
    sh.classList.remove("on");
    if (H.$("#drawer").hidden) { dim.classList.remove("on"); document.body.style.overflow = ""; }
    var done = function () { if (t !== sheetToken) return; sh.hidden = true; if (H.$("#drawer").hidden) dim.hidden = true; };
    if (instant === true) done(); else setTimeout(done, 280);
    if (instant !== true && H._lastFocus && document.contains(H._lastFocus)) { try { H._lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  };
  H.openDrawer = function (html) {
    var dr = H.$("#drawer"), dim = H.$("#dim");
    drawerToken++;
    dr.innerHTML = html; dr.hidden = false; dim.hidden = false;
    requestAnimationFrame(function () { dr.classList.add("on"); dim.classList.add("on"); });
    document.body.style.overflow = "hidden";
    setTimeout(function () { var x = dr.querySelector("button"); if (x) x.focus({ preventScroll: true }); }, 80);
  };
  H.closeDrawer = function (instant) {
    var dr = H.$("#drawer"), dim = H.$("#dim"), t = drawerToken;
    if (dr.hidden) return;
    dr.classList.remove("on");
    if (H.$("#sheet").hidden) { dim.classList.remove("on"); document.body.style.overflow = ""; }
    var done = function () { if (t !== drawerToken) return; dr.hidden = true; if (H.$("#sheet").hidden) dim.hidden = true; };
    if (instant === true) done(); else setTimeout(done, 280);
  };
  H.toast = function (msg) {
    var t = H.$("#toast");
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); }, 2600);
  };

  /* ---------- 누르기 · 입력 ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#/']");
    if (a) {
      H._forceTop = true;
      if (a.getAttribute("href") === location.hash) { e.preventDefault(); H.closeSheet(); H.closeDrawer(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    }
    if (e.target.id === "dim") { H.closeSheet(); H.closeDrawer(); return; }
    var el = e.target.closest("[data-act]");
    if (el && H.acts[el.dataset.act]) { e.preventDefault(); H.acts[el.dataset.act](el, e); }
  });
  document.addEventListener("input", function (e) { var el = e.target.closest("[data-input]"); if (el && H.inputs[el.dataset.input]) H.inputs[el.dataset.input](el, e); });
  document.addEventListener("change", function (e) { var el = e.target.closest("[data-change]"); if (el && H.inputs[el.dataset.change]) H.inputs[el.dataset.change](el, e); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { H.closeSheet(); H.closeDrawer(); if (H.pdSheet) H.pdSheet(false); } });

  H.acts.closeSheet = function () { H.closeSheet(); };
  H.acts.closeDrawer = function () { H.closeDrawer(); };
  H.acts.toast = function (el) { H.toast(el.dataset.msg || ""); };
  H.acts.go = function (el) { H.closeSheet(true); H.closeDrawer(true); H.go(el.dataset.to); };

  var scrollMem = {}, lastHash = "";
  window.addEventListener("hashchange", function () {
    scrollMem[lastHash] = window.scrollY;
    lastHash = location.hash;
    H.closeSheet(true); H.closeDrawer(true);
    H.render();
    var y = H._forceTop ? 0 : scrollMem[location.hash] || 0;
    H._forceTop = false;
    window.scrollTo(0, y);
  });

  H.start = function () {
    if (!location.hash || location.hash === "#") history.replaceState(null, "", "#/");
    lastHash = location.hash;
    H.render();
  };
})();
