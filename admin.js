/* 하이유플 리뉴얼 목업 — 직원용 관리(시안): 하유 가이드 글 편집 · 구매후기 피드 감추기
 * 실제로는 자비스웹 안에 들어갈 화면. 목업에서는 고친 내용이 이 브라우저에만 저장된다.
 */
(function () {
  "use strict";
  var H = window.H, C = H.C;
  var ADD_TYPES = [["h", "소제목"], ["p", "문단"], ["list", "목록"], ["note", "안내"], ["steps", "순서"], ["cta", "단추"]];
  var TYPE_LABEL = { answer: "짧게 답하면", h: "소제목", p: "문단", list: "목록", note: "안내", steps: "순서", pairs: "두 칸 설명", formula: "계산식", calc: "금액표 (자동 계산)", compare: "비교표 (자동 계산)", cta: "단추" };

  /* 관리 화면은 손님 사이트가 아니라 자비스웹(직원 로그인) «판매몰 관리 › 손님몰 화면» 안에 들어간다.
   * 자비스웹과 손님몰은 한 프로그램(labadmin) · 같은 DB. 탭 옆 표시: 있음 = 지금 메뉴 · 고침 = 칸 더하기 · 새로 = 새 메뉴 */
  var TAG = { "있음": "have", "고침": "fix", "새로": "new" };
  function shell(tab, inner, title, extra) {
    var tabs = [["home", "관리 첫 화면", "#/admin", ""], ["banners", "배너 관리", "#/admin/banners", "있음"], ["reviews", "후기 관리", "#/admin/reviews", "고침"], ["guides", "하유 가이드 글", "#/admin/guides", "새로"]];
    return Object.assign({
      title: title, tab: false, footer: false,
      html: `<div class="adm">
  <div class="adm__bar"><div class="wrap adm__bar-in"><b>자비스웹 <span class="adm__path">판매몰 관리 › 손님몰 화면 · 하이유플</span></b><a class="adm__out" href="#/">손님 화면으로${H.icon("arrow", "ic--sm")}</a></div></div>
  <div class="wrap">
    <nav class="adm__tabs" aria-label="관리 메뉴">${tabs.map(function (t) { return `<a href="${t[2]}"${tab === t[0] ? ' aria-current="page"' : ""}>${t[1]}${t[3] ? `<small class="adm-tag adm-tag--${TAG[t[3]]}">${t[3]}</small>` : ""}</a>`; }).join("")}</nav>
    ${inner}
  </div>
</div>`
    }, extra || {});
  }

  /* ---------- 관리 첫 화면 ---------- */
  H.views["admin-home"] = function () {
    var guides = H.guideList({ all: true }), hidden = (H.state.guideHidden || []).length;
    var feed = H.feedAll(), mods = H.state.feedMod || {};
    var hidePosts = feed.filter(function (p) { return (mods[p.id] || {}).hide; }).length;
    var hidePhotos = feed.filter(function (p) { return (mods[p.id] || {}).hidePhoto; }).length;
    var bnOn = (H.BANNERS || []).filter(function (b) { return (H.state.bannerOff || []).indexOf(b.key) < 0; }).length;
    return shell("home", `
  <header class="ph ph--tight"><h1>관리 첫 화면</h1><p>손님 사이트(hiuplus.com)에는 관리 화면이 없어요. 모두 직원이 로그인하는 자비스웹 «판매몰 관리 › 손님몰 화면» 메뉴에 들어가요.</p></header>
  <div class="adm-where">
    <div><b>자비스웹과 손님몰은 한 프로그램이에요</b><p>같은 데이터를 쓰기 때문에 자비스웹에서 저장하면 손님 화면에 바로 반영돼요. 목업에서는 이 브라우저에만 저장돼요.</p></div>
    <ul><li><span class="adm-tag adm-tag--have">있음</span>지금 자비스웹에 있는 메뉴</li><li><span class="adm-tag adm-tag--fix">고침</span>있는 메뉴에 칸 · 기능 더하기</li><li><span class="adm-tag adm-tag--new">새로</span>새로 만드는 메뉴</li></ul>
  </div>
  <div class="adm-cards">
    <a class="adm-card" href="#/admin/banners"><small>배너 관리 <span class="adm-tag adm-tag--have">있음</span></small><b class="num">${bnOn}장 켜짐</b><span>순서 · 노출 기간 · 켜기 · PC/모바일 그림</span></a>
    <a class="adm-card" href="#/admin/reviews"><small>후기 관리 <span class="adm-tag adm-tag--fix">고침</span></small><b class="num">${feed.length}개</b><span>감춤 ${hidePosts}개 · 사진만 감춤 ${hidePhotos}개</span></a>
    <a class="adm-card" href="#/admin/guides"><small>하유 가이드 글 <span class="adm-tag adm-tag--new">새로</span></small><b class="num">${guides.length}개</b><span>숨김 ${hidden}개 · 새 글 쓰기 · 고치기</span></a>
  </div>
  <p class="demo-note"><span class="demo-tag">시안</span>파트너스 · 인터넷+TV · 상담 접수 · 접수 관리는 지금 자비스웹 화면을 그대로 써요</p>`, "관리");
  };

  /* ---------- 배너 관리 — 지금 자비스웹 «배너 관리»와 같은 칸 + 시안에 필요한 칸 ---------- */
  H.views["admin-banners"] = function () {
    var list = H.BANNERS || [], off = H.state.bannerOff || [];
    return shell("banners", `
  <div class="adm-hd"><div><h1>배너 관리</h1><p>첫 화면 배너를 올리고 순서 · 노출 기간 · 켜기를 정해요. 켜진 배너가 5초마다 넘어가요.</p></div><button type="button" class="btn btn--mg btn--sm" data-act="toast" data-msg="시안: 배너 추가 칸이 열려요 (PC 그림 · 모바일 그림 · 링크 · 순서 · 노출 기간)">배너 추가</button></div>
  <p class="adm-now">${H.icon("info", "ic--sm")}<span>지금 하이유플에 켜진 배너는 5장이에요. 글자까지 그림에 그려 넣고 배너 전체가 링크예요(상품 목록 3장 · 아이폰 사전예약 이벤트 · 랜덤박스 후기).</span></p>
  <div class="bnr-list">${list.map(function (b, i) {
    var on = off.indexOf(b.key) < 0;
    return `<div class="bnr${on ? "" : " is-off"}">
      <span class="bnr__th bnr__th--${b.theme || "fold"}" aria-hidden="true"><i class="num">${i + 1}</i></span>
      <div class="bnr__main"><b>${H.esc(b.name)}</b><small>${H.esc(b.to || "#/phones?cat=galaxy&series=z8")}</small>
        <dl class="bnr__kv"><div><dt>PC 그림</dt><dd>올림</dd></div><div><dt>모바일 그림</dt><dd>올림</dd></div><div><dt>노출 기간</dt><dd>없음</dd></div></dl></div>
      <button type="button" class="switch" role="switch" aria-checked="${on}" aria-label="${H.esc(b.name)} 켜기" data-act="bnrToggle" data-v="${b.key}"></button>
    </div>`;
  }).join("")}</div>
  <section class="adm-sec adm-sec--gap"><h2>배너 한 장에 넣는 칸</h2>
    <div class="tbl-wrap"><table class="adm-tbl"><thead><tr><th>칸</th><th>지금 자비스웹</th><th>리뉴얼 시안에 필요한 것</th></tr></thead><tbody>
      <tr><td>PC 그림</td><td>있음 · 틀 1280:620 · PNG · JPG · WEBP · GIF 8MB 이하</td><td>시안 틀은 1200:500 → 틀 비율 바꾸기(개발)</td></tr>
      <tr><td>모바일 그림</td><td>있음 · 틀 800:985</td><td>시안은 글자 아래 사진 구성 → 사진 틀 바꾸기(개발)</td></tr>
      <tr><td>글자</td><td>«배너 위 문구» 한 줄(왼쪽 위 검정 글씨)</td><td>작은 제목 · 큰 제목 · 설명 · 단추 글자 칸 더하기(개발). 안 하면 지금처럼 글자를 그림에 그림</td></tr>
      <tr><td>링크</td><td>있음 · 배너 전체</td><td>그대로</td></tr>
      <tr><td>순서 · 사용 · 노출 기간</td><td>있음</td><td>그대로 (노출 시각 칸 한국시간 처리 확인 필요)</td></tr>
      <tr><td>넘김</td><td>5초 · 좌우 화살표 · 아래 점 · 누르고 있으면 멈춤</td><td>멈춤 단추 + 5초 막대(하이폰 · 하이스테이션에 고른 모양과 같게)</td></tr>
    </tbody></table></div>
  </section>`, "배너 관리");
  };
  H.acts.bnrToggle = function (el) {
    var k = el.dataset.v, off = (H.state.bannerOff || []).slice(), i = off.indexOf(k);
    if (i < 0 && (H.BANNERS || []).length - off.length <= 1) { H.toast("배너는 한 장 이상 켜 두세요"); return; }
    if (i >= 0) off.splice(i, 1); else off.push(k);
    H.state.bannerOff = off;
    H.save();
    H.rerender();
    H.toast(i >= 0 ? "배너를 켰어요. 첫 화면에 다시 보여요" : "배너를 껐어요. 첫 화면에서 빠졌어요");
  };

  /* ---------- 하유 가이드 글 목록 ---------- */
  H.views["admin-guides"] = function () {
    var list = H.guideList({ all: true }), hid = H.state.guideHidden || [], edits = H.state.guideEdits || {};
    return shell("guides", `
  <div class="adm-hd"><div><h1>하유 가이드 글</h1><p class="num">${list.length}개 · 손님 화면에 보이는 순서</p></div><a class="btn btn--mg btn--sm" href="#/admin/guide/new">${H.icon("pencil", "ic--sm")}새 글 쓰기</a></div>
  <div class="adm-list">${list.map(function (g) {
    var isHid = hid.indexOf(g.slug) >= 0, isNew = !C.guides.some(function (x) { return x.slug === g.slug; });
    return `<div class="adm-row">
      <div class="adm-row__main"><small>${H.esc(g.cat)}${g.home ? " · 첫 화면" : ""}</small><b>${H.esc(g.title)}</b>
        <span class="adm-row__tags">${isHid ? '<span class="st st--off">숨김</span>' : '<span class="st st--on">공개</span>'}${isNew ? '<span class="st">새 글</span>' : edits[g.slug] ? '<span class="st">고친 글</span>' : ""}</span></div>
      <div class="adm-row__acts">
        <a class="btn btn--line btn--sm" href="#/guide/${g.slug}?preview=1">보기</a>
        <a class="btn btn--ink btn--sm" href="#/admin/guide/${g.slug}">고치기</a>
        <button type="button" class="switch" role="switch" aria-checked="${!isHid}" aria-label="손님 화면에 공개" data-act="admGuideVis" data-v="${g.slug}"></button>
      </div>
    </div>`;
  }).join("")}</div>
  <p class="demo-note"><span class="demo-tag">시안</span>스위치를 끄면 손님 화면의 하유 가이드 목록 · 첫 화면에서 바로 빠져요</p>`, "하유 가이드 글 관리");
  };
  H.acts.admGuideVis = function (el) {
    var slug = el.dataset.v, hid = (H.state.guideHidden || []).slice(), i = hid.indexOf(slug);
    if (i >= 0) hid.splice(i, 1); else hid.push(slug);
    H.state.guideHidden = hid;
    H.save();
    H.rerender(el);
    H.toast(i >= 0 ? "공개했어요. 손님 화면에 보여요" : "숨겼어요. 손님 화면에서 빠졌어요");
  };

  /* ---------- 글 편집 ---------- */
  function draftFor(slug) {
    if (H.editDraft && H.editDraft._slug === slug) return H.editDraft;
    var g = slug === "new"
      ? { slug: "g" + Date.now().toString(36), cat: "구매 조건", title: "", summary: "", read: 2, home: false, body: [{ t: "answer", text: "" }, { t: "h", text: "" }, { t: "p", text: "" }, { t: "cta", label: "내 조건으로 월 납부 금액 보기", to: "#/phones", last: true }] }
      : JSON.parse(JSON.stringify(H.guide(slug) || {}));
    g._slug = slug;
    g._isNew = slug === "new";
    H.editDraft = g;
    return g;
  }
  function cur() { return draftFor(H.route.parts[2] || "new"); }
  function blockEditor(b, i, len) {
    var head = `<div class="ed-block__hd"><b>${TYPE_LABEL[b.t] || b.t}</b><span class="ed-block__acts">
      <button type="button" data-act="edMove" data-k="${i}" data-v="-1" aria-label="위로 옮기기"${i === 0 ? " disabled" : ""}>↑</button>
      <button type="button" data-act="edMove" data-k="${i}" data-v="1" aria-label="아래로 옮기기"${i === len - 1 ? " disabled" : ""}>↓</button>
      <button type="button" data-act="edDel" data-k="${i}" aria-label="이 칸 지우기">${H.icon("close", "ic--sm")}</button></span></div>`;
    var body;
    if (b.t === "list" || b.t === "steps") {
      body = `<textarea class="input input--area" rows="${Math.max(3, (b.items || []).length + 1)}" data-input="edBlock" data-k="${i}" data-f="items" aria-label="${TYPE_LABEL[b.t]}" placeholder="한 줄에 하나씩">${H.esc((b.items || []).join("\n"))}</textarea><p class="help-t">한 줄에 하나씩 적어요</p>`;
    } else if (b.t === "cta") {
      body = `<input class="input" value="${H.esc(b.label || "")}" data-input="edBlock" data-k="${i}" data-f="label" aria-label="단추 글자" placeholder="단추 글자 (예: 내 조건으로 월 납부 금액 보기)"><p class="help-t">누르면 손님이 보던 휴대폰으로 가요. 본 휴대폰이 없으면 휴대폰 목록으로 가요.</p>`;
    } else if (b.t === "calc" || b.t === "compare") {
      body = `<p class="ed-auto">${H.esc(b.caption || "")}</p><p class="help-t">금액은 상품 가격으로 자동 계산돼요. 가격이 바뀌면 글 속 숫자도 같이 바뀌어요.</p>`;
    } else if (b.t === "pairs") {
      body = `<textarea class="input input--area" rows="3" data-input="edBlock" data-k="${i}" data-f="pairs" aria-label="두 칸 설명" placeholder="이름 | 설명">${H.esc((b.items || []).map(function (x) { return x.join(" | "); }).join("\n"))}</textarea><p class="help-t">«이름 | 설명» 을 한 줄에 하나씩</p>`;
    } else if (b.t === "formula") {
      body = `<input class="input" value="${H.esc((b.items || []).join(" "))}" data-input="edBlock" data-k="${i}" data-f="formula" aria-label="계산식"><p class="help-t">예) 월 납부 금액 = 월 할부금 + 월 통신 요금</p>`;
    } else {
      body = `<textarea class="input input--area" rows="${b.t === "h" ? 1 : 3}" data-input="edBlock" data-k="${i}" data-f="text" aria-label="${TYPE_LABEL[b.t] || "내용"}">${H.esc(b.text || "")}</textarea>`;
    }
    return `<div class="ed-block ed-block--${b.t}">${head}${body}</div>`;
  }
  H.views["admin-guide"] = function (r) {
    var slug = r.parts[2] || "new", g = draftFor(slug);
    if (!g.body) return shell("guides", `<p class="empty">글을 찾을 수 없어요.</p>`, "글 고치기");
    var cats = C.guideCats.filter(function (c) { return c !== "전체"; });
    return shell("guides", `
  <a class="back" href="#/admin/guides">${H.icon("chev-l")}하유 가이드 글</a>
  <div class="adm-hd"><div><h1>${g._isNew ? "새 글 쓰기" : "글 고치기"}</h1><p>고친 뒤 «저장»을 눌러야 손님 화면에 반영돼요.</p></div></div>
  <div class="adm-editor">
    <section class="adm-sec"><h2>글 정보</h2>
      <div class="field"><label for="edCat">주제</label><select id="edCat" class="input" data-change="edField" data-f="cat">${cats.map(function (c) { return `<option${c === g.cat ? " selected" : ""}>${c}</option>`; }).join("")}</select></div>
      <div class="field"><label for="edTitle">제목<span class="req">*</span></label><input id="edTitle" class="input" value="${H.esc(g.title)}" placeholder="손님이 검색할 질문 그대로 (예: 요금제는 언제 낮출 수 있나요?)" data-input="edField" data-f="title"></div>
      <div class="field"><label for="edSum">목록에 보일 한 줄</label><input id="edSum" class="input" value="${H.esc(g.summary)}" data-input="edField" data-f="summary"></div>
      <div class="field-2">
        <div class="field"><label for="edRead">읽는 시간(분)</label><input id="edRead" class="input" inputmode="numeric" value="${g.read}" data-input="edField" data-f="read"></div>
        <div class="toggle toggle--box"><span>첫 화면에 보이기<small>첫 화면 «하유 가이드»에 나와요</small></span><button type="button" class="switch" role="switch" aria-checked="${!!g.home}" data-act="edHome" aria-label="첫 화면에 보이기"></button></div>
      </div>
    </section>
    <section class="adm-sec"><h2>본문</h2><p class="help-t">위에서부터 순서대로 보여요. 칸마다 ↑ ↓ 로 옮기고, 필요 없으면 지워요.</p>
      <div class="ed-blocks">${g.body.map(function (b, i) { return blockEditor(b, i, g.body.length); }).join("")}</div>
      <div class="ed-add"><span>칸 더하기</span>${ADD_TYPES.map(function (t) { return `<button type="button" class="chip" data-act="edAdd" data-v="${t[0]}">+ ${t[1]}</button>`; }).join("")}</div>
    </section>
  </div>
  <div class="adm-save pc-only"><button type="button" class="btn btn--line" data-act="edPreview">저장하고 미리보기</button><button type="button" class="btn btn--mg" data-act="edSave">저장</button></div>
  ${g._isNew ? "" : '<p class="login-links"><button type="button" data-act="edReset">처음 글로 되돌리기</button></p>'}`, "글 고치기",
    { bar: '<div class="bar-pair"><button type="button" class="btn btn--line" data-act="edPreview">미리보기</button><button type="button" class="btn btn--mg" data-act="edSave">저장</button></div>' });
  };
  H.inputs.edField = function (el) {
    var g = cur(), f = el.dataset.f;
    g[f] = f === "read" ? parseInt(el.value, 10) || 1 : el.value;
  };
  H.inputs.edBlock = function (el) {
    var b = cur().body[Number(el.dataset.k)], f = el.dataset.f, v = el.value;
    if (f === "items") b.items = v.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    else if (f === "pairs") b.items = v.split("\n").map(function (x) { return x.split("|").map(function (y) { return y.trim(); }); }).filter(function (x) { return x[0]; });
    else if (f === "formula") b.items = v.split(/\s*([=+])\s*/).map(function (x) { return x.trim(); }).filter(Boolean);
    else b[f] = v;
  };
  H.acts.edHome = function (el) { var g = cur(); g.home = !g.home; el.setAttribute("aria-checked", String(g.home)); };
  H.acts.edMove = function (el) {
    var g = cur(), i = Number(el.dataset.k), j = i + Number(el.dataset.v);
    if (j < 0 || j >= g.body.length) return;
    var t = g.body[i]; g.body[i] = g.body[j]; g.body[j] = t;
    H.rerender();
  };
  H.acts.edDel = function (el) { cur().body.splice(Number(el.dataset.k), 1); H.rerender(); H.toast("칸을 지웠어요. 저장해야 반영돼요"); };
  H.acts.edAdd = function (el) {
    var g = cur(), t = el.dataset.v;
    g.body.push(t === "list" || t === "steps" ? { t: t, items: [] } : t === "cta" ? { t: "cta", label: "내 조건으로 월 납부 금액 보기", to: "#/phones", last: true } : { t: t, text: "" });
    H.rerender();
    setTimeout(function () {
      var all = H.$$(".ed-block"), last = all[all.length - 1];
      if (!last) return;
      last.scrollIntoView({ block: "center" });
      var field = last.querySelector("textarea, input");
      if (field) field.focus({ preventScroll: true });
    }, 40);
  };
  function persist() {
    var g = cur();
    if (!String(g.title || "").trim()) { H.toast("제목을 적어 주세요"); return null; }
    var clean = JSON.parse(JSON.stringify(g));
    delete clean._slug; delete clean._isNew;
    if (g._isNew) {
      H.state.guideNew = (H.state.guideNew || []).concat([clean]);
      H.editDraft = null;
    } else if (C.guides.some(function (x) { return x.slug === clean.slug; })) {
      var e = Object.assign({}, H.state.guideEdits || {});
      e[clean.slug] = clean;
      H.state.guideEdits = e;
    } else {
      H.state.guideNew = (H.state.guideNew || []).map(function (x) { return x.slug === clean.slug ? clean : x; });
    }
    H.save();
    return clean;
  }
  H.acts.edSave = function () {
    var wasNew = cur()._isNew, c = persist();
    if (!c) return;
    H.toast("저장했어요. 손님 화면에 반영됐어요");
    if (wasNew) H.go("#/admin/guide/" + c.slug);
  };
  H.acts.edPreview = function () {
    var c = persist();
    if (!c) return;
    H.editDraft = null;
    H.go("#/guide/" + c.slug + "?preview=1");
  };
  H.acts.edReset = function () {
    var g = cur(), e = Object.assign({}, H.state.guideEdits || {});
    delete e[g.slug];
    H.state.guideEdits = e;
    H.editDraft = null;
    H.save();
    H.rerender();
    H.toast("처음 글로 되돌렸어요");
  };

  /* ---------- 구매후기 피드 감추기 ---------- */
  H.views["admin-reviews"] = function (r) {
    var f = r.q.f || "all", mods = H.state.feedMod || {};
    var list = H.feedAll().filter(function (p) {
      var m = mods[p.id] || {};
      return f === "all" || (f === "photo" && p.img) || (f === "hidden" && (m.hide || m.hidePhoto)) || (f === "home" && m.home);
    });
    var tabs = [["all", "전체"], ["photo", "사진 있음"], ["hidden", "감춤"], ["home", "첫 화면"]];
    return shell("reviews", `
  <div class="adm-hd"><div><h1>후기 관리</h1><p>지금 자비스웹 «후기 관리»(숨기기 · 삭제)에 «사진만 감추기» · «첫 화면에 보이기»를 더한 모습이에요. 감춘 건 손님 화면에서 바로 빠져요.</p></div><a class="btn btn--line btn--sm" href="#/reviews">손님 피드 보기</a></div>
  <nav class="feed-tabs" aria-label="후기 거르기">${tabs.map(function (t) { return `<a href="#/admin/reviews${t[0] === "all" ? "" : "?f=" + t[0]}"${f === t[0] ? ' aria-current="true"' : ""}>${t[1]}</a>`; }).join("")}</nav>
  <div class="mod-list">${list.map(function (p) {
    var m = mods[p.id] || {};
    return `<div class="mod${m.hide ? " is-hidden" : ""}">
      <div class="mod__th">${p.img ? `<img src="${p.img}" alt=""${m.hidePhoto ? ' class="is-dim"' : ""}>` : '<span class="mod__txt">글</span>'}</div>
      <div class="mod__main"><small class="num">${H.esc(p.name)} · ${p.date.replace(/-/g, ".")}${p.mine ? " · 새로 올라옴" : ""}</small><p>${H.esc(p.text)}</p>
        <div class="mod__acts">
          <label class="mini-sw"><button type="button" class="switch" role="switch" aria-checked="${!!m.hide}" data-act="modSet" data-v="${p.id}" data-k="hide"></button>게시물 감추기</label>
          ${p.img ? `<label class="mini-sw"><button type="button" class="switch" role="switch" aria-checked="${!!m.hidePhoto}" data-act="modSet" data-v="${p.id}" data-k="hidePhoto"></button>사진만 감추기</label>` : ""}
          <label class="mini-sw"><button type="button" class="switch" role="switch" aria-checked="${!!m.home}" data-act="modSet" data-v="${p.id}" data-k="home"></button>첫 화면에 보이기</label>
        </div>
      </div>
    </div>`;
  }).join("") || '<p class="empty">해당하는 후기가 없어요.</p>'}</div>
  <p class="demo-note"><span class="demo-tag">시안</span>«첫 화면에 보이기»를 하나도 안 켜면 첫 화면에는 최근 글 후기가 저절로 나와요</p>`, "후기 관리");
  };
  H.acts.modSet = function (el) {
    var id = el.dataset.v, k = el.dataset.k, mods = Object.assign({}, H.state.feedMod || {}), m = Object.assign({}, mods[id] || {});
    m[k] = !m[k];
    mods[id] = m;
    H.state.feedMod = mods;
    H.save();
    el.setAttribute("aria-checked", String(m[k]));
    var row = el.closest(".mod");
    if (row) {
      row.classList.toggle("is-hidden", !!m.hide);
      var im = row.querySelector(".mod__th img");
      if (im) im.classList.toggle("is-dim", !!m.hidePhoto);
    }
    H.toast({
      hide: m.hide ? "게시물을 감췄어요. 손님 화면에서 빠졌어요" : "게시물을 다시 보이게 했어요",
      hidePhoto: m.hidePhoto ? "사진만 감췄어요. 글은 그대로 보여요" : "사진을 다시 보이게 했어요",
      home: m.home ? "첫 화면 후기에 넣었어요" : "첫 화면 후기에서 뺐어요"
    }[k]);
  };
})();
