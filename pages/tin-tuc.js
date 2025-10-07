/**
 * Modern News Page - Optimized for UX, SEO and Performance
 * Enhanced UI with better image rendering and user experience
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../components/Layout';
import SEOOptimized from '../components/SEOOptimized';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import styles from '../styles/tintuc.module.css';

// API functions with caching and error handling
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Enhanced in-memory cache with better performance
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for better caching
const MAX_CACHE_SIZE = 100; // Limit cache size

const fetchWithCache = async (url, cacheKey, retries = 3) => {
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'max-age=600', // 10 minutes
                    'Accept': 'application/json',
                },
                // Add timeout to prevent hanging requests
                signal: AbortSignal.timeout(10000) // 10 seconds timeout
            });

            if (!response.ok) {
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

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
};

const fetchArticles = async (params = {}) => {
    const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 12,
        sort: params.sort || '-publishedAt',
        ...params
    });

    const cacheKey = `articles_${queryParams.toString()}`;
    return fetchWithCache(`${apiUrl}/api/articles?${queryParams}`, cacheKey);
};

const fetchFeaturedArticles = async (limit = 5) => {
    const cacheKey = `featured_${limit}`;
    return fetchWithCache(`${apiUrl}/api/articles/featured?limit=${limit}`, cacheKey);
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
                        title: 'Hướng dẫn tạo dàn đề 9x-0x hiệu quả nhất 2025',
                        excerpt: 'Cách tạo dàn đề 9x-0x chuyên nghiệp với thuật toán Fisher-Yates. Bộ lọc dàn đề tổng hợp thông minh, miễn phí 100%.',
                        slug: 'huong-dan-tao-dan-de-9x-0x',
                        category: 'huong-dan-choi',
                        publishedAt: new Date().toISOString(),
                        views: 1250,
                        author: 'Admin',
                        featuredImage: {
                            url: '/imgs/wukong.png',
                            alt: 'Hướng dẫn tạo dàn đề'
                        }
                    },
                    {
                        _id: '2',
                        title: 'Thống kê xổ số 3 miền - Xu hướng số nóng lạnh',
                        excerpt: 'Phân tích thống kê xổ số miền Bắc, Nam, Trung. Xu hướng số nóng lạnh, mẹo chơi hiệu quả từ chuyên gia.',
                        slug: 'thong-ke-xo-so-3-mien',
                        category: 'thong-ke-xo-so',
                        publishedAt: new Date(Date.now() - 86400000).toISOString(),
                        views: 980,
                        author: 'Admin',
                        featuredImage: {
                            url: '/imgs/wukong.png',
                            alt: 'Thống kê xổ số'
                        }
                    },
                    {
                        _id: '3',
                        title: 'Mẹo vặt xổ số - Tăng tỷ lệ trúng thưởng',
                        excerpt: 'Những mẹo vặt xổ số được các cao thủ chia sẻ. Cách tăng tỷ lệ trúng thưởng, kinh nghiệm chơi lô đề.',
                        slug: 'meo-vat-xo-so',
                        category: 'meo-vat-xo-so',
                        publishedAt: new Date(Date.now() - 172800000).toISOString(),
                        views: 756,
                        author: 'Admin',
                        featuredImage: {
                            url: '/imgs/wukong.png',
                            alt: 'Mẹo vặt xổ số'
                        }
                    }
                ],
                totalPages: 1,
                currentPage: 1
            }
        };
    }

    if (cacheKey.includes('featured_')) {
        return {
            success: true,
            data: [
                {
                    _id: 'f1',
                    title: 'Công cụ tạo dàn đề chuyên nghiệp - Tôn Ngộ Không',
                    excerpt: 'Công cụ tạo dàn đề và thống kê xổ số 3 miền chuyên nghiệp. Miễn phí, nhanh chóng, chính xác 100%.',
                    slug: 'cong-cu-tao-dan-de-chuyen-nghiep',
                    category: 'dan-de-chuyen-nghiep',
                    publishedAt: new Date().toISOString(),
                    views: 2100,
                    author: 'Admin',
                    featuredImage: {
                        url: '/imgs/wukong.png',
                        alt: 'Công cụ tạo dàn đề'
                    }
                },
                {
                    _id: 'f2',
                    title: 'Phương pháp soi cầu xổ số hiệu quả',
                    excerpt: 'Các phương pháp soi cầu xổ số được các chuyên gia khuyên dùng. Tăng cơ hội trúng thưởng.',
                    slug: 'phuong-phap-soi-cau-xo-so',
                    category: 'phuong-phap-soi-cau',
                    publishedAt: new Date(Date.now() - 43200000).toISOString(),
                    views: 1580,
                    author: 'Admin',
                    featuredImage: {
                        url: '/imgs/wukong.png',
                        alt: 'Phương pháp soi cầu'
                    }
                }
            ]
        };
    }

    if (cacheKey.includes('trending_')) {
        return {
            success: true,
            data: [
                {
                    _id: 't1',
                    title: 'Kinh nghiệm chơi lô đề từ cao thủ',
                    excerpt: 'Chia sẻ kinh nghiệm chơi lô đề từ các cao thủ. Mẹo và chiến thuật hiệu quả.',
                    slug: 'kinh-nghiem-choi-lo-de',
                    category: 'kinh-nghiem-choi-lo-de',
                    publishedAt: new Date().toISOString(),
                    views: 3200,
                    author: 'Admin',
                    featuredImage: {
                        url: '/imgs/wukong.png',
                        alt: 'Kinh nghiệm chơi lô đề'
                    }
                },
                {
                    _id: 't2',
                    title: 'Giải mã giấc mơ - Số may mắn',
                    excerpt: 'Giải mã giấc mơ để tìm số may mắn. Cách chọn số dựa trên giấc mơ.',
                    slug: 'giai-ma-giac-mo',
                    category: 'giai-ma-giac-mo',
                    publishedAt: new Date(Date.now() - 21600000).toISOString(),
                    views: 1890,
                    author: 'Admin',
                    featuredImage: {
                        url: '/imgs/wukong.png',
                        alt: 'Giải mã giấc mơ'
                    }
                }
            ]
        };
    }

    if (cacheKey.includes('categories')) {
        return {
            success: true,
            data: [
                { key: 'huong-dan-choi', count: 15 },
                { key: 'thong-ke-xo-so', count: 12 },
                { key: 'meo-vat-xo-so', count: 8 },
                { key: 'kinh-nghiem-choi-lo-de', count: 10 },
                { key: 'phuong-phap-soi-cau', count: 6 },
                { key: 'giai-ma-giac-mo', count: 9 },
                { key: 'dan-de-chuyen-nghiep', count: 7 }
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

// Enhanced image URL validation and fallback
const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/imgs/wukong.png';

    // Check if it's a valid URL
    try {
        const url = new URL(imageUrl);
        // If it's from our API, return as is
        if (url.hostname === 'api.taodandewukong.pro' || url.hostname === 'localhost') {
            return imageUrl;
        }
    } catch {
        // Invalid URL, return fallback
        return '/imgs/wukong.png';
    }

    return imageUrl;
};

// Enhanced image error handler
const handleImageError = (e, fallbackSrc = '/imgs/wukong.png') => {
    if (e.target.src !== fallbackSrc) {
        e.target.src = fallbackSrc;
    }
};

// Enhanced Image Component with better error handling
const OptimizedImage = React.memo(({
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
    const [imageSrc, setImageSrc] = useState(getImageUrl(src));
    const [hasError, setHasError] = useState(false);

    const handleError = useCallback((e) => {
        if (!hasError) {
            setHasError(true);
            setImageSrc('/imgs/wukong.png');
        }
    }, [hasError]);

    // Reset error state when src changes
    useEffect(() => {
        setHasError(false);
        setImageSrc(getImageUrl(src));
    }, [src]);

    // Only use blur placeholder if blurDataURL is provided
    const finalPlaceholder = blurDataURL ? placeholder : 'empty';

    // Don't use loading="lazy" when priority is true
    const finalLoading = priority ? undefined : loading;

    return (
        <Image
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            loading={finalLoading}
            quality={quality}
            placeholder={finalPlaceholder}
            blurDataURL={blurDataURL}
            sizes={sizes}
            onError={handleError}
            {...props}
        />
    );
});

const getCategoryColor = (category) => {
    const colors = {
        'giai-ma-giac-mo': '#8b5cf6',
        'kinh-nghiem-choi-lo-de': '#3b82f6',
        'thong-ke-xo-so': '#10b981',
        'meo-vat-xo-so': '#f59e0b',
        'tin-tuc-xo-so': '#ef4444',
        'huong-dan-choi': '#06b6d4',
        'phuong-phap-soi-cau': '#84cc16',
        'dan-de-chuyen-nghiep': '#f97316'
    };
    return colors[category] || '#6b7280';
};

const getCategoryLabel = (category) => {
    const labels = {
        'giai-ma-giac-mo': 'Giải Mã Giấc Mơ',
        'kinh-nghiem-choi-lo-de': 'Kinh Nghiệm Chơi Lô Đề',
        'thong-ke-xo-so': 'Thống Kê Xổ Số',
        'meo-vat-xo-so': 'Mẹo Vặt Xổ Số',
        'tin-tuc-xo-so': 'Tin Tức Xổ Số',
        'huong-dan-choi': 'Hướng Dẫn Chơi',
        'phuong-phap-soi-cau': 'Phương Pháp Soi Cầu',
        'dan-de-chuyen-nghiep': 'Dàn Đề Chuyên Nghiệp'
    };
    return labels[category] || 'Tin Tức';
};

// Optimized blur placeholder for better image loading
const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

// Image optimization settings
const IMAGE_QUALITY = 75;
const IMAGE_PLACEHOLDER = 'blur';
const IMAGE_LOADING_STRATEGY = 'lazy';

// Enhanced Loading Components
const LoadingSkeleton = React.memo(() => (
    <div className={styles.loading}>
        <div className={styles.skeletonHero}></div>
        <div className={styles.skeletonFeatured}>
            {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}></div>
            ))}
        </div>
        <div className={styles.skeletonArticles}>
            {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}></div>
            ))}
        </div>
    </div>
));

const ErrorMessage = React.memo(({ message, onRetry }) => (
    <div className={styles.error}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Không thể tải dữ liệu</h3>
        <p>{message}</p>
        {onRetry && (
            <button onClick={onRetry} className={styles.retryButton}>
                🔄 Thử lại
            </button>
        )}
    </div>
));

// Optimized Hero Article Component
const HeroArticle = React.memo(({ article }) => {
    if (!article) return null;

    return (
        <Link href={`/tin-tuc/${article.slug}`} className={styles.heroPost}>
            <div className={styles.heroImageContainer}>
                <OptimizedImage
                    src={article.featuredImage?.url}
                    alt={article.featuredImage?.alt || article.title}
                    width={800}
                    height={400}
                    className={styles.heroImage}
                    priority
                    blurDataURL={blurDataURL}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 800px"
                />
                <div className={styles.heroOverlay}>
                    <div className={styles.heroCategory}>
                        {getCategoryLabel(article.category)}
                    </div>
                </div>
            </div>
            <div className={styles.heroContent}>
                <div className={styles.heroMeta}>
                    <span className={styles.heroDate}>
                        📅 {formatDate(article.publishedAt)}
                    </span>
                    <span className={styles.heroViews}>
                        👁️ {article.views || 0} lượt xem
                    </span>
                </div>
                <h1 className={styles.heroTitle}>{article.title}</h1>
                <p className={styles.heroExcerpt}>{article.excerpt}</p>
                <div className={styles.heroReadMore}>
                    Đọc thêm →
                </div>
            </div>
        </Link>
    );
});

// Optimized Featured Card Component
const FeaturedCard = React.memo(({ article, index }) => (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.featuredCard}>
        <div className={styles.featuredImageContainer}>
            <OptimizedImage
                src={article.featuredImage?.url}
                alt={article.featuredImage?.alt || article.title}
                width={300}
                height={200}
                className={styles.featuredImage}
                loading={index < 2 ? "eager" : "lazy"}
                blurDataURL={blurDataURL}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            />
            <div className={styles.featuredOverlay}>
                <span
                    className={styles.featuredCategory}
                    style={{ '--category-color': getCategoryColor(article.category) }}
                >
                    {getCategoryLabel(article.category)}
                </span>
            </div>
        </div>
        <div className={styles.featuredContent}>
            <h3 className={styles.featuredTitle}>{article.title}</h3>
            <p className={styles.featuredExcerpt}>{article.excerpt}</p>
            <div className={styles.featuredMeta}>
                <span className={styles.featuredDate}>
                    📅 {formatDate(article.publishedAt)}
                </span>
                <span className={styles.featuredViews}>
                    👁️ {article.views || 0}
                </span>
            </div>
        </div>
    </Link>
));

// Optimized Article Card Component
const ArticleCard = React.memo(({ article, index }) => (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.articleCard}>
        <div className={styles.articleImageContainer}>
            <OptimizedImage
                src={article.featuredImage?.url}
                alt={article.featuredImage?.alt || article.title}
                width={200}
                height={120}
                className={styles.articleImage}
                loading="lazy"
                blurDataURL={blurDataURL}
                sizes="(max-width: 768px) 100vw, 200px"
            />
            <div className={styles.articleOverlay}>
                <span
                    className={styles.articleCategory}
                    style={{ '--category-color': getCategoryColor(article.category) }}
                >
                    {getCategoryLabel(article.category)}
                </span>
            </div>
        </div>
        <div className={styles.articleContent}>
            <h3 className={styles.articleTitle}>{article.title}</h3>
            <p className={styles.articleExcerpt}>{article.excerpt}</p>
            <div className={styles.articleMeta}>
                <span className={styles.articleDate}>
                    📅 {formatDate(article.publishedAt)}
                </span>
                <span className={styles.articleViews}>
                    👁️ {article.views || 0}
                </span>
            </div>
        </div>
    </Link>
));

// Enhanced Sidebar Item Component
const SidebarItem = React.memo(({ article, index }) => (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.sidebarItem}>
        <div className={styles.sidebarItemImage}>
            <OptimizedImage
                src={article.featuredImage?.url}
                alt={article.featuredImage?.alt || article.title}
                width={60}
                height={60}
                className={styles.sidebarItemImage}
                loading="lazy"
                blurDataURL={blurDataURL}
                sizes="60px"
            />
        </div>
        <div className={styles.sidebarItemContent}>
            <h4 className={styles.sidebarItemTitle}>{article.title}</h4>
            <span className={styles.sidebarItemDate}>
                📅 {formatDate(article.publishedAt)}
            </span>
            <span className={styles.sidebarItemViews}>
                👁️ {article.views || 0}
            </span>
        </div>
    </Link>
));

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
        sortBy: '-publishedAt'
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

    // Enhanced data loading with better error handling and performance optimization
    const loadData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            // Optimize API calls with better caching and error handling
            const [articlesRes, featuredRes, trendingRes, categoriesRes] = await Promise.allSettled([
                fetchArticles({
                    page: state.currentPage,
                    category: state.selectedCategory,
                    sort: state.sortBy,
                    search: state.searchQuery,
                    limit: 12 // Limit articles for better performance
                }),
                fetchFeaturedArticles(4), // Reduce featured articles
                fetchTrendingArticles(6), // Reduce trending articles
                fetchCategories()
            ]);

            setState(prev => ({
                ...prev,
                articles: articlesRes.status === 'fulfilled' && articlesRes.value.success
                    ? articlesRes.value.data.articles : [],
                totalPages: articlesRes.status === 'fulfilled' && articlesRes.value.success
                    ? articlesRes.value.data.totalPages : 1,
                featuredArticles: featuredRes.status === 'fulfilled' && featuredRes.value.success
                    ? featuredRes.value.data : [],
                trendingArticles: trendingRes.status === 'fulfilled' && trendingRes.value.success
                    ? trendingRes.value.data : [],
                categories: categoriesRes.status === 'fulfilled' && categoriesRes.value.success
                    ? categoriesRes.value.data : [],
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
        }
    }, [state.currentPage, state.selectedCategory, state.sortBy, state.searchQuery]);

    // Effects
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Enhanced SEO Data
    const seoData = useMemo(() => ({
        title: 'Tin Tức Xổ Số & Lô Đề - Cập Nhật Mới Nhất 2025 | Tạo Dàn Đề',
        description: 'Tin tức xổ số, lô đề mới nhất, kinh nghiệm chơi, thống kê số nóng lạnh, mẹo vặt và hướng dẫn chuyên nghiệp từ các chuyên gia. Cập nhật 24/7.',
        keywords: 'tin tức xổ số, lô đề, thống kê xổ số, kinh nghiệm chơi, mẹo vặt xổ số, soi cầu, dàn đề, xổ số miền bắc, xổ số miền nam, xổ số miền trung',
        canonical: `${siteUrl}/tin-tuc`,
        ogImage: `${siteUrl}/imgs/wukong.png`,
        ogType: 'website'
    }), [siteUrl]);

    // Enhanced structured data
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seoData.title,
        description: seoData.description,
        url: seoData.canonical,
        publisher: {
            '@type': 'Organization',
            name: 'Tạo Dàn Đề - Công Cụ Xổ Số Chuyên Nghiệp',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/imgs/monkey.png`
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

    // Enhanced handlers
    const handleCategorySelect = useCallback((category) => {
        setState(prev => ({
            ...prev,
            selectedCategory: category,
            currentPage: 1
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

    // Loading state
    if (state.loading) {
        return (
            <Layout>
                <LoadingSkeleton />
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
            <PageSpeedOptimizer />

            <Layout>
                {/* Enhanced Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.container}>
                        <h1 className={styles.pageTitle}>
                            📰 Tin Tức Xổ Số & Lô Đề
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Cập nhật tin tức mới nhất, kinh nghiệm chơi và thống kê chuyên nghiệp 24/7
                        </p>

                        {/* Search and Filter Bar */}
                        <div className={styles.searchFilterBar}>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="🔍 Tìm kiếm bài viết..."
                                    value={state.searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                            <div className={styles.sortBox}>
                                <select
                                    value={state.sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option value="-publishedAt">📅 Mới nhất</option>
                                    <option value="publishedAt">📅 Cũ nhất</option>
                                    <option value="-views">👁️ Xem nhiều</option>
                                    <option value="-likes">❤️ Yêu thích</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Category Navigation */}
                <div className={styles.categoryNav}>
                    <div className={styles.container}>
                        <div className={styles.categoryList}>
                            <button
                                className={`${styles.categoryButton} ${!state.selectedCategory ? styles.active : ''}`}
                                onClick={() => handleCategorySelect(null)}
                            >
                                🏠 Tất cả
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
                            {/* Hero Article */}
                            {state.articles.length > 0 && (
                                <div className={styles.heroSection}>
                                    <HeroArticle article={state.articles[0]} />
                                </div>
                            )}

                            {/* Featured Articles - Optimized rendering */}
                            {state.featuredArticles.length > 0 && (
                                <div className={styles.articlesSection}>
                                    <h2 className={styles.sectionTitle}>
                                        ⭐ Bài Viết Nổi Bật
                                    </h2>
                                    <div className={styles.featuredGrid}>
                                        {state.featuredArticles.slice(0, 4).map((article, index) => (
                                            <FeaturedCard key={article._id} article={article} index={index} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Articles List */}
                            <div className={styles.articlesSection}>
                                <h2 className={styles.sectionTitle}>
                                    {state.selectedCategory
                                        ? `📂 ${getCategoryLabel(state.selectedCategory)}`
                                        : '📰 Tất Cả Bài Viết'
                                    }
                                    <span className={styles.articleCount}>
                                        ({state.articles.length} bài viết)
                                    </span>
                                </h2>
                                <div className={styles.articlesList}>
                                    {state.articles.map((article, index) => (
                                        <ArticleCard key={article._id} article={article} index={index} />
                                    ))}
                                </div>
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
                                        🔥 Tin Nổi Bật
                                    </h3>
                                    <div className={styles.sidebarList}>
                                        {state.trendingArticles.slice(0, 6).map((article, index) => (
                                            <SidebarItem key={article._id} article={article} index={index} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {state.categories.length > 0 && (
                                <div className={styles.sidebarCard}>
                                    <h3 className={styles.sidebarTitle}>📂 Danh Mục</h3>
                                    <div className={styles.sidebarList}>
                                        {state.categories.map((category) => (
                                            <Link
                                                key={category.key}
                                                href={`/tin-tuc?category=${category.key}`}
                                                className={styles.sidebarItem}
                                            >
                                                <div className={styles.sidebarItemContent}>
                                                    <h4 className={styles.sidebarItemTitle}>
                                                        {getCategoryLabel(category.key)}
                                                    </h4>
                                                    <span className={styles.sidebarItemDate}>
                                                        📄 {category.count} bài viết
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className={styles.sidebarCard}>
                                <h3 className={styles.sidebarTitle}>📊 Thống Kê</h3>
                                <div className={styles.statsList}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Tổng bài viết:</span>
                                        <span className={styles.statValue}>{state.articles.length}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Chuyên mục:</span>
                                        <span className={styles.statValue}>{state.categories.length}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Bài nổi bật:</span>
                                        <span className={styles.statValue}>{state.featuredArticles.length}</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </Layout>
        </>
    );
}