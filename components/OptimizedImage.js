import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className,
    style,
    priority = false,
    quality = 75,
    placeholder = 'blur',
    blurDataURL,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before image comes into view
                threshold: 0.1
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority, isInView]);

    // Default blur placeholder
    const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

    return (
        <div
            ref={imgRef}
            className={`optimized-image-container ${className || ''}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            {isInView ? (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
                    style={{
                        width: '100%',
                        height: 'auto',
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: isLoaded ? 1 : 0.7,
                        ...style
                    }}
                    priority={priority}
                    quality={quality}
                    placeholder={placeholder}
                    blurDataURL={blurDataURL || defaultBlurDataURL}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        console.warn(`Failed to load image: ${src}`);
                        setIsLoaded(true);
                    }}
                    {...props}
                />
            ) : (
                // Placeholder while not in view
                <div
                    className="image-placeholder"
                    style={{
                        width: '100%',
                        height: height ? `${height}px` : '200px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px',
                        ...style
                    }}
                >
                    📷
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
