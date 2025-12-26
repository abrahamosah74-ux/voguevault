'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Registers the PWA service worker for offline support
 */
export default function ServiceWorkerRegistry() {
  useEffect(() => {
    // Only register in production
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Check if we're in production (Vercel)
      const isProduction = process.env.NODE_ENV === 'production' || 
                          typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      
      if (isProduction) {
        window.addEventListener('load', async () => {
          try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
              scope: '/',
            });
            console.log('Service Worker registered:', registration);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute

            // Listen for new service worker
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is ready
                  console.log('New service worker ready, prompting user to update');
                  // You could show a notification here to update the app
                }
              });
            });
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        });
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
