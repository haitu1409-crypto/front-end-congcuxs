/**
 * Modern News Page - Optimized for UX, SEO and Performance
 * Enhanced UI with better image rendering and user experience
 */

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../components/Layout';
import SEOOptimized from '../components/SEOOptimized';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import WebVitalsOptimizer from '../components/WebVitalsOptimizer';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from '../styles/NewsClassic.module.css';

// API functions with caching and error handling
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Enhanced in-memory cache with better performance
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for better caching
const MAX_CACHE_SIZE = 200; // Limit cache size

// Intersection Observer for lazy loading images
const imageObserverOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01
};

// Create shared Intersection Observer instance
let imageObserver = null;
if (typeof window !== 'undefined') {
    imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, imageObserverOptions);
}

const fetchWithCache = async (url, cacheKey, retries = 3) => {
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }

    // Create AbortController for better timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'max-age=600', // 10 minutes
                    'Accept': 'application/json',
                },
                // Add timeout to prevent hanging requests
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 429) {
                    // If rate limited, wait longer before retry
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 2000));
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Clean cache if it's too large
            if (cache.size >= MAX_CACHE_SIZE) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }

            cache.set(cacheKey, { data, timestamp: now });
            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            // Don't retry on abort (timeout)
            if (error.name === 'AbortError') {
                console.error(`Request timeout for ${cacheKey}`);
                if (cached) {
                    console.warn('Using cached data due to timeout');
                    return cached.data;
                }
                return getFallbackData(cacheKey);
            }

            console.error(`Fetch error (attempt ${attempt}/${retries}):`, error);

            // If this is the last attempt, return cached data or fallback data
            if (attempt === retries) {
                if (cached) {
                    console.warn('Using cached data due to API failure');
                    return cached.data;
                }
                // Return fallback data if API fails completely
                console.warn('API failed completely, using fallback data for:', cacheKey);
                return getFallbackData(cacheKey);
            }

            // Wait before retry (exponential backoff) - longer wait for 429 errors
            const baseDelay = Math.pow(2, attempt) * 1000;
            const delay = attempt === 1 ? baseDelay * 3 : baseDelay; // Extra delay for first retry
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const fetchArticles = async (params = {}) => {
    const queryParams = new URLSearchParams();

    // Only add params that have values
    queryParams.append('page', params.page || 1);
    queryParams.append('limit', params.limit || 12);
    queryParams.append('sort', params.sort || '-publishedAt');

    // Only add category if it has a value
    if (params.category) {
        queryParams.append('category', params.category);
    }

    // Only add search if it has a value
    if (params.search) {
        queryParams.append('search', params.search);
    }

    const cacheKey = `articles_${queryParams.toString()}`;
    return fetchWithCache(`${apiUrl}/api/articles?${queryParams}`, cacheKey);
};

const fetchFeaturedArticles = async (limit = 3, category = null) => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    if (category) {
        queryParams.append('category', category);
    }

    const cacheKey = `featured_${limit}_${category || 'all'}`;
    return fetchWithCache(`${apiUrl}/api/articles/featured?${queryParams}`, cacheKey);
};

const fetchTrendingArticles = async (limit = 8) => {
    const cacheKey = `trending_${limit}`;
    return fetchWithCache(`${apiUrl}/api/articles/trending?limit=${limit}`, cacheKey);
};

const fetchCategories = async () => {
    const cacheKey = 'categories';
    return fetchWithCache(`${apiUrl}/api/articles/categories`, cacheKey);
};

// Fallback data for when API is not available
const getFallbackData = (cacheKey) => {
    if (cacheKey.includes('articles_')) {
        return {
            success: true,
            data: {
                articles: [
                    {
                        _id: '1',
                        title: 'LMHT: Top 10 tướng mạnh nhất phiên bản 14.5',
                        excerpt: 'Danh sách 10 tướng mạnh nhất meta hiện tại trong Liên Minh Huyền Thoại. Cập nhật mới nhất từ các chuyên gia.',
                        slug: 'lmht-top-10-tuong-manh-nhat',
                        category: 'lien-minh-huyen-thoai',
                        publishedAt: new Date().toISOString(),
                        views: 1250,
                        author: 'Admin',
                        featuredImage: {
                            url: '/imgs/wukong.png',
                            alt: 'Top 10 tướng mạnh nhất'
                        }
                    },
                    {
                        _id: '2',
                        title: 'Liên Quân Mobile: Hướng dẫn lên rank Cao Thủ mùa mới',
                        excerpt: 'Chiến thuật và mẹo chơi Liên Quân Mobile hiệu quả. Cách lên rank nhanh, pick tướng đúng meta.',
                        slug: 'lien-quan-huong-dan-len-rank',
                        category: 'lien-quan-mobile',
                        publishedAt: new Date(Date.now() - 86400000).toISOString(),
                        views: 980,
                        author: 'Admin',
                        featuredImage: {
                            url: '/imgs/wukong.png',
                            alt: 'Hướng dẫn lên rank'
                        }
                    },
                    {
                        _id: '3',
                        title: 'TFT: Meta đội hình mạnh nhất mùa 12',
                        excerpt: 'Tổng hợp đội hình Đấu Trường Chân Lý mạnh nhất hiện tại. Hướng dẫn build đội hình chuẩn meta.',
                        slug: 'tft-meta-doi-hinh-manh-nhat',
                        category: 'dau-truong-chan-ly-tft',
                        publishedAt: new Date(Date.now() - 172800000).toISOString(),
                        views: 756,
                        author: 'Admin',
                        featuredImage: {
                            url: '/imgs/wukong.png',
                            alt: 'Meta TFT'
                        }
                    },
                    {
                        _id: '4',
                        title: 'Trending: Cộng đồng game Việt nổi sóng với giải đấu mới',
                        excerpt: 'Tin tức game hot nhất tuần này. Giải đấu esports lớn sắp diễn ra, cập nhật tin game mới nhất.',
                        slug: 'trending-giai-dau-moi',
                        category: 'trending',
                        publishedAt: new Date(Date.now() - 259200000).toISOString(),
                        views: 1890,
                        author: 'Admin',
                        featuredImage: {
                            url: '/imgs/wukong.png',
                            alt: 'Trending game'
                        }
                    }
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalArticles: 4,
                    hasNext: false,
                    hasPrev: false
                }
            }
        };
    }

    if (cacheKey.includes('featured_')) {
        // Return different featured articles based on category
        const allFeaturedArticles = [
            {
                _id: 'f1',
                title: 'LMHT: Yasuo vs Yone - Ai mạnh hơn trong meta mới?',
                excerpt: 'So sánh chi tiết hai anh em Yasuo và Yone trong phiên bản mới. Build trang bị tối ưu và chiến thuật chơi.',
                slug: 'lmht-yasuo-vs-yone',
                category: 'lien-minh-huyen-thoai',
                publishedAt: new Date().toISOString(),
                views: 2100,
                author: 'Admin',
                featuredImage: {
                    url: '/imgs/wukong.png',
                    alt: 'Yasuo vs Yone'
                }
            },
            {
                _id: 'f2',
                title: 'Liên Quân: Top 5 xạ thủ mạnh nhất mùa 31',
                excerpt: 'Danh sách xạ thủ đáng chơi nhất trong Liên Quân Mobile mùa mới. Cách build và lên đồ hiệu quả.',
                slug: 'lien-quan-top-xa-thu',
                category: 'lien-quan-mobile',
                publishedAt: new Date(Date.now() - 43200000).toISOString(),
                views: 1580,
                author: 'Admin',
                featuredImage: {
                    url: '/imgs/wukong.png',
                    alt: 'Top xạ thủ'
                }
            },
            {
                _id: 'f3',
                title: 'TFT: Hướng dẫn chơi đội hình 6 Học Viện',
                excerpt: 'Build đội hình 6 Học Viện mạnh nhất TFT mùa 12. Cách xoay hệ và pick tướng carry chính.',
                slug: 'tft-doi-hinh-6-hoc-vien',
                category: 'dau-truong-chan-ly-tft',
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
                views: 1320,
                author: 'Admin',
                featuredImage: {
                    url: '/imgs/wukong.png',
                    alt: '6 Học Viện'
                }
            }
        ];

        // For fallback, return all articles (simulate "all" category)
        return {
            success: true,
            data: allFeaturedArticles
        };
    }

    if (cacheKey.includes('trending_')) {
        return {
            success: true,
            data: [
                {
                    _id: 't1',
                    title: 'LMHT: Faker lập kỷ lục mới tại World Championship',
                    excerpt: 'Tin game hot: Faker và T1 vô địch CKTG 2024. Phân tích trận đấu và highlight đáng chú ý.',
                    slug: 'faker-vo-dich-cktg',
                    category: 'lien-minh-huyen-thoai',
                    publishedAt: new Date().toISOString(),
                    views: 3200,
                    author: 'Admin',
                    featuredImage: {
                        url: '/imgs/wukong.png',
                        alt: 'Faker vô địch'
                    }
                },
                {
                    _id: 't2',
                    title: 'Liên Quân: Cập nhật tướng mới Nakroth Siêu Phàm',
                    excerpt: 'Nakroth phiên bản mới với skill set được buff mạnh. Review chi tiết và cách chơi tối ưu.',
                    slug: 'nakroth-sieu-pham',
                    category: 'lien-quan-mobile',
                    publishedAt: new Date(Date.now() - 21600000).toISOString(),
                    views: 1890,
                    author: 'Admin',
                    featuredImage: {
                        url: '/imgs/wukong.png',
                        alt: 'Nakroth mới'
                    }
                },
                {
                    _id: 't3',
                    title: 'TFT: Patch notes mùa 12 - Thay đổi meta lớn',
                    excerpt: 'Cập nhật patch notes TFT mới nhất. Những thay đổi quan trọng ảnh hưởng đến meta.',
                    slug: 'tft-patch-notes-mua-12',
                    category: 'dau-truong-chan-ly-tft',
                    publishedAt: new Date(Date.now() - 43200000).toISOString(),
                    views: 1650,
                    author: 'Admin',
                    featuredImage: {
                        url: '/imgs/wukong.png',
                        alt: 'TFT Patch Notes'
                    }
                }
            ]
        };
    }

    if (cacheKey.includes('categories')) {
        return {
            success: true,
            data: [
                { key: 'lien-minh-huyen-thoai', count: 5 },
                { key: 'lien-quan-mobile', count: 7 },
                { key: 'dau-truong-chan-ly-tft', count: 12 },
                { key: 'trending', count: 9 }
            ]
        };
    }

    return { success: false, data: [] };
};

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return 'Ngày đăng';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Ngày đăng';
    }
};

// Cloudinary optimization helper - Add transformations for better performance
const optimizeCloudinaryUrl = (imageUrl, options = {}) => {
    if (!imageUrl) return null; // Return null instead of fallback, let getImageUrl handle it

    // Check if it's a Cloudinary URL
    const isCloudinary = imageUrl.includes('res.cloudinary.com') || imageUrl.includes('cloudinary.com');

    if (!isCloudinary) {
        // Not Cloudinary, return null to use original URL
        return null;
    }

    // Parse Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
    // Or: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    try {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/').filter(Boolean); // Remove empty strings

        // Cloudinary URL structure: /{cloud_name}/image/upload/{...}
        // pathParts[0] = cloud_name
        // pathParts[1] = 'image'
        // pathParts[2] = 'upload'
        // pathParts[3+] = version/folders/transforms/public_id

        if (pathParts.length < 4) return imageUrl; // Invalid URL structure
        if (pathParts[1] !== 'image' || pathParts[2] !== 'upload') return imageUrl;

        // Extract cloud_name (first part)
        const cloudName = pathParts[0];
        if (!cloudName) return imageUrl;

        // Extract parts after 'upload' (index 2)
        const afterUpload = pathParts.slice(3);
        if (afterUpload.length === 0) return imageUrl;

        // Cloudinary URL format examples:
        // 1. With version: /{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
        // 2. With transformations: /{cloud_name}/image/upload/{transformations}/{public_id}.{format}
        // 3. With both: /{cloud_name}/image/upload/{transformations}/v{version}/{folder}/{public_id}.{format}

        // Find version and transformations
        let versionIndex = -1;
        let firstTransformIndex = -1;

        for (let i = 0; i < afterUpload.length; i++) {
            const part = afterUpload[i];
            // Check if it's a version (starts with 'v' followed by digits)
            if (part.startsWith('v') && /^v\d+$/.test(part) && versionIndex === -1) {
                versionIndex = i;
            }
            // Check if it's transformations (contains '_' or ',')
            if ((part.includes('_') || part.includes(',')) && firstTransformIndex === -1) {
                firstTransformIndex = i;
            }
        }

        // Extract components
        let version = null;
        let existingTransforms = [];
        let publicIdPath = []; // This includes folders + public_id

        if (versionIndex >= 0) {
            // URL has version
            version = afterUpload[versionIndex];
            // Everything before version are transformations (if any)
            if (versionIndex > 0) {
                existingTransforms = afterUpload.slice(0, versionIndex);
            }
            // Everything after version (including folders and public_id)
            publicIdPath = afterUpload.slice(versionIndex + 1);
        } else if (firstTransformIndex >= 0) {
            // URL has transformations but no version
            // Find where transformations end
            let transformEndIndex = firstTransformIndex;
            for (let i = firstTransformIndex + 1; i < afterUpload.length; i++) {
                if (!afterUpload[i].includes('_') && !afterUpload[i].includes(',')) {
                    transformEndIndex = i - 1;
                    break;
                }
                transformEndIndex = i;
            }
            existingTransforms = afterUpload.slice(0, transformEndIndex + 1);
            // Everything after transformations
            publicIdPath = afterUpload.slice(transformEndIndex + 1);
        } else {
            // No version, no transformations - everything is public_id path
            publicIdPath = afterUpload;
        }

        // publicIdPath now contains: [folders..., public_id.format]
        // Join them to get the full public_id path (Cloudinary supports folder in public_id)
        const publicIdWithFormat = publicIdPath.join('/');

        // Build optimized transformations
        const transforms = [];

        // Add width/height if specified
        if (options.width) {
            transforms.push(`w_${options.width}`);
        }
        if (options.height) {
            transforms.push(`h_${options.height}`);
        }

        // Add crop mode
        if (options.crop) {
            transforms.push(`c_${options.crop}`);
        } else if (options.width || options.height) {
            transforms.push('c_limit'); // Default: limit crop to maintain aspect ratio
        }

        // Add quality optimization
        if (options.quality && options.quality !== 'auto') {
            transforms.push(`q_${options.quality}`);
        } else {
            transforms.push('q_auto'); // Auto quality for best performance
        }

        // Add format optimization (WebP if supported)
        transforms.push('f_auto'); // Auto format (WebP, AVIF if supported)

        // Combine all parts in correct Cloudinary order:
        // transformations -> version -> public_id (which may include folders)
        const urlParts = [];

        // 1. Add transformations FIRST (combine existing and new)
        const allTransforms = [];
        if (existingTransforms.length > 0) {
            existingTransforms.forEach(transform => {
                // If transform contains commas, split and add individually
                if (transform.includes(',')) {
                    allTransforms.push(...transform.split(','));
                } else {
                    allTransforms.push(transform);
                }
            });
        }
        // Add new transforms
        allTransforms.push(...transforms);

        // Join all transforms with comma
        if (allTransforms.length > 0) {
            urlParts.push(allTransforms.join(','));
        }

        // 2. Add version if exists
        if (version) {
            urlParts.push(version);
        }

        // 3. Add public_id path (which includes folders if any)
        urlParts.push(publicIdWithFormat);

        // Build the path: /{cloud_name}/image/upload/{transformations}/{version}/{public_id_path}
        const newPath = `/${cloudName}/image/upload/${urlParts.join('/')}`;

        return `${url.protocol}//${url.host}${newPath}`;
    } catch (error) {
        console.warn('Error optimizing Cloudinary URL:', error, 'Original URL:', imageUrl);
        return imageUrl; // Return original on error
    }
};

// Enhanced image URL validation and fallback with Cloudinary optimization
const getImageUrl = (imageUrl, options = {}) => {
    // Return fallback only if imageUrl is truly empty/null/undefined
    if (!imageUrl || imageUrl === '' || imageUrl === 'null' || imageUrl === 'undefined') {
        return '/imgs/wukong.png';
    }

    // If it's already a relative path starting with /, return as is (for local images)
    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }

    // Optimize Cloudinary URLs
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
        const optimized = optimizeCloudinaryUrl(imageUrl, options);
        // If optimization failed, return original URL
        return optimized || imageUrl;
    }

    // Check if it's a valid absolute URL
    try {
        const url = new URL(imageUrl);
        // Return any valid absolute URL (including Cloudinary, API URLs, etc.)
        return imageUrl;
    } catch {
        // If it's not a valid URL but not empty, try to use it as relative path
        // This handles cases where URL might be missing protocol
        if (imageUrl.startsWith('//')) {
            return `https:${imageUrl}`;
        }
        // If it looks like a path without leading slash, add it
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            return `/${imageUrl}`;
        }
        // Last resort: return fallback
        console.warn('Invalid image URL:', imageUrl);
        return '/imgs/wukong.png';
    }
};

// Enhanced image error handler
const handleImageError = (e, fallbackSrc = '/imgs/wukong.png') => {
    if (e.target.src !== fallbackSrc) {
        e.target.src = fallbackSrc;
    }
};

// Enhanced Image Component with Cloudinary optimization and better performance
const OptimizedImage = memo(({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    loading = "lazy",
    quality = IMAGE_QUALITY,
    placeholder = IMAGE_PLACEHOLDER,
    blurDataURL,
    sizes,
    ...props
}) => {
    // Optimize image URL with Cloudinary transformations
    const optimizedSrc = useMemo(() => {
        // Handle null/undefined/empty strings
        if (!src || src === 'null' || src === 'undefined' || src === '' || src === null || src === undefined) {
            return '/imgs/wukong.png';
        }

        // Convert to string if needed
        const srcString = String(src).trim();
        if (!srcString) {
            return '/imgs/wukong.png';
        }

        // First check if it's Cloudinary and optimize
        if (srcString.includes('cloudinary.com')) {
            const optimized = optimizeCloudinaryUrl(srcString, {
                width: width,
                height: height,
                quality: quality === 75 ? 'auto' : quality,
                crop: 'limit'
            });
            // If optimization succeeded, use it; otherwise use original
            if (optimized) {
                return optimized;
            }
            // If optimization failed, return original Cloudinary URL
            return srcString;
        }

        // For non-Cloudinary URLs, use getImageUrl
        const result = getImageUrl(srcString, {
            width: width,
            height: height,
            quality: quality === 75 ? 'auto' : quality,
            crop: 'limit'
        });

        // Debug: log if we're falling back to default (only in development)
        if (process.env.NODE_ENV === 'development' && result === '/imgs/wukong.png' && srcString && srcString !== '/imgs/wukong.png') {
            console.warn('Image URL fallback triggered:', { original: srcString, result, type: typeof src });
        }

        return result;
    }, [src, width, height, quality]);

    const [imageSrc, setImageSrc] = useState(() => optimizedSrc);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    const handleError = useCallback((e) => {
        if (!hasError && e.target.src !== '/imgs/wukong.png') {
            setHasError(true);
            setImageSrc('/imgs/wukong.png');
        }
    }, [hasError]);

    // Reset error state when src changes
    useEffect(() => {
        if (optimizedSrc !== imageSrc && !hasError) {
            setHasError(false);
            setImageSrc(optimizedSrc);
        }
    }, [optimizedSrc, imageSrc, hasError]);

    // Only use blur placeholder if blurDataURL is provided
    const finalPlaceholder = blurDataURL ? placeholder : 'empty';

    // Don't use loading="lazy" when priority is true
    const finalLoading = priority ? undefined : loading;

    // For Cloudinary images, use unoptimized since Cloudinary handles optimization
    const isCloudinary = imageSrc.includes('cloudinary.com');
    const shouldUnoptimize = isCloudinary;

    return (
        <Image
            ref={imgRef}
            src={imageSrc}
            alt={alt || ''}
            width={width}
            height={height}
            className={className}
            priority={priority}
            loading={finalLoading}
            quality={isCloudinary ? undefined : quality} // Cloudinary handles quality
            placeholder={finalPlaceholder}
            blurDataURL={blurDataURL}
            sizes={sizes}
            onError={handleError}
            unoptimized={shouldUnoptimize} // Let Cloudinary handle optimization
            {...props}
        />
    );
}, (prevProps, nextProps) => {
    // Custom comparison for memo
    return prevProps.src === nextProps.src &&
        prevProps.alt === nextProps.alt &&
        prevProps.className === nextProps.className &&
        prevProps.priority === nextProps.priority &&
        prevProps.width === nextProps.width &&
        prevProps.height === nextProps.height;
});

OptimizedImage.displayName = 'OptimizedImage';

// Category Label Component - Small badge for image corners
const CategoryLabel = memo(({ category }) => {
    if (!category) return null;

    const color = useMemo(() => getCategoryColor(category), [category]);
    const label = useMemo(() => getCategoryLabel(category), [category]);

    return (
        <span
            className={styles.categoryLabel}
            style={{ backgroundColor: color }}
        >
            {label}
        </span>
    );
}, (prevProps, nextProps) => prevProps.category === nextProps.category);

CategoryLabel.displayName = 'CategoryLabel';

// Map old categories (from database) to new game categories
const mapOldCategoryToNew = (category) => {
    const mapping = {
        'du-doan-ket-qua-xo-so': 'lien-minh-huyen-thoai',
        'dan-de-chuyen-nghiep': 'lien-minh-huyen-thoai',
        'thong-ke-xo-so': 'lien-minh-huyen-thoai',
        'giai-ma-giac-mo': 'lien-quan-mobile',
        'tin-tuc-xo-so': 'lien-quan-mobile',
        'kinh-nghiem-choi-lo-de': 'dau-truong-chan-ly-tft',
        'meo-vat-xo-so': 'dau-truong-chan-ly-tft',
        'phuong-phap-soi-cau': 'trending',
        'huong-dan-choi': 'trending'
    };
    return mapping[category] || category;
};

// Group old categories into new categories
const groupCategories = (categories) => {
    const grouped = {};

    categories.forEach(cat => {
        const newKey = mapOldCategoryToNew(cat.key);
        if (grouped[newKey]) {
            grouped[newKey].count += cat.count;
        } else {
            grouped[newKey] = { key: newKey, count: cat.count };
        }
    });

    // Return as array with desired order
    const order = ['lien-minh-huyen-thoai', 'lien-quan-mobile', 'dau-truong-chan-ly-tft', 'trending'];
    return order
        .map(key => grouped[key])
        .filter(cat => cat); // Remove undefined
};

// When user selects new category, we need to map back to old categories for API
// Since API doesn't support new categories yet, we just pass null for now
const mapNewCategoryForAPI = (newCategory) => {
    // For now, return null to show all articles regardless of selected new category
    // This allows the new category UI to work without backend changes
    return null;
};

const getCategoryColor = (category) => {
    const mappedCategory = mapOldCategoryToNew(category);
    const colors = {
        'lien-minh-huyen-thoai': '#0397ab',
        'lien-quan-mobile': '#d32f2f',
        'dau-truong-chan-ly-tft': '#7c3aed',
        'trending': '#f59e0b'
    };
    return colors[mappedCategory] || '#6b7280';
};

const getCategoryLabel = (category) => {
    const mappedCategory = mapOldCategoryToNew(category);
    const labels = {
        'lien-minh-huyen-thoai': 'Liên Minh Huyền Thoại',
        'lien-quan-mobile': 'Liên Quân Mobile',
        'dau-truong-chan-ly-tft': 'Đấu Trường Chân Lý TFT',
        'trending': 'Trending'
    };
    return labels[mappedCategory] || 'Tin Tức';
};

// Optimized blur placeholder for better image loading
const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

// Image optimization settings
const IMAGE_QUALITY = 75;
const IMAGE_PLACEHOLDER = 'blur';
const IMAGE_LOADING_STRATEGY = 'lazy';

// Optimized sizes for responsive images
const getResponsiveSizes = (type = 'default') => {
    const sizes = {
        hero: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',
        featured: '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px',
        card: '(max-width: 500px) 140px, (max-width: 800px) 150px, (max-width: 1000px) 180px, 240px',
        sidebar: '(max-width: 500px) 140px, 160px',
        category: '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px',
        default: '(max-width: 768px) 100vw, 1200px'
    };
    return sizes[type] || sizes.default;
};


const ErrorMessage = memo(({ message, onRetry }) => {
    const handleRetry = useCallback(() => {
        if (onRetry) onRetry();
    }, [onRetry]);

    return (
        <div className={styles.error}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3>Không thể tải dữ liệu</h3>
            <p>{message}</p>
            {onRetry && (
                <button onClick={handleRetry} className={styles.retryButton}>
                    🔄 Thử lại
                </button>
            )}
        </div>
    );
});

ErrorMessage.displayName = 'ErrorMessage';

// Optimized Hero Article Component - Horizontal Layout
const HeroArticle = memo(({ article }) => {
    if (!article) return null;

    const categoryColor = useMemo(() => getCategoryColor(article.category), [article.category]);
    const categoryLabel = useMemo(() => getCategoryLabel(article.category), [article.category]);
    const formattedDate = useMemo(() => formatDate(article.publishedAt), [article.publishedAt]);

    return (
        <Link href={`/tin-tuc/${article.slug}`} className={styles.heroPost}>
            <div className={styles.heroImageContainer}>
                <CategoryLabel category={article.category} />
                <OptimizedImage
                    src={article.featuredImage?.url}
                    alt={article.featuredImage?.alt || article.title}
                    width={600}
                    height={400}
                    className={styles.heroImage}
                    priority
                    blurDataURL={blurDataURL}
                    sizes={getResponsiveSizes('hero')}
                />
            </div>
            <div className={styles.heroContent}>
                <span
                    className={styles.heroCategory}
                    style={{ backgroundColor: categoryColor }}
                >
                    {categoryLabel}
                </span>
                <h1 className={styles.heroTitle}>{article.title}</h1>
                <p className={styles.heroExcerpt}>{article.excerpt}</p>
                <div className={styles.heroMeta}>
                    <span className={styles.heroDate}>
                        {formattedDate}
                    </span>
                    <span className={styles.heroViews}>
                        {article.views || 0} lượt xem
                    </span>
                </div>
            </div>
        </Link>
    );
}, (prevProps, nextProps) => {
    return prevProps.article?._id === nextProps.article?._id &&
        prevProps.article?.views === nextProps.article?.views;
});

HeroArticle.displayName = 'HeroArticle';

// Optimized Featured Card Component - Sforum Style (Square with Overlay)
const FeaturedCard = memo(({ article, index }) => (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.featuredCard}>
        <div className={styles.featuredImageContainer}>
            <CategoryLabel category={article.category} />
            <OptimizedImage
                src={article.featuredImage?.url}
                alt={article.featuredImage?.alt || article.title}
                width={400}
                height={400}
                className={styles.featuredImage}
                loading={index < 2 ? "eager" : "lazy"}
                blurDataURL={blurDataURL}
                sizes={getResponsiveSizes('featured')}
            />
            <div className={styles.featuredOverlay}>
                <h3 className={styles.featuredTitle}>{article.title}</h3>
            </div>
        </div>
    </Link>
), (prevProps, nextProps) => {
    return prevProps.article?._id === nextProps.article?._id &&
        prevProps.index === nextProps.index;
});

FeaturedCard.displayName = 'FeaturedCard';

// Featured Articles Slider Component - Carousel/Belt Effect
const FeaturedSlider = memo(({ articles, currentIndex, onNext, onPrev, onGoToSlide }) => {
    if (!articles || articles.length === 0) return null;

    const [slidesPerView, setSlidesPerView] = useState(
        typeof window !== 'undefined' && window.innerWidth <= 768 ? 1 : 3
    );
    const trackRef = useRef(null);
    const resizeTimeoutRef = useRef(null);

    // Clone articles để tạo hiệu ứng loop vô hạn (clone 3 items đầu để seamless loop)
    const clonedArticles = useMemo(() => [...articles, ...articles.slice(0, 3)], [articles]);

    // Tính toán translateX dựa trên currentIndex
    const translateX = useMemo(() => -(currentIndex * (100 / slidesPerView)), [currentIndex, slidesPerView]);

    // Throttled resize handler
    const updateSlidesPerView = useCallback(() => {
        if (typeof window === 'undefined') return;
        const isMobile = window.innerWidth <= 768;
        setSlidesPerView(isMobile ? 1 : 3);
    }, []);

    // Update slidesPerView on resize with throttling
    useEffect(() => {
        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(updateSlidesPerView, 150);
        };

        updateSlidesPerView();
        window.addEventListener('resize', handleResize, { passive: true });
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [updateSlidesPerView]);

    // Xử lý seamless loop khi đến cuối
    useEffect(() => {
        if (currentIndex >= articles.length && trackRef.current && onGoToSlide) {
            // Khi đến cuối (hiển thị cloned items), reset về đầu không có transition để seamless
            trackRef.current.style.transition = 'none';
            // Reset về index 0 ngay lập tức
            const timeoutId = setTimeout(() => {
                if (onGoToSlide) {
                    onGoToSlide(0);
                }
                // Khôi phục transition sau khi reset
                setTimeout(() => {
                    if (trackRef.current) {
                        trackRef.current.style.transition = 'transform 0.5s ease-in-out';
                    }
                }, 50);
            }, 500); // Đợi animation hoàn thành

            return () => clearTimeout(timeoutId);
        }
    }, [currentIndex, articles.length, onGoToSlide]);

    const handlePrev = useCallback(() => {
        const newIndex = currentIndex === 0
            ? articles.length - 1
            : currentIndex - 1;
        onPrev(newIndex);
    }, [currentIndex, articles.length, onPrev]);

    const handleNext = useCallback(() => {
        const newIndex = (currentIndex + 1) % articles.length;
        onNext(newIndex);
    }, [currentIndex, articles.length, onNext]);

    const handleGoToSlide = useCallback((index) => {
        if (onGoToSlide) {
            onGoToSlide(index);
        }
    }, [onGoToSlide]);

    return (
        <div className={styles.featuredSlider}>
            <div className={styles.featuredCarouselWrapper}>
                <div
                    ref={trackRef}
                    className={styles.featuredCarouselTrack}
                    style={{
                        transform: `translateX(${translateX}%)`,
                        transition: 'transform 0.5s ease-in-out'
                    }}
                >
                    {clonedArticles.map((article, index) => (
                        <div key={`${article._id}-${index}`} className={styles.featuredCarouselItem}>
                            <FeaturedCard
                                article={article}
                                index={index}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            {articles.length > 3 && (
                <div className={styles.sliderNavigation}>
                    <button
                        className={styles.sliderButton}
                        onClick={handlePrev}
                        aria-label="Bài trước"
                    >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"></path>
                        </svg>
                    </button>
                    <div className={styles.sliderDots}>
                        {articles.slice(0, Math.min(10, articles.length)).map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.sliderDot} ${currentIndex === index ? styles.active : ''}`}
                                onClick={() => handleGoToSlide(index)}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>
                    <button
                        className={styles.sliderButton}
                        onClick={handleNext}
                        aria-label="Bài sau"
                    >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"></path>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.currentIndex === nextProps.currentIndex &&
        prevProps.articles?.length === nextProps.articles?.length &&
        prevProps.articles?.[0]?._id === nextProps.articles?.[0]?._id;
});

FeaturedSlider.displayName = 'FeaturedSlider';

// Optimized Article Card Component - Horizontal List View (Sforum Style)
const ArticleCard = memo(({ article, index }) => {
    const formattedDate = useMemo(() => formatDate(article.publishedAt), [article.publishedAt]);

    return (
        <Link href={`/tin-tuc/${article.slug}`} className={styles.articleListItem}>
            <div className={styles.articleListImageContainer}>
                <CategoryLabel category={article.category} />
                <OptimizedImage
                    src={article.featuredImage?.url}
                    alt={article.featuredImage?.alt || article.title}
                    width={300}
                    height={200}
                    className={styles.articleListImage}
                    loading={index < 3 ? "eager" : "lazy"}
                    blurDataURL={blurDataURL}
                    sizes={getResponsiveSizes('card')}
                />
            </div>
            <div className={styles.articleListContent}>
                <h3 className={styles.articleListTitle}>{article.title}</h3>
                {article.excerpt && (
                    <p className={styles.articleListExcerpt}>{article.excerpt}</p>
                )}
                <div className={styles.articleListMeta}>
                    {article.author && (
                        <span className={styles.articleListAuthor}>
                            {article.author}
                        </span>
                    )}
                    <span className={styles.articleListDate}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5 7.25a.75.75 0 0 0-1.5 0v5.5c0 .27.144.518.378.651l3.5 2a.75.75 0 0 0 .744-1.302L12.5 12.315V7.25Z"></path>
                            <path d="M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1ZM2.5 12a9.5 9.5 0 0 0 9.5 9.5 9.5 9.5 0 0 0 9.5-9.5A9.5 9.5 0 0 0 12 2.5 9.5 9.5 0 0 0 2.5 12Z"></path>
                        </svg>
                        {formattedDate}
                    </span>
                    <span className={styles.articleListViews}>
                        👁️ {article.views || 0}
                    </span>
                </div>
            </div>
        </Link>
    );
}, (prevProps, nextProps) => {
    return prevProps.article?._id === nextProps.article?._id &&
        prevProps.article?.views === nextProps.article?.views &&
        prevProps.index === nextProps.index;
});

ArticleCard.displayName = 'ArticleCard';

// Enhanced Sidebar Item Component - Sforum Style
const SidebarItem = memo(({ article, index }) => {
    const formattedDate = useMemo(() => formatDate(article.publishedAt), [article.publishedAt]);

    return (
        <Link href={`/tin-tuc/${article.slug}`} className={styles.sidebarItem}>
            <div className={styles.sidebarItemImageWrapper}>
                <CategoryLabel category={article.category} />
                <OptimizedImage
                    src={article.featuredImage?.url}
                    alt={article.featuredImage?.alt || article.title}
                    width={200}
                    height={150}
                    className={styles.sidebarItemImage}
                    loading="lazy"
                    blurDataURL={blurDataURL}
                    sizes={getResponsiveSizes('sidebar')}
                />
            </div>
            <div className={styles.sidebarItemContent}>
                <h4 className={styles.sidebarItemTitle}>{article.title}</h4>
                <div className={styles.sidebarItemMeta}>
                    {article.author && (
                        <span className={styles.sidebarItemAuthor}>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
                                <path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20ZM79.57,196.57a60,60,0,0,1,96.86,0,83.72,83.72,0,0,1-96.86,0ZM100,120a28,28,0,1,1,28,28A28,28,0,0,1,100,120ZM194,179.94a83.48,83.48,0,0,0-29-23.42,52,52,0,1,0-74,0,83.48,83.48,0,0,0-29,23.42,84,84,0,1,1,131.9,0Z"></path>
                            </svg>
                            {article.author}
                        </span>
                    )}
                    <span className={styles.sidebarItemDate}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                            <path d="M236,137A108.13,108.13,0,1,1,119,20,12,12,0,0,1,121,44,84.12,84.12,0,1,0,212,135,12,12,0,1,1,236,137ZM116,76v52a12,12,0,0,0,12,12h52a12,12,0,0,0,0-24H140V76a12,12,0,0,0-24,0Zm92,20a16,16,0,1,0-16-16A16,16,0,0,0,208,96ZM176,64a16,16,0,1,0-16-16A16,16,0,0,0,176,64Z"></path>
                        </svg>
                        {formattedDate}
                    </span>
                </div>
            </div>
        </Link>
    );
}, (prevProps, nextProps) => {
    return prevProps.article?._id === nextProps.article?._id &&
        prevProps.index === nextProps.index;
});

SidebarItem.displayName = 'SidebarItem';

// Category Grid Section (tabs with up to 9 items)
const CategoryGrid = memo(({ articles, activeCategory, onChangeCategory }) => {
    const [maxItems, setMaxItems] = useState(
        typeof window !== 'undefined' && window.innerWidth <= 480 ? 3 : 6
    );
    const resizeTimeoutRef = useRef(null);

    // Throttled resize handler
    const updateMaxItems = useCallback(() => {
        if (typeof window === 'undefined') return;
        setMaxItems(window.innerWidth <= 480 ? 3 : 6);
    }, []);

    // Update max items by viewport: mobile shows 3, others 6
    useEffect(() => {
        const handler = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(updateMaxItems, 150);
        };
        updateMaxItems();
        window.addEventListener('resize', handler, { passive: true });
        return () => {
            window.removeEventListener('resize', handler);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [updateMaxItems]);

    const categories = useMemo(() => [
        { key: 'lien-minh-huyen-thoai', label: getCategoryLabel('lien-minh-huyen-thoai') },
        { key: 'lien-quan-mobile', label: getCategoryLabel('lien-quan-mobile') },
        { key: 'dau-truong-chan-ly-tft', label: getCategoryLabel('dau-truong-chan-ly-tft') }
    ], []);

    const filtered = useMemo(() => {
        const mapped = articles.filter(a => mapOldCategoryToNew(a.category) === activeCategory);
        return mapped.slice(0, maxItems); // mobile 3 items, others 6
    }, [articles, activeCategory, maxItems]);

    const handleCategoryChange = useCallback((cat) => {
        onChangeCategory(cat);
    }, [onChangeCategory]);

    if (articles.length === 0) return null;

    return (
        <div className={styles.categoryGridSection}>
            <div className={styles.categoryGridHeader}>
                <h2 className={styles.sectionTitle}>BÀI VIẾT THEO DANH MỤC</h2>
                <div className={styles.categoryGridTabs}>
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            className={`${styles.categoryGridButton} ${activeCategory === cat.key ? styles.active : ''}`}
                            style={{ '--category-color': getCategoryColor(cat.key) }}
                            onClick={() => handleCategoryChange(cat.key)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.categoryGridList}>
                {filtered.map(article => (
                    <Link href={`/tin-tuc/${article.slug}`} key={article._id} className={styles.categoryGridCard}>
                        <div className={styles.categoryGridImageWrapper}>
                            <CategoryLabel category={article.category} />
                            <OptimizedImage
                                src={article.featuredImage?.url}
                                alt={article.featuredImage?.alt || article.title}
                                width={400}
                                height={250}
                                className={styles.categoryGridImage}
                                loading="lazy"
                                blurDataURL={blurDataURL}
                                sizes={getResponsiveSizes('category')}
                            />
                        </div>
                        <div className={styles.categoryGridContent}>
                            <h3 className={styles.categoryGridTitle}>{article.title}</h3>
                            <div className={styles.categoryGridMeta}>
                                <span className={styles.categoryGridDate}>{formatDate(article.publishedAt)}</span>
                                <span className={styles.categoryGridViews}>👁️ {article.views || 0}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.activeCategory === nextProps.activeCategory &&
        prevProps.articles?.length === nextProps.articles?.length;
});

CategoryGrid.displayName = 'CategoryGrid';

// Main Component
export default function NewsPage() {
    const [state, setState] = useState({
        articles: [],
        featuredArticles: [],
        trendingArticles: [],
        categories: [],
        selectedCategory: null,
        currentPage: 1,
        totalPages: 1,
        loading: true,
        error: null,
        searchQuery: '',
        sortBy: '-publishedAt',
        categoryGrid: 'lien-minh-huyen-thoai'
    });

    // State for "Show more" functionality
    const [visibleArticles, setVisibleArticles] = useState(6);

    // State for featured articles slider
    const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);

    // Ref to prevent multiple simultaneous API calls
    const isLoadingRef = useRef(false);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

    // Enhanced data loading with better error handling and performance optimization
    const loadData = useCallback(async () => {
        // Prevent multiple simultaneous API calls
        if (isLoadingRef.current) {
            console.log('⏳ Already loading, skipping API call');
            return;
        }

        try {
            isLoadingRef.current = true;
            setState(prev => ({ ...prev, loading: true, error: null }));

            // Optimize API calls with better caching and error handling
            // Load all articles and filter on client side since backend has old categories
            // Map category mới sang category cũ để fetch từ API (nếu cần)
            // Nhưng vì API đã hỗ trợ category mới, ta có thể truyền trực tiếp
            const apiCategory = state.selectedCategory || null;

            const [articlesRes, featuredRes, trendingRes, categoriesRes] = await Promise.allSettled([
                fetchArticles({
                    page: state.currentPage,
                    category: null, // Load all, filter on client
                    sort: state.sortBy,
                    search: state.searchQuery,
                    limit: 50 // Load more articles for client-side filtering
                }),
                fetchFeaturedArticles(10, apiCategory), // Load 10 featured articles theo category
                fetchTrendingArticles(10), // Load more trending articles
                fetchCategories()
            ]);

            // Extract articles data
            let articles = articlesRes.status === 'fulfilled' && articlesRes.value.success
                ? articlesRes.value.data.articles : [];

            // Filter articles on client side based on selected new category
            if (state.selectedCategory) {
                articles = articles.filter(article =>
                    mapOldCategoryToNew(article.category) === state.selectedCategory
                );
            }

            const totalPages = articlesRes.status === 'fulfilled' && articlesRes.value.success
                ? articlesRes.value.data.totalPages : 1;

            // Debug log
            console.log('📰 Articles loaded:', {
                category: state.selectedCategory || 'Tất cả',
                currentPage: state.currentPage,
                articlesCount: articles.length,
                totalPages: totalPages,
                pagination: {
                    currentPage: state.currentPage,
                    totalPages: totalPages,
                    hasNext: state.currentPage < totalPages,
                    hasPrev: state.currentPage > 1
                },
                heroArticle: articles.length > 0 ? {
                    title: articles[0].title,
                    category: articles[0].category,
                    publishedAt: articles[0].publishedAt
                } : null,
                featuredArticles: featuredRes.status === 'fulfilled' && featuredRes.value.success ? {
                    count: featuredRes.value.data.length,
                    articles: featuredRes.value.data.map(a => ({ title: a.title, category: a.category }))
                } : null,
                response: articlesRes.status === 'fulfilled' ? articlesRes.value : null
            });

            // Lấy categories từ API (đã được group ở back-end)
            // Hỗ trợ cả response mới (đã group) và response cũ (cần group)
            const rawCategories = categoriesRes.status === 'fulfilled' && categoriesRes.value.success
                ? categoriesRes.value.data : [];

            // Kiểm tra xem response đã được group chưa (có key là category mới không)
            const isAlreadyGrouped = rawCategories.length > 0 &&
                ['lien-minh-huyen-thoai', 'lien-quan-mobile', 'dau-truong-chan-ly-tft', 'trending']
                    .includes(rawCategories[0].key);

            // Nếu đã được group, sử dụng trực tiếp; nếu chưa, group lại
            const groupedCategories = isAlreadyGrouped
                ? rawCategories
                : groupCategories(rawCategories);

            // Lấy 10 bài viết mới nhất có isFeatured = true
            // API đã filter theo category và isFeatured rồi
            let featuredArticles = featuredRes.status === 'fulfilled' && featuredRes.value.success
                ? featuredRes.value.data : [];

            // Nếu API chưa filter đúng category mới, filter lại ở client
            if (state.selectedCategory) {
                featuredArticles = featuredArticles.filter(article =>
                    mapOldCategoryToNew(article.category) === state.selectedCategory
                );
            }

            // Giới hạn tối đa 10 bài
            featuredArticles = featuredArticles.slice(0, 10);

            // Reset slide index khi category thay đổi hoặc articles thay đổi
            setFeaturedSlideIndex(0);

            setState(prev => ({
                ...prev,
                articles: articles,
                totalPages: totalPages,
                featuredArticles: featuredArticles,
                trendingArticles: trendingRes.status === 'fulfilled' && trendingRes.value.success
                    ? trendingRes.value.data.slice(0, 6) : [],
                categories: groupedCategories,
                loading: false
            }));

            // Log any failed requests for debugging
            const failedRequests = [articlesRes, featuredRes, trendingRes, categoriesRes]
                .filter(result => result.status === 'rejected')
                .map(result => result.reason);

            if (failedRequests.length > 0) {
                console.warn('Some requests failed:', failedRequests);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại.'
            }));
        } finally {
            isLoadingRef.current = false;
        }
    }, [state.currentPage, state.selectedCategory, state.sortBy, state.searchQuery]);

    // Debounced data loading to prevent too many API calls
    const debounceTimeoutRef = useRef(null);

    const debouncedLoadData = useCallback(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            loadData();
        }, 300); // 300ms debounce
    }, [loadData]);

    // Effects
    useEffect(() => {
        debouncedLoadData();
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [debouncedLoadData]);

    // Reset visible articles when category changes
    useEffect(() => {
        setVisibleArticles(6);
    }, [state.selectedCategory, state.searchQuery, state.sortBy]);

    // Auto-play slider: chuyển mỗi 5 giây, mỗi lần 1 item từ phải sang trái (hiệu ứng băng chuyền)
    useEffect(() => {
        if (state.featuredArticles.length <= 3) return; // Không cần auto-play nếu <= 3 bài

        const interval = setInterval(() => {
            setFeaturedSlideIndex(prev => {
                // Chuyển sang bài tiếp theo (tăng index lên 1) - từ phải sang trái
                // Khi đến cuối, quay về đầu để tạo loop vô hạn
                const nextIndex = prev >= state.featuredArticles.length - 1 ? 0 : prev + 1;
                return nextIndex;
            });
        }, 5000); // 5 giây

        return () => clearInterval(interval);
    }, [state.featuredArticles.length]);

    // Memoize visible articles to prevent unnecessary re-renders
    const visibleArticlesList = useMemo(() => {
        return state.articles.slice(0, visibleArticles);
    }, [state.articles, visibleArticles]);

    // Enhanced SEO Data - Optimized for social sharing preview
    const seoData = useMemo(() => {
        const ogImageUrl = `${siteUrl}/imgs/wukong.png`;
        return {
            title: 'Tin Tức Game - LMHT, Liên Quân, TFT | Cập Nhật 24/7',
            description: 'Tin tức game mới nhất về Liên Minh Huyền Thoại, Liên Quân Mobile, Đấu Trường Chân Lý TFT. Hướng dẫn, meta, review chuyên sâu. Cập nhật 24/7.',
            keywords: 'tin tức game, LMHT, League of Legends, Liên Quân Mobile, TFT, Đấu Trường Chân Lý, esports, game MOBA, meta game, hướng dẫn game',
            canonical: `${siteUrl}/tin-tuc`,
            ogImage: ogImageUrl,
            ogType: 'website'
        };
    }, [siteUrl]);

    // Enhanced structured data
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seoData.title,
        description: seoData.description,
        url: seoData.canonical,
        publisher: {
            '@type': 'Organization',
            name: 'S-Games - Tin Tức Game & Esports',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/imgs/wukong.png`
            }
        },
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: state.articles.slice(0, 10).map((article, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Article',
                    headline: article.title,
                    description: article.excerpt,
                    url: `${siteUrl}/tin-tuc/${article.slug}`,
                    datePublished: article.publishedAt,
                    author: {
                        '@type': 'Person',
                        name: article.author
                    },
                    image: article.featuredImage?.url,
                    articleSection: getCategoryLabel(article.category)
                }
            }))
        }
    };

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Tin Tức', url: `${siteUrl}/tin-tuc` }
    ];

    // Enhanced handlers with debounce
    const handleCategorySelect = useCallback((category) => {
        setState(prev => ({
            ...prev,
            selectedCategory: category,
            currentPage: 1,
            loading: true // Show loading immediately
        }));
    }, []);

    const handlePageChange = useCallback((page) => {
        setState(prev => ({ ...prev, currentPage: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSearch = useCallback((query) => {
        setState(prev => ({
            ...prev,
            searchQuery: query,
            currentPage: 1
        }));
    }, []);

    const handleSortChange = useCallback((sortBy) => {
        setState(prev => ({
            ...prev,
            sortBy: sortBy,
            currentPage: 1
        }));
    }, []);

    const handleShowMore = useCallback(() => {
        setVisibleArticles(prev => prev + 6);
    }, []);

    // Loading state - YouTube style spinner
    if (state.loading) {
        return (
            <Layout>
                <div style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 24px'
                }}>
                    <LoadingSpinner
                        size="large"
                        message="Đang tải tin tức..."
                        showMessage={true}
                    />
                </div>
            </Layout>
        );
    }

    // Error state
    if (state.error) {
        return (
            <Layout>
                <ErrorMessage message={state.error} onRetry={loadData} />
            </Layout>
        );
    }

    return (
        <>
            <SEOOptimized
                pageType="news"
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                canonical={seoData.canonical}
                ogImage={seoData.ogImage}
                ogType={seoData.ogType}
                breadcrumbs={breadcrumbs}
                structuredData={structuredData}
            />
            <WebVitalsOptimizer />
            <PageSpeedOptimizer />

            <Layout>
                {/* Enhanced Category Navigation */}
                <div className={styles.categoryNav}>
                    <div className={styles.container}>
                        <div className={styles.categoryList}>
                            <button
                                className={`${styles.categoryButton} ${!state.selectedCategory ? styles.active : ''}`}
                                onClick={() => handleCategorySelect(null)}
                            >
                                Tất cả
                            </button>
                            {state.categories.map((category) => (
                                <button
                                    key={category.key}
                                    className={`${styles.categoryButton} ${state.selectedCategory === category.key ? styles.active : ''}`}
                                    onClick={() => handleCategorySelect(category.key)}
                                    style={{ '--category-color': getCategoryColor(category.key) }}
                                >
                                    {getCategoryLabel(category.key)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.container}>
                    <div className={styles.mainContent}>
                        {/* Main Content */}
                        <main>
                            {/* Hero Article - Shows latest article from selected category or all articles */}
                            {state.articles.length > 0 && (
                                <div className={styles.heroSection}>
                                    <HeroArticle article={state.articles[0]} />
                                </div>
                            )}

                            {/* Show message when no articles found for selected category */}
                            {state.articles.length === 0 && !state.loading && (
                                <div className={styles.noArticles}>
                                    <p>
                                        {state.selectedCategory
                                            ? `Không tìm thấy bài viết nào trong danh mục "${getCategoryLabel(state.selectedCategory)}"`
                                            : 'Không tìm thấy bài viết nào'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Featured Articles - Slider Style */}
                            {state.featuredArticles.length > 0 && (
                                <div className={styles.featuredSection}>
                                    <h2 className={styles.sectionTitle}>
                                        BÀI VIẾT NỔI BẬT
                                    </h2>
                                    <FeaturedSlider
                                        articles={state.featuredArticles}
                                        currentIndex={featuredSlideIndex}
                                        onNext={(newIndex) => {
                                            setFeaturedSlideIndex(newIndex);
                                        }}
                                        onPrev={(newIndex) => {
                                            setFeaturedSlideIndex(newIndex);
                                        }}
                                        onGoToSlide={(newIndex) => {
                                            setFeaturedSlideIndex(newIndex);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Category Grid Tabs (up to 9 items) */}
                            <CategoryGrid
                                articles={state.articles}
                                activeCategory={state.categoryGrid}
                                onChangeCategory={(cat) => setState(prev => ({ ...prev, categoryGrid: cat }))}
                            />

                            {/* Articles List - Show all articles when "Tất cả" is selected, or filtered articles for specific category */}
                            <div className={styles.articlesSection}>
                                <h2 className={styles.sectionTitle}>
                                    {state.selectedCategory
                                        ? getCategoryLabel(state.selectedCategory)
                                        : 'Tất Cả Bài Viết'
                                    }
                                    <span className={styles.articleCount}>
                                        ({state.articles.length} bài viết)
                                    </span>
                                </h2>
                                <div className={styles.articlesList}>
                                    {state.articles.length > 0 ? (
                                        visibleArticlesList.map((article, index) => (
                                            <ArticleCard key={article._id} article={article} index={index} />
                                        ))
                                    ) : (
                                        <div className={styles.noArticles}>
                                            <p>
                                                {state.selectedCategory
                                                    ? `Không tìm thấy bài viết nào trong danh mục "${getCategoryLabel(state.selectedCategory)}"`
                                                    : 'Không tìm thấy bài viết nào'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Show More Button */}
                                {state.articles.length > visibleArticles && (
                                    <div className={styles.showMoreContainer}>
                                        <button
                                            className={styles.showMoreButton}
                                            onClick={handleShowMore}
                                        >
                                            <span>Xem thêm</span>
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Pagination */}
                            {state.totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => handlePageChange(state.currentPage - 1)}
                                        disabled={state.currentPage === 1}
                                    >
                                        ← Trước
                                    </button>

                                    {[...Array(state.totalPages)].map((_, i) => {
                                        const page = i + 1;
                                        if (
                                            page === 1 ||
                                            page === state.totalPages ||
                                            (page >= state.currentPage - 1 && page <= state.currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    className={`${styles.paginationButton} ${state.currentPage === page ? styles.active : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === state.currentPage - 2 ||
                                            page === state.currentPage + 2
                                        ) {
                                            return <span key={page}>...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => handlePageChange(state.currentPage + 1)}
                                        disabled={state.currentPage === state.totalPages}
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </main>

                        {/* Enhanced Sidebar */}
                        <aside className={styles.sidebar}>
                            {/* Trending Articles - Optimized rendering */}
                            {state.trendingArticles.length > 0 && (
                                <div className={styles.sidebarCard}>
                                    <h3 className={styles.sidebarTitle}>
                                        Tin Nổi Bật
                                    </h3>
                                    <div className={styles.sidebarList}>
                                        {state.trendingArticles.slice(0, 6).map((article, index) => (
                                            <SidebarItem key={article._id} article={article} index={index} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trending Sidebar Items */}
                            <div className={styles.sidebarCard}>
                                <h3 className={styles.sidebarTitle}>
                                    Trending
                                </h3>
                                <div className={styles.sidebarList}>
                                    {[
                                        {
                                            _id: 'fixed-1',
                                            slug: 'thong-ke-xo-so-mien-bac-phan-tich-xu-huong-so-nong-lanh',
                                            title: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh',
                                            author: 'Admin',
                                            publishedAt: new Date('2025-10-06').toISOString(),
                                            featuredImage: {
                                                url: '/imgs/wukong.png',
                                                alt: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh'
                                            }
                                        },
                                        {
                                            _id: 'fixed-2',
                                            slug: 'thong-ke-xo-so-mien-bac-phan-tich-xu-huong-so-nong-lanh',
                                            title: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh',
                                            author: 'Admin',
                                            publishedAt: new Date('2025-10-06').toISOString(),
                                            featuredImage: {
                                                url: '/imgs/wukong.png',
                                                alt: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh'
                                            }
                                        },
                                        {
                                            _id: 'fixed-3',
                                            slug: 'thong-ke-xo-so-mien-bac-phan-tich-xu-huong-so-nong-lanh',
                                            title: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh',
                                            author: 'Admin',
                                            publishedAt: new Date('2025-10-06').toISOString(),
                                            featuredImage: {
                                                url: '/imgs/wukong.png',
                                                alt: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh'
                                            }
                                        },
                                        {
                                            _id: 'fixed-4',
                                            slug: 'thong-ke-xo-so-mien-bac-phan-tich-xu-huong-so-nong-lanh',
                                            title: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh',
                                            author: 'Admin',
                                            publishedAt: new Date('2025-10-06').toISOString(),
                                            featuredImage: {
                                                url: '/imgs/wukong.png',
                                                alt: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Xu Hướng Số Nóng Lạnh'
                                            }
                                        }
                                    ].map((article, index) => (
                                        <SidebarItem key={article._id} article={article} index={index + state.trendingArticles.length} />
                                    ))}
                                </div>
                            </div>

                        </aside>
                    </div>
                </div>
            </Layout>
        </>
    );
}