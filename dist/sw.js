var staticCacheName = 'restaurant-v2';
var basepath = '/dist/';
var allCaches = [
  staticCacheName
];


self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        basepath+'js/allIndex.js',
        basepath+'js/allRestaurant.js',
        basepath+'js/library/idb.js',
        basepath+'index.html',
        basepath+'restaurant.html',
        basepath+'css/styles.css'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === basepath) {
      event.respondWith(caches.match(basepath+'index.html'));
      return;
    }

    if (requestUrl.pathname.includes(basepath+'restaurant.html')) {
      event.respondWith(caches.match(basepath+'restaurant.html'));
      return;
    }

    if (requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.css') || requestUrl.pathname.endsWith('.html') || requestUrl.pathname.endsWith('.json')) {
      event.respondWith(
        caches.match(event.request).then(function(response) {
          return response || fetch(event.request);
        })
      );
      return;
    }

    if (requestUrl.pathname.endsWith('.jpg')) {
      event.respondWith(serveImg(event.request));
      return;
    }
  }
});

function serveImg(request) {
  let storageUrl = request.url;
  return caches.open(staticCacheName).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      return fetch(request).then(function(networkResponse) {
        if (networkResponse) cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      }).catch(function(){
        return response;
      });
    });
  });
}
