# ANC Vertex Web Sitesi

Gece siyahı + gümüş-beyaz logo + elektrik mavisi vurgular. Bağımlılıksız, hızlı ve geliştirilebilir bir yapı.

> **Not:** Bu sürüm, geliştirme ortamında npm paket kaynağına erişim olmadığı için Next.js yerine **sıfır bağımlılıklı** bir yapıyla hazırlandı (yalnızca Node.js 20+). Sayfalar `build.mjs` ile üretilir, iletişim formu saf Node ile yazılmış bir API'ye bağlıdır. İleride Next.js'e geçmek isterseniz içerik (`content/`), tasarım (`src/styles.css`) ve form mantığı (`lib/contact.mjs`) olduğu gibi taşınabilir.

## 1. Teknoloji
- HTML + CSS + JavaScript (framework yok), Node.js 20+ (yalnızca yerleşik modüller)
- Sayfa üretici: `build.mjs` → `dist/` klasörü
- İletişim API'si: `lib/contact.mjs` (yerelde `server.mjs`, Vercel'de `api/contact.js`)
- E-posta gönderimi: Resend (ortam değişkenleriyle), isteğe bağlı Cloudflare Turnstile
- Yazı tipi: sistem yazı tipleri (Manrope/Inter varsa onlar). Manrope'u kendi sunucundan yüklemek için aşağıya bak.

## 2. Klasör yapısı
```
ancvertex/
├─ content/tr/
│  ├─ site.json        ← menü, hizmetler, süreç, hakkımızda metinleri, iletişim e-postası, sosyal hesaplar
│  └─ projects.json    ← TÜM projeler burada (tek veri kaynağı)
├─ src/
│  ├─ styles.css       ← tasarım sistemi (renkler :root içinde)
│  ├─ main.js          ← menü, filtre, animasyon, form
│  └─ noscript.css
├─ lib/
│  ├─ icons.mjs        ← ikon seti
│  ├─ art.mjs          ← konsept proje görselleri (SVG üretici)
│  └─ contact.mjs      ← form doğrulama + e-posta gönderimi
├─ api/contact.js      ← Vercel fonksiyonu
├─ public/assets/      ← logo (şeffaf), favicon, paylaşım görseli
├─ scripts/check.mjs   ← bozuk bağlantı / h1 / alt metin kontrolü
├─ build.mjs           ← sayfa üretici
├─ server.mjs          ← yerel/kendi sunucu için
├─ vercel.json         ← başlıklar (CSP vb.) ve derleme ayarı
└─ .env.example        ← gerekli ortam değişkenleri
```

## 3. Yerelde çalıştırma
```bash
node build.mjs         # dist/ üretir
node server.mjs        # http://localhost:3000
node scripts/check.mjs # bağlantı ve işaretleme kontrolü
```
Form, e-posta anahtarları girilmeden **bilerek çalışmaz** ve "yapılandırılmadı" mesajı döner (sahte başarı göstermez).
Yerelde denemek için:
```bash
RESEND_API_KEY=... CONTACT_TO_EMAIL=sen@ornek.com CONTACT_FROM_EMAIL="ANC Vertex <form@dogrulanmis-alan.com>" node server.mjs
```

## 4. İnternette yayınlama (Vercel)
1. Klasörü bir GitHub deposuna yükle (`.env` dosyası ve `dist/` yüklenmez, `.gitignore` bunu sağlar).
2. vercel.com → *Add New Project* → depoyu seç. Ayarlar `vercel.json` içinde hazır (build: `node build.mjs`, çıktı: `dist`).
3. *Settings → Environment Variables* bölümüne `.env.example` içindeki değişkenleri gir.
4. Deploy et. `https://proje-adi.vercel.app` adresinde siteyi ve formu dene.

Kendi sunucunda (VPS): `node build.mjs && PORT=3000 node server.mjs` ve önüne Nginx/Caddy ile HTTPS koy.

## 5. `ancvertex.com` alan adını bağlama
1. Vercel → Project → *Settings → Domains* → `ancvertex.com` ve `www.ancvertex.com` ekle.
2. Vercel'in gösterdiği DNS kayıtlarını alan adını aldığın firmada gir (genelde kök için `A` kaydı, `www` için `CNAME`).
3. Yayılması birkaç dakika–saat sürer; HTTPS sertifikası otomatik kurulur.
4. `SITE_URL=https://ancvertex.com` ortam değişkenini ekleyip yeniden deploy et (canonical, sitemap ve paylaşım meta verileri buna göre üretilir).
5. Google Search Console'a alan adını ekle ve `https://ancvertex.com/sitemap.xml` adresini gönder.

## 6. Hâlâ gerekli ayarlar
| Ne | Neden |
|---|---|
| Resend hesabı + API anahtarı (`RESEND_API_KEY`) | Form e-postalarını göndermek için |
| Doğrulanmış gönderen adresi (`CONTACT_FROM_EMAIL`) | Resend yalnızca doğrulanmış alan adından gönderir |
| Taleplerin geleceği adres (`CONTACT_TO_EMAIL`) | Kendi e-posta adresin |
| `SITE_URL` | Doğru canonical/sitemap için |
| (İsteğe bağlı) Turnstile `TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET` | Ek spam koruması |
| Gizlilik metninin gözden geçirilmesi | Metin taslaktır; gerçek veri akışına göre doğrulanmalı |

Sitede **uydurma e-posta, telefon, adres veya sosyal medya hesabı yoktur.** Gerçek bilgileri `content/tr/site.json` → `contact` bölümüne yazınca footer ve iletişim sayfasında otomatik görünür.

## 7. Gerçek proje ve görselleri değiştirme
- `content/tr/projects.json` içine yeni bir kayıt ekle. Boş bıraktığın alanlar (`liveUrl`, `sourceUrl`, `tech` …) sayfada hiç gösterilmez.
- `kind: "Konsept"` olan kayıtlar "Konsept görseli" rozeti alır. Gerçek proje için `kind` değerini `"Gerçek proje"` yap.
- Gerçek ekran görüntüsü kullanmak için resmi `public/assets/projects/<slug>.webp` olarak koy ve `build.mjs` içindeki proje görsel yolunu (`/assets/projects/${p.slug}.svg`) `.webp` yap; ya da `art` alanıyla otomatik üretilen konsept görselini kullanmaya devam et.
- Proje ekledikten sonra `node build.mjs` çalıştır.
- Hakkımızda sayfasına kurucu bilgisi eklemek için `site.json` → `about.founder` alanını doldur (şu an `null`, bölüm gizli).

### Manrope yazı tipini ekleme
`Manrope-Variable.woff2` dosyasını `public/fonts/` içine koy, `src/styles.css` başındaki yorum satırındaki `@font-face` bloğunu aç.

## 8. Tamamlanmayan / test edilmesi gerekenler
- Tarayıcıda görsel test: bu ortamda tarayıcı olmadığı için 320–1440 px düzenleri **gözle test edilemedi**; yayından önce telefonda ve masaüstünde gez.
- Lighthouse puanı ölçülmedi; yayından sonra ölçüp düzeltmeler yapılmalı.
- Form: Resend anahtarları girilip gerçek bir deneme gönderimi yapılmalı. Bellek içi hız sınırı sunucusuz ortamda örnek başına çalışır; asıl koruma için Turnstile önerilir.
- İngilizce: içerik `content/tr/` altında; `content/en/` eklenip `SITE_LOCALE=en` ile üretilebilir, ancak ayrı alan/yol (`/en/`) ve dil seçici henüz yapılmadı.
- Gizlilik politikası taslaktır; hukuki doğrulama gerekir.
