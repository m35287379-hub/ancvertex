// ANC Vertex — statik site üretici (bağımlılık yok, sadece Node.js)
// Kullanım: node build.mjs   →  dist/ klasörünü üretir.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectArt } from './lib/art.mjs';
import { icon } from './lib/icons.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const LOCALE = process.env.SITE_LOCALE || 'tr'; // ileride content/en eklenebilir
const SITE_URL = (process.env.SITE_URL || 'https://ancvertex.com').replace(/\/$/, '');
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '';

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const site = readJson(`content/${LOCALE}/site.json`);
const projects = readJson(`content/${LOCALE}/projects.json`);

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ---------- çıktı klasörü ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'assets', 'projects'), { recursive: true });
cpSync(join(ROOT, 'public'), DIST, { recursive: true });
cpSync(join(ROOT, 'src', 'styles.css'), join(DIST, 'assets', 'styles.css'));
cpSync(join(ROOT, 'src', 'noscript.css'), join(DIST, 'assets', 'noscript.css'));
cpSync(join(ROOT, 'src', 'main.js'), join(DIST, 'assets', 'main.js'));
for (const p of projects) writeFileSync(join(DIST, 'assets', 'projects', `${p.slug}.svg`), projectArt(p.art));

const hash = (f) => createHash('sha1').update(readFileSync(join(DIST, 'assets', f))).digest('hex').slice(0, 8);
const V = { css: hash('styles.css'), js: hash('main.js') };

// ---------- ortak parçalar ----------
const logoLockup = (cls = '') => `
  <span class="logo ${cls}">
    <img class="logo__mark" src="/assets/logo-mark.webp" width="575" height="259" alt="" decoding="async">
    <img class="logo__word" src="/assets/logo-word.webp" width="932" height="75" alt="ANC Vertex" decoding="async">
  </span>`;

function header(active) {
  const links = site.nav
    .map((n) => `<li><a href="${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`)
    .join('');
  return `
<a class="skip-link" href="#icerik">İçeriğe geç</a>
<header class="site-header" id="top">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="/" aria-label="ANC Vertex — Ana Sayfa">${logoLockup()}</a>
    <nav class="nav" aria-label="Ana menü">
      <ul class="nav__list" id="menu">${links}</ul>
      <a class="btn btn--primary btn--sm nav__cta" href="/iletisim/">Bir Proje Başlatalım</a>
    </nav>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobil-menu" aria-label="Menüyü aç">
      <span class="menu-toggle__icon menu-toggle__icon--open">${icon('menu')}</span>
      <span class="menu-toggle__icon menu-toggle__icon--close">${icon('close')}</span>
    </button>
  </div>
  <div class="mobile-menu" id="mobil-menu" hidden>
    <div class="container">
      <ul class="mobile-menu__list">${links}</ul>
      <a class="btn btn--primary btn--block" href="/iletisim/">Bir Proje Başlatalım</a>
    </div>
  </div>
</header>`;
}

function footer() {
  const nav = site.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('');
  const svc = site.services.map((s) => `<li><a href="/hizmetler/#${s.id}">${esc(s.title)}</a></li>`).join('');
  const email = site.contact.email
    ? `<li><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></li>`
    : '';
  const social = (site.contact.social || [])
    .map((s) => `<li><a href="${esc(s.url)}" rel="noopener noreferrer" target="_blank">${esc(s.label)}</a></li>`)
    .join('');
  return `
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <a href="/" aria-label="ANC Vertex — Ana Sayfa">${logoLockup('logo--footer')}</a>
        <p>${esc(site.brand.footerBlurb)}</p>
      </div>
      <nav aria-label="Alt menü">
        <h2 class="footer-title">Sayfalar</h2>
        <ul>${nav}</ul>
      </nav>
      <nav aria-label="Hizmetler">
        <h2 class="footer-title">Hizmetler</h2>
        <ul>${svc}</ul>
      </nav>
      <div>
        <h2 class="footer-title">İletişim</h2>
        <ul>
          <li><a href="/iletisim/">İletişim formu</a></li>
          ${email}
          ${social}
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <p>© <span data-year>${new Date().getFullYear()}</span> ANC Vertex. Tüm hakları saklıdır.</p>
      <a href="/gizlilik/">Gizlilik Politikası</a>
    </div>
  </div>
</footer>`;
}

function cta(title = 'Aklında bir proje mi var?') {
  return `
<section class="section cta" aria-labelledby="cta-baslik">
  <div class="container">
    <div class="cta__panel reveal">
      <h2 id="cta-baslik">${esc(title)}</h2>
      <p>Fikrini, ihtiyacını veya geliştirmek istediğin dijital ürünü konuşalım.</p>
      <div class="btn-row">
        <a class="btn btn--primary" href="/iletisim/#form">Projeni Anlat ${icon('arrow')}</a>
        <a class="btn btn--ghost" href="/iletisim/">İletişime Geç</a>
      </div>
    </div>
  </div>
</section>`;
}

function page({ path, key, title, description, body, ogImage = '/assets/og-image.jpg', noindex = false, jsonLd = '', extraHead = '', extraBody = '' }) {
  const url = SITE_URL + path;
  const fullTitle = title;
  return `<!doctype html>
<html lang="${LOCALE}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#080A0F">
<meta name="color-scheme" content="dark">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
<link rel="canonical" href="${url}">
<link rel="icon" href="/assets/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ANC Vertex">
<meta property="og:locale" content="tr_TR">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="603">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE_URL}${ogImage}">
<link rel="preload" as="image" href="/assets/logo-mark.webp" type="image/webp">
<link rel="stylesheet" href="/assets/styles.css?v=${V.css}">
<noscript><link rel="stylesheet" href="/assets/noscript.css?v=${V.css}"></noscript>
<script src="/assets/main.js?v=${V.js}" defer></script>
${extraHead}
${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}
</head>
<body data-page="${key || ''}">
${header(key)}
<main id="icerik" tabindex="-1">
${body}
</main>
${footer()}
${extraBody}
</body>
</html>`;
}

const write = (path, html) => {
  const file = path.endsWith('.html') ? join(DIST, path) : join(DIST, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

// ---------- parçalar: proje kartı ----------
function projectCard(p) {
  return `
<article class="card project-card reveal" data-category="${esc(p.category)}">
  <a class="project-card__media" href="/projeler/${p.slug}/" tabindex="-1" aria-hidden="true">
    <img src="/assets/projects/${p.slug}.svg" width="1200" height="750" loading="lazy" decoding="async" alt="">
    ${p.kind === 'Konsept' ? '<span class="badge badge--concept">Konsept görseli</span>' : ''}
  </a>
  <div class="project-card__body">
    <div class="project-card__meta">
      <span class="tag">${esc(p.categoryLabel)}</span>
      <span class="status">${esc(p.status)}</span>
    </div>
    <h3><a href="/projeler/${p.slug}/">${esc(p.name)}</a></h3>
    <p>${esc(p.summary)}</p>
    ${p.tech.length ? `<ul class="chips" aria-label="Kullanılan teknolojiler">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    <a class="link-arrow" href="/projeler/${p.slug}/">Detayı gör ${icon('arrow')}<span class="sr-only"> — ${esc(p.name)}</span></a>
  </div>
</article>`;
}

// ---------- ANA SAYFA ----------
const home = () => {
  const svcCards = site.services
    .map(
      (s, i) => `
    <article class="card service-card reveal d${i + 1}">
      <div class="service-card__top"><span class="service-card__icon">${icon(s.icon)}</span><span class="num">${s.num}</span></div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.short)}</p>
      <a class="link-arrow" href="/hizmetler/#${s.id}">Kapsamı gör ${icon('arrow')}<span class="sr-only"> — ${esc(s.title)}</span></a>
    </article>`
    )
    .join('');
  const featured = projects.filter((p) => p.featured).slice(0, 3).map(projectCard).join('');
  const principles = site.principles
    .map((p, i) => `<li class="principle reveal d${i + 1}"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`)
    .join('');
  const steps = site.process
    .map(
      (s, i) => `
    <li class="step reveal d${i + 1}">
      <span class="step__num" aria-hidden="true">${i + 1}</span>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
    </li>`
    )
    .join('');

  const body = `
<section class="hero" aria-labelledby="hero-baslik">
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="container hero__inner">
    <div class="hero__copy">
      <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>INDEPENDENT DIGITAL STUDIO</p>
      <h1 id="hero-baslik">Fikirleri dijital deneyimlere dönüştürüyoruz.</h1>
      <p class="lead">ANC Vertex; modern web deneyimleri, yazılım çözümleri ve yenilikçi dijital ürünler üzerine çalışan teknoloji odaklı bir markadır. Fikirleri işlevsel, estetik ve geliştirilebilir dijital çözümlere dönüştürmeye odaklanır.</p>
      <div class="btn-row">
        <a class="btn btn--primary" href="/projeler/">Projeleri Keşfet ${icon('arrow')}</a>
        <a class="btn btn--ghost" href="/iletisim/">İletişime Geç</a>
      </div>
    </div>
    <div class="hero__art" aria-hidden="true">
      <div class="hero__glow"></div>
      <div class="hero__frame hero__frame--a"></div>
      <div class="hero__frame hero__frame--b"></div>
      <img class="hero__mark" src="/assets/logo-mark.webp" width="575" height="259" alt="" fetchpriority="high" decoding="async">
    </div>
  </div>
</section>

<section class="section" aria-labelledby="hizmet-baslik">
  <div class="container">
    <div class="section__head reveal">
      <p class="eyebrow eyebrow--plain">Odak alanlarımız</p>
      <h2 id="hizmet-baslik">Dijital dünyada fikirden ürüne.</h2>
      <p>İhtiyaca uygun tasarım, geliştirme ve teknoloji çözümleriyle dijital projelerin temellerini oluşturuyoruz.</p>
    </div>
    <div class="grid grid--4">${svcCards}</div>
  </div>
</section>

<section class="section section--alt" aria-labelledby="proje-baslik">
  <div class="container">
    <div class="section__head section__head--row reveal">
      <div>
        <p class="eyebrow eyebrow--plain">Öne çıkan çalışmalar</p>
        <h2 id="proje-baslik">Tasarımdan çalışan ürüne.</h2>
        <p>Dijital projelerimizi, tasarım yaklaşımımızı ve geliştirme sürecimizi keşfedin.</p>
      </div>
      <a class="link-arrow" href="/projeler/">Tüm projeler ${icon('arrow')}</a>
    </div>
    <div class="grid grid--3">${featured}</div>
    <p class="note reveal">Konsept ve prototip olarak etiketlenen çalışmalar gerçek müşteri işi değildir; ANC Vertex'in tasarım yaklaşımını göstermek için hazırlanmıştır.</p>
  </div>
</section>

<section class="section" aria-labelledby="yaklasim-baslik">
  <div class="container approach">
    <div class="approach__copy reveal">
      <p class="eyebrow eyebrow--plain">Yaklaşım</p>
      <h2 id="yaklasim-baslik">Sadece güzel görünen değil, işe yarayan dijital çözümler.</h2>
      <p>İyi bir dijital ürün; güçlü bir görsel kimliği, anlaşılır bir kullanıcı deneyimini ve güvenilir bir teknik temeli bir araya getirir. ANC Vertex'te tasarım ve geliştirmeyi aynı bütünün parçaları olarak ele alıyoruz.</p>
    </div>
    <ul class="principles">${principles}</ul>
  </div>
</section>

<section class="section section--alt" aria-labelledby="surec-baslik">
  <div class="container">
    <div class="section__head reveal">
      <p class="eyebrow eyebrow--plain">Çalışma süreci</p>
      <h2 id="surec-baslik">Bir fikrin dijital ürüne dönüşme süreci.</h2>
    </div>
    <ol class="steps">${steps}</ol>
  </div>
</section>

${cta()}`;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ANC Vertex',
    url: SITE_URL,
    logo: `${SITE_URL}/assets/icon-512.png`
  });
  write('/', page({
    path: '/',
    key: 'home',
    title: 'ANC Vertex | Web Tasarımı, Yazılım ve Dijital Ürünler',
    description: 'ANC Vertex; modern web tasarımı, yazılım geliştirme, yapay zekâ çözümleri ve dijital ürünlere odaklanan teknoloji markasıdır.',
    body,
    jsonLd
  }));
};

// ---------- HİZMETLER ----------
const servicesPage = () => {
  const blocks = site.services
    .map((s) => {
      const related = projects.filter((p) => p.category === s.category);
      return `
<section class="service-block reveal" id="${s.id}" aria-labelledby="${s.id}-baslik">
  <div class="service-block__head">
    <span class="service-card__icon">${icon(s.icon)}</span>
    <span class="num">${s.num}</span>
    <h2 id="${s.id}-baslik">${esc(s.title)}</h2>
    <p>${esc(s.short)}</p>
    <p class="service-block__need"><strong>Kimler için:</strong> ${esc(s.need)}</p>
  </div>
  <div class="service-block__body">
    <h3>Kapsam</h3>
    <ul class="checklist">${s.scope.map((x) => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
    <div class="btn-row">
      ${related.length ? `<a class="btn btn--ghost btn--sm" href="/projeler/?kategori=${s.category}">İlgili çalışmalar</a>` : ''}
      <a class="btn btn--primary btn--sm" href="/iletisim/?hizmet=${s.id}#form">Bu konuda konuşalım</a>
    </div>
  </div>
</section>`;
    })
    .join('');
  const body = `
<section class="page-hero" aria-labelledby="sayfa-baslik">
  <div class="container">
    <p class="eyebrow eyebrow--plain">Hizmetler</p>
    <h1 id="sayfa-baslik">Fikirden ürüne uzanan odak alanları.</h1>
    <p class="lead">ANC Vertex'in üzerinde çalıştığı alanlar ve her birinin kapsamı. Fiyatlandırma proje kapsamına göre belirlenir; sabit bir paket yoktur, teklif için iletişime geçebilirsin.</p>
  </div>
</section>
<div class="container service-list">${blocks}</div>
${cta('Hangi alanda destek lazım?')}`;
  write('/hizmetler/', page({
    path: '/hizmetler/',
    key: 'services',
    title: 'Hizmetler | ANC Vertex',
    description: 'ANC Vertex odak alanları: web tasarımı ve geliştirme, yazılım geliştirme, yapay zekâ ve otomasyon, dijital ürünler.',
    body
  }));
};

// ---------- PROJELER ----------
const projectsPage = () => {
  const filters = [{ id: 'hepsi', label: 'Tümü' }, ...site.categories]
    .map((c, i) => `<button type="button" class="filter${i === 0 ? ' is-active' : ''}" data-filter="${c.id}" aria-pressed="${i === 0}">${esc(c.label)}</button>`)
    .join('');
  const body = `
<section class="page-hero" aria-labelledby="sayfa-baslik">
  <div class="container">
    <p class="eyebrow eyebrow--plain">Projeler / Portföy</p>
    <h1 id="sayfa-baslik">Tasarımdan çalışan ürüne.</h1>
    <p class="lead">Gerçek projeler ve konsept çalışmalar. Her kartta çalışmanın türü açıkça belirtilir.</p>
  </div>
</section>
<section class="section section--tight" aria-label="Proje listesi">
  <div class="container">
    <div class="filters" role="group" aria-label="Kategori filtresi">${filters}</div>
    <p class="sr-only" id="filtre-durum" role="status" aria-live="polite"></p>
    <div class="grid grid--3 project-grid">${projects.map(projectCard).join('')}</div>
    <p class="empty" id="bos-liste" hidden>Bu kategoride henüz bir çalışma yok.</p>
    <p class="note">Konsept ve prototip olarak etiketlenen çalışmalar gerçek müşteri işi değildir. Yeni projeler <code>content/${LOCALE}/projects.json</code> dosyasına eklenir.</p>
  </div>
</section>
${cta()}`;
  write('/projeler/', page({
    path: '/projeler/',
    key: 'projects',
    title: 'Projeler | ANC Vertex',
    description: 'ANC Vertex portföyü: web, yazılım, yapay zekâ ve dijital ürün çalışmaları ile konsept projeler.',
    body
  }));
};

// ---------- PROJE DETAY (şablon) ----------
const projectDetail = (p) => {
  const row = (label, val) => (val ? `<div class="spec"><dt>${label}</dt><dd>${esc(val)}</dd></div>` : '');
  const list = (label, arr) =>
    arr && arr.length ? `<div class="spec"><dt>${label}</dt><dd><ul class="chips">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></dd></div>` : '';
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];
  const links = [
    p.liveUrl ? `<a class="btn btn--primary btn--sm" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">Canlı demo ${icon('arrow')}</a>` : '',
    p.sourceUrl ? `<a class="btn btn--ghost btn--sm" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Kaynak kodu</a>` : ''
  ].join('');
  const body = `
<section class="page-hero page-hero--project" aria-labelledby="sayfa-baslik">
  <div class="container">
    <nav class="breadcrumb" aria-label="Sayfa yolu"><a href="/projeler/">Projeler</a><span aria-hidden="true">/</span><span>${esc(p.name)}</span></nav>
    <div class="project-card__meta"><span class="tag">${esc(p.categoryLabel)}</span><span class="status">${esc(p.status)}</span></div>
    <h1 id="sayfa-baslik">${esc(p.name)}</h1>
    <p class="lead">${esc(p.summary)}</p>
    ${links ? `<div class="btn-row">${links}</div>` : ''}
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    <figure class="project-figure reveal">
      <img src="/assets/projects/${p.slug}.svg" width="1200" height="750" decoding="async" alt="${esc(p.name)} için hazırlanmış ${p.kind === 'Konsept' ? 'konsept' : 'tasarım'} görseli">
      ${p.kind === 'Konsept' ? '<figcaption>Bu görsel, ANC Vertex tarafından hazırlanmış bir konsept maketidir; gerçek bir müşteri işi veya yayında bir ürün değildir.</figcaption>' : ''}
    </figure>
    <dl class="specs reveal">
      ${row('Projenin amacı', p.purpose)}
      ${row('Çözdüğü problem', p.problem)}
      ${row('Hedef kullanıcı', p.audience)}
      ${row('Tasarım yaklaşımı', p.design)}
      ${list('Kullanılan teknolojiler', p.tech)}
      ${list('Proje kapsamı', p.scope)}
      ${row('Durum', p.status)}
    </dl>
    <div class="project-next reveal">
      <a class="link-arrow" href="/projeler/">${icon('arrow', 'icon--back')} Tüm projeler</a>
      <a class="link-arrow" href="/projeler/${next.slug}/">Sıradaki: ${esc(next.name)} ${icon('arrow')}</a>
    </div>
  </div>
</section>
${cta()}`;
  write(`/projeler/${p.slug}/`, page({
    path: `/projeler/${p.slug}/`,
    key: 'projects',
    title: `${p.name} | ANC Vertex`,
    description: p.summary,
    body
  }));
};

// ---------- HAKKIMIZDA ----------
const aboutPage = () => {
  const blocks = site.about.blocks
    .map((b, i) => `<article class="card about-card reveal d${(i % 4) + 1}"><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></article>`)
    .join('');
  const founder = site.about.founder
    ? `<section class="section"><div class="container"><h2>Kurucu</h2><p>${esc(site.about.founder.name)}</p></div></section>`
    : '';
  const body = `
<section class="page-hero" aria-labelledby="sayfa-baslik">
  <div class="container">
    <p class="eyebrow eyebrow--plain">Hakkımızda</p>
    <h1 id="sayfa-baslik">Teknolojiye tasarım ve geliştirme perspektifinden yaklaşıyoruz.</h1>
    <p class="lead">ANC Vertex, dijital tasarım ve teknoloji geliştirme alanlarına odaklanan bir markadır. Amacımız; kullanıcı ihtiyaçlarını dikkate alan, estetik açıdan güçlü ve teknik olarak sürdürülebilir dijital deneyimler geliştirmektir.</p>
    <p class="lead lead--muted">Web tasarımıyla başlayan bu yaklaşımı zaman içinde yazılım, yapay zekâ, otomasyon ve dijital ürün alanlarına genişletmeyi hedefliyoruz.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    <p class="status-note reveal">${esc(site.about.status)}</p>
    <div class="grid grid--2">${blocks}</div>
  </div>
</section>
${founder}
${cta('Birlikte bir şey geliştirelim mi?')}`;
  write('/hakkimizda/', page({
    path: '/hakkimizda/',
    key: 'about',
    title: 'Hakkımızda | ANC Vertex',
    description: 'ANC Vertex; tasarım ve geliştirmeyi bir bütün olarak ele alan, web, yazılım, yapay zekâ ve dijital ürünlere odaklanan bağımsız bir marka.',
    body
  }));
};

// ---------- İLETİŞİM ----------
const contactPage = () => {
  const options = site.services.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join('');
  const turnstile = TURNSTILE_SITE_KEY
    ? `<div class="cf-turnstile" data-sitekey="${esc(TURNSTILE_SITE_KEY)}" data-theme="dark"></div>`
    : '';
  const body = `
<section class="page-hero" aria-labelledby="sayfa-baslik">
  <div class="container">
    <p class="eyebrow eyebrow--plain">İletişim</p>
    <h1 id="sayfa-baslik">Birlikte ne geliştirebiliriz?</h1>
    <p class="lead">Projenin fikrini, hedefini ve ihtiyaçlarını paylaş. Sana uygun bir sonraki adımı değerlendirelim.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="container contact">
    <form class="form card" id="form" action="/api/contact" method="post" novalidate>
      <noscript><p class="form__notice">Bu form çalışmak için JavaScript gerektirir.</p></noscript>
      <div class="field">
        <label for="f-ad">Ad ve soyad <span class="req" aria-hidden="true">*</span></label>
        <input id="f-ad" name="name" type="text" autocomplete="name" required maxlength="100" aria-describedby="f-ad-hata">
        <p class="field__error" id="f-ad-hata" role="alert"></p>
      </div>
      <div class="field">
        <label for="f-eposta">E-posta adresi <span class="req" aria-hidden="true">*</span></label>
        <input id="f-eposta" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="200" aria-describedby="f-eposta-hata">
        <p class="field__error" id="f-eposta-hata" role="alert"></p>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="f-hizmet">İlgilenilen hizmet <span class="req" aria-hidden="true">*</span></label>
          <select id="f-hizmet" name="service" required aria-describedby="f-hizmet-hata">
            <option value="">Seçiniz</option>
            ${options}
            <option value="diger">Diğer</option>
          </select>
          <p class="field__error" id="f-hizmet-hata" role="alert"></p>
        </div>
        <div class="field">
          <label for="f-butce">Tahmini bütçe <span class="opt">(isteğe bağlı)</span></label>
          <select id="f-butce" name="budget">
            <option value="">Belirtmek istemiyorum</option>
            <option value="belirsiz">Henüz belirsiz, konuşalım</option>
            <option value="kucuk">Küçük ölçekli proje</option>
            <option value="orta">Orta ölçekli proje</option>
            <option value="genis">Kapsamlı proje</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label for="f-mesaj">Proje açıklaması <span class="req" aria-hidden="true">*</span></label>
        <textarea id="f-mesaj" name="message" rows="6" required minlength="20" maxlength="4000" aria-describedby="f-mesaj-hata"></textarea>
        <p class="field__error" id="f-mesaj-hata" role="alert"></p>
      </div>
      <div class="field field--hp" aria-hidden="true">
        <label for="f-web">Web sitesi (boş bırakın)</label>
        <input id="f-web" name="website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <input type="hidden" name="ts" id="f-ts" value="">
      <div class="field field--check">
        <input id="f-onay" name="consent" type="checkbox" required aria-describedby="f-onay-hata">
        <label for="f-onay"><a href="/gizlilik/" target="_blank" rel="noopener">Gizlilik bilgilendirmesini</a> okudum; bilgilerimin yalnızca bu talebi yanıtlamak için kullanılmasını kabul ediyorum. <span class="req" aria-hidden="true">*</span></label>
        <p class="field__error" id="f-onay-hata" role="alert"></p>
      </div>
      ${turnstile}
      <button class="btn btn--primary btn--block" type="submit" id="gonder"><span class="btn__label">Gönder</span><span class="btn__spinner" aria-hidden="true"></span></button>
      <p class="form__status" id="form-durum" role="status" aria-live="polite" tabindex="-1"></p>
    </form>
    <aside class="contact__aside" aria-label="Bilgilendirme">
      <div class="card">
        <h2>Nasıl ilerliyoruz?</h2>
        <ol class="mini-steps">
          <li>Formu doldurursun.</li>
          <li>Talebin incelenir ve uygun bir sonraki adım belirlenir.</li>
          <li>Kapsama göre teklif ve takvim paylaşılır.</li>
        </ol>
        <p class="muted">Fiyatlandırma proje kapsamına göre belirlenir; sabit bir paket yoktur.</p>
        ${site.contact.email ? `<p><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></p>` : ''}
      </div>
    </aside>
  </div>
</section>`;
  write('/iletisim/', page({
    path: '/iletisim/',
    key: 'contact',
    title: 'İletişim | ANC Vertex',
    description: 'ANC Vertex ile iletişime geç: web, yazılım, yapay zekâ veya dijital ürün fikrini paylaş.',
    body,
    extraBody: TURNSTILE_SITE_KEY ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ''
  }));
};

// ---------- GİZLİLİK ----------
const privacyPage = () => {
  const draft = site.privacyDraftNotice
    ? `<p class="status-note">Taslak metin: Bu sayfa sitenin bugünkü çalışma biçimini anlatmak için hazırlanmıştır ve hukuki bir belge olarak sunulmamaktadır. Yayına almadan önce gerçek veri akışına ve geçerli yükümlülüklere göre doğrulanmalıdır.</p>`
    : '';
  const body = `
<section class="page-hero" aria-labelledby="sayfa-baslik">
  <div class="container prose">
    <p class="eyebrow eyebrow--plain">Gizlilik</p>
    <h1 id="sayfa-baslik">Gizlilik Politikası</h1>
    ${draft}
  </div>
</section>
<section class="section section--tight">
  <div class="container prose">
    <h2>Hangi bilgiler toplanır?</h2>
    <p>Yalnızca iletişim formunu doldurduğunda yazdığın bilgiler alınır: ad ve soyad, e-posta adresi, seçtiğin hizmet, isteğe bağlı bütçe aralığı ve proje açıklaman. Gereksiz kişisel veri istenmez.</p>
    <h2>Bilgiler ne için kullanılır?</h2>
    <p>Bu bilgiler yalnızca talebini değerlendirmek ve sana yanıt vermek için kullanılır.</p>
    <h2>Bilgiler nasıl iletilir?</h2>
    <p>Form gönderimi sunucu tarafında doğrulanır ve ANC Vertex'in yapılandırdığı e-posta gönderim hizmeti üzerinden iletilir. Şu anda kullanılması planlanan üçüncü taraf servisler: e-posta gönderimi için Resend; isteğe bağlı olarak spam koruması için Cloudflare Turnstile. Hangi servislerin gerçekten etkin olduğu yayına alma sırasında bu metne işlenmelidir.</p>
    <h2>Çerezler ve analitik</h2>
    <p>Bu sürümde çerez kullanılmaz ve analitik aracı bulunmaz. İleride bir analitik aracı eklenirse bu bilgilendirme ve gerekli onay mekanizmaları güncellenmelidir.</p>
    <h2>Saklama süresi ve haklar</h2>
    <p>Gönderilen talepler yalnızca e-posta kutusunda bulunur; ayrı bir veri tabanında saklanmaz. Saklama süresi ve veri sahibi hakları (erişim, düzeltme, silme gibi) yayına almadan önce ilgili mevzuata göre netleştirilmelidir.</p>
    <h2>İletişim</h2>
    <p>Gizlilikle ilgili sorular için <a href="/iletisim/">iletişim formunu</a> kullanabilirsin.</p>
  </div>
</section>`;
  write('/gizlilik/', page({
    path: '/gizlilik/',
    key: 'privacy',
    title: 'Gizlilik Politikası | ANC Vertex',
    description: 'ANC Vertex iletişim formunda hangi bilgilerin alındığı ve nasıl kullanıldığı hakkında bilgilendirme.',
    body
  }));
};

// ---------- 404 ----------
const notFound = () => {
  const body = `
<section class="page-hero page-hero--center" aria-labelledby="sayfa-baslik">
  <div class="container">
    <p class="eyebrow eyebrow--plain">404</p>
    <h1 id="sayfa-baslik">Aradığın sayfa bulunamadı.</h1>
    <p class="lead">Bağlantı değişmiş ya da sayfa kaldırılmış olabilir.</p>
    <div class="btn-row btn-row--center">
      <a class="btn btn--primary" href="/">Ana Sayfaya Dön</a>
      <a class="btn btn--ghost" href="/projeler/">Projelere Göz At</a>
    </div>
  </div>
</section>`;
  write('/404.html', page({
    path: '/404.html',
    key: '404',
    title: 'Sayfa bulunamadı | ANC Vertex',
    description: 'Aradığın sayfa bulunamadı.',
    body,
    noindex: true
  }));
};

// ---------- sitemap + robots ----------
const seo = () => {
  const urls = ['/', '/hizmetler/', '/projeler/', ...projects.map((p) => `/projeler/${p.slug}/`), '/hakkimizda/', '/iletisim/', '/gizlilik/'];
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  writeFileSync(join(DIST, 'sitemap.xml'), xml);
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
};

home();
servicesPage();
projectsPage();
projects.forEach(projectDetail);
aboutPage();
contactPage();
privacyPage();
notFound();
seo();
console.log(`✔ dist/ hazır — ${projects.length} proje, site URL: ${SITE_URL}`);
