var staticCacheName = 'restaurant-v2';
var contentImgsCache = 'content-imgs';
var allCaches = [
  staticCacheName
];

let dbPromise = new Promise((resolve, reject) => {
  const openreq = indexedDB.open('restaurant-db', 1);

  openreq.onerror = () => {
    reject(openreq.error);
  };

  openreq.onupgradeneeded = () => {
    openreq.result.createObjectStore('restaurants', { keyPath: 'id' });
//    openreq.result.transaction.objectStore('restaurants').createIndex('byId', 'id');
  };

  openreq.onsuccess = () => {
    resolve(openreq.result);
  };
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        '/index.html',
        '/restaurant.html',
        'css/styles.css'
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
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/index.html'));
      return;
    }

    if (requestUrl.pathname.includes('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
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
  }else{
    if (requestUrl.pathname.endsWith('/restaurants')) {
      return getAllValues().then(function(values){
        if (values.length > 0) {
          // console.log('SW: values returned suddenly');
          // console.log(values);
          return new Response(values);
        }else{
          return fetch(event.request)
            .then(response => response.json())
            .then(function(data){
            // console.log('SW: values storing');
            // console.log(data);
              storeAllValues(data);
              return data;
            }).catch(function(err){
              console.log(err);
              return;
            });
        }
      });
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


function storeAllValues(data){
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants', 'readwrite');
    var restaurantsStore = tx.objectStore('restaurants');

    data.forEach(value => restaurantsStore.put(value));

    return tx.complete;
  }).then(function() {
    console.log('storeAllValues: All data added');
  });
}

function getAllValues(){
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants');
    var restaurantsStore = tx.objectStore('restaurants');
    //return restaurantsStore.getAll();

    return new Promise((resolve, reject) => {
      const openreq = restaurantsStore.getAll();
      openreq.onerror = () => {reject(openreq.error);};
      openreq.onsuccess = () => {resolve(openreq.result);};
    });

  }).then(function(response) {
    console.log('getAllValues: All data returned');
    return response;
  });
}
