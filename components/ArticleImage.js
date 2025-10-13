import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useImageOptimization } from '../hooks/useImageOptimization';

const ArticleImage = ({
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
    caption,
    showCaption = true,
    ...props
}) => {
    const { imageProps, imageState, setRef } = useImageOptimization(src, {
        priority,
        quality,
        placeholder,
        blurDataURL,
        onLoad: () => {
            console.log(`Image loaded: ${src}`);
        },
        onError: (error) => {
            console.warn(`Image failed to load: ${src}`, error);
        }
    });

    return (
        <div
            ref={setRef}
            className={`article-image-container ${className || ''}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                margin: '20px auto',
                maxWidth: '500px',
                ...style
            }}
        >
            {imageState.isInView ? (
                <>
                    <Image
                        {...imageProps}
                        alt={alt}
                        width={width}
                        height={height}
                        className={`article-image ${imageState.isLoaded ? 'loaded' : 'loading'}`}
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '280px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            transition: 'opacity 0.3s ease-in-out',
                            opacity: imageState.isLoaded ? 1 : 0.7,
                            filter: imageState.isLoaded ? 'none' : 'blur(1px)',
                            ...style
                        }}
                        {...props}
                    />
                    {showCaption && caption && (
                        <p className="image-caption" style={{
                            fontSize: '13px',
                            color: '#757575',
                            fontStyle: 'italic',
                            marginTop: '8px',
                            textAlign: 'center',
                            maxWidth: '500px',
                            width: '100%'
                        }}>
                            {caption}
                        </p>
                    )}
                </>
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
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200px 100%',
                        animation: 'shimmer 1.5s infinite'
                    }}
                >
                    📷
                </div>
            )}

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200px 0;
                    }
                    100% {
                        background-position: calc(200px + 100%) 0;
                    }
                }
                
                .article-image {
                    will-change: transform;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    content-visibility: auto;
                    contain-intrinsic-size: 500px 280px;
                }
                
                .article-image.loading {
                    opacity: 0.7;
                    filter: blur(1px);
                }
                
                .article-image.loaded {
                    opacity: 1;
                    filter: none;
                }
                
                @media (max-width: 768px) {
                    .article-image {
                        max-height: 220px;
                        contain-intrinsic-size: 100% 220px;
                    }
                }
                
                @media (max-width: 480px) {
                    .article-image {
                        max-height: 180px;
                        contain-intrinsic-size: 100% 180px;
                    }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .article-image {
                        transition: none;
                    }
                    
                    .image-placeholder {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default ArticleImage;
