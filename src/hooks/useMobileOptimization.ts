'use client';

import { useEffect } from 'react';

/**
 * Mobile Optimization Hook
 * Handles mobile-specific interactions and improvements
 */
export function useMobileOptimization() {
  useEffect(() => {
    // Prevent zoom on double-tap for form inputs
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Handle viewport height changes (mobile keyboards appear/disappear)
    const handleViewportChange = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', handleViewportChange);
    handleViewportChange(); // Set initial value

    return () => {
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);
}

/**
 * Mobile Detection Hook
 * Returns device information
 */
export function useMobileDetect() {
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isMobile) {
      document.documentElement.setAttribute('data-device', 'mobile');
    }
    if (isIOS) {
      document.documentElement.setAttribute('data-os', 'ios');
    }
    if (isAndroid) {
      document.documentElement.setAttribute('data-os', 'android');
    }
  }, []);

  return {
    isMobile: /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
  };
}
