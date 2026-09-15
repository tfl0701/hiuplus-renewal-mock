/* 하이유플 리뉴얼 목업 — 화면 순서대로 보기(직원 검토용)
 * #/tour/<흐름>/<번호> 로 들어오면 예시 값을 채운 뒤 그 화면으로 넘어가고, 위에 노란 순서 막대를 띄운다.
 */
(function () {
  "use strict";
  var H = window.H;
  var OID = "HU260915", OLD = "HU260903";

  function guest() { H.state.loggedIn = false; }
  function member() {
    H.state.loggedIn = true;
    H.state.user = Object.assign({}, H.state.user, { id: "hayu95", name: "김하유", birth: "19950312", phone: "010-1234-5678" });
  }
  function freshProduct() { H.state.carrier = "other"; delete H.sel[54]; }
  function draft54() {
    freshProduct();
    var sel = H.defaults(H.prod(54));
    sel.method = "move";
    H.state.draft = { pid: 54, sel: sel };
  }
  function orders(step) { return [H.makeOrder(54, step, OID, "2026.09.15")]; }
  function ordersWithPast(step) {
    var old = H.makeOrder(51, 3, OLD, "2026.09.03");
    old.addr = H.SAMPLE_ADDR[1];
    old.addr2 = "A동 702호";
    return orders(step).concat([old]);
  }

  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  function scrollToEl(sel) {
    return function () { setTimeout(function () { var el = H.$(sel); if (el) el.scrollIntoView({ block: "center" }); }, 80); };
  }
  function noPartner() { H.state.partner = null; H.pjoin = null; }
  function samplePartner() {
    H.pjoin = null;
    H.state.partner = { code: "K7M2QX", name: "김하유", phone: "010-1234-5678", type: "person", biz: "", bank: "국민", account: "123456-01-234567", holder: "김하유", channel: "", joined: "2026.09.15" };
  }
  function pjoinSample(o) {
    return Object.assign({ name: "김하유", phone: "010-1234-5678", type: "person", biz: "", bank: "", account: "", holder: "김하유", channel: "", agree: [false, false], tried: false }, o);
  }
  function adminClean() { H.state.guideEdits = {}; H.state.guideNew = []; H.state.guideHidden = []; H.state.feedMod = {}; H.editDraft = null; }
  var NEW_GUIDE = {
    slug: "same-number", cat: "가입 방법", title: "휴대폰을 바꿔도 번호는 그대로인가요?", summary: "번호이동도 기기변경도 쓰던 번호 그대로예요.", read: 1, home: false,
    body: [
      { t: "answer", text: "네. 번호이동도 기기변경도 쓰던 번호를 그대로 써요." },
      { t: "h", text: "가입 방법별로 보면" },
      { t: "list", items: ["번호이동 — SKT · KT · 알뜰폰에서 LG U+로 통신사만 옮기고, 번호는 그대로예요", "기기변경 — 지금 쓰는 LG U+ 번호 그대로 휴대폰만 바꿔요"] },
      { t: "cta", label: "내 조건으로 월 납부 금액 보기", to: "#/phones", last: true }
    ]
  };
  var MOD = { "8": { hide: true }, "164": { hidePhoto: true }, "165": { home: true }, "10": { home: true }, "9": { home: true } };

  var FLOWS = {
    order: {
      title: "주문하기", desc: "상품에서 로그인 · 주문서 · 접수 완료 · 진행 상황까지",
      steps: [
        { t: "상품 화면 · 아이폰 18 프로", go: "#/phone/54", setup: function () { guest(); freshProduct(); } },
        { t: "주문하기를 누르면 · 로그인 창", go: "#/phone/54", setup: function () { guest(); draft54(); }, after: function () { H.acts.login(null, "#/order"); } },
        { t: "회원가입 · 가입 방법 고르기", go: "#/signup?next=%23%2Forder", setup: function () { guest(); draft54(); } },
        { t: "일반 회원가입 · 다 채운 모습", go: "#/signup/form?next=%23%2Forder", setup: function () { guest(); draft54(); H.resetSignup(false); H.fillSignupSample(); } },
        { t: "가입 완료 · 1만 포인트", go: "#/signup/done?next=%23%2Forder", setup: function () { member(); draft54(); } },
        { t: "주문서 · 처음 모습", go: "#/order", setup: function () { member(); draft54(); H.resetOrderForm(false); } },
        { t: "주문서 · 빠진 칸 안내", go: "#/order", setup: function () { member(); draft54(); H.resetOrderForm(true); } },
        { t: "주문서 · 다 채운 모습", go: "#/order", setup: function () { member(); draft54(); H.resetOrderForm(false); H.fillOrderSample(); } },
        { t: "접수 완료", go: "#/done/" + OID, setup: function () { member(); H.state.orders = orders(0); } },
        { t: "온라인 신청서 작성 창", go: "#/done/" + OID, setup: function () { member(); H.state.orders = orders(0); }, after: function () { H.acts.writeForm({ dataset: { id: OID } }); } },
        { t: "신청서를 쓴 뒤", go: "#/done/" + OID, setup: function () { member(); H.state.orders = orders(1); } },
        { t: "마이페이지 · 담당자 확인 중", go: "#/my", setup: function () { member(); H.state.orders = orders(1); } },
        { t: "신청내역 상세 · 준비·배송", go: "#/my/order/" + OID, setup: function () { member(); H.state.orders = orders(2); } },
        { t: "배송조회 창 · 송장번호", go: "#/my/order/" + OID, setup: function () { member(); H.state.orders = orders(2); }, after: function () { H.acts.trackSheet({ dataset: { id: OID } }); } },
        { t: "신청내역 상세 · 개통완료", go: "#/my/order/" + OID, setup: function () { member(); H.state.orders = orders(3); } }
      ]
    },
    signup: {
      title: "회원가입", desc: "로그인 전 마이페이지부터 가입 완료까지",
      steps: [
        { t: "마이페이지 · 로그인 전", go: "#/my", setup: guest },
        { t: "로그인 창", go: "#/my", setup: guest, after: function () { H.acts.login(null, ""); } },
        { t: "회원가입 · 가입 방법 고르기", go: "#/signup", setup: guest },
        { t: "일반 회원가입 · 빈 칸", go: "#/signup/form", setup: function () { guest(); H.resetSignup(false); } },
        { t: "일반 회원가입 · 빠진 칸 안내", go: "#/signup/form", setup: function () { guest(); H.resetSignup(true); } },
        { t: "일반 회원가입 · 다 채운 모습", go: "#/signup/form", setup: function () { guest(); H.resetSignup(false); H.fillSignupSample(); } },
        { t: "가입 완료", go: "#/signup/done", setup: member },
        { t: "마이페이지 · 가입 직후", go: "#/my", setup: function () { member(); H.state.orders = []; H.state.recent = []; H.state.feedPosts = []; } }
      ]
    },
    my: {
      title: "마이페이지", desc: "신청내역 · 마일리지 · 최근 본 상품 · 후기 · 회원정보",
      steps: [
        { t: "마이페이지 첫 화면", go: "#/my", setup: function () { member(); H.state.orders = ordersWithPast(1); H.state.recent = [54, 51, 35, 42]; } },
        { t: "신청내역", go: "#/my/orders", setup: function () { member(); H.state.orders = ordersWithPast(1); } },
        { t: "신청내역 상세 · 진행 중", go: "#/my/order/" + OID, setup: function () { member(); H.state.orders = ordersWithPast(1); } },
        { t: "신청내역 상세 · 개통 끝난 주문", go: "#/my/order/" + OLD, setup: function () { member(); H.state.orders = ordersWithPast(1); } },
        { t: "마일리지", go: "#/my/mileage", setup: member },
        { t: "최근 본 상품", go: "#/my/recent", setup: function () { member(); H.state.recent = [54, 51, 35, 42]; } },
        { t: "내가 쓴 후기 · 아직 없음", go: "#/my/reviews", setup: function () { member(); H.state.feedPosts = []; } },
        { t: "후기 쓰기 창", go: "#/my/reviews", setup: function () { member(); H.state.feedPosts = []; }, after: function () { H.acts.writeReview(); } },
        { t: "알림 신청 내역", go: "#/my", setup: function () { member(); H.state.alerts = [{ pid: 56, date: "9월 15일" }]; }, after: function () { H.acts.myAlerts(); } },
        { t: "회원정보 수정", go: "#/my/account", setup: function () { member(); H.acc = null; } },
        { t: "연락처 바꾸기 창", go: "#/my/account", setup: member, after: function () { H.acts.phoneSheet(); } }
      ]
    },
    partner: {
      title: "파트너스", desc: "마이페이지 입구 · 안내 · 가입 · 추천코드 · 실적",
      steps: [
        { t: "마이페이지 · 파트너스 입구", go: "#/my", setup: function () { member(); noPartner(); H.state.orders = []; } },
        { t: "파트너스 안내", go: "#/partner", setup: function () { member(); noPartner(); } },
        { t: "파트너 가입 · 로그인 안 했을 때", go: "#/partner/join", setup: function () { guest(); noPartner(); } },
        { t: "파트너 가입 · 처음 모습", go: "#/partner/join", setup: function () { member(); noPartner(); } },
        { t: "파트너 가입 · 빠진 칸 안내", go: "#/partner/join", setup: function () { member(); noPartner(); H.pjoin = pjoinSample({ type: "biz", bank: "국민", tried: true }); } },
        { t: "파트너 가입 · 다 채운 모습", go: "#/partner/join", setup: function () { member(); noPartner(); H.pjoin = pjoinSample({ bank: "국민", account: "123456-01-234567", agree: [true, true] }); } },
        { t: "추천코드를 만든 뒤", go: "#/partner/done", setup: function () { member(); samplePartner(); } },
        { t: "파트너 실적 · 예시", go: "#/partner/stats", setup: function () { member(); samplePartner(); } },
        { t: "마이페이지 · 내 추천 링크", go: "#/my", setup: function () { member(); samplePartner(); H.state.orders = []; } }
      ]
    },
    browse: {
      title: "둘러보기", desc: "첫 화면 · 목록 · 상품 · 알고사기 · 구매후기 피드 · 고객센터",
      steps: [
        { t: "첫 화면", go: "#/" },
        { t: "첫 화면 · 후기 한 줄", go: "#/", setup: function () { H.state.feedMod = {}; }, after: scrollToEl(".rv-row") },
        { t: "휴대폰 목록 · 아이폰", go: "#/phones?cat=iphone" },
        { t: "휴대폰 목록 · 갤럭시 Z부터", go: "#/phones?cat=galaxy&series=z8" },
        { t: "상품 화면 · 아이폰 18 프로", go: "#/phone/54", setup: freshProduct },
        { t: "요금제 고르기 창", go: "#/phone/54", setup: freshProduct, after: function () { H.acts.planSheet(); } },
        { t: "출시 전 상품 · 아이폰 듀오", go: "#/phone/56" },
        { t: "출시 알림 신청 창", go: "#/phone/56", after: function () { H.acts.alert({ dataset: { pid: "56" } }); } },
        { t: "알고사기 목록", go: "#/guide" },
        { t: "알고사기 글 · 선택약정 비교", go: "#/guide/support-or-select" },
        { t: "알고사기 글 끝 · 보던 휴대폰으로 가는 단추", go: "#/guide/plan-down", setup: function () { H.state.recent = [54]; }, after: scrollToEl(".art-cta--last") },
        { t: "구매후기 피드", go: "#/reviews", setup: function () { H.state.feedMod = {}; } },
        { t: "구매후기 · 사진만", go: "#/reviews?f=photo", setup: function () { H.state.feedMod = {}; } },
        { t: "후기 한 편", go: "#/review/165", setup: function () { H.state.feedMod = {}; } },
        { t: "후기 올리기 창", go: "#/reviews", setup: member, after: function () { H.acts.writeReview(); } },
        { t: "고객센터", go: "#/cs" },
        { t: "AI 상담 창", go: "#/cs", after: function () { H.acts.chat(); } },
        { t: "검색 · «폴드8»", go: "#/search?q=%ED%8F%B4%EB%93%9C8" },
        { t: "전체 메뉴", go: "#/", after: function () { H.acts.menu(); } }
      ]
    },
    admin: {
      title: "직원 관리", desc: "알고사기 글 고치기 · 새 글 · 구매후기 감추기 (실제로는 자비스웹 안)",
      steps: [
        { t: "관리 첫 화면", go: "#/admin", setup: adminClean },
        { t: "알고사기 글 목록 · 한 글 숨김", go: "#/admin/guides", setup: function () { adminClean(); H.state.guideHidden = ["installment"]; } },
        { t: "글 고치기 · 요금제 낮추기 글", go: "#/admin/guide/plan-down", setup: adminClean },
        { t: "새 글 쓰기 · 빈 칸", go: "#/admin/guide/new", setup: adminClean },
        { t: "새 글 쓰기 · 채운 모습", go: "#/admin/guide/new", setup: function () { adminClean(); H.editDraft = Object.assign(copy(NEW_GUIDE), { _slug: "new", _isNew: true }); } },
        { t: "저장한 뒤 미리보기", go: "#/guide/same-number?preview=1", setup: function () { adminClean(); H.state.guideNew = [copy(NEW_GUIDE)]; } },
        { t: "구매후기 피드 관리", go: "#/admin/reviews", setup: function () { adminClean(); H.state.feedMod = copy(MOD); } },
        { t: "감춘 뒤 손님 피드", go: "#/reviews", setup: function () { adminClean(); H.state.feedMod = copy(MOD); } },
        { t: "첫 화면 후기 줄 · 고른 후기만", go: "#/", setup: function () { adminClean(); H.state.feedMod = copy(MOD); }, after: scrollToEl(".rv-row") }
      ]
    }
  };
  var ORDER = ["order", "signup", "my", "partner", "browse", "admin"];

  H.runTour = function (r) {
    var key = r.parts[1], flow = FLOWS[key];
    if (!flow) { location.replace("#/screens"); return; }
    var n = Math.min(Math.max(parseInt(r.parts[2], 10) || 1, 1), flow.steps.length), st = flow.steps[n - 1];
    H.closeSheet(true);
    H.closeDrawer(true);
    H.state.welcomed = true;
    if (st.setup) st.setup();
    H.state.tour = { flow: key, n: n };
    H.save();
    H._tourAfter = st.after || null;
    H._forceTop = true;
    if (location.hash === st.go) { H.render(); window.scrollTo(0, 0); } else { location.replace(st.go); }
  };

  H.tourBar = function () {
    var t = H.state.tour, flow = t && FLOWS[t.flow];
    if (!flow) return "";
    var n = t.n, len = flow.steps.length, st = flow.steps[n - 1];
    var prev = n > 1 ? `<a class="tb-btn" href="#/tour/${t.flow}/${n - 1}" aria-label="이전 화면">${H.icon("chev-l", "ic--sm")}</a>` : `<span class="tb-btn is-off" aria-hidden="true">${H.icon("chev-l", "ic--sm")}</span>`;
    var next = n < len ? `<a class="tb-btn tb-btn--next" href="#/tour/${t.flow}/${n + 1}">다음${H.icon("chev-r", "ic--sm")}</a>` : `<a class="tb-btn tb-btn--next" href="#/screens">목록</a>`;
    return `<div class="tourbar" role="region" aria-label="화면 순서대로 보기">
      <a class="tourbar__meta" href="#/screens"><b class="num">${flow.title} ${n}/${len}</b><span>${st.t}</span></a>
      ${prev}${next}<button type="button" class="tb-x" data-act="tourClose" aria-label="순서 보기 끝내기">${H.icon("close", "ic--sm")}</button></div>`;
  };
  H.acts.tourClose = function () { H.state.tour = null; H.save(); H.rerender(); };

  H.views.screens = function () {
    return {
      title: "화면 순서대로 보기",
      html: `<div class="wrap">
  <header class="ph"><h1>화면 순서대로 보기</h1><p>직원 검토용이에요. 흐름을 고르면 로그인이나 입력 없이 예시 값으로 한 화면씩 넘겨 볼 수 있어요. 위에 뜨는 노란 막대의 «다음»을 누르면 돼요.</p></header>
  <div class="flows">${ORDER.map(function (k) {
    var f = FLOWS[k];
    return `<section class="flow-card" aria-labelledby="fl-${k}">
      <div class="flow-card__hd"><div><h2 id="fl-${k}">${f.title}</h2><p>${f.desc} · ${f.steps.length}화면</p></div><a class="btn btn--ink btn--sm" href="#/tour/${k}/1">처음부터 보기</a></div>
      <ol>${f.steps.map(function (s, i) { return `<li><a href="#/tour/${k}/${i + 1}"><span class="num">${i + 1}</span>${s.t}</a></li>`; }).join("")}</ol>
    </section>`;
  }).join("")}</div>
  <p class="demo-note"><span class="demo-tag">시안</span>순서 보기는 이 휴대폰 안의 예시 값만 바꿔요. 처음 상태로 돌리려면 마이페이지 맨 아래 «목업 처음 상태로 되돌리기»</p>
</div>`
    };
  };

  /* 처음 들어온 직원에게 한 번만 안내 */
  H.after.home = function () {
    if (H.state.welcomed || H.state.tour) return;
    H.state.welcomed = true;
    H.save();
    setTimeout(function () {
      if (H.viewKey !== "home") return;
      H.openSheet({
        title: "하이유플 리뉴얼 목업이에요",
        body: `<p class="help-t help-t--lead">직원 검토용 시안이에요. 실제로 주문 · 가입되지 않아요.</p>
          <div class="consult-list">
            <a class="cs-card cs-card--dark" href="#/tour/order/1"><span class="cs-card__ic">${H.icon("arrow")}</span><b>주문 흐름 순서대로 보기</b><small>상품 → 로그인 · 회원가입 → 주문서 → 접수 완료 → 진행 상황 (${FLOWS.order.steps.length}화면)</small></a>
            <a class="cs-card" href="#/screens"><span class="cs-card__ic">${H.icon("doc")}</span><b>화면 순서대로 보기 목록</b><small>회원가입 · 마이페이지 · 파트너스 · 둘러보기 · 직원 관리</small></a>
            <button type="button" class="cs-card" data-act="closeSheet"><span class="cs-card__ic">${H.icon("home")}</span><b>그냥 둘러보기</b><small>노란 연필 단추에서 언제든 다시 열 수 있어요</small></button>
          </div>`
      });
    }, 500);
  };
})();
