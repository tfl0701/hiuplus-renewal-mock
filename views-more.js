/* 하이유플 리뉴얼 목업 — 알고사기 · 구매후기 · 고객센터 · 검색 · 전체 메뉴 · 알림 신청 · 상담 · 기획 메모 */
(function () {
  "use strict";
  var H = window.H, D = H.D, C = H.C, N = H.N;
  var ASOF = D.asOf.replace(/-/g, ".");

  /* 알고사기 글 목록 — 관리 화면에서 고친 내용(이 브라우저에 저장)을 덮어쓴다 */
  H.guideList = function (opt) {
    var st = H.state, edits = st.guideEdits || {}, hidden = st.guideHidden || [];
    var list = C.guides.map(function (g) { return edits[g.slug] || g; }).concat(st.guideNew || []);
    if (opt && opt.all) return list;
    return list.filter(function (g) { return hidden.indexOf(g.slug) < 0; });
  };
  H.guide = function (slug) { return H.guideList({ all: true }).find(function (g) { return g.slug === slug; }); };

  /* ---------- 여러 화면이 같이 쓰는 조각 ---------- */
  /* 글 후기 카드 — 첫 화면 한 줄 · 상품 화면에서 쓴다(사진 없이) */
  H.reviewCard = function (r) {
    return `<a class="rv-card2" href="#/review/${r.id}">
      <span class="rv-card2__top">${H.stars(r.rating)}<span class="num">${r.date.replace(/-/g, ".")}</span></span>
      <span class="rv-card2__txt">${H.esc(r.text)}</span>
      <span class="rv-card2__who">${H.esc(r.name)}${r.tag ? " · " + H.esc(r.tag) : ""}</span></a>`;
  };
  H.faqHtml = function () {
    return '<div class="faq">' + C.faq.map(function (f) {
      return `<details><summary><span class="q">Q</span><span>${f.q}</span>${H.icon("chev-d")}</summary><p class="a">${f.a}</p></details>`;
    }).join("") + "</div>";
  };
  H.helpBox = function () {
    var cs = C.cs;
    return `<div class="help"><b>혼자 고민하지 마세요</b><p>요금제 비교부터 개통 이후까지, 편하게 물어보세요.</p>
      <a class="tel num" href="tel:${cs.phone}">${cs.phone}</a><p class="help__hours">${cs.hours.join("<br>")}</p>
      <div class="help__acts"><button type="button" class="btn btn--kakao" data-act="kakao">${H.icon("kakao", "ic--fill")}카카오톡 상담</button><button type="button" class="btn btn--line" data-act="chat">${H.icon("spark")}AI 상담</button></div></div>`;
  };

  /* ---------- 알고사기 ---------- */
  function sel(b, o) {
    return Object.assign({ vol: b.vol || 0, color: 0, planId: b.plan, method: b.method, discount: b.discount, payment: "installment", months: b.months || 24 }, o || {});
  }
  function calc(b) {
    var p = H.prod(b.pid), s = sel(b), r = H.price(p, s);
    return `<figure class="calc"><figcaption>${b.caption}</figcaption><div class="rows">${H.priceRows(p, s, r)}
      <div class="row row--total"><span>월 납부 금액</span><b class="num">${H.won(r.monthlyTotal)}</b></div></div>
      <p class="asof">하이유플 ${ASOF} 가격으로 계산했어요 · 가격은 바뀔 수 있어요</p></figure>`;
  }
  function compare(b) {
    var p = H.prod(b.pid), sa = sel(b, b.a), sb = sel(b, b.b);
    var cost = b.down ? H.costDown : H.cost;
    var ra = H.price(p, sa), rb = H.price(p, sb), ca = cost(p, sa), cb = cost(p, sb);
    var win = b.neutral || ca === cb ? "" : ca < cb ? "a" : "b";
    var after = function (r, s) { return r.monthlyTotal - r.planFee + Math.round(Math.min(r.planFeeBase, H.DOWN.fee) * (s.discount === "select" ? 0.75 : 1)); };
    var col = function (key, lab, r, c, s) {
      return `<div class="col${win === key ? " win" : ""}"><h4>${lab}${win === key ? '<span class="badge badge--pre">덜 내요</span>' : ""}</h4>
        <p class="big num">월 ${H.won(r.monthlyTotal)}</p><p class="small num">${b.down ? `${H.DOWN.keep + 1}개월째부터 월 ${H.won(after(r, s))}<br>` : ""}실구매가 ${H.won(r.principal)}<br>24개월 합계 ${H.won(c)}</p></div>`;
    };
    var gap = H.won(Math.abs(ca - cb));
    var res = ca === cb ? "" : b.neutral ? `<p class="compare-res">같은 폰, 같은 요금제라도 24개월 합계가 <span class="num">${gap}</span> 달라요.</p>`
      : `<p class="compare-res">${win === "a" ? b.a.label : b.b.label} 쪽이 ${b.down ? "185일 뒤 47,000원으로 낮춰도 " : ""}24개월 동안 <span class="num">${gap}</span> 덜 내요.</p>`;
    var how = b.down ? ` · 185일이 지나는 ${H.DOWN.keep}개월째까지 고른 요금제, ${H.DOWN.keep + 1}개월째부터 월 47,000원(${H.DOWN.name})` : "";
    return `<figure class="compare-wrap"><figcaption>${b.caption}</figcaption><div class="compare">${col("a", b.a.label, ra, ca, sa)}${col("b", b.b.label, rb, cb, sb)}</div>${res}<p class="asof">하이유플 ${ASOF} 가격으로 계산했어요 · 24개월 합계 = 기기값 + 할부 이자 + 요금${how}</p></figure>`;
  }
  function block(b) {
    switch (b.t) {
      case "answer": return `<div class="answer"><small>짧게 답하면</small><p>${b.text}</p></div>`;
      case "h": return `<h2>${b.text}</h2>`;
      case "p": return `<p>${b.text}</p>`;
      case "list": return `<ul class="a-list">${b.items.map(function (i) { return "<li>" + i + "</li>"; }).join("")}</ul>`;
      case "formula": return `<div class="formula">${b.items.map(function (i) { return /^[=+]$/.test(i) ? '<span class="op">' + i + "</span>" : "<span>" + i + "</span>"; }).join("")}</div>`;
      case "steps": return `<div class="a-steps">${b.items.map(function (i) { return "<span>" + i + "</span>"; }).join(H.icon("chev-r"))}</div>`;
      case "note": return `<div class="a-note">${H.icon("info")}<span>${b.text}</span></div>`;
      case "pairs": return `<div class="pairs">${b.items.map(function (i) { return "<div><b>" + i[0] + "</b><p>" + i[1] + "</p></div>"; }).join("")}</div>`;
      case "calc": return calc(b);
      case "compare": return compare(b);
      case "cta": {
        if (b.act) return `<button type="button" class="btn btn--mg btn--block art-cta" data-act="${b.act}" data-pid="56">${b.label}</button>`;
        var lp = b.last && H.state.recent.map(H.prod).find(function (p) { return p && !p.launch; });
        if (lp) return `<button type="button" class="btn btn--ink btn--block art-cta art-cta--last" data-act="lastProduct" data-pid="${lp.id}"><small>보던 휴대폰 · ${lp.name}</small>${b.label}</button>`;
        return `<a class="btn btn--ink btn--block art-cta" href="${b.to}">${b.label}</a>`;
      }
    }
    return "";
  }
  /* 알고사기 목록 — 대표 글 → 주제별 묶음 → 찾는 답이 없을 때 상담 */
  function plain(t) { return String(t || "").replace(/<[^>]+>/g, ""); }
  function hasTable(g) { return (g.body || []).some(function (b) { return b.t === "calc" || b.t === "compare"; }); }
  function glMeta(g) {
    return `<span class="gl-meta"><span>${H.esc(g.cat)}</span><span class="num">${g.read}분</span>${hasTable(g) ? '<span class="gl-meta__tag">실제 금액표</span>' : ""}</span>`;
  }
  function glRow(g) {
    return `<a class="gl-row" href="#/guide/${g.slug}"><span class="gl-row__txt">${glMeta(g)}<b>${H.esc(g.title)}</b>${g.summary ? `<span class="gl-row__sum">${H.esc(g.summary)}</span>` : ""}</span>${H.icon("chev-r", "gl-row__go")}</a>`;
  }
  function glFeature(g) {
    var ans = (g.body || []).find(function (b) { return b.t === "answer" && b.text; });
    return `<a class="gl-feat" href="#/guide/${g.slug}">
      <span class="gl-feat__main"><span class="gl-feat__eyebrow">처음이라면 이 글부터</span><b class="gl-feat__t">${H.esc(g.title)}</b>${glMeta(g)}</span>
      ${ans ? `<span class="gl-feat__ans"><small>짧게 답하면</small>${H.esc(plain(ans.text))}</span>` : ""}
      <span class="gl-feat__go">글 읽기${H.icon("arrow")}</span></a>`;
  }
  H.views.guides = function (r) {
    var all = H.guideList(), desc = C.guideCatDesc || {};
    var cats = C.guideCats.filter(function (c) { return c !== "전체" && all.some(function (g) { return g.cat === c; }); });
    var cat = cats.indexOf(r.q.cat) >= 0 ? r.q.cat : "전체";
    var nav = ["전체"].concat(cats).map(function (c) {
      var n = c === "전체" ? all.length : all.filter(function (g) { return g.cat === c; }).length;
      return `<a href="#/guide${c === "전체" ? "" : "?cat=" + encodeURIComponent(c)}"${cat === c ? ' aria-current="true"' : ""}><span>${c}</span><small class="num">${n}</small></a>`;
    }).join("");
    var lead = cat === "전체" ? all[0] : null;
    var secs = (cat === "전체" ? cats : [cat]).map(function (c) {
      var list = all.filter(function (g) { return g.cat === c && g !== lead; });
      if (!list.length) return "";
      return `<section class="gl-sec"><header class="gl-sec__hd"><h2>${c}</h2>${desc[c] ? `<p>${desc[c]}</p>` : ""}</header><div class="gl-list">${list.map(glRow).join("")}</div></section>`;
    }).join("");
    return {
      title: "알고사기",
      html: `<div class="wrap"><div class="gl">
  <div class="gl-side">
    <header class="gl-hd"><h1>알고사기</h1><p>휴대폰 살 때 헷갈리는 조건을 쉬운 말로 풀어드려요.</p><p class="gl-hd__meta num">글 ${all.length}개 · 금액은 ${ASOF} 판매 가격으로 계산</p></header>
    <a class="gl-search" href="#/search">${H.icon("search")}<span>궁금한 말로 찾기</span></a>
    <nav class="gl-nav" aria-label="글 주제">${nav}</nav>
  </div>
  <div class="gl-main">
    ${lead ? glFeature(lead) : ""}
    ${secs || (lead ? "" : '<p class="empty">아직 글이 없어요.</p>')}
    <div class="gl-help"><div><b>찾는 답이 없나요?</b><p>AI 상담이나 카카오톡으로 물어보세요. 전화 없이도 돼요.</p></div><div class="gl-help__acts"><button type="button" class="btn btn--line btn--sm" data-act="chat">${H.icon("spark")}AI 상담</button><button type="button" class="btn btn--kakao btn--sm" data-act="kakao">${H.icon("kakao", "ic--fill")}카카오톡 상담</button></div></div>
  </div>
</div></div>`
    };
  };
  /* 보던 휴대폰 화면으로 — 손님이 고른 조건(H.sel)은 건드리지 않는다 */
  H.acts.lastProduct = function (el) { H.go("#/phone/" + el.dataset.pid); };
  H.views.guide = function (r) {
    var g = H.guide(r.parts[1]);
    if (g && (H.state.guideHidden || []).indexOf(g.slug) >= 0 && r.q.preview !== "1") g = null;
    if (!g) return { title: "알고사기", html: `<div class="wrap"><p class="empty">글을 찾을 수 없어요.<br><br><a class="btn btn--ink btn--sm" href="#/guide">알고사기 전체 보기</a></p></div>` };
    var related = H.guideList().filter(function (x) { return x.slug !== g.slug; }).slice(0, 3);
    return {
      title: g.title,
      html: `<div class="wrap"><article class="art">
  ${r.q.preview === "1" ? '<p class="preview-bar">미리보기예요. 관리 화면에서 저장한 내용이 이렇게 보여요. <a href="#/admin/guides">관리로 돌아가기</a></p>' : ""}
  <a class="back" href="#/guide">${H.icon("chev-l")}알고사기</a>
  <p class="eyebrow">${g.cat}</p><h1>${g.title}</h1><p class="meta">${g.read}분이면 읽어요 · ${ASOF} 기준</p>
  <div class="art__body">${g.body.map(block).join("")}</div>
  <footer class="art-foot">
    <div class="helpful"><span>이 글이 도움이 됐나요?</span><button type="button" class="btn btn--soft btn--sm" data-act="toast" data-msg="고마워요. 더 쉬운 글로 채워 갈게요">네</button><button type="button" class="btn btn--soft btn--sm" data-act="chat">아직 궁금해요</button></div>
    <section class="related"><h2>함께 읽으면 좋은 글</h2><div class="g-list">${related.map(function (x) {
      return `<a class="g-item" href="#/guide/${x.slug}"><small>${x.cat}</small><h3>${x.title}</h3></a>`;
    }).join("")}</div></section>
  </footer>
</article></div>`
    };
  };

  /* ---------- 구매후기 = 손님 피드 ---------- */
  var SAMPLE_IMG = { 165: "img/feed-1.jpg", 10: "img/feed-3.jpg", 9: "img/feed-2.jpg", 8: "img/feed-5.jpg", 164: "img/feed-6.jpg", 158: "img/feed-4.jpg" };
  H.feedAll = function () {
    var mine = (H.state.feedPosts || []).map(function (p) { return Object.assign({ mine: true }, p); });
    var base = C.reviews.map(function (r) {
      return { id: String(r.id), name: r.name, rating: r.rating, date: r.date, text: r.text, img: SAMPLE_IMG[r.id] || null, tag: r.tag || "", sample: true };
    });
    return mine.concat(base);
  };
  H.feedMod = function (id) { return (H.state.feedMod || {})[id] || {}; };
  H.feedVisible = function () {
    return H.feedAll().filter(function (p) { return !H.feedMod(p.id).hide; }).map(function (p) {
      return H.feedMod(p.id).hidePhoto && p.img ? Object.assign({}, p, { img: null, photoHidden: true }) : p;
    });
  };
  H.homeReviews = function () {
    var list = H.feedVisible(), picked = list.filter(function (p) { return H.feedMod(p.id).home; });
    return (picked.length ? picked : list.filter(function (p) { return p.text.length > 30; })).slice(0, 6);
  };
  function tile(p) {
    return p.img
      ? `<a class="ft ft--ph" href="#/review/${p.id}"><img src="${p.img}" alt="${H.esc(p.name)} 손님 사진" loading="lazy"><span class="ft__ov">${H.icon("star", "ic--fill")}${p.rating} · ${H.esc(p.name)}</span></a>`
      : `<a class="ft ft--txt" href="#/review/${p.id}"><span class="ft__q">${H.esc(p.text)}</span><span class="ft__who">${H.esc(p.name)}</span></a>`;
  }
  H.feedTile = tile;
  function maskName(n) {
    n = String(n || "손님");
    return n.length <= 1 ? n : n.length === 2 ? n[0] + "*" : n[0] + "*".repeat(n.length - 2) + n[n.length - 1];
  }
  H.views.reviews = function (r) {
    var f = r.q.f || "all", list = H.feedVisible();
    var shown = f === "photo" ? list.filter(function (p) { return p.img; }) : list;
    var avg = list.length ? (list.reduce(function (a, x) { return a + x.rating; }, 0) / list.length).toFixed(1) : "0.0";
    return {
      title: "구매후기",
      html: `<div class="wrap feed">
  <header class="feed-hd">
    <div><h1>구매후기</h1><p>하이유플에서 산 손님들이 올린 사진과 이야기예요.</p></div>
    <button type="button" class="btn btn--mg feed-up" data-act="writeReview">${H.icon("camera")}올리기</button>
  </header>
  <div class="feed-stats"><span><b class="num">${list.length}</b>개의 이야기</span><span class="feed-stats__star">${H.stars(5)}<b class="num">${avg}</b></span></div>
  <nav class="feed-tabs" aria-label="후기 보기">${[["all", "전체"], ["photo", "사진만"]].map(function (c) {
    return `<a href="#/reviews${c[0] === "all" ? "" : "?f=photo"}"${f === c[0] ? ' aria-current="true"' : ""}>${c[1]}</a>`;
  }).join("")}</nav>
  <div class="feed-grid">${shown.map(tile).join("")}</div>
  <p class="demo-note"><span class="demo-tag">시안</span>알맞지 않은 사진이나 글은 하이유플이 감출 수 있어요 · 사진은 예시</p>
</div>`
    };
  };
  H.views.review = function (r) {
    var list = H.feedVisible(), p = list.find(function (x) { return x.id === r.parts[1]; });
    if (!p) return { title: "구매후기", html: `<div class="wrap"><p class="empty">후기를 찾을 수 없어요. 하이유플이 감춘 후기일 수 있어요.<br><br><a class="btn btn--ink btn--sm" href="#/reviews">구매후기 보기</a></p></div>` };
    var more = list.filter(function (x) { return x.id !== p.id && x.img; }).slice(0, 6);
    return {
      title: "구매후기",
      html: `<div class="wrap"><article class="post">
  <a class="back" href="#/reviews">${H.icon("chev-l")}구매후기</a>
  <header class="post__hd"><span class="post__av">${H.esc(p.name.charAt(0))}</span><div><b>${H.esc(p.name)}</b><small class="num">${p.date.replace(/-/g, ".")}${p.tag ? " · " + H.esc(p.tag) : ""}</small></div>${p.mine ? '<span class="demo-tag">내가 올림</span>' : ""}</header>
  ${p.img ? `<div class="post__ph"><img src="${p.img}" alt="${H.esc(p.name)} 손님 사진"></div>` : ""}
  <div class="post__body">${H.stars(p.rating)}<p class="post__txt">${H.esc(p.text)}</p>${p.photoHidden ? '<p class="help-t">사진은 하이유플이 감췄어요.</p>' : ""}</div>
  <div class="post__acts"><a class="btn btn--ink btn--block" href="#/phones">나도 내 조건으로 보기</a></div>
  ${more.length ? `<h2 class="post__more-t">다른 손님 사진</h2><div class="feed-grid feed-grid--sm">${more.map(tile).join("")}</div>` : ""}
</article></div>`
    };
  };
  H.acts.writeReview = function () {
    if (!H.state.loggedIn) { H.acts.login(null, "#/reviews"); return; }
    H.upload = { img: null, rating: 5 };
    H.openSheet({
      title: "구매후기 올리기",
      body: `<label class="up-ph" id="upPh"><input type="file" id="upFile" accept="image/*" data-change="upFile"><span class="up-ph__in">${H.icon("camera")}<b>사진 고르기</b><small>한 장 · 휴대폰으로 찍은 사진 그대로 괜찮아요</small></span></label>
        <div class="field"><label for="rvProd">어떤 휴대폰을 샀나요?</label><select id="rvProd" class="input">${H.ordered().filter(function (p) { return !p.launch; }).map(function (p) { return "<option>" + p.name + "</option>"; }).join("")}</select></div>
        <div class="field"><span class="field-label">별점</span><div class="star-pick" role="radiogroup" aria-label="별점">${[1, 2, 3, 4, 5].map(function (n) {
          return `<button type="button" role="radio" class="on" aria-checked="${n === 5}" aria-label="${n}점" data-act="upStar" data-v="${n}">${H.icon("star", "ic--fill")}</button>`;
        }).join("")}</div></div>
        <div class="field"><label for="rvText">이야기<span class="req">*</span></label><textarea id="rvText" class="input input--area" rows="4" placeholder="개통 과정, 배송, 상담이 어땠는지 알려 주세요" data-focus></textarea></div>
        <p class="help-t">올린 사진과 글은 바로 보여요. 알맞지 않은 사진이나 글은 하이유플이 감출 수 있어요.</p>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="reviewSave">올리기</button><p class="demo-note"><span class="demo-tag">시안</span>올린 후기는 이 휴대폰 안에서만 보여요</p>`
    });
  };
  H.inputs.upFile = function (el) {
    var file = el.files && el.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var size = 640, side = Math.min(img.width, img.height), cv = document.createElement("canvas");
      cv.width = size; cv.height = size;
      cv.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      H.upload.img = cv.toDataURL("image/jpeg", 0.8);
      URL.revokeObjectURL(url);
      var ph = H.$("#upPh");
      if (ph) { ph.classList.add("has"); ph.style.backgroundImage = "url(" + H.upload.img + ")"; }
    };
    img.src = url;
  };
  H.acts.upStar = function (el) {
    var n = Number(el.dataset.v);
    H.upload.rating = n;
    H.$$(".star-pick button").forEach(function (b) {
      var v = Number(b.dataset.v);
      b.classList.toggle("on", v <= n);
      b.setAttribute("aria-checked", String(v === n));
    });
  };
  H.acts.reviewSave = function () {
    var t = ((H.$("#rvText") || {}).value || "").trim(), prod = (H.$("#rvProd") || {}).value || "";
    if (t.length < 5) { H.toast("이야기를 조금 더 적어 주세요"); return; }
    var up = H.upload || {};
    var post = { id: "u" + Date.now(), name: maskName(H.state.user.name), rating: up.rating || 5, date: new Date().toISOString().slice(0, 10), text: t, img: up.img || null, tag: prod };
    H.state.feedPosts = [post].concat(H.state.feedPosts || []);
    H.save();
    H.closeSheet(true);
    H.toast("올렸어요. 구매후기 맨 앞에 보여요");
    H.go("#/reviews");
  };

  /* ---------- 고객센터 ---------- */
  H.views.cs = function () {
    var cs = C.cs;
    return {
      title: "고객센터",
      html: `<div class="wrap">
  <header class="ph"><h1>고객센터</h1><p>편한 방법으로 물어보세요. 전화 없이도 개통까지 도와드려요.</p></header>
  <div class="cs-cards">
    <button type="button" class="cs-card cs-card--dark" data-act="chat"><span class="cs-card__ic">${H.icon("spark")}</span><b>AI 상담 하유</b><small>요금제별 가격, 선택약정 비교처럼 궁금한 걸 바로 물어보세요.</small></button>
    <button type="button" class="cs-card cs-card--kakao" data-act="kakao"><span class="cs-card__ic">${H.icon("kakao", "ic--fill")}</span><b>카카오톡 상담</b><small>상담원과 채팅으로 이야기해요. 운영 시간에 답해 드려요.</small></button>
    <a class="cs-card" href="tel:${cs.phone}"><span class="cs-card__ic">${H.icon("call")}</span><b class="num">${cs.phone}</b><small>${cs.hours.join("<br>")}</small></a>
  </div>
  <section class="pd-sec"><h2>자주 묻는 질문</h2>${H.faqHtml()}</section>
  <section class="pd-sec"><h2>이메일</h2><p class="lead">${cs.email}</p></section>
</div>`
    };
  };

  /* ---------- 검색 ---------- */
  var POPULAR = ["아이폰 18 프로", "폴드8", "플립8", "갤럭시 S26", "선택약정", "요금제 낮추기"];
  var KW = {
    "zero-won": "0원 공짜 할부원금 월 납부 기기값",
    "plan-down": "요금제 낮추기 변경 하향 185일 47000",
    "alert-vs-preorder": "사전알림 사전예약 알림 듀오 두번",
    "move-or-change": "번호이동 기기변경 통신사 유심",
    "support-or-select": "선택약정 공시지원금 이통사지원금 25% 할인",
    "installment": "할부 이자 5.9 일시불"
  };
  function norm(s) {
    return String(s).toLowerCase().replace(/\s+/g, "")
      .replace(/iphone/g, "아이폰").replace(/galaxy/g, "갤럭시").replace(/promax/g, "프로맥스").replace(/pro/g, "프로")
      .replace(/max/g, "맥스").replace(/air/g, "에어").replace(/ultra/g, "울트라").replace(/plus|\+/g, "플러스")
      .replace(/fold/g, "폴드").replace(/flip/g, "플립").replace(/duo/g, "듀오");
  }
  function find(q) {
    var toks = q.trim().split(/\s+/).map(norm).filter(Boolean);
    var hit = function (text) { var t = norm(text); return toks.every(function (k) { return t.indexOf(k) >= 0 || t.indexOf(k.replace(/기$/, "")) >= 0; }); };
    return {
      prods: H.ordered().filter(function (p) { return hit(p.name + " " + p.db + " " + (D.series[p.series] || "")); }),
      guides: H.guideList().filter(function (g) { return hit(g.title + " " + g.summary + " " + g.cat + " " + (KW[g.slug] || "")); })
    };
  }
  function resultsHtml(q) {
    if (!q.trim()) {
      var recent = H.state.searches;
      return (recent.length ? `<h2>최근 찾은 말</h2><div class="kw">${recent.map(function (k) { return `<button type="button" data-act="kw" data-v="${H.esc(k)}">${H.esc(k)}</button>`; }).join("")}</div>` : "") +
        `<h2>많이 찾는 말</h2><div class="kw">${POPULAR.map(function (k) { return `<button type="button" data-act="kw" data-v="${k}">${k}</button>`; }).join("")}</div>`;
    }
    var res = find(q);
    if (!res.prods.length && !res.guides.length) {
      return `<p class="empty">«${H.esc(q)}»에 맞는 결과가 없어요.<br>다른 말로 찾아보거나 상담으로 물어보세요.<br><br><button type="button" class="btn btn--ink btn--sm" data-act="chat">AI에게 물어보기</button></p>`;
    }
    return (res.prods.length ? `<h2>휴대폰 ${res.prods.length}</h2><div>${res.prods.map(function (p) {
      return `<a class="res-row" href="#/phone/${p.id}"><span class="th"><img src="${H.img(p, H.defaults(p).color)}" alt=""></span><span><b>${p.name}</b><small class="num">${p.launch ? "출시 알림 받기" : "실구매가 " + H.won(H.listPrice(p).principal)}</small></span></a>`;
    }).join("")}</div>` : "") +
      (res.guides.length ? `<h2>알고사기 ${res.guides.length}</h2><div>${res.guides.map(function (g) {
        return `<a class="res-row" href="#/guide/${g.slug}"><span class="th">${H.icon("doc")}</span><span><b>${g.title}</b><small>${g.cat}</small></span></a>`;
      }).join("")}</div>` : "");
  }
  H.views.search = function (r) {
    var q = r.q.q || "";
    return {
      title: "검색",
      html: `<div class="wrap"><div class="srch">
  <div class="srch__box">${H.icon("search")}<input id="srchQ" type="search" value="${H.esc(q)}" placeholder="휴대폰 이름이나 궁금한 말을 적어 보세요" aria-label="검색어" data-input="search" data-change="searchCommit" enterkeyhint="search" autocomplete="off"><button type="button" data-act="clearSearch" aria-label="검색어 지우기">${H.icon("close", "ic--sm")}</button></div>
  <div id="srchRes">${resultsHtml(q)}</div>
</div></div>`
    };
  };
  H.after.search = function () { var i = H.$("#srchQ"); if (i) i.focus({ preventScroll: true }); };
  H.inputs.search = function (el) {
    H.$("#srchRes").innerHTML = resultsHtml(el.value);
    history.replaceState(null, "", "#/search" + (el.value ? "?q=" + encodeURIComponent(el.value) : ""));
  };
  H.inputs.searchCommit = function (el) {
    var v = el.value.trim();
    if (!v) return;
    H.state.searches = [v].concat(H.state.searches.filter(function (x) { return x !== v; })).slice(0, 6);
    H.save();
  };
  H.acts.kw = function (el) {
    var i = H.$("#srchQ");
    if (!i) return;
    i.value = el.dataset.v;
    H.inputs.search(i);
    H.inputs.searchCommit(i);
  };
  H.acts.clearSearch = function () {
    var i = H.$("#srchQ");
    if (!i) return;
    i.value = "";
    H.inputs.search(i);
    i.focus();
  };

  /* ---------- 전체 메뉴 ---------- */
  H.acts.menu = function () {
    var cs = C.cs;
    H.openDrawer(`<div class="dr-hd"><img src="img/logo-white.svg" alt="HIU+"><button type="button" class="sheet__x" data-act="closeDrawer" aria-label="메뉴 닫기">${H.icon("close")}</button></div>
      <div class="dr-body">
        <a class="dr-search" href="#/search">${H.icon("search")}휴대폰이나 궁금한 말 찾기</a>
        <nav class="dr-nav" aria-label="전체 메뉴">
          <a href="#/phones">휴대폰${H.icon("chev-r")}</a>
          <div class="dr-sub">${D.cats.map(function (c) { return `<a href="#/phones?cat=${c.key}">${c.label}</a>`; }).join("")}</div>
          <a href="#/guide">알고사기${H.icon("chev-r")}</a>
          <a href="#/reviews">구매후기${H.icon("chev-r")}</a>
          <a href="#/cs">고객센터${H.icon("chev-r")}</a>
          <a href="#/partner">파트너스${H.icon("chev-r")}</a>
          <a href="#/my">${H.state.loggedIn ? "내정보" : "로그인"}${H.icon("chev-r")}</a>
        </nav>
        <button type="button" class="btn btn--mg btn--block" data-act="alert" data-pid="56">${H.icon("bell")}아이폰 듀오 알림 신청</button>
      </div>
      <div class="dr-foot">고객센터 <b class="num">${cs.phone}</b><br>${cs.hours[0]} · ${cs.hours[1]}</div>`);
  };

  /* ---------- 출시 알림 신청 ---------- */
  H.acts.alert = function (el) {
    H.closeDrawer(true);
    var p = H.prod((el && el.dataset.pid) || 56), u = H.state.user, li = H.state.loggedIn;
    var already = H.state.alerts.some(function (a) { return a.pid === p.id; });
    H.openSheet({
      title: "출시 알림 신청",
      body: `<div class="alert-model"><img src="${H.img(p, 0)}" alt=""><div><b>${p.name}</b><small>예약이 열리면 알림톡으로 가장 먼저 알려드려요</small></div></div>
        ${already ? `<p class="a-note">${H.icon("check")}<span>이미 신청하셨어요. 다시 신청하지 않아도 돼요.</span></p>` : ""}
        <div class="field"><label for="alName">이름<span class="req">*</span></label><input id="alName" class="input" autocomplete="name" value="${li ? H.esc(u.name) : ""}" data-focus></div>
        <div class="field"><label for="alPhone">휴대폰 번호<span class="req">*</span></label><input id="alPhone" class="input" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="${li ? H.esc(u.phone) : ""}"></div>
        <div class="agree"><label><input type="checkbox" id="alAgree"><span class="box">${H.icon("check")}</span><span>[필수] 알림톡 받기와 개인정보 수집에 동의해요</span></label></div>
        <p class="help-t">사전예약은 정식 기간에만 받을 수 있어요. <a href="#/guide/alert-vs-preorder">왜 두 번 신청하나요?</a></p>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="alertSend" data-pid="${p.id}">알림 신청하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 신청되지 않아요</p>`
    });
  };
  H.acts.alertSend = function (el) {
    var name = H.$("#alName").value.trim(), phone = H.$("#alPhone").value, agreed = H.$("#alAgree").checked;
    if (!name || phone.replace(/\D/g, "").length < 10) { H.toast("이름과 휴대폰 번호를 적어 주세요"); return; }
    if (!agreed) { H.toast("알림톡 받기에 동의해 주세요"); return; }
    var pid = Number(el.dataset.pid), now = new Date();
    if (!H.state.alerts.some(function (a) { return a.pid === pid; })) H.state.alerts.unshift({ pid: pid, date: now.getMonth() + 1 + "월 " + now.getDate() + "일" });
    H.save();
    H.setSheet(`<div class="ok"><div class="ok__ic">${H.icon("bell")}</div><h3>알림 신청이 끝났어요</h3><p>${H.prod(pid).name} 예약이 열리면<br>알림톡으로 가장 먼저 알려드릴게요.</p></div>
      <a class="link-arrow" href="#/guide/alert-vs-preorder">사전알림과 사전예약 차이 보기${H.icon("arrow")}</a>`,
      `<button type="button" class="btn btn--ink btn--block" data-act="closeSheet">확인</button>`);
  };

  /* ---------- 상담 ---------- */
  H.acts.consult = function () {
    H.closeDrawer(true);
    H.openSheet({
      title: "무엇을 도와드릴까요?",
      body: `<div class="consult-list">
        <button type="button" class="cs-card cs-card--dark" data-act="chat"><span class="cs-card__ic">${H.icon("spark")}</span><b>AI 상담 하유</b><small>가격 · 요금제 · 선택약정 비교를 바로 물어보세요</small></button>
        <button type="button" class="cs-card cs-card--kakao" data-act="kakao"><span class="cs-card__ic">${H.icon("kakao", "ic--fill")}</span><b>카카오톡 상담</b><small>상담원과 채팅으로 이야기해요</small></button>
        <a class="cs-card" href="tel:${C.cs.phone}"><span class="cs-card__ic">${H.icon("call")}</span><b class="num">${C.cs.phone}</b><small>${C.cs.hours[0]} · ${C.cs.hours[1]}</small></a>
      </div>`
    });
  };
  H.acts.kakao = function () { H.toast("시안: 하이유플 카카오톡 채널 상담으로 연결돼요"); };
  var CHAT_Q = [
    ["아이폰 18 프로 월 얼마예요?", function () {
      var p = H.prod(54), s = H.defaults(p), r = H.price(p, s);
      return "아이폰 18 프로 256G를 " + r.plan.name + " · " + H.methodLabel(s.method) + " · 이통사지원금 · 24개월 할부로 사면\n실구매가 " + H.won(r.principal) + ", 월 납부 금액은 " + H.won(r.monthlyTotal) + "이에요.\n지금 쓰는 통신사를 알려 주시면 그 금액으로 다시 계산해 드릴게요.";
    }],
    ["선택약정이 더 싸요?", function () {
      var p = H.prod(54), s = H.defaults(p), b = H.cheaper(p, s);
      return b ? "아이폰 18 프로 · " + H.plan(s.planId).name + " · " + H.methodLabel(s.method) + " 기준으로는\n" + b.label + "이 24개월 동안 " + H.won(b.diff) + " 덜 내요.\n폰과 요금제마다 달라서, 상품 화면에서 두 방법을 눌러 보시면 바로 비교돼요." : "이 조건에서는 두 방법의 금액이 같아요.";
    }],
    ["요금제는 언제 낮출 수 있어요?", function () {
      return "개통일 기준 185일이 지나면 낮출 수 있어요.\nLG U+는 월 47,000원 이상 요금제까지 괜찮고, 그보다 낮추면 위약금이 생길 수 있어요.";
    }]
  ];
  H.acts.chat = function () {
    H.closeDrawer(true);
    H.openSheet({
      title: "AI 상담",
      body: `<div class="chat" id="chatBox"><p class="chat-who"><span class="chat-av">하유</span>하이유플 AI 상담</p>
        <p class="msg msg--ai">안녕하세요, 하유예요. 가격이나 조건이 헷갈리면 편하게 물어보세요.</p></div>
        <div class="chat-sugg" id="chatSugg">${CHAT_Q.map(function (q, i) { return `<button type="button" data-act="chatAsk" data-i="${i}">${q[0]}</button>`; }).join("")}</div>`,
      foot: `<p class="demo-note"><span class="demo-tag">시안</span>정해진 질문에만 답해요. 실제 AI 상담은 지금 사이트 것을 이어 써요</p>`
    });
  };
  H.acts.chatAsk = function (el) {
    var q = CHAT_Q[Number(el.dataset.i)], box = H.$("#chatBox"), body = H.$("#sheetBody");
    box.insertAdjacentHTML("beforeend", `<p class="msg msg--me">${q[0]}</p><p class="msg msg--ai">${H.esc(q[1]())}</p>`);
    el.remove();
    if (!H.$("#chatSugg button")) H.$("#chatSugg").innerHTML = `<button type="button" data-act="kakao">상담원과 이야기하기</button>`;
    body.scrollTop = body.scrollHeight;
  };

  /* ---------- 기획 메모 ---------- */
  H.acts.memo = function () {
    var n = N.screens[H.viewKey] || N.screens.home;
    var li = function (t, cls) { return `<li${cls ? ' class="' + cls + '"' : ""}>${t}</li>`; };
    H.openSheet({
      title: "기획 메모 · " + n.title, wide: true,
      body: `<div class="memo">
        <h3>이 화면에서 정한 것</h3><ul>${n.points.map(function (t) { return li(t); }).join("")}</ul>
        ${n.ask && n.ask.length ? `<h3>대표님 확인이 필요한 것</h3><ul>${n.ask.map(function (t) { return li(t, "ask"); }).join("")}</ul>` : ""}
        <h3>«제안 보기»로 켜지는 것</h3><ul>${N.proposals.map(function (t) { return li(t); }).join("")}</ul>
        <a class="btn btn--ink btn--block memo-tour" href="#/screens">화면 순서대로 보기 (회원가입 · 주문 · 마이페이지)</a>
        <a class="btn btn--line btn--block memo-tour2" href="#/admin">직원용 관리 화면 (알고사기 글 · 후기 감추기)</a>
        <a class="link-arrow pd-more" href="plan.html">기획서 전체 보기${H.icon("arrow")}</a>
      </div>
      <div class="toggle"><span>제안 보기<small>시안에 없는 제안을 화면에 켜서 비교해요</small></span><button type="button" class="switch" role="switch" aria-checked="${!!H.state.proposals}" data-act="toggleProposals" aria-label="제안 보기"></button></div>
      <div class="toggle"><span>메모 단추 숨기기<small>손님 눈으로 볼 때 켜세요. 내정보 메뉴에서 다시 보이게 할 수 있어요</small></span><button type="button" class="switch" role="switch" aria-checked="${!!H.state.memoHidden}" data-act="toggleMemoHidden" aria-label="메모 단추 숨기기"></button></div>`
    });
  };
  H.acts.toggleProposals = function (el) {
    H.state.proposals = !H.state.proposals;
    H.save();
    document.body.classList.toggle("proposals", H.state.proposals);
    el.setAttribute("aria-checked", String(H.state.proposals));
    H.toast(H.state.proposals ? "제안을 켰어요. 첫 화면에서 비교해 보세요" : "시안 그대로 돌아왔어요");
  };
  H.acts.toggleMemoHidden = function (el) {
    H.state.memoHidden = !H.state.memoHidden;
    H.save();
    document.body.classList.toggle("memo-hidden", H.state.memoHidden);
    if (el.getAttribute("role") === "switch") { el.setAttribute("aria-checked", String(H.state.memoHidden)); }
    else { var y = window.scrollY; H.render(); window.scrollTo(0, y); }
  };
})();
