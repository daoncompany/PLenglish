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
 'toeic': '<rect x="118" y="28" width="60" height="90" rx="10"/><path d="M132 52h32M132 70h32M132 88h20"/>'  # RC 문서
          '<path d="M31 140v-10a43 43 0 0 1 86 0v10"/>'  # LC 헤드폰 밴드
          '<rect class="a" x="20" y="140" width="22" height="42" rx="11"/><rect class="a" x="106" y="140" width="22" height="42" rx="11"/>',
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

# V3 — 제미나이로 만든 이미지로 교체 예정. 비어 있으면 V1 사진이 나온다
ILLUST = {}
