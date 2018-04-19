

var dbPromise = idb.open('restaurant-db', 1, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
    case 0:
    var keyValStore = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
  }
});

// dbPromise.then(function(db) {
//   var tx = db.transaction('restaurants', 'readwrite');
//   var restaurantsStore = tx.objectStore('restaurants');
//
//   //TODO
//   //restaurantsJSON.restaurants.forEach(data => restaurantsStore.put(data));
//
//   return tx.complete;
// }).then(function() {
//   console.log('Restaurants added');
// });

dbPromise.then(function(db) {
  var tx = db.transaction('restaurants');
  var restaurantsStore = tx.objectStore('restaurants');
  //TODO
  return restaurantsStore.get(3);
}).then(function(val) {
  if(!val){
    //TODO
    //return storeSingleValue(singleRestaurant);
  }
}).then(function() {
  console.log('fine GET + PUT');
})


function storeAllValues(data){
  console.log('entered');
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants', 'readwrite');
    var restaurantsStore = tx.objectStore('restaurants');

    data.forEach(value => restaurantsStore.put(value));

    return tx.complete;
  }).then(function() {
    console.log('All data added');
  });
}

function storeSingleValue(singleValue){
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants', 'readwrite');
    var restaurantsStore = tx.objectStore('restaurants');

    restaurantsStore.put(singleValue);

    return tx.complete;
  }).then(function() {
    console.log('singleValue added');
  });
}
