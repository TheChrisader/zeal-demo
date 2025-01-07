import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();

self.addEventListener("push", (event) => {
  console.log(event.data?.json());
  const notification = event.data?.json();
  const options = {
    body: notification?.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    image: notification?.thumbnail,
    data: {
      url: self.registration.scope + "en/post/" + notification?.postSlug,
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      notification?.title || "For you",
      options,
    ),
  );
});

// self.addEventListener("pushsubscriptionchange", (event) => {
//   console.log('Subscription expired');
//   event.waitUntil(
//     self.registration.pushManager.subscribe({ userVisibleOnly: true })
//     .then(function(subscription) {
//       console.log('Subscribed after expiration', subscription.endpoint);
//       return fetch('register', {
//         method: 'post',
//         headers: {
//           'Content-type': 'application/json'
//         },
//         body: JSON.stringify({
//           endpoint: subscription.endpoint
//         })
//       });
//     })
//   );

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  disableDevLogs: true,
  fallbacks: {
    entries: [
      {
        url: "/downloads", // the page that'll display if user goes offline
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
