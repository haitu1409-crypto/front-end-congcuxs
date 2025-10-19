/**
 * WebVitalsOptimizer - Tối ưu Core Web Vitals
 * Giảm CLS, cải thiện LCP, FCP, FID, INP
 */

import { useEffect } from 'react';

const WebVitalsOptimizer = () => {
  useEffect(() => {
    // 1. Preload critical resources
    const preloadCriticalResources = () => {
      // Preload hero image
      const heroImg = document.querySelector('.heroImage');
      if (heroImg) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = heroImg.src;
        document.head.appendChild(link);
      }

      // Preload featured images
      const featuredImgs = document.querySelectorAll('.featuredImage');
      featuredImgs.forEach((img, index) => {
        if (index < 3) { // Only preload first 3
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = img.src;
          document.head.appendChild(link);
        }
      });
    };

    // 2. Optimize font loading
    const optimizeFonts = () => {
      // Add font-display: swap to all fonts
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'system-fonts';
          src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    };

    // 3. Reduce layout shifts
    const reduceLayoutShifts = () => {
      // Set explicit dimensions for images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.style.width && !img.style.height) {
          img.style.width = img.width ? `${img.width}px` : '100%';
          img.style.height = img.height ? `${img.height}px` : 'auto';
        }
      });

      // Reserve space for dynamic content
      const containers = document.querySelectorAll('.heroImageContainer, .featuredImageContainer, .articleImageContainer');
      containers.forEach(container => {
        container.style.minHeight = container.style.minHeight || '120px';
      });
    };

    // 4. Optimize interactions
    const optimizeInteractions = () => {
      // Add touch-action for better mobile performance
      const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
      interactiveElements.forEach(el => {
        el.style.touchAction = 'manipulation';
      });
    };

    // 5. Monitor and report CLS
    const monitorCLS = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              console.log('CLS Entry:', {
                value: entry.value,
                sources: entry.sources?.map(source => ({
                  node: source.node?.tagName,
                  currentRect: source.currentRect,
                  previousRect: source.previousRect
                }))
              });
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Run optimizations
    preloadCriticalResources();
    optimizeFonts();
    reduceLayoutShifts();
    optimizeInteractions();
    monitorCLS();

    // Cleanup
    return () => {
      // Remove any added elements if needed
    };
  }, []);

  return null; // This component doesn't render anything
};

export default WebVitalsOptimizer;












