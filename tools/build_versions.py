"""V1(루트) HTML 을 복사해 v2/ v3/ 를 만든다. 다시 돌려도 같은 결과 — V1 공통 수정 후 이 스크립트만 재실행.
사용: python build_versions.py <홈페이지초안 폴더> <캐시버전>"""
import re, sys, pathlib, shutil, subprocess
here = pathlib.Path(__file__).parent
sys.path.insert(0, str(here))

root, ver = pathlib.Path(sys.argv[1]), sys.argv[2]
# V2 픽토그램 원본 = tools/picto/NN_페이지.svg (피그마 내보내기 그대로). 고칠 땐 이 파일만 교체 후 재실행
PICTO = {f.stem.split('_', 1)[1]: re.sub(r'<svg [^>]*>', '<svg class="hv" viewBox="0 0 400 400" fill="none" aria-hidden="true">', f.read_text(encoding='utf-8').strip(), count=1)
         for f in sorted((here / 'picto').glob('*.svg'))}
# V3 일러스트 = v3/assets/img/hero/페이지.webp (홈페이지자료/v3 일러스트 PNG 를 webp 로 변환해 둔 것)
ILLUST = {f.stem: f'<img class="hv" src="assets/img/hero/{f.name}?v={ver}" alt="" width="1024" height="1024" decoding="async">'
          for f in sorted((root / 'v3/assets/img/hero').glob('*.webp'))}
JOBS = {'v2': ('C', PICTO), 'v3': ('D', ILLUST)}

for folder, (copy_ver, art) in JOBS.items():
    out = root / folder
    (out / 'assets/css').mkdir(parents=True, exist_ok=True)
    if folder != 'v2':
        shutil.copy(root / 'v2/assets/css/hero.css', out / 'assets/css/hero.css')
    for src in root.glob('*.html'):
        page = src.stem
        s = src.read_text(encoding='utf-8')
        s = s.replace('"assets/', '"../assets/')
        s = re.sub(r'(<link rel="stylesheet" href="\.\./assets/css/style\.css\?v=[^"]+">)',
                   rf'\1\n<link rel="stylesheet" href="assets/css/hero.css?v={ver}">\n<meta name="robots" content="noindex">', s, count=1)
        if page in art:
            svg = art[page]
            if '<div class="hero-visual">' in s:
                s = re.sub(r'<div class="hero-visual">\s*</div>', f'<div class="hero-visual">{svg}</div>', s, count=1)
            else:  # index · reviews · contact — hero-copy 뒤에 자리 추가
                s = re.sub(r'(<ul class="hero-chips">.*?</ul>\s*</div>)', rf'\1\n    <div class="hero-visual">{svg}</div>', s, count=1, flags=re.S)
            assert 'class="hv' in s, (folder, page)
        (out / src.name).write_text(s, encoding='utf-8')
    subprocess.run([sys.executable, str(here / 'apply_copy.py'), copy_ver, str(out)], check=True)
