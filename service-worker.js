const CACHE_NAME = 'gamificacao-dev-cache-v5'; // Alterado para v5 para garantir que o cache antigo seja limpo e force a atualização
const urlsToCache = [
    // CORRIGIDO: Caminhos prefixados com o nome real do repositório 'app'.
    '/app/', // Representa o root da aplicação no GitHub Pages
    '/app/index.html',
    '/app/style.css',
    '/app/script.js',
    '/app/manifest.json',
    // Ícones
    '/app/icons/apple-touch-icon.png',
    '/app/icons/favicon-32x32.png',
    '/app/icons/favicon-16x16.png',
    '/app/icons/favicon.ico',
    '/app/icons/icon-72x72.png',
    '/app/icons/icon-96x96.png',
    '/app/icons/icon-128x128.png',
    '/app/icons/icon-144x144.png',
    '/app/icons/icon-152x152.png',
    '/app/icons/icon-192x192.png',
    '/app/icons/icon-384x384.png',
    '/app/icons/icon-512x512.png',
    // Para cachear Google Fonts (opcional, como você notou)
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
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