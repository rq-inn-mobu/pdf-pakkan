// serice-worker.js
const CACHE_NAME = "pdf-guuu-v1.0";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./js/ui.js",
  "./js/main.js",
  "./js/select_language.js",
  "./js/select_file_folder.js",
  "./js/folder_output.js",
  "./js/join_logic.js",
  "./images/icon-512.png"
];

// インストール
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// フェッチ
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
