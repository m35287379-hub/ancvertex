// İletişim formu iş mantığı. Hem yerel sunucu (server.mjs) hem Vercel fonksiyonu (api/contact.js) kullanır.
// Gizli anahtarlar yalnızca ortam değişkenlerinden okunur; istemciye asla gönderilmez.

const SERVICES = ['web', 'yazilim', 'yapay-zeka', 'dijital-urun', 'diger'];
const SERVICE_LABELS = {
  web: 'Web Tasarımı ve Geliştirme',
  yazilim: 'Yazılım Geliştirme',
  'yapay-zeka': 'Yapay Zekâ ve Otomasyon',
  'dijital-urun': 'Dijital Ürün',
  diger: 'Diğer'
};
const BUDGETS = {
  '': 'Belirtilmedi',
  belirsiz: 'Henüz belirsiz',
  kucuk: 'Küçük ölçekli proje',
  orta: 'Orta ölçekli proje',
  genis: 'Kapsamlı proje'
};

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;
const MIN_FILL_MS = 3000; // bot koruması: form çok hızlı gönderilirse reddet
const MAX_AGE_MS = 1000 * 60 * 60 * 6;

// Basit bellek içi hız sınırı (sunucusuz ortamda her örnek için ayrıdır; ek koruma için Turnstile önerilir).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, ' ');
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function validate(body) {
  const errors = {};
  const data = {
    name: oneLine(body.name, 100),
    email: oneLine(body.email, 200),
    service: oneLine(body.service, 40),
    budget: oneLine(body.budget, 20),
    message: clean(body.message, 4000)
  };
  if (data.name.length < 2) errors.name = 'Lütfen adını ve soyadını yaz.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Geçerli bir e-posta adresi yaz.';
  if (!SERVICES.includes(data.service)) errors.service = 'Lütfen bir hizmet seç.';
  if (!(data.budget in BUDGETS)) data.budget = '';
  if (data.message.length < 20) errors.message = 'Projeni birkaç cümleyle anlat (en az 20 karakter).';
  if (body.consent !== true && body.consent !== 'true' && body.consent !== 'on') {
    errors.consent = 'Devam etmek için gizlilik bilgilendirmesini onaylamalısın.';
  }
  return { data, errors };
}

async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) })
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

async function sendMail({ data, env }) {
  const base = env.RESEND_API_BASE || 'https://api.resend.com';
  const subject = `[ANC Vertex] Yeni proje talebi — ${data.name}`.slice(0, 150);
  const text =
    `Ad: ${data.name}\nE-posta: ${data.email}\nHizmet: ${SERVICE_LABELS[data.service]}\nBütçe: ${BUDGETS[data.budget]}\n\n${data.message}\n`;
  const html =
    `<p><strong>Ad:</strong> ${escHtml(data.name)}<br><strong>E-posta:</strong> ${escHtml(data.email)}<br>` +
    `<strong>Hizmet:</strong> ${escHtml(SERVICE_LABELS[data.service])}<br><strong>Bütçe:</strong> ${escHtml(BUDGETS[data.budget])}</p>` +
    `<p style="white-space:pre-wrap">${escHtml(data.message)}</p>`;
  const res = await fetch(`${base}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: data.email,
      subject,
      text,
      html
    })
  });
  return res.ok;
}

export function isConfigured(env) {
  return Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL);
}

/** @returns {Promise<{status:number, json:object}>} */
export async function handleContact({ body, ip = 'unknown', env = process.env }) {
  if (!body || typeof body !== 'object') {
    return { status: 400, json: { ok: false, message: 'Geçersiz istek.' } };
  }

  // Bal küpü alanı: bot doldurduysa sessizce başarılı gibi davran.
  if (clean(body.website, 200)) return { status: 200, json: { ok: true, message: 'Mesajın alındı.' } };

  const { data, errors } = validate(body);
  if (Object.keys(errors).length) {
    return { status: 422, json: { ok: false, errors, message: 'Lütfen işaretli alanları kontrol et.' } };
  }

  // Doldurma süresi kontrolü (ts alanı varsa)
  const ts = Number(body.ts);
  if (ts) {
    const age = Date.now() - ts;
    if (age < MIN_FILL_MS || age > MAX_AGE_MS) {
      return { status: 429, json: { ok: false, message: 'Form çok hızlı gönderildi. Lütfen birkaç saniye sonra tekrar dene.' } };
    }
  }

  if (rateLimited(ip)) {
    return { status: 429, json: { ok: false, message: 'Kısa sürede çok fazla deneme yapıldı. Lütfen biraz sonra tekrar dene.' } };
  }

  if (!isConfigured(env)) {
    return {
      status: 503,
      json: { ok: false, code: 'not_configured', message: 'İletişim formu henüz yapılandırılmadı; mesajın gönderilemedi. Lütfen daha sonra tekrar dene.' }
    };
  }

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(body['cf-turnstile-response'], env.TURNSTILE_SECRET, ip);
    if (!ok) return { status: 400, json: { ok: false, message: 'Spam doğrulaması tamamlanamadı. Lütfen tekrar dene.' } };
  }

  try {
    const sent = await sendMail({ data, env });
    if (!sent) throw new Error('mail_failed');
  } catch {
    return { status: 502, json: { ok: false, message: 'Mesaj şu anda iletilemedi. Lütfen biraz sonra tekrar dene.' } };
  }
  return { status: 200, json: { ok: true, message: 'Mesajın alındı. En kısa sürede dönüş yapılacak.' } };
}
