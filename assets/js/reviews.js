/* ============================================================
   PL어학원 — 수강후기 게시판
   ------------------------------------------------------------
   [저장 방식]
   · endpoint 가 설정되어 있으면 → 구글시트(Apps Script)에 저장 = 모든 기기에서 공유
   · endpoint 가 비어 있거나 연결 실패 시 → 그 브라우저 저장소(localStorage)로 동작
     (초안 확인용. 다른 기기에서는 보이지 않습니다)
   · 첫 화면은 reviews-data.js 의 백업본으로 즉시 그리고, 서버 응답이 오면 교체합니다.
   ============================================================ */
window.PL_REVIEWS_API = {
  endpoint: 'https://script.google.com/macros/s/AKfycbweInbpb8Ze3d4rRzTFWYHhXY1EJPqJbb___uPTh2L3Aw1eu-B_tyZCLm2uO0OiuZ1h/exec',
};

/* ------------------------------------------------------------
   [비공개 처리 후기]
   개인정보(연락처 · 이메일)가 본문에 노출되어 목록에서 감춘 글 번호입니다.
   · 여기 번호를 지우면 그 글은 다시 목록에 나옵니다.
   · 원문은 구글시트 `후기` 탭과 `수강후기_시트업로드.csv` 에 그대로 남아 있습니다.
     (reviews-data.js 백업본에서도 뺐으므로, 되살릴 때는 CSV/시트에서 다시 넣으세요)
   · 88  「영어회화」(신수현, 2016-03-27)        — 본문에 이메일
   · 105 「[re]회화 시간 등 문의」               — 문의 답글, 실명·연락처
   · 106 「회화 시간 등 문의」(ksj, 2018-12-18)  — 문의 원글, 휴대폰·이메일
   ------------------------------------------------------------ */
window.PL_REVIEWS_HIDDEN = [88, 105, 106];

(function () {
  'use strict';

  var LIST = document.getElementById('boardList');
  if (!LIST) return;

  var VIEW = document.getElementById('boardView');
  var WRITE = document.getElementById('boardWrite');
  var BODY = document.getElementById('boardBody');
  var PAGING = document.getElementById('paging');
  var PER_PAGE = 10;
  var STORE_KEY = 'pl_reviews_user';

  var state = { page: 1, keyword: '', data: [], editNo: null, viewNo: null, online: false, loading: false };
  var endpoint = function () { return (window.PL_REVIEWS_API || {}).endpoint || ''; };

  /* ==================================================== 통신 */
  function api(payload) {
    return fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    }).then(function (res) { return res.json(); });
  }

  /* ==================================================== 저장소 (localStorage 대체용) */
  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveLocal(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); return true; }
    catch (e) { alert('저장 공간이 부족해 등록하지 못했습니다.'); return false; }
  }
  function hashPw(pw) {
    var text = 'pl-review::' + pw;
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        .then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
        })
        .catch(function () { return simpleHash(text); });
    }
    return Promise.resolve(simpleHash(text));
  }
  function simpleHash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    return 'fb' + h.toString(16);
  }

  /* ==================================================== 데이터 */
  function visible(list) {
    var hide = window.PL_REVIEWS_HIDDEN || [];
    return list.filter(function (r) { return hide.indexOf(Number(r.no)) === -1; });
  }

  function buildLocalData() {
    var base = (window.PL_REVIEWS || []).slice();
    state.data = visible(loadLocal().concat(base)).sort(function (a, b) { return b.no - a.no; });
  }

  function refreshFromServer() {
    if (!endpoint()) return Promise.resolve(false);
    state.loading = true;
    return api({ action: 'reviews.list' })
      .then(function (out) {
        if (!out || out.result !== 'ok' || !out.items) throw new Error('목록을 불러오지 못했습니다.');
        state.data = visible(out.items).map(function (r) {
          return {
            no: Number(r.no), title: r.title, writer: r.writer, date: r.date,
            hit: Number(r.hit) || 0, content: r.content, editedAt: r.editedAt || '',
            pw: r.hasPw ? '1' : '',       // 서버 모드에서는 존재 여부만 표시
          };
        });
        state.online = true;
        return true;
      })
      .catch(function () { state.online = false; return false; })
      .then(function (ok) {
        state.loading = false;
        setStatus();
        if (LIST.hidden === false) renderList();
        else if (state.viewNo != null) renderView(state.viewNo);
        return ok;
      });
  }

  function setStatus() {
    var el = document.getElementById('boardStatus');
    if (!el) return;
    if (state.online) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = endpoint()
      ? '※ 서버에 연결하지 못해 백업본을 표시하고 있습니다. 새로 쓰신 글은 이 브라우저에만 저장됩니다.'
      : '※ 현재 초안 모드입니다. 새로 쓰신 글은 이 브라우저에만 저장됩니다.';
  }

  function findPost(no) {
    return state.data.filter(function (r) { return String(r.no) === String(no); })[0];
  }
  function isMine(post) { return !!(post && post.pw); }

  /* ==================================================== 비밀번호 확인 모달 */
  var PW = {
    modal: document.getElementById('pwModal'),
    input: document.getElementById('pwInput'),
    desc: document.getElementById('pwDesc'),
    err: document.querySelector('.err[data-for="pwInput"]'),
    onDone: null,
  };

  /** 비밀번호를 입력받아 resolve(입력값) — 취소하면 resolve(null) */
  function askPassword(actionLabel) {
    return new Promise(function (resolve) {
      PW.desc.textContent = '글 작성 시 입력하신 비밀번호를 입력해야 ' + actionLabel + '할 수 있습니다.';
      PW.input.value = '';
      setErr2('');
      PW.modal.hidden = false;
      document.body.style.overflow = 'hidden';
      setTimeout(function () { PW.input.focus(); }, 50);
      PW.onDone = resolve;
    });
  }
  function closePw(value) {
    PW.modal.hidden = true;
    document.body.style.overflow = '';
    var cb = PW.onDone; PW.onDone = null;
    if (cb) cb(value);
  }
  function setErr2(msg) {
    PW.err.textContent = msg || '';
    PW.err.classList.toggle('on', !!msg);
  }
  function submitPw() {
    var v = PW.input.value.trim();
    if (!v) { setErr2('비밀번호를 입력해 주세요.'); PW.input.focus(); return; }
    closePw(v);
  }
  document.getElementById('pwOk').addEventListener('click', submitPw);
  document.getElementById('pwCancel').addEventListener('click', function () { closePw(null); });
  document.getElementById('pwDim').addEventListener('click', function () { closePw(null); });
  PW.input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submitPw(); }
    if (e.key === 'Escape') closePw(null);
  });

  /* ==================================================== 목록 */
  function filtered() {
    var k = state.keyword.trim().toLowerCase();
    if (!k) return state.data;
    return state.data.filter(function (r) {
      return (r.title || '').toLowerCase().indexOf(k) >= 0 ||
        (r.writer || '').toLowerCase().indexOf(k) >= 0;
    });
  }

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  function renderList() {
    var rows = filtered();
    document.getElementById('totalCount').textContent = rows.length;

    var totalPage = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    if (state.page > totalPage) state.page = totalPage;
    var start = (state.page - 1) * PER_PAGE;
    var pageRows = rows.slice(start, start + PER_PAGE);

    if (!pageRows.length) {
      BODY.innerHTML = '<tr class="is-empty"><td class="bd-empty" colspan="5">검색 결과가 없습니다.</td></tr>';
    } else {
      BODY.innerHTML = pageRows.map(function (r) {
        return '<tr>' +
          '<td class="td-no">' + r.no + '</td>' +
          '<td class="td-title"><a href="#no=' + r.no + '" data-no="' + r.no + '">' + esc(r.title) +
            (r.isNew ? '<span class="bd-new">NEW</span>' : '') +
            (isMine(r) ? '<span class="bd-lock" title="비밀번호로 보호된 글">🔒</span>' : '') + '</a></td>' +
          '<td class="td-writer">' + esc(r.writer) + '</td>' +
          '<td class="td-date">' + esc(r.date) + '</td>' +
          '<td class="td-hit">' + (r.hit || 0) + '</td>' +
        '</tr>';
      }).join('');
    }

    var block = Math.floor((state.page - 1) / 5) * 5;
    var html = '<button type="button" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + '>이전</button>';
    for (var i = block + 1; i <= Math.min(block + 5, totalPage); i++) {
      html += '<button type="button" data-page="' + i + '"' + (i === state.page ? ' class="on"' : '') + '>' + i + '</button>';
    }
    html += '<button type="button" data-page="' + (state.page + 1) + '"' + (state.page === totalPage ? ' disabled' : '') + '>다음</button>';
    PAGING.innerHTML = html;
  }

  /* ==================================================== 상세 */
  function renderView(no) {
    var rows = state.data;
    var idx = -1;
    for (var i = 0; i < rows.length; i++) { if (String(rows[i].no) === String(no)) { idx = i; break; } }
    if (idx < 0) { location.hash = ''; return; }
    var r = rows[idx];
    state.viewNo = r.no;

    document.getElementById('viewTitle').textContent = r.title;
    document.getElementById('viewWriter').textContent = r.writer;
    document.getElementById('viewDate').textContent = r.date + (r.editedAt ? ' (수정 ' + r.editedAt + ')' : '');
    document.getElementById('viewHit').textContent = r.hit || 0;
    document.getElementById('viewBody').textContent = r.content && r.content.trim()
      ? r.content
      : '등록된 본문 내용이 없는 게시물입니다. (이전 게시판 이관 데이터)';

    document.getElementById('editBtn').hidden = !isMine(r);
    document.getElementById('delBtn').hidden = !isMine(r);

    var prev = rows[idx - 1], next = rows[idx + 1];
    var nav = '';
    if (prev) nav += '<a href="#no=' + prev.no + '" data-no="' + prev.no + '"><em>이전 글</em>' + esc(prev.title) + '</a>';
    if (next) nav += '<a href="#no=' + next.no + '" data-no="' + next.no + '"><em>다음 글</em>' + esc(next.title) + '</a>';
    document.getElementById('viewNav').innerHTML = nav;

    show('view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==================================================== 화면 전환 */
  function show(mode) {
    LIST.hidden = mode !== 'list';
    VIEW.hidden = mode !== 'view';
    WRITE.hidden = mode !== 'write';
  }

  function openWrite(post) {
    state.editNo = post ? post.no : null;
    document.getElementById('writeLabel').textContent = post ? 'MODIFY' : 'WRITE';
    document.getElementById('writeTitle').textContent = post ? '수강후기 수정' : '수강후기 작성';
    document.getElementById('writeDesc').textContent = post
      ? '내용을 수정한 뒤 저장하세요. 비밀번호를 새로 입력하면 비밀번호도 변경됩니다.'
      : '수업을 들으며 느낀 점을 자유롭게 남겨주세요. 작성하신 후기는 목록 맨 위에 등록됩니다.';
    document.getElementById('submitBtn').textContent = post ? '수정 저장' : '등록하기';
    document.getElementById('passHelp').textContent = post
      ? '비워두면 기존 비밀번호가 그대로 유지됩니다.'
      : '글을 수정 · 삭제할 때 필요합니다. 잊지 않도록 기억해 주세요.';

    document.getElementById('rWriter').value = post ? post.writer : '';
    document.getElementById('rTitle').value = post ? post.title : '';
    document.getElementById('rContent').value = post ? post.content : '';
    document.getElementById('rPass').value = '';
    ['rWriter', 'rTitle', 'rContent', 'rPass'].forEach(function (id) { setErr(id, ''); });

    show('write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function route() {
    var h = location.hash.replace('#', '');
    if (h.indexOf('no=') === 0) renderView(h.slice(3));
    else if (h === 'write') openWrite(null);
    else { show('list'); renderList(); }
  }

  /* ==================================================== 이벤트 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-no]') : null;
    if (a) { e.preventDefault(); location.hash = 'no=' + a.getAttribute('data-no'); return; }
    if (e.target.closest && e.target.closest('#writeBtn')) { e.preventDefault(); location.hash = 'write'; return; }
    if (e.target.closest && (e.target.closest('#backBtn') || e.target.closest('#cancelWrite'))) {
      e.preventDefault(); state.editNo = null;
      if (location.hash) location.hash = ''; else route();
      return;
    }
    var pg = e.target.closest ? e.target.closest('.bd-paging button') : null;
    if (pg && !pg.disabled) {
      state.page = Number(pg.getAttribute('data-page'));
      renderList();
      window.scrollTo({ top: LIST.offsetTop - 120, behavior: 'smooth' });
    }
  });

  /* 수정 */
  document.getElementById('editBtn').addEventListener('click', function () {
    var post = findPost(state.viewNo);
    if (!isMine(post)) return;

    askPassword('수정').then(function (pw) {
      if (!pw) return;
      if (state.online) {
        /* 서버 모드 — 비밀번호는 저장 시점에 함께 검증됩니다 */
        state.editPw = pw;
        openWrite(post);
      } else {
        hashPw(pw).then(function (h) {
          if (h !== post.pw) { alert('비밀번호가 일치하지 않습니다.'); return; }
          openWrite(post);
        });
      }
    });
  });

  /* 삭제 */
  document.getElementById('delBtn').addEventListener('click', function () {
    var post = findPost(state.viewNo);
    if (!isMine(post)) return;

    askPassword('삭제').then(function (pw) {
      if (!pw) return;
      if (!confirm('이 후기를 정말 삭제할까요?\n삭제한 글은 되돌릴 수 없습니다.')) return;

      if (state.online) {
        api({ action: 'reviews.delete', no: post.no, pw: pw }).then(function (out) {
          if (!out || out.result !== 'ok') { alert((out && out.message) || '삭제하지 못했습니다.'); return; }
          /* 화면에서 먼저 지우고, 서버 목록은 뒤에서 조용히 새로고침 */
          state.data = state.data.filter(function (r) { return String(r.no) !== String(post.no); });
          alert('삭제되었습니다.');
          goList();
          refreshFromServer();
        }).catch(function () { alert('서버에 연결하지 못했습니다.'); });
        return;
      }

      hashPw(pw).then(function (h) {
        if (h !== post.pw) { alert('비밀번호가 일치하지 않습니다.'); return; }
        var list = loadLocal().filter(function (p) { return String(p.no) !== String(post.no); });
        if (!saveLocal(list)) return;
        buildLocalData();
        alert('삭제되었습니다.');
        goList();
      });
    });
  });

  function goList() {
    state.editNo = null;
    if (location.hash) location.hash = ''; else route();
  }

  function doSearch() {
    state.keyword = document.getElementById('searchInput').value;
    state.page = 1;
    renderList();
  }
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
  });

  /* ==================================================== 등록 · 수정 저장 */
  var rForm = document.getElementById('reviewForm');
  var submitBtn = document.getElementById('submitBtn');

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (!el) return !msg;
    var box = document.querySelector('.err[data-for="' + id + '"]');
    var field = el.closest('.field');
    if (box) { box.textContent = msg || ''; box.classList.toggle('on', !!msg); }
    if (field) field.classList.toggle('is-err', !!msg);
    return !msg;
  }
  rForm.addEventListener('input', function (e) { if (e.target.id) setErr(e.target.id, ''); });

  function busy(on, label) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? '저장 중입니다…' : label;
  }

  rForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var isEdit = state.editNo != null;
    var writer = document.getElementById('rWriter').value.trim();
    var title = document.getElementById('rTitle').value.trim();
    var content = document.getElementById('rContent').value.trim();
    var pass = document.getElementById('rPass').value.trim();

    var ok = true;
    ok = setErr('rWriter', writer ? '' : '글쓴이를 입력해 주세요.') && ok;
    ok = setErr('rTitle', title ? '' : '제목을 입력해 주세요.') && ok;
    ok = setErr('rContent', content.length >= 10 ? '' : '내용을 10자 이상 입력해 주세요.') && ok;
    ok = setErr('rPass', isEdit
      ? ((!pass || pass.length >= 4) ? '' : '비밀번호는 4자 이상으로 입력해 주세요.')
      : (pass.length >= 4 ? '' : '비밀번호를 4자 이상 입력해 주세요.')) && ok;
    if (!ok) return;

    /* ---------------- 서버 모드 ---------------- */
    if (state.online) {
      busy(true);
      var req = isEdit
        ? { action: 'reviews.update', no: state.editNo, pw: state.editPw, newPw: pass, title: title, writer: writer, content: content }
        : { action: 'reviews.add', title: title, writer: writer, content: content, pw: pass };

      api(req).then(function (out) {
        if (!out || out.result !== 'ok') throw new Error((out && out.message) || '저장하지 못했습니다.');
        var no = out.no || state.editNo;

        /* 화면에는 먼저 반영하고, 서버 목록은 뒤에서 조용히 새로고침 (대기 시간 단축) */
        if (isEdit) {
          var t = findPost(no);
          if (t) { t.title = title; t.writer = writer; t.content = content; t.editedAt = today(); }
        } else {
          state.data.unshift({
            no: no, title: title, writer: writer, date: today(),
            hit: 0, content: content, editedAt: '', pw: '1', isNew: true,
          });
        }

        rForm.reset();
        state.editNo = null; state.editPw = null;
        alert(isEdit ? '수정되었습니다.' : '후기가 등록되었습니다. 감사합니다!');
        location.hash = 'no=' + no;
        route();
        refreshFromServer();
      }).catch(function (err) {
        alert(err.message || '서버에 연결하지 못했습니다.');
      }).finally(function () { busy(false, isEdit ? '수정 저장' : '등록하기'); });
      return;
    }

    /* ---------------- 브라우저 저장 모드 ---------------- */
    var list = loadLocal();

    if (isEdit) {
      var target = null;
      for (var i = 0; i < list.length; i++) { if (String(list[i].no) === String(state.editNo)) { target = list[i]; break; } }
      if (!target) { alert('수정할 글을 찾지 못했습니다.'); goList(); return; }

      var save = function (pwHash) {
        target.writer = writer; target.title = title; target.content = content;
        target.editedAt = today();
        if (pwHash) target.pw = pwHash;
        if (!saveLocal(list)) return;
        buildLocalData();
        var no = target.no;
        state.editNo = null;
        alert('수정되었습니다.');
        location.hash = 'no=' + no; route();
      };
      if (pass) hashPw(pass).then(save); else save(null);
      return;
    }

    hashPw(pass).then(function (pwHash) {
      var maxNo = state.data.reduce(function (m, r) { return Math.max(m, Number(r.no) || 0); }, 0);
      var post = {
        no: maxNo + 1, title: title, writer: writer, date: today(),
        hit: 0, content: content, pw: pwHash, isNew: true,
      };
      list.push(post);
      if (!saveLocal(list)) return;
      buildLocalData();
      rForm.reset();
      alert('후기가 등록되었습니다. 감사합니다!');
      location.hash = 'no=' + post.no; route();
    });
  });

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /* ==================================================== 시작 */
  buildLocalData();               // 1) 백업본으로 즉시 표시
  window.addEventListener('hashchange', route);
  route();
  refreshFromServer();            // 2) 서버 데이터가 오면 교체
})();
