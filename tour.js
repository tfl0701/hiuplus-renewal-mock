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
        { t: "마이페이지 · 가입 직후", go: "#/my", setup: function () { member(); H.state.orders = []; H.state.recent = []; H.state.myReviews = []; } }
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
        { t: "내가 쓴 후기 · 아직 없음", go: "#/my/reviews", setup: function () { member(); H.state.myReviews = []; } },
        { t: "후기 쓰기 창", go: "#/my/reviews", setup: function () { member(); H.state.myReviews = []; }, after: function () { H.acts.writeReview(); } },
        { t: "알림 신청 내역", go: "#/my", setup: function () { member(); H.state.alerts = [{ pid: 56, date: "9월 15일" }]; }, after: function () { H.acts.myAlerts(); } },
        { t: "회원정보 수정", go: "#/my/account", setup: function () { member(); H.acc = null; } },
        { t: "연락처 바꾸기 창", go: "#/my/account", setup: member, after: function () { H.acts.phoneSheet(); } }
      ]
    },
    browse: {
      title: "둘러보기", desc: "첫 화면 · 목록 · 상품 · 알고사기 · 후기 · 고객센터",
      steps: [
        { t: "첫 화면", go: "#/" },
        { t: "휴대폰 목록 · 갤럭시 Z", go: "#/phones?cat=galaxy-z" },
        { t: "상품 화면 · 아이폰 18 프로", go: "#/phone/54", setup: freshProduct },
        { t: "요금제 고르기 창", go: "#/phone/54", setup: freshProduct, after: function () { H.acts.planSheet(); } },
        { t: "출시 전 상품 · 아이폰 듀오", go: "#/phone/56" },
        { t: "출시 알림 신청 창", go: "#/phone/56", after: function () { H.acts.alert({ dataset: { pid: "56" } }); } },
        { t: "알고사기 목록", go: "#/guide" },
        { t: "알고사기 글 · 선택약정 비교", go: "#/guide/support-or-select" },
        { t: "구매후기", go: "#/reviews" },
        { t: "고객센터", go: "#/cs" },
        { t: "AI 상담 창", go: "#/cs", after: function () { H.acts.chat(); } },
        { t: "검색 · «폴드8»", go: "#/search?q=%ED%8F%B4%EB%93%9C8" },
        { t: "전체 메뉴", go: "#/", after: function () { H.acts.menu(); } }
      ]
    }
  };
  var ORDER = ["order", "signup", "my", "browse"];

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
            <a class="cs-card" href="#/screens"><span class="cs-card__ic">${H.icon("doc")}</span><b>화면 순서대로 보기 목록</b><small>회원가입 · 마이페이지 · 둘러보기</small></a>
            <button type="button" class="cs-card" data-act="closeSheet"><span class="cs-card__ic">${H.icon("home")}</span><b>그냥 둘러보기</b><small>노란 연필 단추에서 언제든 다시 열 수 있어요</small></button>
          </div>`
      });
    }, 500);
  };
})();
