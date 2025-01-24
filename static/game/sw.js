self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.hostname.includes('line')) {
        // cancel request 
        event.respondWith(new Response(null, { status: 204 }));
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'noaka',
                    url: event.request.url,
                });
            });
        }).catch(error => console.error('Service Worker: Error sending message:', error));
    }
});
  