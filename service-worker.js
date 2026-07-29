const CACHE_NAME='nextmatch-v15';
const APP_SHELL=[
  '/GPTomgeving/',
  '/GPTomgeving/index.html',
  '/GPTomgeving/manifest.webmanifest',
  '/GPTomgeving/assets/nextmatch-mark.svg',
  '/GPTomgeving/assets/nextmatch-logo-light.svg',
  '/GPTomgeving/assets/product-v12.css',
  '/GPTomgeving/assets/mobile-v15.css',
  '/GPTomgeving/assets/mobile-v15.js'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
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
  event.respondWith(
    fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      return response;
    }).catch(()=>caches.match(request).then(cached=>cached||caches.match('/GPTomgeving/index.html')))
  );
});
