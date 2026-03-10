// Performance Optimization Utilities
import React from 'react';

// 1. Image lazy loading with intersection observer
export const useImageLazyLoad = (ref) => {
  React.useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);
};

// 2. Request debouncing for API calls
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// 3. Request throttling
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 4. Memoization for expensive calculations
export const memoize = (func) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];
    const result = func(...args);
    cache[key] = result;
    return result;
  };
};

// 5. Cache management
export const cacheData = (key, data, expiresIn = 3600) => {
  const item = {
    value: data,
    expiry: Date.now() + expiresIn * 1000
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCachedData = (key) => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  const cached = JSON.parse(item);
  if (Date.now() > cached.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return cached.value;
};

// 6. Image optimization
export const getOptimizedImageUrl = (url, width = 400, height = 400) => {
  if (!url) return null;
  
  // If using cloudinary
  if (url.includes('cloudinary')) {
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
  }
  
  return url;
};

// 7. Code splitting helper
export const loadComponent = (importFunc) => {
  return React.lazy(() =>
    importFunc().catch(() => ({
      default: () => <div>Component failed to load</div>
    }))
  );
};

// 8. Virtual scrolling for large lists
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const startIndex = 0; // In a real implementation, track scrollTop
  const endIndex = Math.ceil(containerHeight / itemHeight);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return { visibleItems, startIndex };
};

// 9. Local Storage management
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// 10. Analytics tracking
export const trackEvent = (eventName, eventData = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }
};

// 11. Performance monitoring
export const reportWebVitals = (metric) => {
  console.log('Web Vitals:', metric);
  
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      event_label: metric.id,
    });
  }
};

// 12. Skeleton loader component
export const Skeleton = ({ height = '20px', width = '100%', className = '' }) => (
  <div
    className={`bg-gray-300 animate-pulse rounded ${className}`}
    style={{ height, width }}
  />
);

// 13. Service worker registration for offline support
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  }
};

// 14. Network status detection
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
