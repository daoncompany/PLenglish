/**
 * ============================================================
 *  PL어학원 홈페이지 — 문의 접수 + 수강후기 게시판 스크립트
 *  ------------------------------------------------------------
 *  하나의 구글 시트에 두 가지를 처리합니다.
 *    · 문의접수 시트 : 홈페이지 문의 폼 → 메일 발송 + 기록
 *    · 후기 시트     : 수강후기 목록 / 작성 / 수정 / 삭제 (비밀번호 확인)
 *
 *  코드를 고친 뒤에는 반드시
 *  [배포 → 배포 관리 → 편집(연필) → 버전: 새 버전 → 배포] 를 해야 반영됩니다.
 * ============================================================
 */

/* ▼▼▼ 학원 정보에 맞게 수정 ▼▼▼ */
var MAIL_TO      = 'daoncompany4512@gmail.com';  // 문의를 받을 메일 주소 (여러 명이면 콤마로 구분)
var MAIL_FROM    = 'PL어학원 홈페이지';      // 메일에 표시될 보내는 사람 이름
var SHEET_NAME   = '문의접수';                // 문의가 쌓일 시트 탭 이름
var REVIEW_SHEET = '후기';                    // 후기가 쌓일 시트 탭 이름 (이름이 달라도 '후기'가 들어가면 자동 인식)
var PW_SALT      = 'pl-review-2026';          // 비밀번호 암호화용 값 (한 번 정하면 바꾸지 마세요)
var IMPORT_KEY   = 'pl-import-2026';          // 기존 후기 일괄 등록용 열쇠

// 목록에서 감출 후기 번호 (본문에 개인정보가 노출된 글)
//   88  「영어회화」(신수현, 2016-03-27)        — 이메일
//   105 「[re]회화 시간 등 문의」               — 문의 답글, 실명 · 연락처
//   106 「회화 시간 등 문의」(ksj, 2018-12-18)  — 휴대폰 · 이메일
// 여기서 번호를 빼면 그 글이 다시 목록에 나옵니다. 시트 원본은 그대로 남습니다.
var HIDDEN_NOS   = [88, 105, 106];

// 배포 확인용 표시 — 코드를 고쳐 새로 배포할 때마다 날짜를 바꿔두면
// 웹앱 주소를 브라우저로 열었을 때 어느 버전이 돌고 있는지 바로 알 수 있습니다.
var CODE_VERSION = '2026-09-10';
/* ▲▲▲ ------------------------------------ ▲▲▲ */


/* ============================================================
   요청 받기
   ============================================================ */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    switch (d.action) {
      case 'reviews.list':   return jsonOut(reviewsList_());
      case 'reviews.add':    return jsonOut(reviewsAdd_(d));
      case 'reviews.update': return jsonOut(reviewsUpdate_(d));
      case 'reviews.delete': return jsonOut(reviewsDelete_(d));
      case 'reviews.import': return jsonOut(reviewsImport_(d));
      default:               return jsonOut(inquiry_(d));   // 문의 폼 (기존과 동일)
    }
  } catch (err) {
    return jsonOut({ result: 'error', message: String(err) });
  }
}

/** 배포 확인용 — 브라우저에서 웹앱 주소를 열면 보입니다 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'reviews.list') return jsonOut(reviewsList_());
  return jsonOut({
    result: 'ok',
    message: 'PL어학원 API 정상 동작 중',
    version: CODE_VERSION,
    mailTo: MAIL_TO,
    hiddenReviews: HIDDEN_NOS,
    sheets: SpreadsheetApp.getActiveSpreadsheet().getSheets().map(function (s) { return s.getName(); }),
  });
}


/* ============================================================
   ① 온라인 문의
   ============================================================ */
function inquiry_(data) {
  if (data.website) return { result: 'ok' };            // 스팸봇 차단(함정 필드)

  var name    = clean_(data.name);
  var email   = clean_(data.email);
  var phone   = clean_(data.phone);
  var callTime = clean_(data.callTime);
  var message = clean_(data.message);
  if (!name || !email || !message) return { result: 'error', message: '필수 항목이 비어 있습니다.' };

  // 통화가능시간은 기존 데이터와 어긋나지 않도록 맨 끝 칸에 넣습니다.
  getInquirySheet_().appendRow([new Date(), name, email, phone || '(미기재)', message, data.page || '', callTime || '(미선택)']);

  MailApp.sendEmail({
    to: MAIL_TO,
    subject: '[홈페이지 문의] ' + name + '님' + (phone ? ' / ' + phone : ''),
    name: MAIL_FROM,
    replyTo: email,
    body:
      '홈페이지 온라인 문의가 접수되었습니다.\n\n' +
      '■ Name (이름)      : ' + name + '\n' +
      '■ E-mail (이메일)   : ' + email + '\n' +
      '■ C.P (핸드폰)      : ' + (phone || '(미기재)') + '\n' +
      '■ Call time (통화가능시간) : ' + (callTime || '(미선택)') + '\n\n' +
      '■ Counsel about classes (수강문의)\n' + message + '\n\n' +
      '--------------------------------------\n' +
      '접수일시 : ' + now_() + '\n' +
      '접수경로 : ' + (data.page || '홈페이지 문의 폼') + '\n' +
      '\n※ 이 메일에 그대로 [답장]하면 문의하신 분에게 회신됩니다.',
  });

  return { result: 'ok' };
}

function getInquirySheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['접수일시', '이름', '이메일', '연락처', '수강문의 내용', '유입 페이지', '통화가능시간']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f5f6f8');
    sheet.setColumnWidths(1, 6, 150);
    sheet.setColumnWidth(5, 480);
    sheet.setFrozenRows(1);
  }
  return sheet;
}


/* ============================================================
   ② 수강후기 게시판
   ------------------------------------------------------------
   시트 열 구성 : 번호 | 제목 | 글쓴이 | 등록일 | 조회수 | 본문 | 비밀번호 | 수정일
   ============================================================ */
var REVIEW_COLS = ['번호', '제목', '글쓴이', '등록일', '조회수', '본문', '비밀번호', '수정일'];

function getReviewSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REVIEW_SHEET);

  // 정확한 이름이 없으면 이름에 '후기'가 들어간 시트를 찾아 사용
  if (!sheet) {
    var found = ss.getSheets().filter(function (s) { return s.getName().indexOf('후기') >= 0; });
    sheet = found.length ? found[0] : ss.insertSheet(REVIEW_SHEET);
  }

  // 머리글이 비어 있으면 새로 작성
  var head = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var empty = head.join('').trim() === '';
  if (empty) {
    sheet.getRange(1, 1, 1, REVIEW_COLS.length).setValues([REVIEW_COLS]);
    sheet.getRange(1, 1, 1, REVIEW_COLS.length).setFontWeight('bold').setBackground('#f5f6f8');
    sheet.setColumnWidth(1, 60);
    sheet.setColumnWidth(2, 320);
    sheet.setColumnWidth(6, 520);
    sheet.setFrozenRows(1);
  } else {
    // 기존 머리글에 비밀번호 · 수정일 열이 없으면 오른쪽에 추가
    ['비밀번호', '수정일'].forEach(function (name) {
      if (headIndex_(sheet, name) < 0) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(name).setFontWeight('bold').setBackground('#f5f6f8');
      }
    });
  }
  return sheet;
}

/** 머리글 이름 → 열 번호(1부터). 없으면 -1 */
function headIndex_(sheet, name) {
  var head = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var alias = {
    '번호': ['번호', 'no', 'No', 'NO'],
    '제목': ['제목', 'title'],
    '글쓴이': ['글쓴이', '작성자', '이름', 'writer'],
    '등록일': ['등록일', '작성일', '날짜', 'date'],
    '조회수': ['조회수', '조회', 'hit'],
    '본문': ['본문', '본문내용', '내용', 'content'],
    '비밀번호': ['비밀번호', '패스워드', 'pw'],
    '수정일': ['수정일', 'editedAt'],
  }[name] || [name];

  for (var i = 0; i < head.length; i++) {
    var h = String(head[i]).trim();
    for (var j = 0; j < alias.length; j++) {
      if (h.toLowerCase() === String(alias[j]).toLowerCase()) return i + 1;
    }
  }
  return -1;
}

function readReviews_() {
  var sheet = getReviewSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return { sheet: sheet, rows: [] };

  var cols = {};
  REVIEW_COLS.forEach(function (c) { cols[c] = headIndex_(sheet, c); });

  var width = sheet.getLastColumn();
  var values = sheet.getRange(2, 1, last - 1, width).getValues();
  var rows = values.map(function (v, i) {
    var get = function (c) { return cols[c] > 0 ? v[cols[c] - 1] : ''; };
    return {
      row: i + 2,
      no: Number(get('번호')) || 0,
      title: String(get('제목') || ''),
      writer: String(get('글쓴이') || ''),
      date: fmtDate_(get('등록일')),
      hit: Number(get('조회수')) || 0,
      content: String(get('본문') || ''),
      pw: String(get('비밀번호') || ''),
      editedAt: fmtDate_(get('수정일')),
    };
  }).filter(function (r) { return r.no || r.title; });

  return { sheet: sheet, rows: rows, cols: cols };
}

/** 목록 — 비밀번호와 비공개 처리된 글은 절대 내보내지 않습니다 */
function reviewsList_() {
  var db = readReviews_();
  var items = db.rows.filter(function (r) {
    return HIDDEN_NOS.indexOf(Number(r.no)) === -1;
  }).map(function (r) {
    return {
      no: r.no, title: r.title, writer: r.writer, date: r.date,
      hit: r.hit, content: r.content, editedAt: r.editedAt,
      hasPw: !!r.pw,
    };
  }).sort(function (a, b) { return b.no - a.no; });
  return { result: 'ok', items: items, count: items.length };
}

function reviewsAdd_(d) {
  var title = clean_(d.title), writer = clean_(d.writer), content = clean_(d.content), pw = String(d.pw || '');
  if (!title || !writer || !content) return { result: 'error', message: '필수 항목이 비어 있습니다.' };
  if (pw.length < 4) return { result: 'error', message: '비밀번호는 4자 이상이어야 합니다.' };

  var db = readReviews_();
  var maxNo = db.rows.reduce(function (m, r) { return Math.max(m, r.no); }, 0);
  var no = maxNo + 1;

  var sheet = db.sheet;
  var width = sheet.getLastColumn();
  var line = new Array(width).fill('');
  var cols = {};
  REVIEW_COLS.forEach(function (c) { cols[c] = headIndex_(sheet, c); });
  var set = function (c, v) { if (cols[c] > 0) line[cols[c] - 1] = v; };

  set('번호', no); set('제목', title); set('글쓴이', writer);
  set('등록일', today_()); set('조회수', 0); set('본문', content);
  set('비밀번호', hash_(pw)); set('수정일', '');

  sheet.appendRow(line);
  return { result: 'ok', no: no };
}

function reviewsUpdate_(d) {
  var db = readReviews_();
  var target = null;
  for (var i = 0; i < db.rows.length; i++) { if (db.rows[i].no === Number(d.no)) { target = db.rows[i]; break; } }
  if (!target) return { result: 'error', message: '글을 찾을 수 없습니다.' };
  if (!target.pw) return { result: 'error', message: '이 글은 수정할 수 없습니다.' };
  if (hash_(String(d.pw || '')) !== target.pw) return { result: 'error', message: '비밀번호가 일치하지 않습니다.' };

  var sheet = db.sheet, cols = db.cols;
  var put = function (c, v) { if (cols[c] > 0) sheet.getRange(target.row, cols[c]).setValue(v); };
  if (clean_(d.title)) put('제목', clean_(d.title));
  if (clean_(d.writer)) put('글쓴이', clean_(d.writer));
  if (clean_(d.content)) put('본문', clean_(d.content));
  if (d.newPw && String(d.newPw).length >= 4) put('비밀번호', hash_(String(d.newPw)));
  put('수정일', today_());

  return { result: 'ok', no: target.no };
}

function reviewsDelete_(d) {
  var db = readReviews_();
  var target = null;
  for (var i = 0; i < db.rows.length; i++) { if (db.rows[i].no === Number(d.no)) { target = db.rows[i]; break; } }
  if (!target) return { result: 'error', message: '글을 찾을 수 없습니다.' };
  if (!target.pw) return { result: 'error', message: '이 글은 삭제할 수 없습니다.' };
  if (hash_(String(d.pw || '')) !== target.pw) return { result: 'error', message: '비밀번호가 일치하지 않습니다.' };

  db.sheet.deleteRow(target.row);
  return { result: 'ok' };
}

/** 기존 후기 일괄 등록 (이미 있는 번호는 건너뜁니다) */
function reviewsImport_(d) {
  if (String(d.key) !== IMPORT_KEY) return { result: 'error', message: '열쇠가 올바르지 않습니다.' };
  var items = d.items || [];
  if (!items.length) return { result: 'error', message: '보낼 데이터가 없습니다.' };

  var db = readReviews_();
  var sheet = db.sheet;
  var exists = {};
  db.rows.forEach(function (r) { exists[r.no] = true; });

  var cols = {};
  REVIEW_COLS.forEach(function (c) { cols[c] = headIndex_(sheet, c); });
  var width = Math.max(sheet.getLastColumn(), REVIEW_COLS.length);

  var lines = [];
  items.forEach(function (it) {
    if (exists[Number(it.no)]) return;
    var line = new Array(width).fill('');
    var set = function (c, v) { if (cols[c] > 0) line[cols[c] - 1] = v; };
    set('번호', Number(it.no)); set('제목', it.title || ''); set('글쓴이', it.writer || '');
    set('등록일', it.date || ''); set('조회수', Number(it.hit) || 0); set('본문', it.content || '');
    set('비밀번호', ''); set('수정일', '');
    lines.push(line);
  });

  if (lines.length) sheet.getRange(sheet.getLastRow() + 1, 1, lines.length, width).setValues(lines);
  return { result: 'ok', added: lines.length, skipped: items.length - lines.length };
}


/* ============================================================
   공통
   ============================================================ */
function hash_(pw) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, PW_SALT + '::' + pw, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function clean_(v) { return String(v == null ? '' : v).trim().slice(0, 5000); }
function now_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'); }
function today_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd'); }
function fmtDate_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd');
  return String(v).trim();
}
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


/* ============================================================
   설치 확인용 (편집기에서 직접 실행)
   ============================================================ */
function 테스트발송() {
  var r = inquiry_({
    name: '테스트', email: 'test@example.com', phone: '010-0000-0000',
    message: '설치 테스트용 문의입니다. 이 메일이 도착하면 정상 연동된 것입니다.', page: '설치 테스트',
  });
  Logger.log(r);
}

/**
 * 메일이 안 올 때 여기부터 확인하세요.
 * 편집기 위쪽 함수 목록에서 [메일설정_확인] 을 고르고 [실행] → [실행 로그] 를 보면 됩니다.
 */
function 메일설정_확인() {
  var sh = getInquirySheet_();
  var last = sh.getLastRow();
  Logger.log('■ 코드 버전        : ' + CODE_VERSION);
  Logger.log('■ 받는 주소(MAIL_TO): ' + MAIL_TO);
  Logger.log('■ 보내는 계정       : ' + Session.getEffectiveUser().getEmail());
  Logger.log('■ 오늘 남은 발송량  : ' + MailApp.getRemainingDailyQuota() + '통');
  Logger.log('■ 문의접수 시트 행수: ' + last);
  if (last > 1) {
    Logger.log('■ 마지막 행         : ' + JSON.stringify(sh.getRange(last, 1, 1, sh.getLastColumn()).getValues()[0]));
  }
  Logger.log('----------------------------------------');
  Logger.log('받는 주소가 예전 것이면 → 코드를 붙여넣고 [배포 관리 → 편집 → 새 버전 → 배포]');
  Logger.log('남은 발송량이 0이면    → 오늘 한도를 다 쓴 것이니 내일 다시 시도');
  Logger.log('마지막 행 맨 끝에 시간이 없으면 → 옛 코드가 배포되어 있는 상태');
}

/** 메일 발송만 단독 테스트 — 실행하면 MAIL_TO 로 한 통 보냅니다 */
function 메일_한통_보내기() {
  MailApp.sendEmail({
    to: MAIL_TO,
    subject: '[PL어학원] 메일 발송 테스트 (' + CODE_VERSION + ')',
    name: MAIL_FROM,
    body: '이 메일이 도착하면 발송 기능은 정상입니다.
받는 주소 : ' + MAIL_TO + '
보낸 계정 : ' + Session.getEffectiveUser().getEmail(),
  });
  Logger.log(MAIL_TO + ' 로 보냈습니다. 남은 발송량 ' + MailApp.getRemainingDailyQuota() + '통');
}

function 후기시트_확인() {
  var db = readReviews_();
  Logger.log('시트 이름 : ' + db.sheet.getName());
  Logger.log('후기 건수 : ' + db.rows.length);
  Logger.log(JSON.stringify(db.rows.slice(0, 2)));
}
