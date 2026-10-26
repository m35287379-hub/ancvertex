// Yerel/kendi sunucunda çalıştırmak için bağımlılıksız sunucu: statik dist/ + POST /api/contact
// Kullanım: node build.mjs && node server.mjs   (PORT ortam değişkeniyle port seçilir)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact } from './lib/contact.mjs';

const DIST = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = Number(process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};

async function fileFor(pathname) {
  let p = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  let full = join(DIST, p);
  if (!full.startsWith(DIST)) return null;
  try {
    const s = await stat(full);
    if (s.isDirectory()) full = join(full, 'index.html');
    await stat(full);
    return full;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (status, headers, body) => { res.writeHead(status, { ...SECURITY, ...headers }); res.end(body); };

  if (url.pathname === '/api/contact') {
    if (req.method !== 'POST') return send(405, { Allow: 'POST', 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, message: 'Yalnızca POST desteklenir.' }));
    const chunks = [];
    let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > 20000) return send(413, { 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, message: 'İstek çok büyük.' }));
      chunks.push(c);
    }
    let body = null;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { /* geçersiz */ }
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    const { status, json } = await handleContact({ body, ip, env: process.env });
    return send(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, JSON.stringify(json));
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, { Allow: 'GET, HEAD' }, 'Method Not Allowed');

  // /hizmetler  →  /hizmetler/
  if (!extname(url.pathname) && !url.pathname.endsWith('/')) {
    return send(301, { Location: url.pathname + '/' + url.search }, '');
  }
  const file = await fileFor(url.pathname);
  if (!file) {
    const nf = await readFile(join(DIST, '404.html'));
    return send(404, { 'Content-Type': TYPES['.html'] }, req.method === 'HEAD' ? '' : nf);
  }
  const data = await readFile(file);
  const ext = extname(file);
  send(200, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  }, req.method === 'HEAD' ? '' : data);
}).listen(PORT, () => console.log(`ANC Vertex → http://localhost:${PORT}`));
