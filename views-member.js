/* 하이유플 리뉴얼 목업 — 회원가입 · 마이페이지 (메뉴와 문구는 지금 사이트 그대로) */
(function () {
  "use strict";
  var H = window.H;
  var SG_TERMS = [["만 14세 이상입니다.", true], ["이용약관 동의", true], ["개인정보 수집 및 이용에 대한 동의", true], ["이벤트 및 쇼핑혜택 SMS 수신 동의", false], ["이벤트 및 쇼핑혜택 이메일 수신 동의", false]];

  function back(href, label) { return `<a class="back" href="${href}">${H.icon("chev-l")}${label}</a>`; }
  function findOrder(id) { return H.state.orders.find(function (x) { return x.id === id; }); }
  function stepName(o) { return H.STEP_NAMES[o.step]; }
  function nextParam(r) { return r.q.next ? "?next=" + encodeURIComponent(r.q.next) : ""; }
  function needLogin(title) {
    return {
      title: title,
      html: `<div class="wrap me-narrow"><header class="me-hd"><h1>${title}</h1><p>로그인이 필요합니다.</p></header>
        <div class="login-box"><a class="btn btn--mg btn--block" href="#/signup">회원가입하고 1만 포인트 받기</a><button type="button" class="btn btn--ink btn--block" data-act="login">로그인</button></div></div>`
    };
  }
  function memoToggleRow() {
    return `<button type="button" data-act="toggleMemoHidden">기획 메모 단추 ${H.state.memoHidden ? "다시 보이기" : "숨기기"}<small class="demo-tag">시안</small></button>`;
  }
  H.mileageLeft = function () {
    var used = H.state.orders.reduce(function (a, o) { return a + (o.usedMileage || 0); }, 0);
    return Math.max(0, H.state.mileage - used);
  };
  function nextAction(o) {
    return [
      ["온라인 신청서를 써 주세요", "신청서를 쓰면 담당자가 확인을 시작해요.", `<button type="button" class="btn btn--mg btn--block" data-act="writeForm" data-id="${o.id}">온라인 신청서 작성하기</button>`],
      ["신청서 작성을 마쳤어요", "담당자가 확인하고 카카오톡으로 가입내역을 보내드려요. «확인했습니다»라고 답해 주시면 개통을 진행해요.", `<button type="button" class="btn btn--line btn--block" data-act="joinInfo" data-id="${o.id}">가입내역은 이렇게 받아요</button>`],
      ["개통과 배송을 준비하고 있어요", "택배를 보내는 날 알림톡으로 택배사와 송장번호를 보내드려요. 택배비는 무료예요.", ""],
      ["개통이 끝났어요", "새 휴대폰 잘 쓰세요. 궁금한 점은 고객센터로 물어봐 주세요.", `<a class="btn btn--line btn--block" href="#/my/reviews">후기 남기기</a>`]
    ][o.step];
  }
  function demoStep(o) {
    return `<div class="demo-tools"><span class="demo-tag">시안</span><button type="button" class="btn btn--soft btn--sm" data-act="demoStep" data-id="${o.id}">다음 단계 보기</button></div>`;
  }
  H.orderCard = function (o) {
    var p = H.prod(o.pid), next = nextAction(o);
    return `<div class="order-card">
      <div class="order-card__top"><span class="num">신청번호 ${o.id}${o.example ? ' <span class="demo-tag">예시</span>' : ""}</span><span class="num">${o.date}</span></div>
      <a class="sum__prod" href="#/my/order/${o.id}"><span class="sum__th"><img src="${H.img(p, o.sel.color)}" alt=""></span><span><b>${p.name}</b><small class="num">${p.vols[o.sel.vol][0]} · ${p.colors[o.sel.color][0]} · 월 ${H.won(o.monthly)}</small></span></a>
      ${H.tracker(o.step)}
      ${o.step === 2 ? trackRow(o) : ""}
      <p class="order-card__next">${next[0]}</p><p class="help-t">${next[1]}</p>${next[2]}
      <a class="link-arrow pd-more" href="#/my/order/${o.id}">눌러서 지금 어디쯤인지 보기${H.icon("arrow")}</a>
      ${demoStep(o)}
    </div>`;
  };
  function orderRow(o) {
    var p = H.prod(o.pid);
    return `<a class="o-row" href="#/my/order/${o.id}"><span class="sum__th"><img src="${H.img(p, o.sel.color)}" alt=""></span><span class="o-row__txt"><b>${p.name}</b><small class="num">${o.date} · 신청번호 ${o.id}</small></span><span class="status-chip${o.step === 3 ? " status-chip--done" : ""}">${stepName(o)}</span></a>`;
  }

  /* 배송조회 — 지금 사이트: «택배사 송장번호 · 눌러서 지금 어디쯤인지 보기 · 배송조회» */
  function trackRow(o) {
    return `<div class="track"><span class="track__txt"><b class="num">${H.esc(o.courier || "CJ대한통운")} ${H.esc(o.trackingNo || "123456789012")}</b><small>눌러서 지금 어디쯤인지 보기</small></span><button type="button" class="btn btn--ink btn--sm" data-act="trackSheet" data-id="${o.id}">배송조회</button></div>`;
  }
  /* 지금 사이트 코드(courierTracking.ts)와 같게: 다섯 택배사는 번호가 들어간 조회 화면, 나머지는 네이버 택배조회.
   * 배송 위치를 이 사이트 안에서 보여 주는 조회 API 는 없다 → 택배사 화면으로 넘긴다 */
  H.acts.trackSheet = function (el) {
    var o = findOrder(el.dataset.id) || {}, courier = o.courier || "CJ대한통운", no = o.trackingNo || "123456789012";
    var p = H.prod(o.pid || 54), direct = /우체국|CJ|대한통운|한진|롯데|로젠/.test(courier);
    var msg = `${p.name} 상품이 오늘 출고되었습니다! 📦\n(택배사: ${courier}, 송장번호: ${no})\n\n상품을 수령하신 후, 카카오톡으로 수령 확인을 해주셔야\n개통 진행을 할 수 있습니다. 🔑\n…`;
    H.openSheet({
      title: "배송조회",
      body: `<div class="track track--sheet"><span class="track__txt"><b class="num">${H.esc(courier)} ${H.esc(no)}</b><small>예시 번호예요</small></span><button type="button" class="btn btn--line btn--sm" data-act="toast" data-msg="송장번호를 복사했어요">번호 복사</button></div>
        <button type="button" class="btn btn--ink btn--block track-go" data-act="toast" data-msg="시안: ${H.esc(courier)} 배송조회 화면이 새 창으로 열려요">${H.esc(courier)}에서 배송 위치 보기${H.icon("arrow")}</button>
        <p class="help-t">${direct ? "택배사 조회 화면이 송장번호가 들어간 채로 열려요." : "네이버 택배조회가 열려요. 송장번호를 붙여 넣어 조회해요."} 배송 위치는 택배사 화면에서 확인해요.</p>
        <p class="kchat-label">택배를 보낸 날 이렇게 와요 · 알림톡 예시</p>
        <div class="kchat"><div class="kchat__who"><span class="kchat__av">H+</span><b>하이유플</b><small>알림톡</small></div><div class="kchat__bubble">${H.esc(msg)}</div></div>`
    });
  };

  /* 가입내역 — 지금은 담당자가 자비스웹 접수 상세 «양식(복사용) › 최종안내»를 복사해 카카오톡으로 보낸다(자동 발송 없음).
   * 글은 orderForm.ts 최종안내 그대로(LGU+ «약정»), 값만 이 신청으로 채움 */
  var FINAL_REST = "유지 기간 일수 계산은 하이유플 마이페이지 신청내역 보시면 (개통완료시점부터) 경과일이 표시됩니다\n일시 정지 기간없이 정상 사용시 경과일 185일 이후에 요금제 변경하시면됩니다\n저희한테 문의 주셔도 됩니다\n\n참고로, 해외 출국 등의 일시정지나 기타 정지 기간은\n유지 일수에 포함되지 않아 현재 정확한 날짜 계산이 어려운 점 양해 부탁드립니다.\n\n✅ 꼭 확인해 주세요.\n요금제 유지 기간은 준수 의무가 있으며,\n하루라도 일찍 요금제를 변경하실 경우,\n하이유플 할인(유통망지원금) 금액 및 위약금이 청구됩니다.\n반드시 숙지 후 진행 부탁드립니다.\n개통 후 185일 이전에 요금제 변경, 해지(직권해지 포함) 시\n받으신 할인금액 전액이 청구됩니다.\n185일 이후에는\n타 통신사 이동, 해지(직권해지 포함), 특정 요금제 이하로 변경 시\n일할 계산된 위약금이 발생할 수 있습니다.\n\n단말기는 개통 전 개봉하실 경우 단순변심으로 인한 반품이 불가능합니다.\n휴대폰은 반드시 개통 완료 후 개봉해주시기 바랍니다.\n\n(부정 개통 · 유심 다른 기기 사용 시 혜택 반환 안내가 이어져요)\n\n확인하셨다면 \"확인했습니다\" 라고 답변 부탁드립니다.\n(답변 시 위 내용에 동의한 것으로 간주됩니다.)";
  function finalHead(o) {
    var p = H.prod(o.pid), s = o.sel, r = H.price(p, s);
    return `${H.state.user.name} 고객님, LGU+ 접수 건 안내드립니다.\n\n아래 접수 내용이 정확한지 확인 부탁드립니다.\n\n주문 모델 : ${p.name} ${p.vols[s.vol][0]} ${p.colors[s.color][0]}\n\n할부원금(최종 기기값): ${H.num(r.principal)}원\n\n가입 상품:  ${s.discount === "select" ? "선택약정" : "공시지원금"} 약정\n요금제: ${r.plan.name} (${H.num(r.planFeeBase)}원)\n요금제 유지 기간: 185일\n185일 이후 하향 가능 요금제: 47,000원 까지 하향가능`;
  }
  H.acts.joinInfo = function (el) {
    var o = findOrder(el.dataset.id);
    if (!o) return;
    H.openSheet({
      title: "가입내역은 이렇게 받아요", wide: true,
      body: `<ol class="how3">
          <li><i>1</i><div><b>담당자가 신청 내용을 확인해요</b><span>온라인 신청서 작성을 마친 뒤 시작해요.</span></div></li>
          <li><i>2</i><div><b>카카오톡으로 가입내역이 와요</b><span>모델 · 할부원금 · 요금제 · 유지 기간 · 위약금 안내가 한 번에 와요.</span></div></li>
          <li><i>3</i><div><b>«확인했습니다»라고 답해 주세요</b><span>답을 받으면 개통을 진행해요. 진행 상황은 문자로 알려드려요.</span></div></li>
        </ol>
        <p class="kchat-label">이렇게 와요 · 이 신청으로 채운 예시</p>
        <div class="kchat"><div class="kchat__who"><span class="kchat__av">H+</span><b>하이유플</b></div>
          <div class="kchat__bubble">${H.esc(finalHead(o))}<details class="kchat__more"><summary>이어지는 안내 보기</summary><p>${H.esc(FINAL_REST)}</p></details></div>
          <div class="kchat__me">확인했습니다</div></div>
        <p class="a-note">${H.icon("info")}<span>같은 내용은 로그인 없이 여는 «신청내역 확인» 링크로도 볼 수 있어요.</span></p>`,
      foot: `<a class="btn btn--ink btn--block" href="#/receipt/${o.id}">신청내역 확인 화면 보기</a><p class="demo-note"><span class="demo-tag">시안</span>지금은 담당자가 자비스웹에서 글을 복사해 카카오톡으로 보내요</p>`
    });
  };

  /* 신청내역 확인 — 지금 사이트 /receipt/<토큰>(로그인 없이 · 30일 · 개통완료 · 취소 · 직원이 끊으면 닫힘)과 같은 화면.
   * «내용이 맞아요»는 제안(지금은 카카오톡 답장으로 받음) */
  H.views.receipt = function (r) {
    var o = findOrder(r.parts[1]);
    if (!o) return { title: "신청내역 확인", html: `<div class="wrap me-narrow"><p class="empty">링크가 닫혔거나 없는 신청이에요.<br>개통이 끝나거나 30일이 지나면 링크가 닫혀요.</p></div>` };
    var p = H.prod(o.pid), s = o.sel, pr = H.price(p, s), u = H.state.user;
    var phone = u.phone.slice(0, 6) + "**-**" + u.phone.slice(-2);
    return {
      title: "신청내역 확인", tab: false,
      html: `<div class="wrap me-narrow">
  <p class="rc-link">${H.icon("shield", "ic--sm")}로그인 없이 여는 링크예요 · 30일 동안 열리고 개통이 끝나면 닫혀요</p>
  <header class="ph ph--tight"><p class="eyebrow-sm num">신청번호 ${o.id} · ${o.date}</p><h1>${stepName(o)}</h1></header>
  <section class="form-sec"><h2>가입하시는 분</h2><dl class="kv"><div><dt>명의자</dt><dd>${H.esc(u.name)}</dd></div><div><dt>개통 번호</dt><dd class="num">${H.esc(phone)}</dd></div><div><dt>받으실 곳</dt><dd>${H.esc(o.addr || "-")}</dd></div></dl></section>
  <section class="form-sec"><h2>휴대폰 · 가입 조건</h2><dl class="kv">
    <div><dt>모델</dt><dd>${p.name} ${p.vols[s.vol][0]} · ${p.colors[s.color][0]}</dd></div>
    <div><dt>가입 조건</dt><dd>LG U+ ${H.methodLabel(s.method)} · ${H.discountLabel(s.discount)} · ${pr.months ? pr.months + "개월 할부" : "일시불"}</dd></div>
    <div><dt>요금제</dt><dd>${pr.plan.name} · 월 ${H.won(pr.planFeeBase)}</dd></div>
    <div><dt>유지 기간</dt><dd>185일 · 이후 월 47,000원까지 낮출 수 있어요</dd></div>
  </dl></section>
  <section class="form-sec"><h2>금액</h2><div class="sum sum--flat"><div class="pbox__rows">${H.priceRows(p, s, pr)}</div><div class="sum__total"><span>월 납부 금액</span><b class="num">${H.won(pr.monthlyTotal)}</b></div></div></section>
  <div class="rc-confirm">${o.confirmed ? `<p class="ok-t">${H.icon("check", "ic--sm")} ${H.esc(o.confirmed)}에 확인했어요</p>` : `<button type="button" class="btn btn--mg btn--block" data-act="rcConfirm" data-id="${o.id}">내용이 맞아요</button>`}
    <p class="demo-note"><span class="demo-tag">제안</span>누르면 자비스웹 접수 상세에 «손님 확인»이 남아요. 지금은 카카오톡 답장으로 받아요</p></div>
</div>`
    };
  };
  H.acts.rcConfirm = function (el) {
    var o = findOrder(el.dataset.id);
    if (!o) return;
    o.confirmed = H.today();
    H.save();
    H.rerender();
    H.toast("확인했어요. 담당자에게 전달돼요 (시안)");
  };

  /* ---------- 마이페이지 ---------- */
  /* 185일 뒤 요금제 낮추기 — 개통하고 나면 잊어버리는 자리라 마이페이지에서 챙겨 준다
   * (대표 2026-09-17 «고객이 185일 이후에 어떤거로 변경하는게 좋다는걸 볼수있는 칸을 만들어줘») */
  function planDownCard(o) {
    if (!o) return "";
    var p = H.prod(o.pid);
    if (!p) return "";
    var sel = o.sel, r = H.price(p, sel), now = r.plan;
    if (!now || r.planFeeBase <= H.DOWN.fee) return "";
    var sale = sel.discount === "select";
    var feeOf = function (f) { return sale ? Math.round(f * 0.75) : f; };

    var d = new Date(String(o.date).replace(/\./g, "-"));
    d.setDate(d.getDate() + 185);
    var when = d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
    var left = Math.ceil((d - new Date()) / 86400000);
    var ready = left <= 0;

    var list = Object.keys(H.D.plans).map(function (k) { return H.D.plans[k]; })
      .filter(function (x) { return x.fee >= H.DOWN.fee && x.fee < r.planFeeBase; })
      .sort(function (a, b) { return a.fee - b.fee; }).slice(0, 3);
    if (!list.length) return "";

    return `<section class="pdown">
      <div class="pdown__hd">
        <div><b>185일 뒤엔 요금제를 낮출 수 있어요</b>
          <small>지금 <b>${H.esc(now.name)}</b> 월 ${H.won(r.planFee)}${sale ? " (선택약정 25% 뺀 금액)" : ""}</small></div>
        <span class="pdown__d ${ready ? "on" : ""}">${ready ? "지금 바꿀 수 있어요" : "D-" + left}</span>
      </div>
      <p class="pdown__when">개통일 ${H.esc(o.date)} 기준 · <b>${when}</b>부터</p>
      <ul class="pdown__list">${list.map(function (x, i) {
      var save = r.planFee - feeOf(x.fee);
      return `<li${i === 0 ? ' class="best"' : ""}>
          <div><b>${H.esc(x.name)}${i === 0 ? '<span class="tag">가장 많이 아껴요</span>' : ""}</b>
            <small>${H.esc(x.data)}${x.after ? " · 다 쓰면 " + H.esc(x.after) : ""}</small></div>
          <div class="pdown__n"><b class="num">월 ${H.won(feeOf(x.fee))}</b><small class="num">매달 ${H.won(save)} ↓</small></div></li>`;
    }).join("")}</ul>
      <p class="help-t">월 47,000원(${H.DOWN.name})보다 더 낮추면 받은 지원금을 토해내야 할 수 있어요. 선택약정 25% 할인은 바꾼 요금제에도 그대로 이어져요.</p>
      <div class="pdown__acts"><button type="button" class="btn btn--line btn--sm" data-act="consult">바꾸는 것 상담받기</button><a class="btn btn--soft btn--sm" href="#/guide/plan-down">왜 185일인가요?</a></div>
    </section>`;
  }

  H.views.my = function () {
    var s = H.state;
    if (!s.loggedIn) {
      return {
        title: "마이페이지",
        html: `<div class="wrap me-narrow">
  <header class="me-hd"><h1>마이페이지</h1><p>로그인하면 신청 진행 상황과 마일리지를 한곳에서 볼 수 있어요.</p></header>
  <div class="login-box">
    <a class="btn btn--mg btn--block" href="#/signup">회원가입하고 1만 포인트 받기</a>
    <p class="or"><span>이미 회원이세요?</span></p>
    <button type="button" class="btn btn--kakao btn--block" data-act="loginDo">${H.icon("kakao", "ic--fill")}카카오 로그인</button>
    <button type="button" class="btn btn--naver btn--block" data-act="loginDo">네이버 로그인</button>
    <button type="button" class="btn btn--line btn--block" data-act="login">아이디로 로그인</button>
    <p class="demo-note"><span class="demo-tag">시안</span>누르면 예시 계정(김하유)으로 로그인돼요</p>
  </div>
  <nav class="menu-list" aria-label="마이페이지 메뉴"><a href="#/screens">화면 순서대로 보기<small class="demo-tag">시안</small></a><a href="#/cs">고객센터${H.icon("chev-r")}</a>${memoToggleRow()}</nav>
</div>`
      };
    }
    var cur = s.orders.find(function (o) { return o.step < 3; }) || s.orders[0];
    var tiles = [["신청건수", s.orders.length + "건", "#/my/orders"], ["마일리지", H.num(H.mileageLeft()) + "P", "#/my/mileage"], ["최근 본 상품", s.recent.length + "개", "#/my/recent"], ["구매 후기", (s.feedPosts || []).length + "개", "#/my/reviews"]]
      .map(function (t) { return `<a class="tile" href="${t[2]}"><small>${t[0]}</small><b class="num">${t[1]}</b></a>`; }).join("");
    var current = cur ? H.orderCard(cur) :
      `<div class="order-card"><p class="order-card__next order-card__next--first">진행 중인 신청이 없어요</p><p class="help-t">마음에 드는 휴대폰을 고르면 여기서 진행 상황을 볼 수 있어요.</p>
        <div class="demo-tools"><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a><button type="button" class="btn btn--soft btn--sm" data-act="demoOrder">예시 신청 보기</button></div></div>`;
    return {
      title: "마이페이지",
      html: `<div class="wrap"><div class="me-grid">
  <div>
    <header class="me-hd"><h1>${H.esc(s.user.name)}님</h1><p>아이디 ${H.esc(s.user.id)} · <a class="me-edit" href="#/my/account">회원정보 수정 ›</a></p></header>
    <div class="tiles">${tiles}</div>
    ${planDownCard(cur)}
    ${s.partner ? `<div class="ref-card"><div><b>내 추천 링크</b><small class="num">hiuplus.com/${s.partner.code}</small></div><div class="ref-card__acts"><button type="button" class="btn btn--line btn--sm" data-act="copyRef">복사</button><a class="btn btn--ink btn--sm" href="#/partner/stats">내 실적</a></div></div>`
      : `<a class="ref-card ref-card--join" href="#/partner"><div><b>하이유플 파트너스</b><small>지인에게 링크를 보내고 개통 1건당 20,000원 받기</small></div>${H.icon("chev-r")}</a>`}
    <div class="quick">
      <button type="button" data-act="consult"><b>중고폰 팔기</b><small>쓰던 폰 시세 조회·판매</small></button>
      <a href="#/together"><b>인터넷 같이 하기</b><small>결합 할인 · 상담</small></a>
    </div>
    <nav class="menu-list" aria-label="마이페이지 메뉴">
      <button type="button" data-act="myAlerts">알림 신청 내역<small class="num">${s.alerts.length}건</small></button>
      <a href="#/my/account">회원정보 수정${H.icon("chev-r")}</a>
      <a href="#/cs">고객센터${H.icon("chev-r")}</a>
      <button type="button" data-act="logout">로그아웃</button>
      <a href="#/screens">화면 순서대로 보기<small class="demo-tag">시안</small></a>
      ${memoToggleRow()}
      <button type="button" data-act="resetMock">목업 처음 상태로 되돌리기<small class="demo-tag">시안</small></button>
    </nav>
  </div>
  <div>
    <h2 class="me-sec-t">진행 중인 신청</h2>${current}
    <div class="sec-row"><h2 class="me-sec-t">최근 신청내역</h2><a class="link-arrow" href="#/my/orders">전체 보기${H.icon("arrow")}</a></div>
    ${s.orders.length ? `<div class="o-list">${s.orders.slice(0, 3).map(orderRow).join("")}</div>` : '<p class="help-t">아직 신청내역이 없어요.</p>'}
  </div>
</div></div>`
    };
  };

  H.views["my-orders"] = function () {
    if (!H.state.loggedIn) return needLogin("신청내역");
    var list = H.state.orders;
    return {
      title: "신청내역",
      html: `<div class="wrap me-narrow">${back("#/my", "마이페이지")}
        <header class="ph ph--tight"><h1>신청내역</h1><p class="num">휴대폰 신청 ${list.length}건</p></header>
        ${list.length ? `<div class="o-list">${list.map(orderRow).join("")}</div>` : `<div class="empty">아직 신청내역이 없어요.<br><br><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a></div>`}
      </div>`
    };
  };

  H.views["my-order"] = function (r) {
    if (!H.state.loggedIn) return needLogin("신청내역 상세");
    var o = findOrder(r.parts[2]);
    if (!o) return { title: "신청내역 상세", html: `<div class="wrap me-narrow">${back("#/my", "마이페이지")}<p class="empty">신청 내역을 찾을 수 없습니다.</p></div>` };
    var p = H.prod(o.pid), s = o.sel, pr = H.price(p, s), next = nextAction(o), pl = H.plan(s.planId);
    return {
      title: "신청내역 상세",
      html: `<div class="wrap me-narrow">
  ${back("#/my", "마이페이지")}
  <header class="ph ph--tight"><p class="eyebrow-sm num">신청번호 ${o.id} · ${o.date}${o.example ? ' <span class="demo-tag">예시</span>' : ""}</p><h1>${stepName(o)}</h1></header>
  <div class="order-card">
    <div class="sum__prod"><span class="sum__th"><img src="${H.img(p, s.color)}" alt=""></span><span><b>${p.name}</b><small>${p.vols[s.vol][0]} · ${p.colors[s.color][0]}</small></span></div>
    ${H.tracker(o.step)}
    ${o.step >= 2 ? trackRow(o) : ""}
    <p class="order-card__next">${next[0]}</p><p class="help-t">${next[1]}</p>${next[2]}
    ${o.step === 3 ? `<div class="dday"><span>요금제를 낮출 수 있을 때까지</span><b class="num">185일 남았어요</b><span>개통일 기준 185일이 지나면 월 47,000원 이상 요금제로 바꿀 수 있어요.</span></div>` : ""}
    ${demoStep(o)}
  </div>
  <section class="form-sec"><h2>신청 조건</h2><dl class="kv">
    <div><dt>통신사</dt><dd>LG U+ ${H.methodLabel(s.method)}</dd></div>
    <div><dt>요금제</dt><dd>${pl.name} · 월 ${H.won(pl.fee)}</dd></div>
    <div><dt>할인 방법</dt><dd>${H.discountLabel(s.discount)}</dd></div>
    <div><dt>구매 방식</dt><dd>${pr.months ? pr.months + "개월 할부" : "일시불"}</dd></div>
  </dl></section>
  <section class="form-sec"><h2>금액</h2><div class="sum sum--flat"><div class="pbox__rows">${H.priceRows(p, s, pr)}${o.usedMileage ? `<div class="row"><span>마일리지 사용</span><b class="num minus">- ${H.num(o.usedMileage)}P</b></div>` : ""}</div>
    <div class="sum__total"><span>월 납부 금액</span><b class="num">${H.won(pr.monthlyTotal)}</b></div></div></section>
  <section class="form-sec"><h2>받으실 곳</h2><dl class="kv">
    <div><dt>주소</dt><dd>${H.esc(o.addr || "-")}</dd></div>
    <div><dt>상세 주소</dt><dd>${H.esc(o.addr2 || "-")}</dd></div>
    <div><dt>송장번호</dt><dd>${o.step >= 2 ? `<span class="num">${H.esc(o.courier || "CJ대한통운")} ${H.esc(o.trackingNo || "123456789012")}</span> <span class="demo-tag">예시</span>` : "택배를 보내면 알려드려요"}</dd></div>
  </dl></section>
  <div class="done__acts"><button type="button" class="btn btn--line btn--sm" data-act="joinInfo" data-id="${o.id}">가입내역 받는 방법</button><a class="btn btn--line btn--sm" href="#/receipt/${o.id}">신청내역 확인 링크</a>${o.step >= 3 ? '<button type="button" class="btn btn--line btn--sm" data-act="caseAsk">케이스 요청하기</button>' : ""}<button type="button" class="btn btn--line btn--sm" data-act="kakao">${H.icon("kakao", "ic--fill")}카카오톡으로 물어보기</button></div>
</div>`
    };
  };

  H.views["my-mileage"] = function () {
    if (!H.state.loggedIn) return needLogin("마일리지");
    var s = H.state, rows = [[s.user.joined, "회원가입 축하", "+10,000P", true]];
    s.orders.forEach(function (o) { if (o.usedMileage) rows.unshift([o.date, "주문에 사용 · " + H.prod(o.pid).name, "-" + H.num(o.usedMileage) + "P", false]); });
    return {
      title: "마일리지",
      html: `<div class="wrap me-narrow">${back("#/my", "마이페이지")}
        <header class="ph ph--tight"><h1>마일리지</h1></header>
        <div class="mile-big"><small>지금 쓰실 수 있는 마일리지</small><b class="num">${H.num(H.mileageLeft())}P</b><p>주문하실 때 할인으로 쓰실 수 있어요.</p></div>
        <h2 class="me-sec-t">쌓이고 쓰인 내역</h2>
        <div class="mile-list">${rows.map(function (x) { return `<div class="mile-row"><span><b>${x[1]}</b><small class="num">${x[0]}</small></span><b class="num${x[3] ? " plus" : ""}">${x[2]}</b></div>`; }).join("")}</div>
      </div>`
    };
  };

  H.views["my-recent"] = function () {
    if (!H.state.loggedIn) return needLogin("최근 본 상품");
    var list = H.state.recent.map(H.prod).filter(Boolean);
    return {
      title: "최근 본 상품",
      html: `<div class="wrap">${back("#/my", "마이페이지")}
        <header class="ph ph--tight"><h1>최근 본 상품</h1></header>
        ${list.length ? `<div class="p-grid">${list.map(H.productCard).join("")}</div>` : `<div class="empty">최근에 보신 상품이 없어요.<br>상품을 둘러보시면 여기에 모입니다.<br><br><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a></div>`}
      </div>`
    };
  };

  H.views["my-reviews"] = function () {
    if (!H.state.loggedIn) return needLogin("내가 쓴 후기");
    var list = H.state.feedPosts || [];
    return {
      title: "내가 쓴 후기",
      html: `<div class="wrap me-narrow">${back("#/my", "마이페이지")}
        <header class="ph ph--tight"><h1>내가 쓴 후기</h1></header>
        ${list.length ? `<div class="rv-list rv-list--mine">${list.map(function (p) {
          var m = H.feedMod(p.id);
          return H.reviewCard(p) + (m.hide ? '<p class="help-t">하이유플이 감춘 후기예요. 나에게만 보여요.</p>' : m.hidePhoto ? '<p class="help-t">사진은 하이유플이 감췄어요.</p>' : "");
        }).join("")}</div><button type="button" class="btn btn--ink btn--block pd-more" data-act="writeReview">후기 올리기</button>`
          : `<div class="empty">아직 쓰신 후기가 없어요.<br>사용해 보신 이야기를 남겨주세요.<br><br><button type="button" class="btn btn--ink btn--sm" data-act="writeReview">후기 쓰기</button></div>`}
      </div>`
    };
  };

  /* ---------- 회원정보 수정 ---------- */
  function acc() {
    if (!H.acc) {
      var u = H.state.user;
      H.acc = { name: u.name, birth: u.birth, addr: u.addr || "", addr2: u.addr2 || "", ref: "", sms: true, email: false };
    }
    return H.acc;
  }
  H.pickAddrFor = function (target, v) {
    if (target === "account") acc().addr = v;
    if (target === "signup") sg().addr = v;
  };
  H.views["my-account"] = function () {
    if (!H.state.loggedIn) return needLogin("회원정보 수정");
    var u = H.state.user, a = acc();
    return {
      title: "회원정보 수정",
      html: `<div class="wrap me-narrow">${back("#/my", "마이페이지")}
  <header class="ph ph--tight"><h1>회원정보 수정</h1></header>
  <section class="form-sec"><h2>로그인 정보</h2>
    <div class="field"><label for="acId">아이디</label><input id="acId" class="input" value="${H.esc(u.id)}" readonly></div>
    <button type="button" class="link-row" data-act="toast" data-msg="시안: 비밀번호 변경은 지금 사이트 화면을 그대로 써요">비밀번호 변경하기 ›</button>
  </section>
  <section class="form-sec"><h2>내 정보</h2>
    <div class="field"><label for="acName">이름</label><input id="acName" class="input" value="${H.esc(a.name)}" data-input="accField" data-f="name" autocomplete="name"></div>
    <div class="field"><label for="acBirth">생년월일</label><input id="acBirth" class="input" inputmode="numeric" maxlength="8" placeholder="예) 19990101" value="${H.esc(a.birth)}" data-input="accField" data-f="birth"></div>
    <div class="field"><span class="field-label">휴대폰 번호</span><div class="phone-row"><span class="num">${H.esc(u.phone)}</span><span class="verified">문자 확인됨</span><button type="button" class="btn btn--line btn--sm" data-act="phoneSheet">인증하고 바꾸기 ›</button></div></div>
  </section>
  <section class="form-sec"><h2>배송지</h2>
    <div class="field"><label for="acAddr">배송지 주소</label><div class="field-row"><input id="acAddr" class="input" value="${H.esc(a.addr)}" placeholder="배송지 주소 입력" readonly data-act="addrSheet" data-target="account"><button type="button" class="btn btn--line" data-act="addrSheet" data-target="account">주소 찾기</button></div></div>
    <div class="field"><label for="acAddr2">상세주소</label><input id="acAddr2" class="input" value="${H.esc(a.addr2)}" data-input="accField" data-f="addr2"></div>
  </section>
  <section class="form-sec"><h2>추천인 <span class="opt-tag">선택</span></h2><div class="field"><label for="acRef" class="sr">추천인</label><input id="acRef" class="input" placeholder="추천인" value="${H.esc(a.ref)}" data-input="accField" data-f="ref"></div></section>
  <section class="form-sec"><h2>혜택 알림 <span class="opt-tag">선택</span></h2>
    <div class="toggle"><span>이벤트 및 쇼핑혜택 SMS 수신 동의</span><button type="button" class="switch" role="switch" aria-checked="${a.sms}" data-act="accToggle" data-k="sms" aria-label="SMS 수신 동의"></button></div>
    <div class="toggle"><span>이벤트 및 쇼핑혜택 이메일 수신 동의</span><button type="button" class="switch" role="switch" aria-checked="${a.email}" data-act="accToggle" data-k="email" aria-label="이메일 수신 동의"></button></div>
  </section>
  <button type="button" class="btn btn--mg btn--block pd-more" data-act="accSave">수정 완료</button>
  <p class="login-links"><button type="button" data-act="toast" data-msg="시안: 회원 탈퇴는 지금 사이트 화면을 그대로 써요">회원 탈퇴</button></p>
</div>`
    };
  };
  H.inputs.accField = function (el) { acc()[el.dataset.f] = el.value; };
  H.acts.accToggle = function (el) {
    var a = acc(), k = el.dataset.k;
    a[k] = !a[k];
    el.setAttribute("aria-checked", String(a[k]));
  };
  H.acts.accSave = function () {
    var a = acc(), u = H.state.user;
    u.name = a.name; u.birth = a.birth; u.addr = a.addr; u.addr2 = a.addr2;
    H.save();
    H.toast("수정 완료");
  };
  H.acts.phoneSheet = function () {
    H.openSheet({
      title: "연락처 바꾸기",
      body: `<div class="field"><label for="phNew">새 휴대폰 번호</label><div class="field-row"><input id="phNew" class="input" inputmode="tel" placeholder="010-0000-0000" data-focus><button type="button" class="btn btn--line" data-act="phoneCode">인증번호 받기</button></div></div>
        <p class="help-t" id="phMsg" hidden>문자로 6자리를 보냈어요. 5분 안에 넣어주세요.</p>
        <div class="field"><label for="phCode">인증번호</label><input id="phCode" class="input" inputmode="numeric" maxlength="6" placeholder="문자로 받은 6자리"></div>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="phoneDone">확인</button><p class="demo-note"><span class="demo-tag">시안</span>문자는 실제로 가지 않아요. 아무 6자리나 넣으면 돼요</p>`
    });
  };
  H.acts.phoneCode = function () {
    if (H.$("#phNew").value.replace(/\D/g, "").length < 10) { H.toast("새 휴대폰 번호를 끝까지 적어 주세요"); return; }
    H.$("#phMsg").hidden = false;
    H.$("#phCode").focus();
  };
  H.acts.phoneDone = function () {
    var v = H.$("#phNew").value, c = H.$("#phCode").value;
    if (v.replace(/\D/g, "").length < 10 || !/^\d{6}$/.test(c)) { H.toast("번호와 인증번호 6자리를 넣어 주세요"); return; }
    H.state.user.phone = v;
    H.save();
    H.closeSheet(true);
    H.rerender();
    H.toast("연락처를 바꿨어요.");
  };

  /* ---------- 회원가입 (지금 사이트: 카카오로 간편가입 · 네이버로 간편가입 · 일반 회원가입) ---------- */
  function sg() {
    if (!H.signup) H.signup = { id: "", idOk: false, pw: "", pw2: "", name: "", birth: "", phone: "", addr: "", addr2: "", ref: "", terms: [false, false, false, false, false], tried: false };
    return H.signup;
  }
  H.resetSignup = function (tried) { H.signup = null; sg().tried = !!tried; };
  H.fillSignupSample = function () {
    Object.assign(sg(), { id: "hayu95", idOk: true, pw: "hiuplus1234", pw2: "hiuplus1234", name: "김하유", birth: "19950312", phone: "010-1234-5678", terms: [true, true, true, true, false], tried: false });
  };
  function sgErr(k) {
    var f = sg();
    if (!f.tried) return "";
    if (k === "id") return !f.id.trim() ? "아이디를 입력해주세요." : !f.idOk ? "아이디 중복확인을 해주세요." : "";
    if (k === "pw") return f.pw ? "" : "비밀번호를 입력해주세요.";
    if (k === "pw2") return f.pw2 && f.pw2 === f.pw ? "" : "비밀번호가 서로 달라요.";
    if (k === "name") return f.name.trim() ? "" : "이름을 입력해주세요.";
    if (k === "birth") return /^\d{8}$/.test(f.birth) ? "" : "예) 19990101 처럼 8자리로 적어 주세요.";
    if (k === "phone") return f.phone.replace(/\D/g, "").length >= 10 ? "" : "휴대폰 번호를 끝까지 적어 주세요.";
    if (k === "terms") return f.terms.slice(0, 3).every(Boolean) ? "" : "필수 약관에 모두 동의해주세요.";
    return "";
  }
  function sgField(id, k, label, attrs) {
    var f = sg(), e = sgErr(k);
    return `<div class="field"><label for="${id}">${label}<span class="req">*</span></label><input id="${id}" class="input${e ? " bad" : ""}" value="${H.esc(f[k])}" data-input="sgField" data-f="${k}" ${attrs || ""}>${e ? `<p class="err-t">${e}</p>` : ""}</div>`;
  }
  H.views.signup = function (r) {
    var next = H.esc(r.q.next || "");
    return {
      title: "회원가입",
      html: `<div class="wrap me-narrow">
  <header class="me-hd"><h1>회원가입</h1><p>마일리지는 주문하실 때 할인으로 쓰실 수 있어요.</p></header>
  <div class="login-box">
    <p class="perk">${H.icon("spark")}회원가입하고 1만 포인트 받기</p>
    <button type="button" class="btn btn--kakao btn--block" data-act="signupEasy" data-next="${next}">${H.icon("kakao", "ic--fill")}카카오로 간편가입</button>
    <button type="button" class="btn btn--naver btn--block" data-act="signupEasy" data-next="${next}">네이버로 간편가입</button>
    <a class="btn btn--line btn--block" href="#/signup/form${nextParam(r)}">일반 회원가입</a>
  </div>
  <p class="login-links"><span>이미 회원이세요?</span><button type="button" data-act="login" data-next="${next}">로그인</button></p>
</div>`
    };
  };
  H.views["signup-form"] = function (r) {
    var f = sg(), idE = sgErr("id"), tE = sgErr("terms"), allT = f.terms.every(Boolean), next = H.esc(r.q.next || "");
    return {
      title: "일반 회원가입", tab: false,
      bar: `<button type="button" class="btn btn--mg btn--block" data-act="signupSubmit" data-next="${next}">회원 가입</button>`,
      html: `<div class="wrap me-narrow">
  <a class="back" href="#/signup${nextParam(r)}">${H.icon("chev-l")}회원가입</a>
  <header class="ph ph--tight"><h1>일반 회원가입</h1><p>가입하면 1만 포인트를 드려요.</p></header>
  <div class="demo-tools"><span class="demo-tag">시안</span><button type="button" class="btn btn--soft btn--sm" data-act="signupSample">예시로 채우기</button></div>
  <section class="form-sec"><h2>로그인 정보</h2>
    <div class="field"><label for="sgId">아이디<span class="req">*</span></label>
      <div class="field-row"><input id="sgId" class="input${idE ? " bad" : ""}" value="${H.esc(f.id)}" data-input="sgField" data-f="id" autocomplete="username"><button type="button" class="btn btn--line" data-act="idCheck">중복확인</button></div>
      ${idE ? `<p class="err-t">${idE}</p>` : f.idOk ? '<p class="ok-t">사용 가능한 아이디입니다.</p>' : ""}</div>
    ${sgField("sgPw", "pw", "비밀번호", 'type="password" autocomplete="new-password"')}
    ${sgField("sgPw2", "pw2", "비밀번호 확인", 'type="password" autocomplete="new-password"')}
  </section>
  <section class="form-sec"><h2>내 정보</h2>
    ${sgField("sgName", "name", "이름", 'autocomplete="name"')}
    ${sgField("sgBirth", "birth", "생년월일", 'inputmode="numeric" maxlength="8" placeholder="예) 19990101"')}
    ${sgField("sgPhone", "phone", "휴대폰 번호", 'inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"')}
  </section>
  <section class="form-sec"><h2>배송지 <span class="opt-tag">선택</span></h2><p class="desc">배송지 주소는 주문 후 입력하셔도 돼요</p>
    <div class="field"><label for="sgAddr" class="sr">배송지 주소</label><div class="field-row"><input id="sgAddr" class="input" value="${H.esc(f.addr)}" placeholder="배송지 주소 입력" readonly data-act="addrSheet" data-target="signup"><button type="button" class="btn btn--line" data-act="addrSheet" data-target="signup">주소 찾기</button></div></div>
    <div class="field"><label for="sgAddr2" class="sr">상세주소</label><input id="sgAddr2" class="input" placeholder="상세주소" value="${H.esc(f.addr2)}" data-input="sgField" data-f="addr2"></div>
  </section>
  <section class="form-sec"><h2>추천인 <span class="opt-tag">선택</span></h2><div class="field"><label for="sgRef" class="sr">추천인</label><input id="sgRef" class="input" placeholder="추천인" value="${H.esc(f.ref)}" data-input="sgField" data-f="ref"></div></section>
  <section class="form-sec"><h2>약관 동의</h2>
    <div class="agree">
      <label class="all"><input type="checkbox" id="sgAll" data-change="sgAll"${allT ? " checked" : ""}><span class="box">${H.icon("check")}</span>모두 동의하기</label>
      ${SG_TERMS.map(function (t, i) {
        return `<label><input type="checkbox" id="sgT${i}" data-change="sgTerm" data-i="${i}"${f.terms[i] ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>[${t[1] ? "필수" : "선택"}] ${t[0]}</span>${i > 0 ? '<button type="button" class="view" data-act="toast" data-msg="시안: 약관 전문은 지금 사이트 것을 그대로 써요">보기</button>' : ""}</label>`;
      }).join("")}
    </div>${tE ? `<p class="err-t">${tE}</p>` : ""}
  </section>
  <div class="order-submit pc-only"><button type="button" class="btn btn--mg btn--block" data-act="signupSubmit" data-next="${next}">회원 가입</button></div>
  <p class="demo-note"><span class="demo-tag">시안</span>실제로 가입되지 않아요</p>
</div>`
    };
  };
  H.views["signup-done"] = function (r) {
    var next = r.q.next || "";
    return {
      title: "가입 완료", tab: false,
      html: `<div class="wrap"><div class="done">
  <div class="done__ic">${H.icon("check")}</div>
  <h1>가입을 마쳤어요</h1>
  <p class="lead">${H.esc(H.state.user.name)}님, 반가워요. 가입 축하 1만 포인트를 넣어 드렸어요. 주문하실 때 할인으로 쓰실 수 있어요.</p>
  <div class="mile-big"><small>지금 쓰실 수 있는 마일리지</small><b class="num">${H.num(H.mileageLeft())}P</b></div>
  <div class="done-cta">${next === "#/order" ? '<a class="btn btn--mg btn--block" href="#/order">고르던 주문 이어서 하기</a>' : '<a class="btn btn--mg btn--block" href="#/phones">휴대폰 보러 가기</a>'}<a class="btn btn--soft btn--block" href="#/my">마이페이지 보기</a></div>
</div></div>`
    };
  };
  H.inputs.sgField = function (el) {
    var f = sg(), k = el.dataset.f;
    f[k] = el.value;
    if (k === "id") f.idOk = false;
    if (f.tried) {
      var e = sgErr(k), err = el.closest(".field").querySelector(".err-t");
      el.classList.toggle("bad", !!e);
      if (!e && err) err.remove();
    }
  };
  H.inputs.sgAll = function (el) {
    var f = sg();
    f.terms = f.terms.map(function () { return el.checked; });
    H.$$('[data-change="sgTerm"]').forEach(function (c) { c.checked = el.checked; });
  };
  H.inputs.sgTerm = function (el) {
    var f = sg(), all = H.$("#sgAll");
    f.terms[Number(el.dataset.i)] = el.checked;
    if (all) all.checked = f.terms.every(Boolean);
  };
  H.acts.idCheck = function () {
    var f = sg();
    if (!f.id.trim()) { H.toast("아이디를 입력해주세요."); return; }
    f.idOk = true;
    H.rerender();
    H.toast("사용 가능한 아이디입니다.");
  };
  H.acts.signupSample = function () { H.fillSignupSample(); H.rerender(); H.toast("예시 값으로 채웠어요"); };
  H.acts.signupSubmit = function (el) {
    var f = sg();
    f.tried = true;
    if (["id", "pw", "pw2", "name", "birth", "phone", "terms"].some(function (k) { return sgErr(k); })) {
      H.rerender();
      var first = H.$(".input.bad") || H.$("#sgAll");
      if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
      H.toast("빠진 칸을 채워 주세요");
      return;
    }
    Object.assign(H.state.user, { id: f.id, name: f.name, birth: f.birth, phone: f.phone, addr: f.addr, addr2: f.addr2 });
    H.state.loggedIn = true;
    H.save();
    H.signup = null;
    H.go("#/signup/done" + (el.dataset.next ? "?next=" + encodeURIComponent(el.dataset.next) : ""));
  };
  H.acts.signupEasy = function (el) {
    H.state.loggedIn = true;
    H.save();
    H.toast("시안: 카카오·네이버 동의 화면은 그쪽에서 띄워요");
    H.go("#/signup/done" + (el.dataset.next ? "?next=" + encodeURIComponent(el.dataset.next) : ""));
  };

  /* ---------- 마이페이지 작은 동작 ---------- */
  H.acts.demoOrder = function () { H.state.orders = [H.makeOrder(54, 0, "HU260915", H.today())]; H.save(); H.rerender(); };
  H.acts.demoStep = function (el) {
    var o = findOrder(el.dataset.id);
    if (o) o.step = (o.step + 1) % 4;
    H.save();
    H.rerender(el);
  };
  H.acts.logout = function () { H.state.loggedIn = false; H.save(); H.toast("로그아웃했어요"); H.rerender(); };
  H.acts.resetMock = function () { H.reset(); H.form = null; H.signup = null; H.acc = null; H.homeSet = "all"; H.toast("처음 상태로 되돌렸어요"); H.go("#/"); };
  H.acts.copyRef = function () { H.toast("복사됨 (시안: 실제 링크는 지금 사이트 것을 그대로 써요)"); };
  H.acts.caseAsk = function () {
    H.openSheet({ title: "케이스 요청", body: `<p class="help-t help-t--lead">케이스를 요청하시겠어요?</p>`, foot: `<button type="button" class="btn btn--mg btn--block" data-act="caseDone">케이스 요청하기</button>` });
  };
  H.acts.caseDone = function () { H.closeSheet(); H.toast("케이스를 요청했어요 (시안)"); };
  H.acts.myAlerts = function () {
    var a = H.state.alerts;
    H.openSheet({
      title: "알림 신청 내역",
      body: a.length ? a.map(function (x) {
        var p = H.prod(x.pid);
        return `<div class="res-row"><span class="th"><img src="${H.img(p, 0)}" alt=""></span><span><b>${p.name}</b><small>${x.date} 신청 · 예약이 열리면 알림톡으로 알려드려요</small></span></div>`;
      }).join("") : `<p class="empty">알림 신청한 휴대폰이 없어요.</p>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="alert" data-pid="56">아이폰 듀오 알림 신청하기</button>`
    });
  };
})();
