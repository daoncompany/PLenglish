/* 공통 헤더 / 퀵메뉴 / 모바일 바 / 푸터 — 이 파일만 고치면 전 페이지에 반영됩니다.
   사용법: 헤더 자리에 <script src="assets/js/layout.js"></script>
           푸터 자리에 <script>PL.footer();</script>            */
(function () {
  var TEL      = '032-544-3352';
  var TEL_HREF = 'tel:' + TEL.replace(/-/g, '');
  var HOURS    = '평일 10:00 ~ 22:00';
  var KAKAO    = '#';                 // 카카오톡 채널 링크로 교체
  var NAV = [
    ['conversation.html',   '영어회화'],
    ['toeic.html',          '토익'],
    ['toeic-speaking.html', '토익스피킹'],
    ['opic.html',           '오픽'],
    ['ielts.html',          '아이엘츠'],
    ['toefl.html',          '토플'],
    ['reviews.html',        '수강후기'],
    ['contact.html',        '문의하기']
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');

  var LOGO = '<a href="index.html" class="logo{cls}"><span class="logo-mark">PL</span><span class="logo-txt">영어학원</span></a>';

  function header() {
    var menu = NAV.map(function (n) {
      return '<li><a href="' + n[0] + '"' + (n[0] === here ? ' class="on"' : '') + '>' + n[1] + '</a></li>';
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
      '      <p>상호 PL영어학원 &nbsp;|&nbsp; 대표 이민환 &nbsp;|&nbsp; 사업자등록번호 106-90-53956</p>\n' +
      '      <p>주소 인천 계양구 계산동 917-11 태영빌딩 2층 &nbsp;|&nbsp; 대표전화 ' + TEL + ' &nbsp;|&nbsp; 운영시간 평일 10:00~22:00 / 토 10:00~17:00</p>\n' +
      '      <p class="ft-copy">&copy; Daondotcom. All rights reserved.</p>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</footer>'
    );
  }

  window.PL = { header: header, footer: footer };
  header();   // 이 스크립트가 놓인 자리에 헤더를 출력
})();
