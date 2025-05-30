const CACHE_NAME = 'gamificacao-dev-cache-v2'; // Alterado para v2 para garantir que o cache antigo seja limpo
const urlsToCache = [
    // Arquivos essenciais para o funcionamento offline
    '/', // Representa o index.html na raiz do escopo do service worker
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    // Ícones (verifique se você tem esses arquivos na sua pasta 'icons')
    'icons/apple-touch-icon.png',
    'icons/favicon-32x32.png',
    'icons/favicon-16x16.png',
    'icons/favicon.ico',
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-128x128.png',
    'icons/icon-144x144.png',
    'icons/icon-152x152.png',
    'icons/icon-192x192.png',
    'icons/icon-384x384.png',
    'icons/icon-512x512.png'
    // Adicione outras fontes, imagens, etc., se forem importantes para o offline
    // Exemplo: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap', // Se você quiser cachear a fonte do Google Fonts
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache aberto durante a instalação.');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Falha ao adicionar URLs ao cache durante a instalação:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('Service Worker: Servindo do cache:', event.request.url);
                    return response;
                }
                console.log('Service Worker: Buscando da rede:', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('Service Worker: Erro durante o fetch:', error);
                // Opcional: Retornar uma página offline se o fetch falhar
                // return caches.match('/offline.html'); 
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
