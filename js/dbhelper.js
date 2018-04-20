/**
 * Common database helper functions.
 */
let dbPromise = idb.open('restaurant-db', 1, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
  case 0:
    var keyValStore = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
  }
});

function storeAllValues(data){
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants', 'readwrite');
    var restaurantsStore = tx.objectStore('restaurants');

    data.forEach(value => restaurantsStore.put(value));

    return tx.complete;
  }).then(function() {
    // console.log('All data added');
  });
}

function getAllValues(){
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants');
    var restaurantsStore = tx.objectStore('restaurants');

    return restaurantsStore.getAll();
  });
}

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000; // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  static get SERVER_API_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
    // return `/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  // static fetchRestaurants(callback) {
  //   let xhr = new XMLHttpRequest();
  //   xhr.open('GET', DBHelper.SERVER_API_URL);
  //   xhr.onload = () => {
  //     // console.log("loaded");
  //     // console.log(xhr);
  //     if (xhr.status === 200) { // Got a success response from server!
  //       const json = JSON.parse(xhr.responseText);
  //       const restaurants = json;
  //       callback(null, restaurants);
  //     } else { // Oops!. Got an error from server.
  //       const error = (`Request failed. Returned status of ${xhr.status}`);
  //       callback(error, null);
  //     }
  //   };
  //   xhr.onerror = () => {
  //     console.log('error');
  //     console.log(xhr);
  //   };
  //   xhr.send();
  // }

  static fetchRestaurants(callback) {
    getAllValues().then(function(values){
      if (values.length > 0) {
        // console.log('values found');
        // console.log(values);
        const restaurants = values;
        callback(null, restaurants);
      }
      fetch(DBHelper.SERVER_API_URL)
        .then(function(response){
          // console.log('fetch OK');
          return response.json();
        }).then(function(data){
          storeAllValues(data);
          if (values.length <= 0){
            // console.log('callback inside fetch OK')
            const restaurants = data;
            callback(null, restaurants);
          }
        }).catch(function(responseError){
          if(values.length <= 0){
            const error = (`Request failed with error: ${responseError}`);
            callback(error, null);
          }
        });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
