/* 하이유플 리뉴얼 목업 — 로그인 · 주문서 · 접수 완료 · 내정보 */
(function () {
  "use strict";
  var H = window.H;
  var STEPS = ["신청서", "접수확인", "준비·배송", "개통완료"];
  var AGREE = ["개인정보 수집 · 이용 동의", "개인정보 제3자 제공 동의 (통신사 가입 처리)", "주문 내용과 유의사항 확인"];
  var SAMPLE_ADDR = ["서울 강남구 테헤란로 152 (역삼동)", "경기 성남시 분당구 판교역로 235 (삼평동)", "부산 부산진구 중앙대로 672 (부전동)"];

  function rerender(el) {
    var y = window.scrollY;
    H.render();
    window.scrollTo(0, y);
    if (el) H.refocus(el);
  }
  H.tracker = function (step) {
    return '<ol class="tracker" aria-label="진행 단계">' + STEPS.map(function (t, i) {
      return '<li class="' + (i < step ? "is-done" : i === step ? "is-now" : "") + '"' + (i === step ? ' aria-current="step"' : "") + ">" + t + "</li>";
    }).join("") + "</ol>";
  };
  function memoToggleRow() {
    return `<button type="button" data-act="toggleMemoHidden">기획 메모 단추 ${H.state.memoHidden ? "다시 보이기" : "숨기기"}<small class="demo-tag">시안</small></button>`;
  }

  /* ---------- 로그인 ---------- */
  H.acts.login = function (el, next) {
    next = next || (el && el.dataset.next) || "";
    H.openSheet({
      title: "로그인하고 주문하기",
      body: `<p class="perk">${H.icon("spark")}회원가입하고 1만 포인트 받기</p>
        <p class="help-t help-t--lead">주문은 로그인한 뒤에 이어져요. 고른 조건은 그대로 남아 있어요.</p>
        <div class="consult-list">
          <button type="button" class="btn btn--kakao btn--block" data-act="loginDo" data-next="${next}" data-focus>${H.icon("kakao", "ic--fill")}카카오로 시작하기</button>
          <button type="button" class="btn btn--naver btn--block" data-act="loginDo" data-next="${next}">네이버로 시작하기</button>
        </div>
        <p class="demo-note"><span class="demo-tag">시안</span>누르면 예시 계정(김하유)으로 로그인돼요</p>`
    });
  };
  H.acts.loginDo = function (el) {
    var next = el.dataset.next || "";
    H.state.loggedIn = true;
    H.save();
    H.closeSheet(true);
    H.toast(H.state.user.name + "님, 반가워요");
    if (next) H.go(next); else rerender();
  };

  /* ---------- 주문서 ---------- */
  function form() {
    if (!H.form) {
      var u = H.state.user;
      H.form = { name: u.name, birth: u.birth, phone: u.phone, phone2: "", addr: "", addr2: "", usePoint: false, agree: [false, false, false], tried: false };
    }
    return H.form;
  }
  function valid(key, v) {
    v = String(v || "");
    if (key === "birth") return /^\d{6}$/.test(v);
    if (key === "phone" || key === "phone2") return v.replace(/\D/g, "").length >= 10;
    return v.trim().length > 0;
  }
  function field(id, key, label, o) {
    var f = form(), bad = f.tried && !valid(key, f[key]);
    return `<div class="field"><label for="${id}">${label}<span class="req">*</span></label>
      <input id="${id}" class="input${bad ? " bad" : ""}" data-input="orderField" data-f="${key}" value="${H.esc(f[key])}" ${o.attrs || ""}>
      ${bad ? `<p class="err-t">${o.err}</p>` : o.help ? `<p class="help-t">${o.help}</p>` : ""}</div>`;
  }

  H.views.order = function () {
    var d = H.state.draft, p = d && H.prod(d.pid);
    if (!p) return { title: "주문서", html: `<div class="wrap"><div class="empty">주문할 휴대폰을 먼저 골라 주세요.<br><br><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a></div></div>` };
    if (!H.state.loggedIn) setTimeout(function () { H.acts.login(null, "#/order"); }, 80);
    var s = d.sel, r = H.price(p, s), f = form(), pl = H.plan(s.planId) || r.plan, all = f.agree.every(Boolean);
    var cond = [p.vols[s.vol][0], p.colors[s.color][0], pl.name, H.methodLabel(s.method), H.discountLabel(s.discount), r.months ? r.months + "개월 할부" : "일시불"].join(" · ");
    var flow = ["간편정보 입력", "온라인 신청서 작성", "작성완료 알림", "기기수령 및 개통"].map(function (t, i) { return i === 0 ? "<b>" + t + "</b>" : "<span>" + t + "</span>"; }).join(H.icon("chev-r"));
    var side = `<aside class="order__side"><div class="sum">
        <div class="sum__prod"><div class="sum__th"><img src="${H.img(p, s.color)}" alt=""></div><div><b>${p.name}</b><small>${cond}</small></div></div>
        <div class="pbox__rows">${H.priceRows(p, s, r)}${f.usePoint ? `<div class="row"><span>포인트 사용</span><b class="num minus">- ${H.num(H.state.points)}P</b></div>` : ""}</div>
        <div class="sum__total"><span>월 납부 금액</span><b class="num">${H.won(r.monthlyTotal)}</b></div>
        <div class="order-submit pc-only"><button type="button" class="btn btn--mg btn--block" data-act="submitOrder">주문 접수하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 접수되지 않아요</p></div>
      </div><a class="link-arrow pd-more" href="#/phone/${p.id}">조건 바꾸기${H.icon("arrow")}</a></aside>`;
    var body = `<div class="order-form">
      <section class="form-sec"><h2>가입하시는 분</h2><p class="desc">로그인 정보로 채웠어요. 다르면 고쳐 주세요.</p>
        ${field("oName", "name", "이름", { err: "이름을 적어 주세요", attrs: 'autocomplete="name"' })}
        ${field("oBirth", "birth", "생년월일 6자리", { err: "예) 950312 처럼 6자리로 적어 주세요", attrs: 'inputmode="numeric" maxlength="6" placeholder="예) 950312"' })}
        ${field("oPhone", "phone", "휴대폰 번호", { err: "휴대폰 번호를 끝까지 적어 주세요", attrs: 'inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"' })}
        ${field("oPhone2", "phone2", "비상 연락처", { err: "비상 연락처를 적어 주세요", help: "가족 등 연락이 닿는 다른 번호예요", attrs: 'inputmode="tel" placeholder="010-0000-0000"' })}
      </section>
      <section class="form-sec"><h2>받으실 곳</h2>
        <div class="field"><label for="oAddr">주소<span class="req">*</span></label>
          <div class="field-row"><input id="oAddr" class="input${f.tried && !f.addr ? " bad" : ""}" value="${H.esc(f.addr)}" placeholder="주소를 찾아 주세요" readonly data-act="addrSheet"><button type="button" class="btn btn--line" data-act="addrSheet">주소 찾기</button></div>
          ${f.tried && !f.addr ? '<p class="err-t">주소를 찾아 주세요</p>' : ""}</div>
        ${field("oAddr2", "addr2", "상세 주소", { err: "동 · 호수를 적어 주세요", attrs: 'placeholder="동 · 호수"' })}
        <p class="help-t">택배비는 무료예요. 번호이동은 유심비 7,700원이 따로 들어요.</p>
      </section>
      <section class="form-sec"><h2>포인트</h2>
        <div class="point-row"><span>보유 포인트 <b class="num">${H.num(H.state.points)}P</b> 쓰기</span><button type="button" class="switch" role="switch" aria-checked="${f.usePoint}" aria-label="포인트 쓰기" data-act="togglePoint"></button></div>
      </section>
      <section class="form-sec"><h2>약관 동의</h2>
        <div class="agree">
          <label class="all"><input type="checkbox" id="agAll" data-change="agreeAll"${all ? " checked" : ""}><span class="box">${H.icon("check")}</span>모두 동의하기</label>
          ${AGREE.map(function (a, i) {
            return `<label><input type="checkbox" id="ag${i}" data-change="agree" data-i="${i}"${f.agree[i] ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>[필수] ${a}</span><button type="button" class="view" data-act="toast" data-msg="시안: 약관 전문은 지금 사이트 것을 그대로 써요">보기</button></label>`;
          }).join("")}
        </div>${f.tried && !all ? '<p class="err-t">필수 약관에 모두 동의해 주세요</p>' : ""}
      </section>
    </div>`;
    return {
      title: "주문서", tab: false,
      bar: `<div class="bar__price"><small class="num">${p.name} · 실구매가 ${H.won(r.principal)}</small><b class="num">월 ${H.won(r.monthlyTotal)}</b></div><button type="button" class="btn btn--mg" data-act="submitOrder">주문 접수하기</button>`,
      html: `<div class="wrap">
        <a class="back" href="#/phone/${p.id}">${H.icon("chev-l")}${p.name}</a>
        <header class="ph ph--tight"><h1>주문서</h1><p>3분이면 끝나요. 전화 없이 개통까지 이어져요.</p></header>
        <p class="flow">${flow}</p>
        <div class="order">${side}${body}</div>
      </div>`
    };
  };
  H.inputs.orderField = function (el) {
    var f = form(), k = el.dataset.f;
    f[k] = el.value;
    if (f.tried) {
      var ok = valid(k, el.value), err = el.parentNode.querySelector(".err-t");
      el.classList.toggle("bad", !ok);
      if (err && ok) err.remove();
    }
  };
  H.inputs.agreeAll = function (el) {
    var f = form();
    f.agree = f.agree.map(function () { return el.checked; });
    H.$$('[data-change="agree"]').forEach(function (c) { c.checked = el.checked; });
  };
  H.inputs.agree = function (el) {
    var f = form(), all = H.$("#agAll");
    f.agree[Number(el.dataset.i)] = el.checked;
    if (all) all.checked = f.agree.every(Boolean);
  };
  H.acts.togglePoint = function (el) { form().usePoint = !form().usePoint; rerender(el); };
  H.acts.addrSheet = function () {
    H.openSheet({
      title: "주소 찾기",
      body: `<div class="srch__box">${H.icon("search")}<input id="addrQ" placeholder="도로명, 건물명, 지번으로 찾기" aria-label="주소 검색어" data-focus></div>
        <p class="help-t">실제 사이트에서는 카카오 주소 찾기가 열려요. 시안에서는 예시 주소 중에서 골라 주세요.</p>
        <div>${SAMPLE_ADDR.map(function (a) {
          return `<button type="button" class="res-row res-row--btn" data-act="pickAddr" data-v="${H.esc(a)}"><span class="th">${H.icon("home")}</span><span><b>${a}</b><small>예시 주소</small></span></button>`;
        }).join("")}</div>`
    });
  };
  H.acts.pickAddr = function (el) {
    form().addr = el.dataset.v;
    H.closeSheet(true);
    rerender();
    var d = H.$("#oAddr2");
    if (d) d.focus({ preventScroll: true });
  };
  H.acts.submitOrder = function () {
    var f = form(), d = H.state.draft, p = d && H.prod(d.pid);
    if (!p) return;
    if (!H.state.loggedIn) { H.acts.login(null, "#/order"); return; }
    f.tried = true;
    var ok = ["name", "birth", "phone", "phone2", "addr", "addr2"].every(function (k) { return valid(k, f[k]); }) && f.agree.every(Boolean);
    if (!ok) {
      rerender();
      var first = H.$(".input.bad") || H.$("#agAll");
      if (first) {
        first.scrollIntoView({ block: "center", behavior: "smooth" });
        if (first.tagName === "INPUT" && !first.readOnly && first.type !== "checkbox") first.focus({ preventScroll: true });
      }
      H.toast("빠진 칸을 채워 주세요");
      return;
    }
    var r = H.price(p, d.sel), now = new Date();
    var o = {
      id: "HU" + String(now.getTime()).slice(-6), pid: p.id, sel: d.sel, monthly: r.monthlyTotal, principal: r.principal, step: 0,
      date: now.getFullYear() + "." + String(now.getMonth() + 1).padStart(2, "0") + "." + String(now.getDate()).padStart(2, "0")
    };
    H.state.orders = [o].concat(H.state.orders).slice(0, 5);
    H.state.draft = null;
    H.form = null;
    H.save();
    H.go("#/done/" + o.id);
  };

  /* ---------- 접수 완료 ---------- */
  H.views.done = function (r) {
    var o = H.state.orders.find(function (x) { return x.id === r.parts[1]; });
    if (!o) return { title: "접수 완료", html: `<div class="wrap"><div class="empty">주문을 찾을 수 없어요.<br><br><a class="btn btn--ink btn--sm" href="#/my">내정보에서 보기</a></div></div>` };
    var p = H.prod(o.pid), formDone = o.step > 0;
    return {
      title: "접수 완료", tab: false,
      html: `<div class="wrap"><div class="done">
  <div class="done__ic">${H.icon("check")}</div>
  <h1>${formDone ? "신청서까지 받았어요" : "접수됐어요.<br>이제 신청서만 쓰면 끝이에요"}</h1>
  <p class="lead">${formDone ? "담당자가 확인하면 카카오톡으로 가입내역을 보내드려요. 진행 상황은 내정보에서 볼 수 있어요." : p.name + " 주문을 받았어요. 온라인 신청서를 써 주시면 담당자가 확인하고 개통을 준비해요."}</p>
  ${H.tracker(o.step)}
  ${formDone ? "" : `<section class="next-card"><small>지금 할 일</small><h2>온라인 신청서 작성하기</h2><p>통신사 가입에 필요한 신청서예요. 3분이면 충분해요. 같은 링크를 카카오톡으로도 보내드렸어요.</p>
    <button type="button" class="btn btn--mg btn--block" data-act="writeForm" data-id="${o.id}">온라인 신청서 작성하기</button>
    <a class="later" href="#/my">나중에 내정보에서 쓸게요</a></section>`}
  <div class="sum">
    <div class="sum__prod"><div class="sum__th"><img src="${H.img(p, o.sel.color)}" alt=""></div><div><b>${p.name}</b><small class="num">주문번호 ${o.id} · ${o.date}</small></div></div>
    <dl class="kv"><div><dt>통신사</dt><dd>LG U+ ${H.methodLabel(o.sel.method)}</dd></div><div><dt>기기</dt><dd>${p.vols[o.sel.vol][0]} · ${p.colors[o.sel.color][0]}</dd></div><div><dt>할인</dt><dd>${H.discountLabel(o.sel.discount)} · ${H.plan(o.sel.planId).name}</dd></div><div><dt>월 납부 금액</dt><dd class="num">${H.won(o.monthly)}</dd></div></dl>
  </div>
  <div class="done__acts"><button type="button" class="btn btn--line btn--sm" data-act="kakao">${H.icon("kakao", "ic--fill")}카카오톡으로 물어보기</button><a class="btn btn--soft btn--sm" href="#/">첫 화면으로</a></div>
</div></div>`
    };
  };
  H.acts.writeForm = function (el) {
    H.openSheet({
      title: "온라인 신청서",
      body: `<p class="a-note">${H.icon("info")}<span>실제 사이트에서는 여기서 통신사 가입 신청서 화면이 열려요. 시안에서는 작성을 마친 것으로 넘어가요.</span></p>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="formDone" data-id="${el.dataset.id}" data-focus>작성을 마친 것으로 보기</button>`
    });
  };
  H.acts.formDone = function (el) {
    var o = H.state.orders.find(function (x) { return x.id === el.dataset.id; });
    if (o && o.step < 1) o.step = 1;
    H.save();
    H.closeSheet(true);
    rerender();
    H.toast("신청서를 받았어요. 확인되면 카카오톡으로 알려드려요");
  };

  /* ---------- 내정보 ---------- */
  function orderCard(o) {
    var p = H.prod(o.pid);
    var next = [
      ["온라인 신청서를 써 주세요", "신청서를 쓰면 담당자가 확인을 시작해요.", `<button type="button" class="btn btn--mg btn--block" data-act="writeForm" data-id="${o.id}">온라인 신청서 작성하기</button>`],
      ["담당자가 신청 내용을 확인하고 있어요", "확인이 끝나면 카카오톡으로 가입내역을 보내드려요.", ""],
      ["개통과 배송을 준비하고 있어요", "택배를 보내면 송장번호를 알려드려요. 택배비는 무료예요.", ""],
      ["개통이 끝났어요", "새 휴대폰 잘 쓰세요. 궁금한 점은 고객센터로 물어봐 주세요.", `<a class="btn btn--line btn--block" href="#/reviews">후기 남기기</a>`]
    ][o.step];
    return `<div class="order-card">
      <div class="order-card__top"><span class="num">주문번호 ${o.id}${o.example ? ' <span class="demo-tag">예시</span>' : ""}</span><span class="num">${o.date}</span></div>
      <div class="sum__prod"><div class="sum__th"><img src="${H.img(p, o.sel.color)}" alt=""></div><div><b>${p.name}</b><small class="num">${p.vols[o.sel.vol][0]} · ${p.colors[o.sel.color][0]} · ${H.plan(o.sel.planId).name} · 월 ${H.won(o.monthly)}</small></div></div>
      ${H.tracker(o.step)}
      <p class="order-card__next">${next[0]}</p><p class="help-t">${next[1]}</p>${next[2]}
      ${o.step === 3 ? `<div class="dday"><span>요금제를 낮출 수 있을 때까지</span><b class="num">185일 남았어요</b><span>개통일 기준 185일이 지나면 월 47,000원 이상 요금제로 바꿀 수 있어요.</span></div>` : ""}
      <div class="demo-tools"><span class="demo-tag">시안</span><button type="button" class="btn btn--soft btn--sm" data-act="demoStep" data-id="${o.id}">다음 단계 보기</button></div>
    </div>`;
  }
  H.views.my = function () {
    var s = H.state;
    if (!s.loggedIn) {
      return {
        title: "내정보",
        html: `<div class="wrap me-narrow">
  <header class="me-hd"><h1>내정보</h1><p>로그인하면 주문 진행 상황과 알림 신청을 한곳에서 볼 수 있어요.</p></header>
  <div class="login-box"><p class="perk">${H.icon("spark")}회원가입하고 1만 포인트 받기</p>
    <button type="button" class="btn btn--kakao btn--block" data-act="loginDo">${H.icon("kakao", "ic--fill")}카카오로 시작하기</button>
    <button type="button" class="btn btn--naver btn--block" data-act="loginDo">네이버로 시작하기</button>
    <p class="demo-note"><span class="demo-tag">시안</span>누르면 예시 계정(김하유)으로 로그인돼요</p></div>
  <nav class="menu-list" aria-label="내정보 메뉴"><a href="#/cs">고객센터${H.icon("chev-r")}</a><a href="#/guide">알고사기${H.icon("chev-r")}</a>${memoToggleRow()}</nav>
</div>`
      };
    }
    var main = s.orders.length ? s.orders.map(orderCard).join("") :
      `<div class="order-card"><p class="order-card__next order-card__next--first">진행 중인 주문이 없어요</p><p class="help-t">마음에 드는 휴대폰을 고르면 여기서 진행 상황을 볼 수 있어요.</p>
        <div class="demo-tools"><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a><button type="button" class="btn btn--soft btn--sm" data-act="demoOrder">예시 주문 보기</button></div></div>`;
    return {
      title: "내정보",
      html: `<div class="wrap"><div class="me-grid">
  <div>
    <header class="me-hd"><h1>${s.user.name}님</h1><p>하이유플 회원 · 포인트 <b class="num">${H.num(s.points)}P</b></p></header>
    <nav class="menu-list" aria-label="내정보 메뉴">
      <button type="button" data-act="myAlerts">알림 신청 내역<small class="num">${s.alerts.length}건</small></button>
      <button type="button" data-act="myRecent">최근 본 휴대폰<small class="num">${s.recent.length}개</small></button>
      <a href="#/reviews">내 후기${H.icon("chev-r")}</a>
      <a href="#/cs">고객센터${H.icon("chev-r")}</a>
      <button type="button" data-act="logout">로그아웃</button>
      ${memoToggleRow()}
      <button type="button" data-act="resetMock">목업 처음 상태로 되돌리기<small class="demo-tag">시안</small></button>
    </nav>
  </div>
  <div><h2 class="me-sec-t">진행 중인 주문</h2>${main}</div>
</div></div>`
    };
  };
  H.acts.demoOrder = function () {
    var p = H.prod(54), sel = H.defaults(p), r = H.price(p, sel);
    H.state.orders = [{ id: "HU" + String(Date.now()).slice(-6), pid: 54, sel: sel, monthly: r.monthlyTotal, principal: r.principal, step: 0, date: "2026.09.15", example: true }];
    H.save();
    rerender();
  };
  H.acts.demoStep = function (el) {
    var o = H.state.orders.find(function (x) { return x.id === el.dataset.id; });
    if (o) o.step = (o.step + 1) % 4;
    H.save();
    rerender(el);
  };
  H.acts.logout = function () { H.state.loggedIn = false; H.save(); H.toast("로그아웃했어요"); rerender(); };
  H.acts.resetMock = function () { H.reset(); H.form = null; H.homeSet = "all"; H.toast("처음 상태로 되돌렸어요"); H.go("#/"); };
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
  H.acts.myRecent = function () {
    var list = H.state.recent.map(H.prod).filter(Boolean);
    H.openSheet({
      title: "최근 본 휴대폰",
      body: list.length ? list.map(function (p) {
        return `<a class="res-row" href="#/phone/${p.id}"><span class="th"><img src="${H.img(p, H.defaults(p).color)}" alt=""></span><span><b>${p.name}</b><small class="num">${p.launch ? "출시 알림 받기" : "실구매가 " + H.won(H.listPrice(p).principal)}</small></span></a>`;
      }).join("") : `<p class="empty">아직 본 휴대폰이 없어요.</p>`
    });
  };
})();
