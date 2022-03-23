/* eslint-disable no-restricted-globals */

// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    // console.log(event);
    const payload = JSON.parse(event.data.text());

    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const options = {
        body: payload.message,
        icon: 'assets/flash.png'
    };

    event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    // eslint-disable-next-line no-undef
    event.waitUntil(clients.openWindow('notification'));
});
