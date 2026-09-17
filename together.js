/* 하이유플 리뉴얼 목업 — 휴대폰 + 인터넷 같이 (메뉴가 아닌 따로 된 설명 공간 · 주소 #/together)
 * 할인표: LG U+ 공식 두 페이지, 2026-09-17 확인
 *   참 쉬운 가족 결합  lguplus.com/benefit-uplus/combined-discount/B200000016
 *   U+투게더 결합      lguplus.com/mobile/combined/together
 * ★두 결합 모두 휴대폰 할인은 «회선당»이다(묶음 전체가 아니다). 대표 참고자료 2026-09-17 로 바로잡음.
 * ★투게더에 «가족이 아니어도» 문구를 쓰지 않는다 — 청구계정을 하나로 묶어야 하므로 (대표 2026-09-17)
 * 인터넷 요금 · 설치비: 자비스웹 인터넷+TV 가격설정(hs_internet_settings, LG, 정책 기준일 2026-09-07) 값
 * 가입 지원금은 조합마다 달라 숫자를 쓰지 않는다(2026-09-15 대표 지시로 인터넷 화면에서도 «정해진 값»처럼 보이는 표기를 뺐다)
 */
(function () {
  "use strict";
  var H = window.H;
  var SPEEDS = [["100", "100Mbps", 22000, 5500], ["500", "500Mbps", 33000, 9900], ["1000", "1Gbps", 38500, 13200]];
  var TIERS = [["low", "69,000원 미만"], ["mid", "69,000원 이상"], ["high", "88,000원 이상"]];
  var PHONE_DC = { 1: [0, 0, 0], 2: [2200, 3300, 4400], 3: [3300, 5500, 6600], 4: [4400, 6600, 8800] };
  var FAQ = [
    ["휴대폰만 사도 되나요?", "네. 하이유플 휴대폰 가격에는 인터넷 결합 조건이 없어요. 인터넷은 원할 때만 더하는 선택이에요."],
    ["휴대폰이 1대뿐이어도 할인되나요?", "휴대폰 1대와 인터넷을 묶으면 휴대폰 할인은 없고, 인터넷 요금만 속도에 따라 할인돼요. 가족 휴대폰을 2대 이상 묶으면 휴대폰도 1대마다 할인돼요."],
    ["가족 범위는 어디까지예요?", "배우자, 직계 존비속, 형제 · 자매, 사위 · 며느리, 배우자의 부모 · 형제 · 자매까지예요. U+휴대폰은 10대, U+인터넷은 3대까지 묶을 수 있어요."],
    ["결합 신청은 어떻게 해요?", "U+one 앱 [MY] → [결합할인 정보] → [결합할인 신청]에서 하거나, 고객센터(114)나 LG U+ 매장에서 할 수 있어요. 결합한 날부터 바로 할인돼요."],
    ["다른 할인과 같이 받을 수 있나요?", "결합 할인과 제휴카드 할인은 같이 받을 수 없어요."]
  ];

  /* ★투게더 «몇 명이면 얼마» — LG U+ 공식 화면처럼 인원을 골라 보는 칸 (대표 2026-09-17)
   * 투게더는 월 85,000원 이상 무제한 요금제만 되고, 할인은 «회선당»이라 인원만큼 각자 받는다 */
  var TG_PEOPLE = [[1, "1명"], [2, "2명"], [3, "3명"], [4, "4~5명"]];
  var TG_DC = { 1: 0, 2: 10000, 3: 14000, 4: 20000 };
  var TG_PLANS = [50, 49, 48, 17];
  function tgPeople() { return H.state.tgPeople || 4; }
  H.acts.tgPeople = function (el) {
    H.state.tgPeople = Number(el.dataset.v);
    H.save();
    var box = H.$("#tgPick");
    if (box) box.innerHTML = tgPickHtml();
    H.refocus(el);
  };
  function tgPickHtml() {
    var n = tgPeople(), dc = TG_DC[n], word = ["", "혼자", "두 명", "세 명", "네 명"][n];
    var people = TG_PEOPLE.map(function (x) {
      var on = x[0] <= n;
      return `<button type="button" class="tgp-p${on ? " on" : ""}" data-act="tgPeople" data-v="${x[0]}" aria-pressed="${x[0] === n}">
        <span class="tgp-p__ic">${H.icon("user")}${on ? `<i class="tgp-p__chk">${H.icon("check")}</i>` : ""}</span><small>${x[1]}</small></button>`;
    }).join('<span class="tgp-plus" aria-hidden="true">+</span>');
    var cards = TG_PLANS.map(function (id) {
      var pl = H.plan(id);
      if (!pl) return "";
      return `<article class="tgp-c">
        <h4>${H.esc(pl.name)}</h4><p class="tgp-c__base num">(${H.won(pl.fee)})</p>
        <p class="tgp-c__when">${word}${n === 1 ? " 쓰면" : "이 모이면"}</p>
        <p class="tgp-c__big num">${H.won(pl.fee - dc)}${n === 1 ? "" : '<small>/인당</small>'}</p>
        <p class="tgp-c__dc num">${dc ? H.won(dc) + " 투게더 결합할인" : "휴대폰 할인은 없어요"}</p>
      </article>`;
    }).join("");
    return `<div class="tgp-people" role="group" aria-label="결합 인원">${people}</div>
      <div class="tgp-grid">${cards}</div>
      <p class="help-t">투게더는 월 85,000원 이상 무제한 요금제만 묶을 수 있어요. 최대 5대까지이고, 대표자가 한꺼번에 내는 청구계정으로 묶어야 해요. 인터넷(500MB 이상)을 같이 쓰면 월 11,000원, 만 18세 이하가 있으면 월 10,000원을 더 할인해요.</p>`;
  }

  function tg() {
    if (!H.tg) H.tg = { speed: "1000", phones: 2, tier: "high" };
    return H.tg;
  }
  function seg(key, list, cur, label) {
    return `<div class="tg-seg" role="group" aria-label="${label}">${list.map(function (x) {
      return `<button type="button" data-act="tgSet" data-k="${key}" data-v="${x[0]}" aria-pressed="${String(x[0]) === String(cur)}">${x[1]}</button>`;
    }).join("")}</div>`;
  }
  function calcHtml() {
    var t = tg(), sp = SPEEDS.find(function (x) { return x[0] === t.speed; }), ti = TIERS.map(function (x) { return x[0]; }).indexOf(t.tier);
    var per = PHONE_DC[t.phones][ti], phoneTotal = per * t.phones, month = sp[3] + phoneTotal;
    return `<div class="tg-calc__in">
      <div class="tg-q"><span>인터넷 속도</span>${seg("speed", SPEEDS, t.speed, "인터넷 속도")}</div>
      <div class="tg-q"><span>묶을 휴대폰</span>${seg("phones", [[1, "1대"], [2, "2대"], [3, "3대"], [4, "4대 이상"]], t.phones, "묶을 휴대폰 수")}</div>
      <div class="tg-q"><span>휴대폰 요금제</span>${seg("tier", TIERS, t.tier, "휴대폰 요금제 구간")}</div>
    </div>
    <div class="tg-res" aria-live="polite">
      <div class="row"><span>인터넷 ${sp[1]} 월 요금</span><b class="num"><s>${H.won(sp[2])}</s> → ${H.won(sp[2] - sp[3])}</b></div>
      <div class="row"><span>휴대폰 할인</span><b class="num">${per ? `${t.phones === 4 ? "4대 이상 · " : ""}1대마다 월 ${H.won(per)}` : "1대면 없어요"}</b></div>
      <div class="tg-res__total"><span>매달 덜 내는 돈</span><b class="num">${H.won(month)}</b></div>
      <p class="tg-res__sub num">인터넷 3년 약정 동안이면 ${H.won(month * 36)}${t.phones === 4 ? " · 4대로 계산" : ""}</p>
    </div>`;
  }

  /* 보던 휴대폰으로 — 최근 본 상품이 있으면 그리로, 없으면 목록으로 (대표 지시 2026-09-16) */
  function backBtn() {
    var lp = (H.state.recent || []).map(H.prod).find(function (x) { return x && !x.launch; });
    return lp
      ? `<button type="button" class="btn btn--line btn--block" data-act="lastProduct" data-pid="${lp.id}">보던 휴대폰으로 돌아가기 · ${H.esc(lp.name)}</button>`
      : `<a class="btn btn--line btn--block" href="#/phones">휴대폰 먼저 보기</a>`;
  }

  H.views.together = function () {
    return {
      title: "휴대폰 + 인터넷 같이",
      html: `<div class="wrap tg">
  <header class="tg-hd">
    <p class="tg-eyebrow">휴대폰 + 인터넷</p>
    <h1>인터넷도 같이 하면<br>결합 할인이 따로 있어요</h1>
    <p class="tg-lead">휴대폰 가격은 인터넷과 상관없어요. LG U+ 인터넷을 같이 쓰면 «U+투게더 결합»이나 «참 쉬운 가족 결합»으로 매달 요금이 내려가요.</p>
    <ul class="tg-points">
      <li>${H.icon("check")}<span><b>휴대폰 가격은 그대로</b>인터넷 결합 조건 없음</span></li>
      <li>${H.icon("wifi")}<span><b>인터넷 요금 할인</b>속도에 따라 매달 내려가요</span></li>
      <li>${H.icon("user")}<span><b>가족 휴대폰도 할인</b>2대부터 1대마다 더 내려가요</span></li>
    </ul>
    ${H.netAskCard("", "인터넷도 같이 상담받을게요", "체크해 두시면 휴대폰 접수할 때 같이 들어가요.", true)}
  </header>

  <section class="tg-sec tg-sec--hero"><h2>결합 할인 두 가지</h2><p class="tg-sub">묶는 사람과 조건이 달라요. 어느 쪽이 나은지는 상담에서 같이 봐 드려요.</p>
    <div class="cb">
      <article class="cb__c cb__c--alt">
        <p class="cb__n">U+투게더 결합</p>
        <p class="cb__d">무제한 요금제끼리 모이면, 회선마다 크게 받는 할인</p>
        <p class="cb__big"><b class="num">91,000</b><span>원</span><small>매달</small></p>
        <p class="cb__basis">휴대폰 4대(회선당 20,000원) + 1Gbps 인터넷 기준 · 월 85,000원 이상 요금제만</p>
        <img class="cb__img" src="img/combo-together.png" width="1080" height="1448" alt="U+투게더 결합 할인표">
      </article>
      <article class="cb__c">
        <p class="cb__n">참 쉬운 가족 결합</p>
        <p class="cb__d">가족이라면 복잡한 조건 없이, 회선마다 받는 할인</p>
        <p class="cb__big"><b class="num">48,400</b><span>원</span><small>매달</small></p>
        <p class="cb__basis">같은 조건 — 휴대폰 4회선(회선당 8,800원) + 1GB 인터넷 기준</p>
        <img class="cb__img" src="img/combo-family.png" width="1080" height="1374" alt="참 쉬운 가족 결합 할인표">
      </article>
    </div>
    <ul class="a-list tg-notes"><li><b>두 결합 모두 휴대폰 할인은 회선마다 붙어요.</b> 묶은 대수만큼 곱해서 받아요.</li><li>투게더는 월 85,000원 이상 무제한 요금제만 되고, 대표자가 한꺼번에 내는 청구계정으로 묶어야 해요.</li><li>인터넷 할인액은 3년 약정 기준이에요. 2년은 절반, 1년은 4분의 1이에요.</li><li>두 결합을 같이 받을 수는 없어요. 유리한 쪽 하나를 골라요.</li></ul>
    <p class="asof">LG U+ 공식 안내 기준 · 2026년 9월 17일 확인 · 가입 조건은 상담에서 다시 확인해 드려요</p>
  </section>

  <section class="tg-sec"><h2>몇 명이 모이면 얼마가 되나요</h2><p class="tg-sub">투게더 결합은 한 사람마다 할인돼요. 모일 인원을 눌러 보세요.</p>
    <div id="tgPick">${tgPickHtml()}</div>
  </section>

  <section class="tg-sec"><h2>인터넷 가입 지원금</h2>
    <div class="tg-gift">${H.icon("won")}<div><b>인터넷을 같이 바꾸시면 80만원을 지원해 드려요</b><p>인터넷과 TV 상품은 상담에서 맞는 것으로 안내해 드려요. LG U+ 인터넷은 공유기가 포함돼요.</p></div></div>
  </section>

  <section class="tg-sec"><h2>이렇게 진행돼요</h2>
    <ol class="steps">${[
      ["휴대폰 주문", "지금처럼 휴대폰을 고르고 주문해요. 인터넷을 안 해도 가격은 같아요."],
      ["인터넷 상담 신청", "이 화면에서 번호를 남기면 담당자가 조합과 설치 일정을 여쭤봐요."],
      ["설치", "설치비는 처음 한 번 인터넷 36,300원, 인터넷+TV 56,100원이에요."],
      ["결합 신청", "U+one 앱이나 114에서 결합을 신청해요. 방법은 상담 때 같이 안내해요."]
    ].map(function (s, i) { return `<li class="step"><i>${i + 1}</i><div><b>${s[0]}</b><p>${s[1]}</p></div></li>`; }).join("")}</ol>
  </section>

  <section class="tg-sec"><h2>자주 묻는 질문</h2>
    <div class="faq">${FAQ.map(function (f) { return `<details><summary><span class="q">Q</span><span>${f[0]}</span>${H.icon("chev-d")}</summary><p class="a">${f[1]}</p></details>`; }).join("")}</div>
  </section>

  ${H.netAskCard("", "인터넷도 같이 상담받을게요", "체크해 두시면 휴대폰 접수할 때 같이 들어가요.", true)}

  <div class="tg-cta">${backBtn()}</div>
  <p class="demo-note"><span class="demo-tag">시안</span>하이유플은 지금 인터넷을 웹에서 팔지 않아요(인터넷 화면 꺼짐). 상담 접수는 자비스웹 «상담 접수 › 인터넷»으로 들어가요</p>
</div>`
    };
  };

  H.acts.tgSet = function (el) {
    var t = tg(), k = el.dataset.k;
    t[k] = k === "phones" ? Number(el.dataset.v) : el.dataset.v;
    var box = H.$("#tgCalc");
    if (box) box.innerHTML = calcHtml();
    H.refocus(el);
  };
  H.acts.tgLead = function () {
    var t = tg(), sp = SPEEDS.find(function (x) { return x[0] === t.speed; }), u = H.state.user, li = H.state.loggedIn;
    H.openSheet({
      title: "인터넷 같이 상담받기",
      body: `<p class="help-t help-t--lead">남겨 주신 번호로 담당자가 연락드려요. 설치 주소와 TV가 필요한지는 통화 때 여쭤봐요.</p>
        <div class="field"><label for="tgName">이름</label><input id="tgName" class="input" autocomplete="name" value="${li ? H.esc(u.name) : ""}"></div>
        <div class="field"><label for="tgPhone">휴대폰 번호<span class="req">*</span></label><input id="tgPhone" class="input" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="${li ? H.esc(u.phone) : ""}" data-focus></div>
        <div class="point-row"><span>관심 있는 인터넷</span><b>LG U+ ${sp[1]}</b></div>
        <div class="agree"><label><input type="checkbox" id="tgAgree"><span class="box">${H.icon("check")}</span><span>[필수] 상담을 위한 개인정보 수집 · 이용 동의</span></label></div>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="tgLeadSend">상담 요청하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 접수되지 않아요</p>`
    });
  };
  H.acts.tgLeadSend = function () {
    var v = (H.$("#tgPhone") || {}).value || "";
    if (v.replace(/\D/g, "").length < 10) { H.toast("휴대폰 번호를 끝까지 적어 주세요"); return; }
    if (!(H.$("#tgAgree") || {}).checked) { H.toast("개인정보 수집 · 이용에 동의해 주세요"); return; }
    H.setSheet(`<div class="ok"><div class="ok__ic">${H.icon("check")}</div><h3>인터넷 상담 요청을 받았어요</h3><p>${H.esc(v)} 번호로 연락드릴게요.<br>평일 10:00–20:00 · 토요일 11:00–20:00</p></div>`,
      `<button type="button" class="btn btn--ink btn--block" data-act="closeSheet">확인</button>`);
  };
})();
