/* 공통 헤더 / 퀵메뉴 / 모바일 바 / 푸터 / 시간표 — 이 파일만 고치면 전 페이지에 반영됩니다.
   사용법: 헤더 자리   <script src="assets/js/layout.js"></script>
           시간표 자리 <script>PL.timetable('토익');</script>
           푸터 자리   <script>PL.footer();</script>                */
(function () {
  var TEL      = '032-544-3352';
  var TEL_HREF = 'tel:' + TEL.replace(/-/g, '');
  var HOURS    = '평일 10:00 ~ 22:00';
  var KAKAO    = '#';                 // 카카오톡 채널 링크로 교체
  var BRAND    = 'PL어학원';

  /* 대메뉴 — [주소, 이름, 소메뉴] */
  var NAV = [
    ['conversation.html',   '영어회화', [
      ['workingholiday.html', '워홀대비반'],
      ['interview.html',      '영어인터뷰']
    ]],
    ['ielts.html',          '아이엘츠'],
    ['toefl.html',          '토플'],
    ['opic.html',           '오픽'],
    ['toeic.html',          '토익'],
    ['toeic-speaking.html', '토스'],
    ['duolingo.html',       '듀오링고'],
    ['reviews.html',        '수강후기'],
    ['contact.html',        '문의하기']
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');

  var LOGO = '<a href="index.html" class="logo{cls}"><span class="logo-mark">PL</span><span class="logo-txt">어학원</span></a>';

  function isOn(item) {
    if (item[0] === here) return true;
    return (item[2] || []).some(function (s) { return s[0] === here; });
  }

  function header() {
    var menu = NAV.map(function (n) {
      var sub = n[2] ? '\n          <ul class="sub">' + n[2].map(function (s) {
        return '<li><a href="' + s[0] + '"' + (s[0] === here ? ' class="on"' : '') + '>' + s[1] + '</a></li>';
      }).join('') + '</ul>' : '';
      return '<li' + (n[2] ? ' class="has-sub"' : '') + '>' +
             '<a href="' + n[0] + '"' + (isOn(n) ? ' class="on"' : '') + '>' + n[1] + '</a>' + sub + '</li>';
    }).join('\n        ');

    document.write(
      '<header class="hd" id="hd">\n' +
      '  <div class="hd-inner">\n' +
      '    ' + LOGO.replace('{cls}', '') + '\n' +
      '    <nav class="gnb" id="gnb">\n' +
      '      <ul>\n        ' + menu + '\n      </ul>\n' +
      '      <a href="contact.html" class="btn btn-red gnb-cta">무료 상담 문의</a>\n' +
      '    </nav>\n' +
      '    <div class="hd-util">\n' +
      '      <a href="' + TEL_HREF + '" class="hd-tel"><b>' + TEL + '</b><em>' + HOURS + '</em></a>\n' +
      '      <a href="contact.html" class="btn btn-red btn-sm">상담 문의</a>\n' +
      '      <button type="button" class="ham" id="ham" aria-label="메뉴 열기"><span></span><span></span><span></span></button>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</header>'
    );
  }

  /* 시간표 — 주2회 / 주3회 / 1:1 기준. subject 는 제목에 들어갈 과목명 */
  function timetable(subject) {
    var s = subject ? subject + ' ' : '';
    document.write(
      '<section class="sec sec-time" id="timetable">\n' +
      '  <div class="inner">\n' +
      '    <div class="sec-head center reveal">\n' +
      '      <span class="sec-label">TIME TABLE</span>\n' +
      '      <h2 class="sec-title">' + s + '<b>수업 시간표</b></h2>\n' +
      '      <p class="sec-lead">정해진 시간표에 학생이 맞추는 수업이 아닙니다. 요일과 시간은 스케줄에 맞춰 편성합니다.</p>\n' +
      '    </div>\n' +
      '    <div class="tt-wrap reveal">\n' +
      '      <table class="tt tt-plan">\n' +
      '        <caption class="blind">' + s + '수업 구성</caption>\n' +
      '        <colgroup><col style="width:150px"><col style="width:300px"><col></colgroup>\n' +
      '        <thead><tr><th scope="col">구분</th><th scope="col">요일</th><th scope="col">안내</th></tr></thead>\n' +
      '        <tbody>\n' +
      '          <tr><th scope="row">주 2회</th>\n' +
      '            <td><span class="tt-item">월 · 수</span><span class="tt-item">화 · 목</span></td>\n' +
      '            <td>수업 시간대는 유동적으로 조율합니다.</td></tr>\n' +
      '          <tr><th scope="row">주 3회</th>\n' +
      '            <td><span class="tt-item">월 · 수 · 금</span><span class="tt-item">화 · 목 · 금</span></td>\n' +
      '            <td>수업 시간대는 유동적으로 조율합니다.</td></tr>\n' +
      '          <tr><th scope="row">1:1 개인</th>\n' +
      '            <td><span class="tt-item">주 1회 ~ 주 5회</span></td>\n' +
      '            <td>횟수 · 요일 · 시간 모두 학생 스케줄에 맞춰 편성합니다.</td></tr>\n' +
      '        </tbody>\n' +
      '      </table>\n' +
      '    </div>\n' +
      '    <ul class="tt-note reveal">\n' +
      '      <li>모든 수업은 <b>대면(방문) 수업</b>이 기준이며, <b>화상수업(줌)</b>으로도 동일하게 수강하실 수 있습니다.</li>\n' +
      '      <li>주 2회 · 주 3회 요일은 위 조합을 기준으로 하며, 시간대는 상담 시 함께 정합니다.</li>\n' +
      '      <li>공휴일 휴강 및 보강 일정은 개별 안내드립니다.</li>\n' +
      '    </ul>\n' +
      '    <div class="tt-cta reveal">\n' +
      '      <a href="contact.html" class="btn btn-red btn-lg">내 시간에 맞는 반 문의하기</a>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</section>'
    );
  }

  function footer() {
    var ftNav = NAV.map(function (n) {
      return '<a href="' + n[0] + '">' + n[1] + '</a>';
    }).join('\n        ');

    document.write(
      '<div class="quick" id="quick">\n' +
      '  <a href="contact.html" class="q-main">\n' +
      '    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\n' +
      '    <span>문의<br>하기</span>\n' +
      '  </a>\n' +
      '  <a href="' + KAKAO + '" class="q-item kakao"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.9 3 2.8 6.3 2.8 10.3c0 2.6 1.7 4.8 4.3 6.1l-1 3.6 3.9-2.2c.7.1 1.3.2 2 .2 5.1 0 9.2-3.3 9.2-7.7S17.1 3 12 3z"/></svg><span>카톡상담</span></a>\n' +
      '  <a href="' + TEL_HREF + '" class="q-item q-hide-mo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg><span>전화문의</span></a>\n' +
      '  <a href="reviews.html" class="q-item"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg><span>수강후기</span></a>\n' +
      '  <button type="button" class="q-top" id="qtop"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg><span>TOP</span></button>\n' +
      '</div>\n\n' +
      '<div class="mo-bar">\n' +
      '  <a href="' + TEL_HREF + '" class="mo-tel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>전화 상담</a>\n' +
      '  <a href="contact.html" class="mo-cta">무료 상담 문의하기</a>\n' +
      '</div>\n\n' +
      '<footer class="ft">\n' +
      '  <div class="inner">\n' +
      '    <div class="ft-top">\n' +
      '      ' + LOGO.replace('{cls}', ' ft-logo') + '\n' +
      '      <nav class="ft-nav">\n        ' + ftNav + '\n      </nav>\n' +
      '    </div>\n' +
      '    <div class="ft-info">\n' +
      '      <p>상호 ' + BRAND + ' &nbsp;|&nbsp; 대표 이민환 &nbsp;|&nbsp; 사업자등록번호 106-90-53956</p>\n' +
      '      <p>주소 인천 계양구 계산동 917-11 태영빌딩 2층 &nbsp;|&nbsp; 대표전화 ' + TEL + ' &nbsp;|&nbsp; 운영시간 평일 10:00~22:00 / 토 10:00~17:00</p>\n' +
      '      <p class="ft-copy">&copy; Daondotcom. All rights reserved.</p>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</footer>'
    );
  }

  window.PL = { header: header, footer: footer, timetable: timetable };
  header();   // 이 스크립트가 놓인 자리에 헤더를 출력
})();
