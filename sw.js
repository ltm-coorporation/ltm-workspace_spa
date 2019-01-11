
if('serviceWorker' in navigator) {
    navigator.serviceWorker
           .register('/sw.js')
           .then(function(reg) { 
            //    console.log("Service Worker Registered"); 
            //    setTimeout(function(){reg.update()}, '3000')
            })
           .catch(err => console.log(err));
}



let cacheName = 'ltm-workspace_cache';
self.addEventListener('install', function(event) {
    /**
     * Steps todo 2-3
     *   
     *  2. delete previous cache
     *  3. add components to cache
     */
    // console.log('installing ');
    self.skipWaiting();
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            //   console.log(cacheNames);
            // console.log('deleting');
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                return true;
                }).map(function(cacheName) {
                //   console.log(cacheName);
                return caches.delete(cacheName);
                })
            );
        })
        .then(res => {        
            caches.open(cacheName).then(function(cache) {
                // console.log('adding');
                return cache.addAll(
                    [
                    "/bower_components/bootstrap/dist/css/bootstrap.min.css",
                    "/bower_components/select2/dist/css/select2.min.css",
                    "/bower_components/select2-bootstrap-theme/dist/select2-bootstrap.min.css",
                    "/bower_components/jquery/dist/jquery.slim.min.js",
                    "/bower_components/popper.js/dist/umd/popper.min.js",
                    "/bower_components/bootstrap/dist/js/bootstrap.min.js" ,
                    "/bower_components/select2/dist/js/select2.min.js" ,
                    "/bower_components/handlebars/handlebars.min.js" ,
                    "/bower_components/vanilla-router/dist/vanilla-router.min.js" ,
                    "/bower_components/pouchdb/dist/pouchdb.min.js" ,
                    "/bower_components/pouchdb/dist/pouchdb.find.min.js" ,
                    "/",
                    "/sw.js",
                    "/js/config.js" ,
                    "/js/views.js" ,
                    "/js/app.js" ,
                    "/js/modals.js" ,
                    "/js/handlers.js",
                    "/js/db.js" ,
                    ]
                );
            })
        })
    );
});


self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            if(response){
                return response;
            }

            let reqURL = new URL(event.request.url);


            // for db server
            if(reqURL.port == 5984){
                return fetch(event.request);
            } else {
                return caches.open(cacheName).then(function(cache) {
                    return fetch(event.request).then(function(response) {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
            }
        })
        .catch(err  => caches.match('/'))        
    );
});

// self.addEventListener('activate', function(event) {
//     // console.log(event);
//     event.waitUntil(
//       caches.keys().then(function(cacheNames) {
//         //   console.log(cacheNames);
//         return Promise.all(
//           cacheNames.filter(function(cacheName) {
//             return true;
//           }).map(function(cacheName) {
//             //   console.log(cacheName);
//             return caches.delete(cacheName);
//           })
//         );
//       })
//       .then(res => window.location.reload)
//     );
//   });
let version = 0.016;