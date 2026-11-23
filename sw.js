
// Tanylel Feeds service worker
const CACHE_NAME = "tanylel-feeds-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192-1.png",
  "./icon-512-3.png"
];

// Install and cache website files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        FILES_TO_CACHE.map(async (file) => {
          try {
            await cache.add(file);
          } catch (error) {
            console.log("Could not cache:", file);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

// Activate and remove old Tanylel caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith("tanylel-feeds-") &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});

// Load cached files when offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(async (cached) => {
      if (cached) return cached;

      try {
        return await fetch(event.request);
      } catch (error) {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
        throw error;
      }
    })
  );
});
