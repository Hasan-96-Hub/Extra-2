const CACHE='jlpt-n3-n2-n1-flipbook-v4';
const ASSETS=['./','./index.html','./styles.css','./app.js','./book-data.js','./manifest.webmanifest','./vendor/page-flip.browser.js','./assets/icon.svg','./assets/page-flip.mp3'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{if(x&&x.ok){const copy=x.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return x;}).catch(()=>caches.match('./index.html'))));});
