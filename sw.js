
if('serviceWorker' in navigator) {
    navigator.serviceWorker
           .register('/sw.js')
        //    .then(function() { console.log("Service Worker Registered"); })
           .catch(err => console.log(err));
}



let cacheName = 'ltm-workspace_cache';
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
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
                // "/sw.js",
                "/js/config.js" ,
                "/js/views.js" ,
                "/js/app.js" ,
                "/js/modals.js" ,
                "/js/db.js" ,
                ]
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    self.skipWaiting();
// console.log(event.request);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});