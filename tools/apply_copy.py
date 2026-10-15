"""사용: python apply_copy.py <B|C|D> <html 폴더>  — 히어로 타이틀/서브 + meta description 의 서브 문구 교체"""
import re, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from hero_copy import COPY

ver, folder = sys.argv[1], pathlib.Path(sys.argv[2])
for page, (t1, t2, sub) in COPY[ver].items():
    f = folder / f'{page}.html'
    s = f.read_text(encoding='utf-8')
    old_sub = re.search(r'<p class="hero-sub">(.*?)</p>', s).group(1)
    s, n1 = re.subn(r'(<h1 class="hero-title">).*?(</h1>)', rf'\g<1>{t1}<br>{t2}\g<2>', s, count=1)
    s, n2 = re.subn(r'(<p class="hero-sub">).*?(</p>)', rf'\g<1>{sub}\g<2>', s, count=1)
    assert n1 == n2 == 1, page
    s = s.replace(f'content="{old_sub}', f'content="{sub}').replace(f' - {old_sub}.', f' - {sub}.')
    f.write_text(s, encoding='utf-8')
    print(ver, page, '->', t1, '/', t2, '|', sub)
