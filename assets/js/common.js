/* PL영어학원 홈페이지 초안 — common script */
(function () {
  'use strict';

  /* 헤더 스크롤 그림자 + TOP 버튼 노출 */
  var hd = document.getElementById('hd');
  var qtop = document.getElementById('qtop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (hd) hd.classList.toggle('is-scroll', y > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 모바일 GNB 토글 */
  var ham = document.getElementById('ham');
  var gnb = document.getElementById('gnb');
  if (ham && gnb) {
    ham.addEventListener('click', function () {
      var open = gnb.classList.toggle('on');
      ham.classList.toggle('on', open);
      ham.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    gnb.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        gnb.classList.remove('on');
        ham.classList.remove('on');
        document.body.style.overflow = '';
      }
    });
  }

  /* TOP */
  if (qtop) {
    qtop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 시간표 탭 (초안용 UI 동작) */
  var ttTab = document.querySelector('.tt-tab');
  if (ttTab) {
    ttTab.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      ttTab.querySelectorAll('button').forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
    });
  }

  /* 스크롤 등장 효과 */
  var targets = document.querySelectorAll('.reveal');
  function showAll() { targets.forEach(function (el) { el.classList.add('in'); }); }
  /* 안전장치: 어떤 이유로든 관찰이 동작하지 않으면 3초 뒤 모두 노출 */
  setTimeout(showAll, 3000);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    targets.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      io.observe(el);
    });
  } else {
    showAll();
  }
})();
