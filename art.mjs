// Konsept maketleri: gerçek içerik/veri içermeyen, soyut arayüz çizimleri (okunabilir metin yok).
const C = {
  bg: '#0B0E14',
  panel: '#10141C',
  card: '#151B26',
  line: '#252D3A',
  dim: '#2B3545',
  dim2: '#36425A',
  blue: '#3B82F6',
  ice: '#60A5FA',
  white: '#E8EEF8'
};

const defs = `
<defs>
  <radialGradient id="g" cx="78%" cy="18%" r="70%">
    <stop offset="0" stop-color="${C.blue}" stop-opacity=".28"/>
    <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F4F7FB"/><stop offset="1" stop-color="#9AA9C6"/>
  </linearGradient>
  <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.ice}"/><stop offset="1" stop-color="${C.blue}"/>
  </linearGradient>
</defs>`;

const frame = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750" role="img" aria-label="Konsept maketi">
${defs}
<rect width="1200" height="750" fill="${C.bg}"/>
<rect width="1200" height="750" fill="url(#g)"/>
<g stroke="${C.line}" stroke-opacity=".35" stroke-width="1">${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100} 0V750"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 100}H1200"/>`).join('')}</g>
${inner}
</svg>`;

const win = (x, y, w, h, body) => `
<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.panel}" stroke="${C.line}"/>
  <path d="M${x} ${y + 44}H${x + w}" stroke="${C.line}"/>
  <circle cx="${x + 28}" cy="${y + 22}" r="5" fill="${C.dim2}"/><circle cx="${x + 46}" cy="${y + 22}" r="5" fill="${C.dim2}"/><circle cx="${x + 64}" cy="${y + 22}" r="5" fill="${C.dim2}"/>
  <rect x="${x + w / 2 - 110}" y="${y + 12}" width="220" height="20" rx="10" fill="${C.card}"/>
  ${body}
</g>`;

const line = (x, y, w, o = 1, c = C.dim) => `<rect x="${x}" y="${y}" width="${w}" height="10" rx="5" fill="${c}" opacity="${o}"/>`;
const mark = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 70 L48 0 L62 0 L24 70Z" fill="url(#m)"/><path d="M34 70 L82 0 L96 0 L58 70Z" fill="url(#m)" opacity=".7"/><path d="M62 0 L110 0 L84 70Z" fill="url(#b)"/></g>`;

const web = () =>
  frame(
    win(120, 90, 960, 570, `
      <rect x="150" y="150" width="120" height="14" rx="7" fill="${C.dim2}"/>
      <rect x="760" y="153" width="40" height="8" rx="4" fill="${C.dim}"/><rect x="820" y="153" width="40" height="8" rx="4" fill="${C.dim}"/><rect x="880" y="153" width="40" height="8" rx="4" fill="${C.dim}"/>
      <rect x="950" y="143" width="100" height="28" rx="14" fill="${C.blue}"/>
      <rect x="150" y="250" width="470" height="26" rx="13" fill="${C.white}"/>
      <rect x="150" y="296" width="380" height="26" rx="13" fill="${C.white}" opacity=".85"/>
      ${line(150, 350, 430)}${line(150, 372, 360, 0.7)}
      <rect x="150" y="410" width="140" height="40" rx="20" fill="${C.blue}"/><rect x="304" y="410" width="120" height="40" rx="20" fill="none" stroke="${C.dim2}"/>
      ${mark(750, 230, 2.4)}
      <rect x="150" y="500" width="270" height="130" rx="12" fill="${C.card}" stroke="${C.line}"/>
      <rect x="440" y="500" width="270" height="130" rx="12" fill="${C.card}" stroke="${C.line}"/>
      <rect x="730" y="500" width="320" height="130" rx="12" fill="${C.card}" stroke="${C.line}"/>
      ${line(170, 526, 90, 1, C.ice)}${line(170, 556, 200)}${line(170, 576, 150, 0.6)}
      ${line(460, 526, 90, 1, C.dim2)}${line(460, 556, 200)}${line(460, 576, 150, 0.6)}
      ${line(750, 526, 90, 1, C.dim2)}${line(750, 556, 240)}${line(750, 576, 180, 0.6)}
    `)
  );

const software = () =>
  frame(
    win(100, 80, 1000, 590, `
      <rect x="100" y="124" width="190" height="546" fill="${C.card}" opacity=".6"/>
      <path d="M290 124V670" stroke="${C.line}"/>
      <rect x="124" y="150" width="142" height="34" rx="10" fill="${C.blue}" opacity=".9"/>
      ${[1, 2, 3, 4, 5].map((i) => line(130, 190 + i * 40, 90 + (i % 3) * 20, 0.8)).join('')}
      <rect x="320" y="150" width="200" height="90" rx="12" fill="${C.card}" stroke="${C.line}"/>
      <rect x="540" y="150" width="200" height="90" rx="12" fill="${C.card}" stroke="${C.line}"/>
      <rect x="760" y="150" width="310" height="90" rx="12" fill="${C.card}" stroke="${C.line}"/>
      ${line(340, 172, 70, 1, C.dim2)}<rect x="340" y="196" width="110" height="22" rx="8" fill="${C.white}"/>
      ${line(560, 172, 70, 1, C.dim2)}<rect x="560" y="196" width="90" height="22" rx="8" fill="${C.ice}"/>
      <g transform="translate(780 262)" fill="none"></g>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="${782 + i * 24}" y="${222 - [20, 34, 26, 44, 38, 56, 48, 62, 50, 70, 60, 74][i] + 0}" width="14" height="${[20, 34, 26, 44, 38, 56, 48, 62, 50, 70, 60, 74][i]}" rx="4" fill="${i > 8 ? C.blue : C.dim2}" transform="translate(0 -6)"/>`).join('')}
      <rect x="320" y="270" width="750" height="370" rx="12" fill="${C.card}" stroke="${C.line}"/>
      <path d="M320 316H1070" stroke="${C.line}"/>
      ${line(344, 288, 80, 1, C.dim2)}${line(560, 288, 60, 1, C.dim2)}${line(780, 288, 60, 1, C.dim2)}${line(960, 288, 60, 1, C.dim2)}
      ${[0, 1, 2, 3, 4, 5].map((i) => `
        ${line(344, 344 + i * 48, 120 + (i % 3) * 30)}${line(560, 344 + i * 48, 110)}${line(780, 344 + i * 48, 90, 0.7)}
        <rect x="960" y="${338 + i * 48}" width="${i % 2 ? 70 : 90}" height="22" rx="11" fill="${i % 3 === 0 ? C.blue : C.dim2}" opacity="${i % 3 === 0 ? 0.9 : 0.8}"/>
        <path d="M344 ${368 + i * 48 + 10}H1046" stroke="${C.line}" stroke-opacity=".6"/>`).join('')}
    `)
  );

const ai = () =>
  frame(
    win(110, 90, 980, 570, `
      <path d="M800 134V660" stroke="${C.line}"/>
      <rect x="150" y="170" width="380" height="64" rx="18" fill="${C.card}" stroke="${C.line}"/>
      ${line(176, 192, 300, 0.8)}${line(176, 212, 200, 0.5)}
      <rect x="400" y="262" width="360" height="92" rx="18" fill="${C.blue}" opacity=".92"/>
      <rect x="426" y="288" width="290" height="10" rx="5" fill="#EAF2FF"/><rect x="426" y="312" width="220" height="10" rx="5" fill="#EAF2FF" opacity=".75"/>
      <rect x="150" y="384" width="440" height="110" rx="18" fill="${C.card}" stroke="${C.line}"/>
      ${line(176, 410, 340, 0.8)}${line(176, 432, 300, 0.55)}${line(176, 454, 240, 0.4)}
      <rect x="150" y="560" width="610" height="56" rx="28" fill="${C.card}" stroke="${C.dim2}"/>
      ${line(182, 584, 220, 0.5)}
      <circle cx="728" cy="588" r="18" fill="url(#b)"/>
      <rect x="830" y="164" width="230" height="20" rx="10" fill="${C.dim2}" opacity=".7"/>
      ${[0, 1, 2].map((i) => `<rect x="830" y="${204 + i * 112}" width="230" height="92" rx="14" fill="${C.card}" stroke="${C.line}"/>${line(850, 226 + i * 112, 120, 1, i === 0 ? C.ice : C.dim2)}${line(850, 252 + i * 112, 170, 0.6)}${line(850, 272 + i * 112, 130, 0.4)}`).join('')}
    `)
  );

const product = () =>
  frame(`
    <g>
      <rect x="250" y="110" width="700" height="530" rx="22" fill="${C.panel}" stroke="${C.line}"/>
      ${mark(300, 150, 0.7)}
      <rect x="300" y="250" width="600" height="46" rx="12" fill="${C.card}" stroke="${C.line}"/>${line(322, 269, 240, 0.55)}
      <rect x="300" y="316" width="600" height="46" rx="12" fill="${C.card}" stroke="${C.line}"/>${line(322, 335, 180, 0.55)}
      <rect x="300" y="386" width="170" height="46" rx="23" fill="${C.blue}"/>
      <rect x="486" y="386" width="46" height="46" rx="23" fill="none" stroke="${C.dim2}"/>
      <rect x="300" y="462" width="600" height="140" rx="14" fill="${C.card}" stroke="${C.line}"/>
      <rect x="300" y="462" width="4" height="140" rx="2" fill="${C.ice}"/>
      ${line(330, 490, 320, 0.9, C.white)}${line(330, 516, 420, 0.5)}${line(330, 538, 360, 0.4)}${line(330, 560, 280, 0.3)}
    </g>
    <g transform="translate(960 160)" opacity=".9"><rect width="140" height="52" rx="14" fill="${C.card}" stroke="${C.line}"/><circle cx="26" cy="26" r="10" fill="${C.blue}"/>${line(48, 22, 70, 0.6)}</g>
    <g transform="translate(90 520)" opacity=".9"><rect width="150" height="52" rx="14" fill="${C.card}" stroke="${C.line}"/><circle cx="26" cy="26" r="10" fill="${C.ice}"/>${line(48, 22, 80, 0.6)}</g>
  `);

export function projectArt(kind) {
  return { web, software, ai, product }[kind]?.() ?? web();
}
