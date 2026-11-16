/* Pescomante © 2026 Damiano (fir3dam). Tutti i diritti riservati. È vietato copiare, modificare, ridistribuire o riutilizzare in tutto o in parte il codice, i testi, i dati elaborati e la grafica di Pescomante, anche tramite strumenti di intelligenza artificiale, senza il permesso scritto dell’autore. Dati e componenti di terzi restano dei rispettivi autori (vedi Guida > Crediti). */
// Service worker di Pescomante: l'app si apre anche senza rete.
// Strategia: prima la rete (così gli aggiornamenti arrivano subito), se manca uso la copia salvata.
const CACHE = 'pescomante-v60-202611162328';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pescomante-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const meteo = /(^|\.)open-meteo\.com$/.test(url.hostname);
  if (!same && !meteo) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
