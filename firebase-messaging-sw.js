/* firebase-messaging-sw.js — BLURRD Links Push Notifications
   Host this file at the ROOT of your domain (same level as index.html)
   e.g. https://yourdomain.com/firebase-messaging-sw.js

   Fill in your Firebase config values below after connecting Firebase
   in the BLURRD Links Admin → Firebase Push Notifications panel.
*/
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// TODO: Replace with your Firebase config from Admin → Firebase Push Notifications
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed or not focused)
messaging.onBackgroundMessage(payload => {
  const { title = 'BLURRD Links ⛳', body = 'You have a new notification' } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: payload.notification?.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'snooze', title: 'Snooze 15 min' }
    ],
    requireInteraction: false,
    tag: payload.data?.tag || 'blurrd-notif'
  });
});

// Notification click — open app or snooze
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    e.waitUntil(
      new Promise(resolve => {
        setTimeout(() => {
          self.registration.showNotification(e.notification.title, {
            body: '[Snoozed] ' + e.notification.body,
            icon: e.notification.icon,
            tag: e.notification.tag + '-snoozed'
          });
          resolve();
        }, 15 * 60 * 1000);
      })
    );
    return;
  }
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
