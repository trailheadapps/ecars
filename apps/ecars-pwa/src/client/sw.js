/* eslint-disable no-restricted-globals */

import { precacheAndRoute } from 'workbox-precaching';

// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(event);
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
    event.waitUntil(clients.openWindow('notification'));
});

precacheAndRoute(self.__WB_MANIFEST);
