/* eslint-disable no-restricted-globals */
"use strict";

/** @type {string} Cache name — bump version to force refresh on deploy */
const CACHE_NAME = 'matdaan-mitra-v3';

/** @type {string[]} Core assets to pre-cache on service worker install */
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

/**
 * Install event: Pre-cache all essential application shell assets.
 * skipWaiting() forces the new SW to activate immediately without waiting.
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

/**
 * Activate event: Purge all stale caches from previous SW versions.
 * clients.claim() lets this SW take control of all pages immediately.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

/**
 * Fetch event: Cache-first strategy for GET requests.
 * Falls back to network; caches dynamic responses for future offline use.
 * Serves index.html for offline navigation requests (SPA fallback).
 */
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') { return; }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) =>
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                })
            ).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('', { status: 408, statusText: 'Offline' });
            });
        })
    );
});
