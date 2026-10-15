# 히어로 선화 — viewBox 0 0 200 200, 선은 CSS(.hv) 가 받음. class="a" = 빨강 포인트, class="f" = 빨강 채움
def star(cx, cy, r=9):
    import math
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * .45
        t = math.pi / 2 + i * math.pi / 5
        pts.append(f'{cx + rr * math.cos(t):.1f},{cy - rr * math.sin(t):.1f}')
    return f'<polygon class="a" points="{" ".join(pts)}"/>'

HI = '<path class="a" d="M127 37v16M141 37v16M127 45h14M153 43v10M153 36.5v.5"/>'

PICTO = {
 'index': '<path d="M30 150L100 165L170 150V70L100 85L30 70Z"/><path d="M100 85v80M48 92l34 7M48 112l34 7M118 99l34-7M118 119l34-7"/>'
          '<rect class="a" x="112" y="24" width="58" height="40" rx="12"/><path class="a" d="M126 64l-6 14 18-14"/>' + HI,
 'conversation': '<rect x="28" y="40" width="96" height="64" rx="20"/><path d="M50 104l-8 18 24-18"/><path d="M50 64h50M50 80h32"/>'
          '<rect class="a" x="76" y="96" width="96" height="64" rx="20"/><path class="a" d="M150 160l8 18-24-18"/>'
          '<circle class="f" cx="104" cy="128" r="5"/><circle class="f" cx="124" cy="128" r="5"/><circle class="f" cx="144" cy="128" r="5"/>',
 'workingholiday': '<circle cx="94" cy="118" r="56"/><ellipse cx="94" cy="118" rx="24" ry="56"/><path d="M38 118h112M46 90h96M46 146h96"/>'
          '<path class="a" d="M30 62Q96 0 152 40" stroke-dasharray="2 12"/><path class="a" d="M150 24l32 12-26 16-3-13zM153 39l3 13 9-8"/>',
 'interview': '<rect x="34" y="92" width="104" height="72" rx="12"/><path d="M70 92V80a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v12M34 122h104M80 122v10h12v-10"/>'
          '<rect class="a" x="118" y="30" width="56" height="44" rx="13"/><path class="a" d="M132 74l-5 13 16-13"/><path class="a" d="M139 46a7 7 0 1 1 9 7v3M148 63v.5"/>',
 'ielts': '<path d="M30 170h140"/><rect x="40" y="120" width="22" height="50" rx="5"/><rect x="72" y="100" width="22" height="70" rx="5"/>'
          '<rect x="104" y="84" width="22" height="86" rx="5"/><rect class="a" x="136" y="58" width="22" height="112" rx="5"/>'
          '<path class="a" d="M40 92L82 62l26 14 44-44M128 32h24v24"/>',
 'toefl': '<path d="M24 82L100 50l76 32-76 32z"/><path d="M58 98v36c0 18 84 18 84 0V98"/>'
          '<path class="a" d="M176 82v44"/><circle class="f" cx="176" cy="134" r="8"/><path d="M100 82l40 16"/>',
 'opic': '<rect x="78" y="34" width="44" height="78" rx="22"/><path d="M78 72h14M108 72h14M78 88h14M108 88h14"/>'
          '<path d="M58 96a42 42 0 0 0 84 0M100 138v24M74 164h52"/>'
          '<path class="a" d="M152 60a26 26 0 0 1 0 40M164 48a44 44 0 0 1 0 64M48 60a26 26 0 0 0 0 40M36 48a44 44 0 0 0 0 64"/>',
 'toeic': '<rect x="46" y="26" width="108" height="150" rx="12"/><path d="M66 48h68"/>'
          + ''.join(f'<circle cx="{x}" cy="{y}" r="7"/>' for y in (76, 102, 128, 154) for x in (72, 94, 116, 138))
          + ''.join(f'<circle class="f" cx="{x}" cy="{y}" r="7"/>' for x, y in ((94, 76), (138, 102), (72, 128), (116, 154))),
 'toeic-speaking': '<circle cx="88" cy="116" r="54"/><path d="M76 50h24M88 50v12M130 70l8-8"/>'
          '<path class="a" d="M88 116V82M88 116l22 14"/><path d="M88 70v4M88 158v4M42 116h4M130 116h4"/>'
          '<rect class="a" x="128" y="22" width="52" height="38" rx="12"/><path class="a" d="M142 60l-5 12 15-12M141 37h26M141 46h16"/>',
 'certification': '<rect x="28" y="38" width="144" height="104" rx="10"/><path d="M52 66h96M52 86h70M52 106h50"/>'
          '<path class="a" d="M128 140l-6 32 14-8 10 10 4-32"/><circle class="a" cx="140" cy="126" r="22"/><path class="a" d="M131 126l6 6 12-12"/>',
 'gtelp': '<rect x="46" y="40" width="108" height="136" rx="12"/><path d="M78 40v-8h44v8a6 6 0 0 1-6 6H84a6 6 0 0 1-6-6z"/>'
          '<path class="a" d="M64 80l7 7 13-13M64 114l7 7 13-13M64 148l7 7 13-13"/><path d="M98 82h38M98 116h38M98 150h26"/>',
 'duolingo': '<rect x="38" y="44" width="124" height="86" rx="10"/><path d="M22 150h156l-12-20H34z"/>'
          '<path class="a" d="M106 58L84 92h18l-8 26 26-38h-18z"/>',
 'reviews': '<path d="M58 52h84a22 22 0 0 1 22 22v40a22 22 0 0 1-22 22H90l-28 24v-24h-4a22 22 0 0 1-22-22V74a22 22 0 0 1 22-22z"/>'
          + star(70, 92, 12) + star(100, 92, 12) + star(130, 92, 12),
 'contact': '<rect x="26" y="74" width="128" height="88" rx="12"/><path d="M28 82l62 46 62-46"/>'
          '<rect class="a" x="120" y="26" width="58" height="42" rx="13"/><path class="a" d="M134 68l-5 12 16-12"/>'
          '<circle class="f" cx="137" cy="47" r="4"/><circle class="f" cx="149" cy="47" r="4"/><circle class="f" cx="161" cy="47" r="4"/>',
}

# V3 — 플랫 인물 일러스트 (면 채움 + 가는 외곽선). 색은 여기 팔레트만 바꾸면 됨
C = dict(coral='#f0614a', yellow='#f7b733', navy='#26315f', peri='#7d82e8', skin='#f5c6a5',
         hair='#2b2233', wood='#dcb497', table='#fff7f0', bub='#f0c2b0', clock='#f6e3d0', shadow='#e7cdbd')

def _f(s):
    return s.format(**C)

ILLUST = {
 'index': _f(
  # 바닥 그림자 · 벽시계
  '<ellipse cx="104" cy="187" rx="92" ry="5" fill="{shadow}" stroke="none"/>'
  '<circle cx="108" cy="30" r="9" fill="{clock}"/><path d="M108 24v6l4 3"/>'
  # 의자 (수강생)
  '<path d="M156 104q24 0 24 30v8h-26z" fill="{wood}"/><path d="M158 142l-4 44M176 142l4 44"/>'
  # 수강생 — 앉아서 왼쪽을 봄
  '<path d="M138 122L118 124v10h32q14 0 14-10z" fill="{navy}"/>'
  '<path d="M118 124l-6 56h10l6-46z" fill="{navy}"/><path d="M106 180h17v6h-21q0-6 4-6z" fill="{coral}"/>'
  '<path d="M136 128l2-32q1-10 12-11 11 1 13 11l2 32z" fill="{peri}"/>'
  '<rect x="147" y="80" width="6" height="7" fill="{skin}"/>'
  '<circle cx="161" cy="59" r="5.5" fill="{hair}"/>'
  '<circle cx="150" cy="72" r="10" fill="{skin}"/>'
  '<path d="M140 71q-1-15 11-15 11 0 10 14-6-7-12-6-5 0-9 7z" fill="{hair}"/>'
  '<circle cx="145" cy="71" r="1.1" fill="{hair}" stroke="none"/><path d="M142 77q3 2 6 0" fill="none"/>'
  ''
  # 테이블 · 책 · 노트북
  '<rect x="78" y="126" width="114" height="5" rx="1.5" fill="{table}"/>'
  '<rect x="84" y="131" width="3" height="56" fill="{wood}"/><rect x="183" y="131" width="3" height="56" fill="{wood}"/>'
  '<rect x="88" y="121" width="22" height="5" fill="{coral}"/><rect x="90" y="116" width="19" height="5" fill="{yellow}"/>'
  '<rect x="87" y="111" width="21" height="5" fill="{peri}"/>'
  '<path d="M118 126l-4-22h20l2 22z" fill="{navy}"/><circle cx="125" cy="114" r="1.6" fill="#fff" stroke="none"/>'
  '<path d="M146 98l-9 20 6 3 9-19z" fill="{peri}"/><circle cx="139" cy="122" r="3.5" fill="{skin}"/>'
  # 선생님 — 서서 오른쪽을 보며 설명
  '<path d="M39 118l-3 62h14l3-48 3 48h14l-3-62z" fill="{yellow}"/>'
  '<path d="M33 180h18v6H29q0-6 4-6z" fill="{navy}"/><path d="M55 180h18q5 0 5 6H55z" fill="{navy}"/>'
  '<path d="M38 120l2-34q1-10 12-11 11 1 13 11l2 34z" fill="{coral}"/>'
  '<rect x="49" y="70" width="6" height="7" fill="{skin}"/>'
  '<circle cx="52" cy="62" r="10" fill="{skin}"/><circle cx="44.5" cy="64" r="2" fill="{skin}"/>'
  '<path d="M42 61q0-14 12-14 11 0 11 10-4-3-10-2-6 1-13 6z" fill="{hair}"/>'
  '<circle cx="57" cy="61" r="1.1" fill="{hair}" stroke="none"/><path d="M55 67q3 2 6-1" fill="none"/>'
  '<path d="M60 82l24 10-2 7-24-7z" fill="{coral}"/><circle cx="86.5" cy="95.5" r="4" fill="{skin}"/>'
  '<path d="M41 84l-7 24 6 2 6-20z" fill="{coral}"/>'
  '<rect x="29" y="104" width="9" height="13" rx="1" fill="{navy}" transform="rotate(-12 33 110)"/><circle cx="37" cy="111" r="3.5" fill="{skin}"/>'
  # 말풍선
  '<rect x="58" y="20" width="36" height="21" rx="10.5" fill="#fff"/><path d="M68 40l-3 7 9-6" fill="#fff"/>'
  '<text x="76" y="34.5" font-size="10" font-weight="800" text-anchor="middle" fill="#e8291c" stroke="none">Hi!</text>'
  '<rect x="124" y="30" width="32" height="18" rx="9" fill="{bub}"/><path d="M136 47l2 7 5-7" fill="{bub}"/>'
  '<circle cx="133" cy="39" r="1.6" fill="#fff" stroke="none"/><circle cx="140" cy="39" r="1.6" fill="#fff" stroke="none"/><circle cx="147" cy="39" r="1.6" fill="#fff" stroke="none"/>'
 ),
}
