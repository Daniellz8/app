const CACHE_NAME = 'gamificacao-dev-cache-v3'; // Alterado para v3 para garantir que o cache antigo seja limpo
const urlsToCache = [
    // Arquivos essenciais para o funcionamento offline
    '/GamificacaoPessoal/', // Representa o root da aplicação no GitHub Pages
    '/GamificacaoPessoal/index.html',
    '/GamificacaoPessoal/style.css',
    '/GamificacaoPessoal/script.js',
    '/GamificacaoPessoal/manifest.json',
    // Ícones (verifique se você tem esses arquivos na sua pasta 'icons')
    '/GamificacaoPessoal/icons/apple-touch-icon.png',
    '/GamificacaoPessoal/icons/favicon-32x32.png',
    '/GamificacaoPessoal/icons/favicon-16x16.png',
    '/GamificacaoPessoal/icons/favicon.ico',
    '/GamificacaoPessoal/icons/icon-72x72.png',
    '/GamificacaoPessoal/icons/icon-96x96.png',
    '/GamificacaoPessoal/icons/icon-128x128.png',
    '/GamificacaoPessoal/icons/icon-144x144.png',
    '/GamificacaoPessoal/icons/icon-152x152.png',
    '/GamificacaoPessoal/icons/icon-192x192.png',
    '/GamificacaoPessoal/icons/icon-384x384.png',
    '/GamificacaoPessoal/icons/icon-512x512.png',
    // Adicione outras fontes, imagens, etc., se forem importantes para o offline
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' // Google Fonts
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
