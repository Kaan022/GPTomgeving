const CACHE_NAME='nextmatch-v17';
const APP_SHELL=[
  '/GPTomgeving/',
  '/GPTomgeving/index.html',
  '/GPTomgeving/manifest.webmanifest',
  '/GPTomgeving/assets/nextmatch-mark.svg',
  '/GPTomgeving/assets/product-v12.css',
  '/GPTomgeving/assets/mobile-v15.css',
  '/GPTomgeving/assets/mobile-v17.js',
  '/GPTomgeving/assets/periodisation-ai-v16.css',
  '/GPTomgeving/assets/periodisation-mobile-v16.css',
  '/GPTomgeving/assets/periodisation-ai-v17.js',
  '/GPTomgeving/assets/weekplanner-migration-v17.js',
  '/GPTomgeving/assets/boot-v17.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.allSettled(APP_SHELL.map(url=>cache.add(url)))).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.includes('/supabase/')||url.pathname.includes('/auth/'))return;

  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put('/GPTomgeving/index.html',copy));
      return response;
    }).catch(()=>caches.match('/GPTomgeving/index.html')));
    return;
  }

  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy))}
    return response;
  }).catch(()=>caches.match(request)));
});