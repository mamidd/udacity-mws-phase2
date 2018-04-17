if (navigator.serviceWorker){
  navigator.serviceWorker.register('/sw.js');
}

(function() {
  'use strict';

  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }
  console.log("sto usando indexedDB");

  var dbPromise = idb.open('test-db', 1, function(upgradeDb) {
    switch(upgradeDb.oldVersion) {
      case 0:
        var keyValStore = upgradeDb.createObjectStore('keyval');
        keyValStore.put("world", "hello kitty");
    }
  });
})();
