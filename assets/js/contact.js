/* ============================================================
   PL어학원 — 온라인 문의 폼
   ------------------------------------------------------------
   [설정] 아래 PL_CONTACT 값만 바꾸면 됩니다.
     endpoint : 구글 Apps Script 웹앱 주소 (배포 후 받은 .../exec 주소)
                → 값을 넣으면 폼 제출 시 학원 지메일로 바로 발송 + 구글시트 저장
                → 비워두면 방문자의 메일 앱을 여는 방식(mailto)으로 동작
     mailTo   : 학원 문의 접수 메일 주소 (mailto 방식 · 실패 시 안내용)
     tel      : 대표 전화번호
   설정 방법은 `문의폼_구글연동_가이드.md` 참고
   ============================================================ */
window.PL_CONTACT = {
  endpoint: 'https://script.google.com/macros/s/AKfycbweInbpb8Ze3d4rRzTFWYHhXY1EJPqJbb___uPTh2L3Aw1eu-B_tyZCLm2uO0OiuZ1h/exec',
  mailTo: 'plinstitute@gmail.com',
  tel: '032-544-3352',
};

(function () {
  'use strict';

  var form = document.getElementById('inquiryForm');
  if (!form) return;

  var result = document.getElementById('formResult');
  var submitBtn = form.querySelector('button[type="submit"]');
  var $ = function (id) { return document.getElementById(id); };
  var cfg = function () { return window.PL_CONTACT || {}; };

  /* ---------------------------------------------- 통화가능시간 (30분 단위) */
  var CALL_OPEN = 10, CALL_CLOSE = 22;      // 운영시간 (평일 10:00 ~ 22:00)

  function timeSlots() {
    var out = [];
    for (var h = CALL_OPEN; h <= CALL_CLOSE; h++) {
      out.push((h < 10 ? '0' : '') + h + ':00');
      if (h !== CALL_CLOSE) out.push((h < 10 ? '0' : '') + h + ':30');
    }
    return out;
  }

  var syncCallTime = function () {};

  function buildTimeSelects() {
    var from = $('fCallFrom'), to = $('fCallTo');
    if (!from || !to) return;
    var slots = timeSlots();

    from.innerHTML = '<option value="">선택 안 함</option><option value="언제든 가능">언제든 가능</option>' +
      slots.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
    to.innerHTML = '<option value="">끝 시간</option>' +
      slots.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');

    function sync() {
      var anytime = from.value === '언제든 가능';
      to.disabled = anytime || !from.value;
      if (to.disabled) to.value = '';
      /* 시작보다 이른 끝 시간은 고를 수 없게 */
      var fi = slots.indexOf(from.value);
      Array.prototype.forEach.call(to.options, function (o) {
        o.hidden = !!o.value && fi > -1 && slots.indexOf(o.value) <= fi;
      });
      if (to.value && slots.indexOf(to.value) <= fi) to.value = '';
    }
    syncCallTime = sync;
    from.addEventListener('change', function () { sync(); setError('fCallFrom', ''); });
    to.addEventListener('change', function () { setError('fCallFrom', ''); });
    sync();
  }
  buildTimeSelects();

  function callTimeValue() {
    var from = $('fCallFrom'), to = $('fCallTo');
    if (!from || !from.value) return '';
    if (from.value === '언제든 가능') return '언제든 가능';
    return to && to.value ? from.value + ' ~ ' + to.value : from.value + ' 이후';
  }

  /* ---------------------------------------------- 검증 */
  function setError(inputId, msg) {
    var input = $(inputId);
    var field = input.closest ? input.closest('.field') : null;
    var box = document.querySelector('.err[data-for="' + inputId + '"]');
    if (box) { box.textContent = msg || ''; box.classList.toggle('on', !!msg); }
    if (field) field.classList.toggle('is-err', !!msg);
    return !msg;
  }

  function validate() {
    var ok = true;
    var name = $('fName').value.trim();
    var email = $('fEmail').value.trim();
    var phone = $('fPhone').value.trim();
    var msg = $('fMessage').value.trim();

    ok = setError('fName', name ? '' : '이름을 입력해 주세요.') && ok;
    ok = setError('fEmail', !email ? '이메일을 입력해 주세요.'
      : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : '이메일 형식을 확인해 주세요.')) && ok;
    ok = setError('fPhone', (!phone || /^[0-9+\-\s()]{9,20}$/.test(phone)) ? '' : '연락처 형식을 확인해 주세요.') && ok;
    var cf = $('fCallFrom'), ct = $('fCallTo');
    var badRange = cf && ct && cf.value && cf.value !== '언제든 가능' && ct.value &&
                   timeSlots().indexOf(ct.value) <= timeSlots().indexOf(cf.value);
    ok = setError('fCallFrom', badRange ? '끝 시간을 시작 시간보다 뒤로 골라주세요.' : '') && ok;
    ok = setError('fMessage', msg ? '' : '문의 내용을 입력해 주세요.') && ok;
    ok = setError('fAgree', $('fAgree').checked ? '' : '개인정보 수집 및 이용에 동의해 주세요.') && ok;
    return ok;
  }

  function payload() {
    return {
      name: $('fName').value.trim(),
      email: $('fEmail').value.trim(),
      phone: $('fPhone').value.trim(),
      callTime: callTimeValue(),
      message: $('fMessage').value.trim(),
      website: $('fWebsite') ? $('fWebsite').value : '',   // 스팸봇용 함정 필드
      page: location.href,
      sentAt: new Date().toLocaleString('ko-KR'),
    };
  }

  /* ---------------------------------------------- 결과 표시 */
  function showResult(type, html) {
    if (!result) return;
    result.className = 'form-result ' + type;
    result.innerHTML = html;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function hideResult() { if (result) { result.hidden = true; result.innerHTML = ''; } }

  function loading(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? '전송 중입니다…' : '문의 보내기';
  }

  /* ---------------------------------------------- 발송 */
  function mailtoLink(d) {
    var subject = '[PL어학원 홈페이지 문의] ' + d.name + '님';
    var body = [
      '■ Name (이름) : ' + d.name,
      '■ E-mail (이메일) : ' + d.email,
      '■ C.P (핸드폰) : ' + (d.phone || '(미기재)'),
      '■ Call time (통화가능시간) : ' + (d.callTime || '(미선택)'),
      '',
      '■ Counsel about classes (수강문의)',
      d.message,
      '',
      '--------------------------------------',
      '접수일시 : ' + d.sentAt,
    ].join('\r\n');
    return 'mailto:' + cfg().mailTo + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function sendByScript(d) {
    /* Content-Type 을 text/plain 으로 보내야 사전 요청(preflight) 없이 전송됩니다. */
    return fetch(cfg().endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(d),
      redirect: 'follow',
    }).then(function (res) {
      return res.json().catch(function () { return { result: 'ok' }; });
    }).then(function (out) {
      if (out && out.result === 'error') throw new Error(out.message || '서버에서 처리하지 못했습니다.');
      return out;
    });
  }

  function successHtml(d) {
    return '<strong>문의가 정상적으로 접수되었습니다.</strong>' +
      '<p>담당 선생님이 확인 후 <b>' + (d.email || '남겨주신 연락처') + '</b> 로 회신드립니다.<br>' +
      '급하신 경우 <a href="tel:' + String(cfg().tel).replace(/[^0-9+]/g, '') + '">' + cfg().tel + '</a> 로 전화 주세요.</p>';
  }

  function errorHtml(d, msg) {
    return '<strong>전송에 실패했습니다.</strong>' +
      '<p>' + (msg ? msg + '<br>' : '') +
      '잠시 후 다시 시도하시거나, 아래 방법으로 연락 주세요.</p>' +
      '<p class="form-result-btns">' +
      '<a class="btn btn-red btn-sm" href="' + mailtoLink(d) + '">메일로 보내기</a> ' +
      '<a class="btn btn-line btn-sm" href="tel:' + String(cfg().tel).replace(/[^0-9+]/g, '') + '">전화 상담 ' + cfg().tel + '</a>' +
      '</p>';
  }

  /* ---------------------------------------------- 제출 */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideResult();

    if (!validate()) {
      var firstErr = form.querySelector('.field.is-err input, .field.is-err textarea');
      if (firstErr) firstErr.focus();
      return;
    }

    var d = payload();

    /* 웹앱 주소가 아직 없으면 메일 앱을 여는 방식으로 동작 */
    if (!cfg().endpoint) {
      window.location.href = mailtoLink(d);
      showResult('info', '<strong>메일 작성 창이 열립니다.</strong><p>메일 프로그램에서 <b>보내기</b>까지 눌러주셔야 접수가 완료됩니다.<br>창이 열리지 않으면 <b>' + cfg().mailTo + '</b> 로 보내주세요.</p>');
      return;
    }

    loading(true);
    sendByScript(d)
      .then(function () {
        form.reset();
        syncCallTime();
        ['fName', 'fEmail', 'fPhone', 'fCallFrom', 'fMessage', 'fAgree'].forEach(function (id) { setError(id, ''); });
        showResult('ok', successHtml(d));
      })
      .catch(function (err) {
        showResult('err', errorHtml(d, err && err.message));
      })
      .finally(function () { loading(false); });
  });

  form.addEventListener('reset', function () {
    setTimeout(syncCallTime, 0);
    ['fName', 'fEmail', 'fPhone', 'fCallFrom', 'fMessage', 'fAgree'].forEach(function (id) { setError(id, ''); });
    hideResult();
  });

  form.addEventListener('input', function (e) {
    if (e.target.id) setError(e.target.id, '');
  });
})();
