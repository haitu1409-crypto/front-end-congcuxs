import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for image optimization and performance monitoring
 */
export const useImageOptimization = (src, options = {}) => {
    const {
        priority = false,
        quality = 75,
        placeholder = 'blur',
        blurDataURL,
        onLoad,
        onError,
        ...restOptions
    } = options;

    const [imageState, setImageState] = useState({
        isLoaded: false,
        isError: false,
        isInView: priority,
        loadTime: null,
        error: null
    });

    const [ref, setRef] = useState(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || imageState.isInView || !ref) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setImageState(prev => ({ ...prev, isInView: true }));
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before image comes into view
                threshold: 0.1
            }
        );

        observer.observe(ref);

        return () => observer.disconnect();
    }, [priority, imageState.isInView, ref]);

    // Handle image load
    const handleLoad = useCallback((event) => {
        const loadTime = performance.now();
        setImageState(prev => ({
            ...prev,
            isLoaded: true,
            loadTime
        }));

        if (onLoad) {
            onLoad(event);
        }
    }, [onLoad]);

    // Handle image error
    const handleError = useCallback((event) => {
        setImageState(prev => ({
            ...prev,
            isError: true,
            error: event.error || new Error('Failed to load image')
        }));

        if (onError) {
            onError(event);
        }
    }, [onError]);

    // Default blur placeholder
    const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

    // Return optimized image props
    const imageProps = {
        src,
        priority,
        quality,
        placeholder,
        blurDataURL: blurDataURL || defaultBlurDataURL,
        onLoad: handleLoad,
        onError: handleError,
        ...restOptions
    };

    return {
        imageProps,
        imageState,
        setRef,
        isLoaded: imageState.isLoaded,
        isError: imageState.isError,
        isInView: imageState.isInView,
        loadTime: imageState.loadTime,
        error: imageState.error
    };
};

/**
 * Hook for monitoring image performance metrics
 */
export const useImagePerformance = () => {
    const [metrics, setMetrics] = useState({
        totalImages: 0,
        loadedImages: 0,
        failedImages: 0,
        averageLoadTime: 0,
        totalLoadTime: 0
    });

    const recordImageLoad = useCallback((loadTime) => {
        setMetrics(prev => {
            const newTotal = prev.totalImages + 1;
            const newLoaded = prev.loadedImages + 1;
            const newTotalTime = prev.totalLoadTime + loadTime;
            const newAverage = newTotalTime / newLoaded;

            return {
                ...prev,
                totalImages: newTotal,
                loadedImages: newLoaded,
                totalLoadTime: newTotalTime,
                averageLoadTime: newAverage
            };
        });
    }, []);

    const recordImageError = useCallback(() => {
        setMetrics(prev => ({
            ...prev,
            totalImages: prev.totalImages + 1,
            failedImages: prev.failedImages + 1
        }));
    }, []);

    const resetMetrics = useCallback(() => {
        setMetrics({
            totalImages: 0,
            loadedImages: 0,
            failedImages: 0,
            averageLoadTime: 0,
            totalLoadTime: 0
        });
    }, []);

    return {
        metrics,
        recordImageLoad,
        recordImageError,
        resetMetrics
    };
};

/**
 * Hook for preloading critical images
 */
export const useImagePreloader = () => {
    const [preloadedImages, setPreloadedImages] = useState(new Set());
    const [isPreloading, setIsPreloading] = useState(false);

    const preloadImage = useCallback((src) => {
        if (preloadedImages.has(src)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                setPreloadedImages(prev => new Set([...prev, src]));
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    }, [preloadedImages]);

    const preloadImages = useCallback(async (imageUrls) => {
        setIsPreloading(true);
        try {
            await Promise.all(imageUrls.map(preloadImage));
        } catch (error) {
            console.warn('Some images failed to preload:', error);
        } finally {
            setIsPreloading(false);
        }
    }, [preloadImage]);

    return {
        preloadedImages,
        isPreloading,
        preloadImage,
        preloadImages
    };
};

export default useImageOptimization;
