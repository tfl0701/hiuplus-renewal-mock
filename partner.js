/* 하이유플 리뉴얼 목업 — 파트너스 안내 · 가입 · 추천코드 · 실적
 * 문구와 규칙은 지금 사이트 hiuplus.com/partner 그대로 옮김(2026-09-15 확인):
 * 개통 1건당 20,000원 · 전월 개통분 다음 달 말 지급 · 185일 안 환수 시 회수 · 개인 3.3% 원천징수 · 링크 90일
 */
(function () {
  "use strict";
  var H = window.H;
  var FEE = 20000;
  var STEPS = [
    ["내 추천 링크 받기", "[추천코드 만들기] 를 누르면 나만의 링크가 바로 만들어집니다. 회원정보가 그대로 들어가니 따로 적을 게 없어요."],
    ["링크 보내기", "휴대폰 바꿀 사람에게 카톡·문자로 보내거나, 블로그·인스타에 올려두면 됩니다. 그 링크로 들어온 분이 로그인하거나 가입하면, 그때부터 기한 없이 계속 내 소개로 남습니다."],
    ["개통되면 수수료", "소개받은 분이 신청하고 개통을 마치면 개통 1건당 20,000원이 쌓입니다. 내 실적 링크에서 진행 상황을 언제든 볼 수 있어요."]
  ];
  var WAYS = [
    ["카톡으로 한 명씩", "가장 잘 되는 방법입니다. 휴대폰 바꾼다는 얘기가 나올 때 링크를 보내주세요.", "“나 여기서 폰 샀는데 상담이 편하더라. 여기로 들어가면 돼 → (내 링크)”"],
    ["블로그·인스타 글 끝에", "개통 후기나 요금 비교 글을 쓰고 마지막에 링크를 답니다. 검색으로 들어온 사람이 며칠 뒤 신청해도 내 실적으로 잡혀요."],
    ["단톡방·동호회", "사람이 모인 곳에 한 번 올려두면 오래갑니다. 다만 광고 금지인 방에 올리면 강퇴될 수 있으니 방 규칙을 먼저 확인해주세요."],
    ["가족·직장 동료", "가입 시기가 비슷한 가족은 한 번에 여러 대가 되기도 합니다. 다만 본인 명의 주문은 수수료 대상이 아니에요."]
  ];
  var RULES = [
    ["ok", "개통완료된 건 — 1건당 20,000원. 접수·배송 중인 건은 개통이 끝나면 반영됩니다"],
    ["no", "취소·반품된 건"],
    ["no", "본인 명의로 넣은 주문(자기추천)"],
    ["ok", "추천했던 분이 다시 사는 것도 대상입니다"],
    ["info", "지급은 전월 개통분을 다음 달 말에 — 8월 개통분은 9월 말"],
    ["info", "개통 후 185일 안에 해지·타사 이동 등으로 환수가 생기면 수수료는 회수됩니다"],
    ["info", "지급은 개인 3.3% 원천징수 후 계좌로. 사업자는 세금계산서로 처리합니다"]
  ];
  var FAQ = [
    ["수수료는 언제 잡히나요?", "개통이 완료된 건만 잡힙니다. 접수·배송 중인 건은 개통이 끝나면 자동으로 반영되고, 취소·반품된 건은 빠집니다."],
    ["언제 받나요?", "전월 개통분을 다음 달 말에 지급합니다. 예를 들어 8월에 개통된 건은 9월 말에 드립니다. 개통 직후 14일 안에는 청약철회가 가능하고 통신사 정산도 한 달쯤 걸려서, 그 기간을 지나 확정된 뒤에 지급합니다."],
    ["개통한 분이 금방 해지하면 어떻게 되나요?", "개통 후 185일 안에 해지·직권해지·타사 이동·요금제 하향으로 통신사 환수가 발생하면 수수료 전액 회수합니다. 아직 지급 전이면 그 건이 빠지고, 이미 받으셨다면 다음 정산에서 차감됩니다. 통신사가 우리에게 지원금을 도로 가져가는 건이라 어쩔 수 없는 부분입니다."],
    ["추천으로 산 분이 나중에 또 바꾸면요?", "그 건도 수수료 대상입니다. 새 개통이라 똑같이 계산돼요. 한 번 소개해두면 기한 없이, 그분이 다시 바꿀 때마다 실적으로 잡힙니다. 손님이 앱에서 신청해도 그대로 이어집니다."],
    ["얼마를 받나요?", "개통 1건당 20,000원입니다. 소개한 분이 개통을 마치면 바로 내 실적에 잡히고, 지급 예정 금액이 실적 화면에 표시됩니다."],
    ["계좌를 지금 안 넣어도 되나요?", "네, 계좌 없이도 링크는 바로 만들어집니다. 다만 수수료를 보내드리려면 정산 전에 등록이 필요해서 마이페이지에서 안내드립니다."],
    ["링크는 얼마나 유효한가요?", "링크를 누른 분이 로그인하거나 가입하면 기한이 없습니다. 계속 내 소개로 남고, 몇 년 뒤에 바꾸셔도 실적으로 잡힙니다. 로그인 없이 구경만 하신 분은 그 브라우저에 90일까지만 남습니다. 여러 파트너의 링크를 거쳤다면 90일 안에는 마지막에 누른 링크가 인정되고, 그 뒤에는 처음 소개한 파트너로 남습니다."],
    ["한동안 소개를 못 하면 어떻게 되나요?", "6개월(180일) 동안 소개 실적이 한 건도 없으면 파트너 활동이 자동으로 종료됩니다. 마지막 접수일부터 세고, 아직 한 건도 없으시면 가입일부터 셉니다. 종료돼도 지난 실적과 받으신 수수료는 그대로입니다. 다시 하고 싶으시면 말씀 주시면 바로 열어드립니다."],
    ["내 실적은 어디서 보나요?", "마이페이지의 [내 실적 보기] 또는 가입할 때 받은 실적 링크에서 봅니다. 로그인 없이 열리니 그 주소는 나만 알고 계세요."],
    ["세금은 어떻게 되나요?", "개인은 지급할 때 3.3%를 원천징수하고 나머지를 보내드립니다. 사업자는 세금계산서로 처리합니다. 주민등록번호는 받지 않습니다."]
  ];

  /* ---------- 파트너스 안내 ---------- */
  H.views.partner = function () {
    var mine = H.state.partner, go = mine ? "#/partner/stats" : "#/partner/join";
    return {
      title: "하이유플 파트너스",
      html: `<div class="wrap pt">
  <section class="pt-hero">
    <p class="pt-eyebrow">하이유플 파트너스</p>
    <h1>링크 하나로<br>소개하고 수수료 받기</h1>
    <p class="pt-lead">휴대폰 바꿀 지인에게 내 링크를 보내주세요. 그 분이 개통을 마치면 <b>개통 1건당 20,000원</b>이 쌓입니다. 가입비도, 재고 부담도 없습니다.</p>
    <div class="pt-fee"><span><small>개통 1건당</small><b class="num">20,000원</b></span><span><small>지급</small><b>다음 달 말</b></span><span><small>가입비</small><b>없음</b></span></div>
    <a class="btn btn--mg btn--block pt-cta" href="${go}">${mine ? "내 파트너 정보 보기" : "추천코드 만들기"}</a>
  </section>
  <section class="pt-sec"><h2>이렇게 진행됩니다</h2>
    <ol class="pt-steps">${STEPS.map(function (s, i) { return `<li><i class="num">${i + 1}</i><div><b>${s[0]}</b><p>${s[1]}</p></div></li>`; }).join("")}</ol></section>
  <section class="pt-sec"><h2>이런 식으로 활동해요</h2>
    <div class="pt-ways">${WAYS.map(function (w) { return `<div class="pt-way"><b>${w[0]}</b><p>${w[1]}</p>${w[2] ? `<p class="pt-quote">${w[2]}</p>` : ""}</div>`; }).join("")}</div></section>
  <section class="pt-sec"><h2>수수료가 잡히는 기준</h2>
    <ul class="pt-rules">${RULES.map(function (x) { return `<li class="pt-rule pt-rule--${x[0]}">${H.icon(x[0] === "ok" ? "check" : x[0] === "no" ? "close" : "info", "ic--sm")}<span>${x[1]}</span></li>`; }).join("")}</ul></section>
  <section class="pt-sec"><h2>자주 묻는 질문</h2>
    <div class="faq">${FAQ.map(function (f) { return `<details><summary><span class="q">Q</span><span>${f[0]}</span>${H.icon("chev-d")}</summary><p class="a">${f[1]}</p></details>`; }).join("")}</div></section>
  <a class="btn btn--mg btn--block pt-cta" href="${go}">${mine ? "내 파트너 정보 보기" : "지금 추천코드 만들기"}</a>
  <p class="pt-foot">가입비·회비 없음 · 언제든 그만둘 수 있습니다</p>
</div>`
    };
  };

  /* ---------- 파트너스 가입 ---------- */
  function pj() {
    if (!H.pjoin) {
      var u = H.state.user;
      H.pjoin = { name: u.name, phone: u.phone, type: "person", biz: "", bank: "", account: "", holder: u.name, channel: "", agree: [false, false], tried: false };
    }
    return H.pjoin;
  }
  function pjErr(k) {
    var f = pj();
    if (!f.tried) return "";
    if (k === "name") return f.name.trim() ? "" : "이름을 적어 주세요";
    if (k === "phone") return f.phone.replace(/\D/g, "").length >= 10 ? "" : "연락처를 끝까지 적어 주세요";
    if (k === "biz") return f.type !== "biz" || /^\d{10}$/.test(f.biz.replace(/\D/g, "")) ? "" : "사업자등록번호 10자리를 적어 주세요";
    if (k === "bank") { var some = f.bank || f.account; return !some || (f.bank.trim() && f.account.replace(/\D/g, "").length >= 8 && f.holder.trim()) ? "" : "계좌를 넣으려면 은행 · 계좌번호 · 예금주를 모두 적어 주세요"; }
    if (k === "agree") return f.agree.every(Boolean) ? "" : "필수 약관에 모두 동의해 주세요";
    return "";
  }
  function pjField(id, k, label, attrs, help) {
    var f = pj(), e = pjErr(k);
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" class="input${e ? " bad" : ""}" value="${H.esc(f[k])}" data-input="pjField" data-f="${k}" ${attrs || ""}>${e ? `<p class="err-t">${e}</p>` : help ? `<p class="help-t">${help}</p>` : ""}</div>`;
  }
  H.views["partner-join"] = function () {
    if (!H.state.loggedIn) {
      return {
        title: "파트너스 가입",
        html: `<div class="wrap me-narrow"><header class="me-hd"><h1>파트너스 가입</h1><p>회원만 추천코드를 만들 수 있어요. 로그인하면 회원정보가 그대로 들어가요.</p></header>
          <div class="login-box"><a class="btn btn--mg btn--block" href="#/signup?next=%23%2Fpartner%2Fjoin">회원가입하고 1만 포인트 받기</a><button type="button" class="btn btn--ink btn--block" data-act="login" data-next="#/partner/join">로그인</button></div></div>`
      };
    }
    if (H.state.partner) {
      return { title: "파트너스 가입", html: `<div class="wrap me-narrow"><header class="me-hd"><h1>이미 파트너이십니다</h1><p>추천코드 ${H.state.partner.code}</p></header><a class="btn btn--mg btn--block" href="#/partner/stats">내 파트너 정보 보기</a></div>` };
    }
    var f = pj(), bankE = pjErr("bank"), agreeE = pjErr("agree"), all = f.agree.every(Boolean);
    var terms = ["[필수] 파트너스 이용 약관 동의", "[필수] 정산을 위한 개인정보 수집 · 이용 동의"];
    return {
      title: "파트너스 가입", tab: false,
      bar: `<button type="button" class="btn btn--mg btn--block" data-act="pjSubmit">추천코드 만들기</button>`,
      html: `<div class="wrap me-narrow">
  <a class="back" href="#/partner">${H.icon("chev-l")}파트너스 안내</a>
  <header class="ph ph--tight"><h1>파트너스 가입</h1><p>추천 링크로 손님을 소개하고 개통완료 건당 수수료를 받는 파트너 가입이에요.</p></header>
  <section class="pt-prep"><h2>가입 전에 준비할 것</h2>
    <ul>
      <li><b>이름 · 연락처</b><span>회원정보에서 자동으로 채워집니다. 다르면 고쳐주세요. 정산 연락과 본인 주문(자기추천) 확인에 씁니다.</span></li>
      <li><b>추천코드</b><span>내 추천 링크가 바로 만들어집니다.</span></li>
      <li><b>정산 계좌 (은행 · 계좌번호 · 예금주)</b><span>나중에 넣어도 돼요.</span></li>
      <li><b>개인 / 사업자 구분</b><span>개인이면 지급할 때 3.3%를 원천징수합니다. 사업자면 사업자등록번호 10자리가 필요하고 세금계산서로 처리합니다.</span></li>
      <li><b>활동 채널 (선택)</b><span>블로그·인스타 등 홍보할 곳 주소. 없으면 비워두셔도 됩니다.</span></li>
    </ul>
    <p class="pt-nossn">${H.icon("shield", "ic--sm")}주민등록번호는 받지 않습니다.</p>
  </section>
  <section class="form-sec"><h2>파트너 정보 입력</h2>
    ${pjField("pjName", "name", "이름", 'autocomplete="name"')}
    <div class="field"><label for="pjPhone">연락처</label><div class="field-row"><input id="pjPhone" class="input${pjErr("phone") ? " bad" : ""}" value="${H.esc(f.phone)}" data-input="pjField" data-f="phone" inputmode="tel"><span class="verified verified--tall">문자 확인됨</span></div>
      ${pjErr("phone") ? `<p class="err-t">${pjErr("phone")}</p>` : '<p class="help-t">회원정보에서 가져왔어요. 다르면 고쳐주세요. 정산 연락과 본인 주문(자기추천) 확인에 씁니다.</p>'}</div>
    <div class="field"><span class="field-label">개인 / 사업자</span><div class="choice-row">
      <button type="button" class="choice" data-act="pjType" data-v="person" aria-pressed="${f.type === "person"}">개인<small>3.3% 원천징수</small></button>
      <button type="button" class="choice" data-act="pjType" data-v="biz" aria-pressed="${f.type === "biz"}">사업자<small>세금계산서</small></button>
    </div></div>
    ${f.type === "biz" ? pjField("pjBiz", "biz", "사업자등록번호", 'inputmode="numeric" placeholder="10자리"') : ""}
  </section>
  <section class="form-sec"><h2>정산 계좌 <span class="opt-tag">나중에 넣어도 돼요</span></h2>
    <div class="field-2">
      <div class="field"><label for="pjBank">은행</label><input id="pjBank" class="input${bankE ? " bad" : ""}" value="${H.esc(f.bank)}" placeholder="예: 국민" data-input="pjField" data-f="bank"></div>
      <div class="field"><label for="pjHolder">예금주</label><input id="pjHolder" class="input" value="${H.esc(f.holder)}" data-input="pjField" data-f="holder"></div>
    </div>
    <div class="field"><label for="pjAcc">계좌번호</label><input id="pjAcc" class="input${bankE ? " bad" : ""}" value="${H.esc(f.account)}" inputmode="numeric" data-input="pjField" data-f="account"></div>
    ${bankE ? `<p class="err-t">${bankE}</p>` : '<p class="help-t">예금주는 가입자 본인 이름이어야 해요.</p>'}
  </section>
  <section class="form-sec"><h2>활동 채널 <span class="opt-tag">선택</span></h2>
    ${pjField("pjCh", "channel", "블로그 · 인스타 주소", 'placeholder="https://"')}
  </section>
  <section class="form-sec"><h2>약관 동의</h2>
    <div class="agree">
      <label class="all"><input type="checkbox" id="pjAll" data-change="pjAll"${all ? " checked" : ""}><span class="box">${H.icon("check")}</span>모두 동의하기</label>
      ${terms.map(function (t, i) { return `<label><input type="checkbox" id="pjT${i}" data-change="pjTerm" data-i="${i}"${f.agree[i] ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>${t}</span><button type="button" class="view" data-act="toast" data-msg="시안: 약관 전문은 지금 사이트 것을 그대로 써요">보기</button></label>`; }).join("")}
    </div>${agreeE ? `<p class="err-t">${agreeE}</p>` : ""}
  </section>
  <div class="order-submit pc-only"><button type="button" class="btn btn--mg btn--block" data-act="pjSubmit">추천코드 만들기</button></div>
  <p class="demo-note"><span class="demo-tag">시안</span>실제로 가입되지 않아요</p>
</div>`
    };
  };
  H.inputs.pjField = function (el) {
    var f = pj();
    f[el.dataset.f] = el.value;
    if (f.tried) { el.classList.remove("bad"); var err = el.closest(".field").querySelector(".err-t"); if (err) err.remove(); }
  };
  H.inputs.pjAll = function (el) {
    var f = pj();
    f.agree = f.agree.map(function () { return el.checked; });
    H.$$('[data-change="pjTerm"]').forEach(function (c) { c.checked = el.checked; });
  };
  H.inputs.pjTerm = function (el) {
    var f = pj(), all = H.$("#pjAll");
    f.agree[Number(el.dataset.i)] = el.checked;
    if (all) all.checked = f.agree.every(Boolean);
  };
  H.acts.pjType = function (el) { pj().type = el.dataset.v; H.rerender(el); };
  H.acts.pjSubmit = function () {
    var f = pj();
    f.tried = true;
    if (["name", "phone", "biz", "bank", "agree"].some(function (k) { return pjErr(k); })) {
      H.rerender();
      var first = H.$(".input.bad") || H.$("#pjAll");
      if (first) first.scrollIntoView({ block: "center", behavior: "smooth" });
      H.toast("빠진 칸을 채워 주세요");
      return;
    }
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", code = "";
    for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    H.state.partner = { code: code, name: f.name, phone: f.phone, type: f.type, biz: f.biz, bank: f.bank, account: f.account, holder: f.holder, channel: f.channel, joined: H.today() };
    H.pjoin = null;
    H.save();
    H.go("#/partner/done");
  };

  /* ---------- 추천코드를 만든 뒤 ---------- */
  H.views["partner-done"] = function () {
    var pt = H.state.partner;
    if (!pt) return { title: "파트너스", html: `<div class="wrap"><p class="empty">아직 추천코드가 없어요.<br><br><a class="btn btn--mg btn--sm" href="#/partner/join">추천코드 만들기</a></p></div>` };
    return {
      title: "추천코드를 만들었어요", tab: false,
      html: `<div class="wrap"><div class="done">
  <div class="done__ic">${H.icon("check")}</div>
  <h1>추천코드를 만들었어요</h1>
  <p class="lead">${H.esc(pt.name)}님의 추천코드는 <b class="num">${pt.code}</b>예요. 아래 링크를 보내면 소개가 시작돼요.</p>
  <div class="pt-link"><small>① 뿌릴 추천 링크</small><b class="num">hiuplus.com/${pt.code}</b>
    <div class="pt-link__acts"><button type="button" class="btn btn--ink btn--sm" data-act="copyRef">복사</button><button type="button" class="btn btn--kakao btn--sm" data-act="toast" data-msg="시안: 카카오톡 공유 창이 열려요">${H.icon("kakao", "ic--fill")}카카오톡으로 보내기</button></div></div>
  <div class="pt-link pt-link--soft"><small>② 내 실적 확인</small><b class="num">hiuplus.com/partner/····</b><p class="help-t">로그인 없이 열리니 그 주소는 나만 알고 계세요.</p>
    <div class="pt-link__acts"><a class="btn btn--line btn--sm" href="#/partner/stats">내 실적 보기</a></div></div>
  ${pt.account ? "" : `<p class="a-note">${H.icon("info")}<span>정산 계좌를 아직 안 넣으셨어요. 수수료를 보내드리려면 정산 전에 등록이 필요해요. 마이페이지에서 다시 안내드려요.</span></p>`}
  <div class="done-cta"><a class="btn btn--soft btn--block" href="#/my">마이페이지로</a></div>
</div></div>`
    };
  };

  /* ---------- 파트너 실적 (예시) ---------- */
  H.views["partner-stats"] = function () {
    var pt = H.state.partner;
    if (!pt) return { title: "파트너 실적", html: `<div class="wrap me-narrow"><header class="me-hd"><h1>파트너 실적</h1><p>아직 파트너가 아니에요.</p></header><a class="btn btn--mg btn--block" href="#/partner">파트너스 안내 보기</a></div>` };
    var rows = [["2026.09.02", "김*준", "갤럭시 Z 플립8", "개통완료", FEE], ["2026.09.05", "이*아", "아이폰 17", "개통완료", FEE], ["2026.09.12", "박*호", "아이폰 18 프로", "접수", 0]];
    var done = rows.filter(function (x) { return x[3] === "개통완료"; }).length, gross = done * FEE, tax = Math.round(gross * 0.033);
    return {
      title: "파트너 실적",
      html: `<div class="wrap me-narrow">
  <a class="back" href="#/my">${H.icon("chev-l")}마이페이지</a>
  <header class="ph ph--tight"><p class="eyebrow-sm num">추천코드 ${pt.code} <span class="demo-tag">예시 실적</span></p><h1>파트너 실적</h1></header>
  <div class="tiles tiles--3"><div class="tile"><small>접수</small><b class="num">${rows.length}</b></div><div class="tile"><small>개통완료</small><b class="num">${done}</b></div><div class="tile"><small>지급 예정</small><b class="num">${done}</b></div></div>
  <div class="sum sum--flat"><div class="pbox__rows"><div class="row"><span>지급 예정 수수료</span><b class="num">${H.won(gross)}</b></div><div class="row"><span>원천징수 3.3%</span><b class="num minus">- ${H.won(tax)}</b></div></div>
    <div class="sum__total"><span>실지급 예상</span><b class="num">${H.won(gross - tax)}</b></div></div>
  <p class="help-t">지금까지 지급된 수수료는 0원입니다. 9월 개통분은 10월 말에 지급돼요.</p>
  <h2 class="me-sec-t">추천 내역</h2>
  <div class="tbl-wrap"><table class="pt-table"><thead><tr><th>접수일</th><th>고객</th><th>모델</th><th>상태</th><th>수수료</th><th>지급됨</th></tr></thead>
    <tbody>${rows.map(function (x) { return `<tr><td class="num">${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td class="num">${x[4] ? H.won(x[4]) : "-"}</td><td>-</td></tr>`; }).join("")}</tbody></table></div>
  <div class="pt-link"><small>내 추천 링크</small><b class="num">hiuplus.com/${pt.code}</b><div class="pt-link__acts"><button type="button" class="btn btn--ink btn--sm" data-act="copyRef">복사</button></div></div>
  <div class="done__acts"><a class="btn btn--line btn--sm" href="#/partner">파트너스 안내</a><button type="button" class="btn btn--soft btn--sm" data-act="pjReset">파트너 정보 지우기 (시안)</button></div>
</div>`
    };
  };
  H.acts.pjReset = function () { H.state.partner = null; H.pjoin = null; H.save(); H.toast("파트너 정보를 지웠어요 (시안)"); H.go("#/partner"); };
})();
