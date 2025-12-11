/**
 * Article Detail Page - SEO & UX Optimized
 * High performance with rich snippets and accessibility
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import Layout from '../../components/Layout';
import ArticleSEO from '../../components/ArticleSEO';
import SocialShareButtons from '../../components/SocialShareButtons';
import dynamic from 'next/dynamic';

// Cloudinary optimization helper - Add transformations for better performance
const optimizeCloudinaryUrl = (imageUrl, options = {}) => {
    if (!imageUrl) return null;

    // Check if it's a Cloudinary URL
    const isCloudinary = imageUrl.includes('res.cloudinary.com') || imageUrl.includes('cloudinary.com');
    
    if (!isCloudinary) {
        return null; // Let caller handle non-Cloudinary URLs
    }

    // Parse Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
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
        
        if (options.width) transforms.push(`w_${options.width}`);
        if (options.height) transforms.push(`h_${options.height}`);
        
        if (options.crop) {
            transforms.push(`c_${options.crop}`);
        } else if (options.width || options.height) {
            transforms.push('c_limit');
        }

        if (options.quality && options.quality !== 'auto') {
            transforms.push(`q_${options.quality}`);
        } else {
            transforms.push('q_auto');
        }

        transforms.push('f_auto');

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

// Helper to get optimized image URL
const getOptimizedImageUrl = (imageUrl, width, height) => {
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === '') {
        return '/imgs/wukong.png';
    }
    
    // If it's Cloudinary, optimize it
    if (imageUrl.includes('cloudinary.com')) {
        const optimized = optimizeCloudinaryUrl(imageUrl, { width, height, quality: 'auto', crop: 'limit' });
        return optimized || imageUrl; // Return original if optimization failed
    }
    
    // For non-Cloudinary URLs, return as is
    return imageUrl;
};
// ✅ Removed duplicate CSS import to reduce bundle size
// import '../../styles/XoSoMienBac.module.css';
import {
    Calendar,
    Eye,
    Heart,
    Share2,
    Clock,
    Tag,
    ArrowLeft,
    TrendingUp,
    Star,
    BookOpen,
    Lightbulb,
    BarChart3,
    Newspaper,
    Facebook,
    Link2,
    FolderOpen,
    ArrowRight,
    Menu,
    Twitter,
    Send,
    MessageCircle,
    X
} from 'lucide-react';
import styles from '../../styles/ArticleDetailClassic.module.css';

// Lazy load heavy components for better PageSpeed
// Note: These components will be created when needed
// For now, we'll use simple fallback components
const RelatedArticles = dynamic(() => Promise.resolve(() => <div className={styles.loadingSkeleton}>Bài viết liên quan</div>), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải bài viết liên quan...</div>,
    ssr: false
});

const SocialShare = dynamic(() => Promise.resolve(() => <div className={styles.loadingSkeleton}>Chia sẻ</div>), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải chia sẻ...</div>,
    ssr: false
});

// Server-side data fetching for SEO
export async function getServerSideProps(context) {
    const { slug } = context.params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';

    try {
        // Fetch article data on server with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        let response;
        try {
            response = await fetch(`${apiUrl}/api/articles/${slug}`, {
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Fetch error in getServerSideProps:', fetchError);
            // Return not found if fetch fails
            return {
                notFound: true
            };
        }

        if (!response.ok) {
            console.error(`API returned ${response.status} for article ${slug}`);
            return {
                notFound: true
            };
        }

        const result = await response.json();

        if (result.success && result.data) {
            const article = result.data;
            
            // Prepare SEO data
            let ogImageUrl = `${siteUrl}/imgs/wukong.png`;
            if (article.featuredImage?.url) {
                if (article.featuredImage.url.startsWith('http://') || article.featuredImage.url.startsWith('https://')) {
                    ogImageUrl = article.featuredImage.url;
                } else if (article.featuredImage.url.startsWith('/')) {
                    ogImageUrl = `${siteUrl}${article.featuredImage.url}`;
                } else {
                    ogImageUrl = `${siteUrl}/${article.featuredImage.url}`;
                }
            }

            // Prepare description
            let description = article.metaDescription || article.excerpt;
            if (!description && article.content) {
                // Remove HTML tags and get first 150 chars
                description = article.content.replace(/<[^>]*>/g, '').substring(0, 150).trim();
            }
            if (!description) {
                description = article.title;
            }
            if (description.length > 160) {
                description = description.substring(0, 157) + '...';
            }

            return {
                props: {
                    article: article,
                    seoData: {
                        title: article.title,
                        description: description,
                        image: ogImageUrl,
                        url: `${siteUrl}/tin-tuc/${article.slug}`,
                        publishedTime: article.publishedAt,
                        modifiedTime: article.updatedAt || article.publishedAt,
                        author: article.author || 'Admin',
                        category: article.category,
                        tags: article.tags || [],
                        articleData: {
                            publishedTime: article.publishedAt,
                            modifiedTime: article.updatedAt || article.publishedAt,
                            author: article.author || 'Admin',
                            section: article.category,
                            tags: article.tags || [],
                            readingTime: Math.ceil((article.content?.length || 0) / 1000),
                            wordCount: article.content?.length || 0
                        }
                    }
                }
            };
        } else {
            console.error('Article not found or invalid response:', result);
            return {
                notFound: true
            };
        }
    } catch (error) {
        console.error('Error fetching article in getServerSideProps:', error);
        return {
            notFound: true
        };
    }
}

export default function ArticleDetailPage({ article: initialArticle, seoData: initialSeoData }) {
    const router = useRouter();
    const { slug } = router.query;
    const [article, setArticle] = useState(initialArticle);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [mostViewedArticles, setMostViewedArticles] = useState([]);
    const [trendingArticles, setTrendingArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showTOC, setShowTOC] = useState(false);
    const [activeHeading, setActiveHeading] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [viewCount, setViewCount] = useState(0);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

    // Map old categories to new categories (đồng bộ với tin-tuc.js)
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

    // Fetch article data with error handling and caching
    const fetchArticle = useCallback(async () => {
        if (!slug || initialArticle) {
            // If we have initial data from SSR, use it and just update view count
            if (initialArticle) {
                setViewCount(initialArticle.views || 0);
                setLoading(false);
                return;
            }
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${apiUrl}/api/articles/${slug}`);
            const result = await response.json();

            if (result.success) {
                setArticle(result.data);
                setViewCount(result.data.views || 0);

                // Fetch related articles
                const relatedResponse = await fetch(
                    `${apiUrl}/api/articles?category=${result.data.category}&limit=5&exclude=${result.data._id}`
                );
                const relatedResult = await relatedResponse.json();

                if (relatedResult.success) {
                    setRelatedArticles(relatedResult.data.articles || []);
                }

                // Fetch most viewed articles
                const mostViewedResponse = await fetch(
                    `${apiUrl}/api/articles?sort=views&limit=5`
                );
                const mostViewedResult = await mostViewedResponse.json();

                if (mostViewedResult.success) {
                    setMostViewedArticles(mostViewedResult.data.articles || []);
                }

                // Fetch trending articles
                const trendingResponse = await fetch(
                    `${apiUrl}/api/articles?category=trending&limit=6`
                );
                const trendingResult = await trendingResponse.json();

                if (trendingResult.success) {
                    setTrendingArticles(trendingResult.data.articles || []);
                }

                // Track view
                fetch(`${apiUrl}/api/articles/${slug}/view`, { method: 'POST' }).catch(console.error);
            } else {
                setError(result.message || 'Không thể tải bài viết');
            }
        } catch (err) {
            console.error('Error fetching article:', err);
            setError('Lỗi kết nối. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, [slug, apiUrl, initialArticle]);

    // Table of Contents generation and content processing
    const { tableOfContents, processedContent } = useMemo(() => {
        const currentArticle = article || initialArticle;
        if (!currentArticle?.content || typeof document === 'undefined') {
            return { tableOfContents: [], processedContent: currentArticle?.content || '' };
        }

        const headings = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentArticle.content;

        const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headingElements.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            headings.push({
                id,
                text: heading.textContent,
                level: parseInt(heading.tagName.charAt(1))
            });
        });

        // Return the processed HTML with IDs
        return {
            tableOfContents: headings,
            processedContent: tempDiv.innerHTML
        };
    }, [article?.content, initialArticle?.content]);

    // Effects
    useEffect(() => {
        // If we have initial data, just set loading to false
        if (initialArticle) {
            setLoading(false);
            setViewCount(initialArticle.views || 0);
        } else {
            fetchArticle();
        }
    }, [fetchArticle, initialArticle]);

    // Ensure headings have IDs after content is rendered
    useEffect(() => {
        if (typeof window === 'undefined' || !processedContent || tableOfContents.length === 0) return;

        // Wait for DOM to be ready
        const timer = setTimeout(() => {
            // Try multiple selectors to find the article content
            const articleContent = document.querySelector('[itemprop="articleBody"]') || 
                                   document.querySelector('.xsmbContainer');
            if (!articleContent) return;

            // Find all headings in the rendered content and add IDs
            const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach((heading, index) => {
                if (index < tableOfContents.length && !heading.id) {
                    heading.id = tableOfContents[index].id;
                }
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [processedContent, tableOfContents]);

    // Reading progress tracking and active heading detection
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateReadingProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min(100, (scrollTop / docHeight) * 100);
            setReadingProgress(scrollPercent);

            // Update active heading based on scroll position
            if (tableOfContents.length > 0) {
                const offset = 100; // Offset for fixed headers
                let currentHeading = '';

                // Check each heading from bottom to top
                for (let i = tableOfContents.length - 1; i >= 0; i--) {
                    const element = document.getElementById(tableOfContents[i].id);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        if (rect.top <= offset) {
                            currentHeading = tableOfContents[i].id;
                            break;
                        }
                    }
                }

                if (currentHeading !== activeHeading) {
                    setActiveHeading(currentHeading);
                }
            }
        };

        window.addEventListener('scroll', updateReadingProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateReadingProgress);
    }, [tableOfContents, activeHeading]);

            // Enhanced structured data for rich snippets - SEO optimized
    const structuredData = useMemo(() => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return null;

        const readingTime = Math.max(1, Math.ceil((currentArticle.content?.length || 0) / 1000));
        const wordCount = currentArticle.content?.split(/\s+/).length || 0;
        
        // Ensure image URL is absolute
        let imageUrl = `${siteUrl}/imgs/wukong.png`;
        if (currentArticle.featuredImage?.url) {
            if (currentArticle.featuredImage.url.startsWith('http://') || currentArticle.featuredImage.url.startsWith('https://')) {
                imageUrl = currentArticle.featuredImage.url;
            } else if (currentArticle.featuredImage.url.startsWith('/')) {
                imageUrl = `${siteUrl}${currentArticle.featuredImage.url}`;
            } else {
                imageUrl = `${siteUrl}/${currentArticle.featuredImage.url}`;
            }
        }

        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: currentArticle.title,
            description: currentArticle.metaDescription || currentArticle.excerpt || currentArticle.title,
            image: {
                '@type': 'ImageObject',
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: currentArticle.featuredImage?.alt || currentArticle.title
            },
            datePublished: currentArticle.publishedAt,
            dateModified: currentArticle.updatedAt || currentArticle.publishedAt,
            author: {
                '@type': 'Person',
                name: currentArticle.author || 'Admin',
                url: siteUrl
            },
            publisher: {
                '@type': 'Organization',
                name: 'S-Games - Tin Tức Game & Esports',
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/imgs/wukong.png`,
                    width: 512,
                    height: 512
                }
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${siteUrl}/tin-tuc/${currentArticle.slug}`
            },
            interactionStatistic: [
                {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/ReadAction',
                    userInteractionCount: currentArticle.views || 0
                },
                {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/ShareAction',
                    userInteractionCount: currentArticle.shares || Math.floor((currentArticle.views || 0) * 0.1)
                }
            ],
            wordCount: wordCount,
            timeRequired: `PT${readingTime}M`,
            articleSection: getCategoryLabel(currentArticle.category),
            keywords: currentArticle.keywords?.join(', ') || currentArticle.tags?.join(', ') || 'tin tức game, LMHT, Liên Quân Mobile, TFT',
            inLanguage: 'vi-VN',
            // Add category URL for better internal linking
            about: {
                '@type': 'Thing',
                name: getCategoryLabel(currentArticle.category),
                url: `${siteUrl}/tin-tuc?category=${currentArticle.category}`
            }
        };
    }, [article, initialArticle, siteUrl]);

    // Enhanced SEO data with validation - use initial data if available
    const seoData = useMemo(() => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return initialSeoData || null;

        const readingTime = Math.max(1, Math.ceil((currentArticle.content?.length || 0) / 1000));
        
        // Optimize meta description length (150-160 chars for best SEO)
        // Use excerpt or first part of content as description
        let rawDescription = currentArticle.metaDescription || currentArticle.excerpt;
        
        // If no excerpt, extract from content (first 150 chars) - safe for SSR
        if (!rawDescription && currentArticle.content && typeof document !== 'undefined') {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = currentArticle.content;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                rawDescription = textContent.substring(0, 150).trim();
            } catch (e) {
                // Fallback: remove HTML tags using regex (works on server)
                rawDescription = currentArticle.content.replace(/<[^>]*>/g, '').substring(0, 150).trim();
            }
        } else if (!rawDescription && currentArticle.content) {
            // Server-side fallback: remove HTML tags using regex
            rawDescription = currentArticle.content.replace(/<[^>]*>/g, '').substring(0, 150).trim();
        }
        
        // Fallback to title if still no description
        if (!rawDescription) {
            rawDescription = currentArticle.title;
        }
        
        const optimizedDescription = rawDescription.length > 160 
            ? rawDescription.substring(0, 157) + '...' 
            : rawDescription;

        // Ensure ogImage is absolute URL for proper social sharing preview
        let ogImageUrl = `${siteUrl}/imgs/wukong.png`;
        if (currentArticle.featuredImage?.url) {
            if (currentArticle.featuredImage.url.startsWith('http://') || currentArticle.featuredImage.url.startsWith('https://')) {
                ogImageUrl = currentArticle.featuredImage.url;
            } else if (currentArticle.featuredImage.url.startsWith('/')) {
                ogImageUrl = `${siteUrl}${currentArticle.featuredImage.url}`;
            } else {
                ogImageUrl = `${siteUrl}/${currentArticle.featuredImage.url}`;
            }
        }

        return {
            title: `${currentArticle.title} | Tin Tức Game - LMHT, Liên Quân, TFT`,
            description: optimizedDescription,
            keywords: currentArticle.keywords?.join(', ') || currentArticle.tags?.join(', ') || 'tin tức game, LMHT, Liên Quân Mobile, TFT, esports',
            canonical: `${siteUrl}/tin-tuc/${currentArticle.slug}`,
            ogImage: ogImageUrl,
            ogType: 'article',
            articleData: {
                publishedTime: currentArticle.publishedAt,
                modifiedTime: currentArticle.updatedAt || currentArticle.publishedAt,
                author: currentArticle.author || 'Admin',
                section: getCategoryLabel(currentArticle.category),
                tags: currentArticle.tags || [],
                readingTime: readingTime,
                wordCount: currentArticle.content?.length || 0
            }
        };
    }, [article, initialArticle, initialSeoData, siteUrl]);

    // Breadcrumbs
    const breadcrumbs = useMemo(() => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return [];
        return [
            { name: 'Trang chủ', url: siteUrl },
            { name: 'Tin Tức', url: `${siteUrl}/tin-tuc` },
            { name: getCategoryLabel(currentArticle.category), url: `${siteUrl}/tin-tuc?category=${currentArticle.category}` },
            { name: currentArticle.title || 'Bài viết', url: `${siteUrl}/tin-tuc/${currentArticle.slug}` }
        ];
    }, [article, initialArticle, siteUrl]);

    // Social sharing functions
    const shareToFacebook = () => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return;
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${currentArticle.slug}`);
        const title = encodeURIComponent(currentArticle.title);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
    };

    const shareToTwitter = () => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return;
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${currentArticle.slug}`);
        const text = encodeURIComponent(currentArticle.title);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
    };

    const shareToTelegram = () => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return;
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${currentArticle.slug}`);
        const text = encodeURIComponent(currentArticle.title);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
    };

    const shareToZalo = () => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return;
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${currentArticle.slug}`);
        window.open(`https://zalo.me/share?url=${url}`, '_blank', 'width=600,height=400');
    };

    const copyLink = async () => {
        const currentArticle = article || initialArticle;
        if (!currentArticle) return;
        try {
            await navigator.clipboard.writeText(`${siteUrl}/tin-tuc/${currentArticle.slug}`);
            // Show toast notification here
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Get current article (from SSR or client-side)
    const currentArticle = article || initialArticle;
    const currentSeoData = seoData || initialSeoData;

    // Loading state - but still render SEO if we have initial data
    if (loading && !initialArticle) {
        return (
            <>
                <SEOOptimized
                    pageType="article"
                    title="Đang tải..."
                    description="Đang tải bài viết..."
                />
                <Layout>
                    <div className={styles.pageWrapper}>
                        <div className={styles.container}>
                            <div className={styles.loading}>
                                <div className={styles.loadingSpinner}></div>
                                <p className={styles.loadingText}>Đang tải bài viết...</p>
                            </div>
                        </div>
                    </div>
                </Layout>
            </>
        );
    }

    // Error state
    if (error || !currentArticle) {
        return (
            <Layout>
                <div className={styles.pageWrapper}>
                    <div className={styles.container}>
                        <div className={styles.error}>
                            <h2 className={styles.errorTitle}>Không tìm thấy bài viết</h2>
                            <p className={styles.errorMessage}>{error || 'Bài viết này không tồn tại hoặc đã bị xóa.'}</p>
                            <Link href="/tin-tuc" className={styles.backButton}>
                                <ArrowLeft size={16} />
                                Quay lại tin tức
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Prepare SEO data for rendering
    const finalTitle = currentSeoData?.title || (currentArticle ? `${currentArticle.title} | Tin Tức Game - LMHT, Liên Quân, TFT` : 'Tin Tức Game');
    const finalDescription = currentSeoData?.description || (currentArticle ? (currentArticle.metaDescription || currentArticle.excerpt || currentArticle.title) : 'Tin tức game mới nhất');
    const finalOgImage = currentSeoData?.image || (currentArticle?.featuredImage?.url ? 
        (currentArticle.featuredImage.url.startsWith('http') ? currentArticle.featuredImage.url : `${siteUrl}${currentArticle.featuredImage.url.startsWith('/') ? currentArticle.featuredImage.url : '/' + currentArticle.featuredImage.url}`)
        : `${siteUrl}/imgs/wukong.png`);
    const finalCanonical = currentSeoData?.url || (currentArticle ? `${siteUrl}/tin-tuc/${currentArticle.slug}` : siteUrl);

    return (
        <>
            {/* Enhanced SEO with JSON-LD Schema - Render FIRST to ensure priority */}
            {currentArticle && (
                <>
                    <Head>
                        {/* Force override og:title and og:description - These MUST be set here to override _app.js */}
                        <meta property="og:title" content={currentArticle.title} key="og-title-override" />
                        <meta property="og:description" content={finalDescription} key="og-description-override" />
                        <meta property="og:image" content={finalOgImage} key="og-image-override" />
                        <meta property="og:image:secure_url" content={finalOgImage} key="og-image-secure-override" />
                        <meta property="og:image:width" content="1200" key="og-image-width-override" />
                        <meta property="og:image:height" content="630" key="og-image-height-override" />
                        <meta property="og:image:alt" content={currentArticle.title} key="og-image-alt-override" />
                        <meta property="og:url" content={finalCanonical} key="og-url-override" />
                        <meta property="og:type" content="article" key="og-type-override" />
                        <meta property="og:site_name" content="Tạo Dàn Đề Wukong" key="og-site-name-override" />
                        <meta property="og:locale" content="vi_VN" key="og-locale-override" />
                        {process.env.NEXT_PUBLIC_FB_APP_ID && (
                            <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FB_APP_ID} key="fb-app-id" />
                        )}
                        <meta property="article:published_time" content={currentArticle.publishedAt} key="article-published-override" />
                        <meta property="article:modified_time" content={currentArticle.updatedAt || currentArticle.publishedAt} key="article-modified-override" />
                        <meta property="article:author" content={currentArticle.author || 'Admin'} key="article-author-override" />
                        <meta property="article:section" content={getCategoryLabel(currentArticle.category)} key="article-section-override" />
                        {currentArticle.tags?.map((tag, index) => (
                            <meta key={`article-tag-override-${index}`} property="article:tag" content={tag} />
                        ))}
                        <title key="title-override">{finalTitle}</title>
                        <meta name="description" content={finalDescription} key="description-override" />
                        {/* Twitter Card */}
                        <meta name="twitter:card" content="summary_large_image" key="twitter-card-override" />
                        <meta name="twitter:title" content={currentArticle.title} key="twitter-title-override" />
                        <meta name="twitter:description" content={finalDescription} key="twitter-description-override" />
                        <meta name="twitter:image" content={finalOgImage} key="twitter-image-override" />
                    </Head>
                    <ArticleSEO
                        title={currentArticle.title}
                        description={finalDescription}
                        author={currentArticle.author || 'Admin'}
                        publishedTime={currentArticle.publishedAt}
                        modifiedTime={currentArticle.updatedAt || currentArticle.publishedAt}
                        image={finalOgImage}
                        url={finalCanonical}
                        keywords={currentArticle.keywords || currentArticle.tags || []}
                        category={getCategoryLabel(currentArticle.category)}
                        tags={currentArticle.tags || []}
                        readingTime={`${Math.ceil((currentArticle.content?.length || 0) / 1000)} phút đọc`}
                        canonical={finalCanonical}
                    />
                    <SEOOptimized
                        pageType="article"
                        customTitle={finalTitle}
                        customDescription={finalDescription}
                        customKeywords={currentArticle.keywords?.join(', ') || currentArticle.tags?.join(', ') || 'tin tức game, LMHT, Liên Quân Mobile, TFT, esports'}
                        canonical={finalCanonical}
                        canonicalUrl={finalCanonical}
                        ogImage={finalOgImage}
                        breadcrumbs={breadcrumbs}
                        structuredData={structuredData}
                        articleData={currentSeoData?.articleData || {
                            publishedTime: currentArticle.publishedAt,
                            modifiedTime: currentArticle.updatedAt || currentArticle.publishedAt,
                            author: currentArticle.author || 'Admin',
                            section: getCategoryLabel(currentArticle.category),
                            tags: currentArticle.tags || [],
                            readingTime: Math.ceil((currentArticle.content?.length || 0) / 1000),
                            wordCount: currentArticle.content?.length || 0
                        }}
                    />
                </>
            )}
            <PageSpeedOptimizer />

            {/* Reading Progress Bar */}
            <div
                className={styles.readingProgress}
                style={{ width: `${readingProgress}%` }}
            />

            <Layout>
                <div className={styles.pageWrapper}>
                    <div className={styles.container}>
                        {/* Breadcrumb */}
                        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                            <ul className={styles.breadcrumbList}>
                                {breadcrumbs.map((crumb, index) => (
                                    <li key={index} className={styles.breadcrumbItem}>
                                        {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                                        {index === breadcrumbs.length - 1 ? (
                                            <span className={styles.breadcrumbCurrent}>{crumb.name}</span>
                                        ) : (
                                            <Link href={crumb.url} className={styles.breadcrumbLink}>
                                                {crumb.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Main Content Layout */}
                        <div className={styles.contentLayout}>
                            {/* Article Main */}
                            <main>
                                <article className={styles.articleMain} itemScope itemType="https://schema.org/Article">
                                    {/* Article Header */}
                                    <header className={styles.articleHeader}>
                                        <span
                                            className={styles.categoryBadge}
                                            style={{ background: getCategoryColor(currentArticle.category) }}
                                        >
                                            {getCategoryLabel(currentArticle.category)}
                                        </span>

                                        <h1 className={styles.articleTitle} itemProp="headline">
                                            {currentArticle.title}
                                        </h1>

                                        {currentArticle.excerpt && (
                                            <p className={styles.articleSummary}>
                                                {currentArticle.excerpt}
                                            </p>
                                        )}

                                        <div className={styles.articleMeta}>
                                            <div className={styles.metaItem}>
                                                <Calendar size={14} className={styles.metaIcon} />
                                                <time dateTime={currentArticle.publishedAt} itemProp="datePublished">
                                                    {formatDate(currentArticle.publishedAt)}
                                                </time>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Tag size={14} className={styles.metaIcon} />
                                                <span className={styles.author} itemProp="author" itemScope itemType="https://schema.org/Person">
                                                    <span itemProp="name">{currentArticle.author || 'Admin'}</span>
                                                </span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Eye size={14} className={styles.metaIcon} />
                                                <span>{viewCount.toLocaleString('vi-VN')} lượt xem</span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Clock size={14} className={styles.metaIcon} />
                                                <span>{Math.ceil((currentArticle.content?.length || 0) / 1000)} phút đọc</span>
                                            </div>
                                        </div>
                                    </header>

                                    {/* Table of Contents */}
                                    {tableOfContents.length > 0 && (
                                        <div className={styles.articleContent}>
                                            <div className={styles.tocBox}>
                                                <div
                                                    className={styles.tocHeader}
                                                    onClick={() => setShowTOC(!showTOC)}
                                                >
                                                    <span>📑 Mục lục bài viết</span>
                                                    <span>{showTOC ? '▲' : '▼'}</span>
                                                </div>
                                                {showTOC && (
                                                    <div className={styles.tocContent}>
                                                        <ul className={styles.tocList}>
                                                            {tableOfContents.map((heading) => (
                                                                <li key={heading.id} className={styles.tocItem}>
                                                                    <a
                                                                        href={`#${heading.id}`}
                                                                        className={`${styles.tocLink} ${activeHeading === heading.id ? styles.active : ''}`}
                                                                        style={{ paddingLeft: `${(heading.level - 1) * 15}px` }}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            
                                                                            // Try to find the element, with retry logic
                                                                            const scrollToHeading = (retries = 3) => {
                                                                                const element = document.getElementById(heading.id);
                                                                                if (element) {
                                                                                    const offset = 80; // Offset for fixed headers
                                                                                    const elementPosition = element.getBoundingClientRect().top;
                                                                                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                                                                                    window.scrollTo({
                                                                                        top: offsetPosition,
                                                                                        behavior: 'smooth'
                                                                                    });
                                                                                    
                                                                                    // Update active heading immediately
                                                                                    setActiveHeading(heading.id);
                                                                                } else if (retries > 0) {
                                                                                    // If element not found, wait a bit and retry
                                                                                    setTimeout(() => scrollToHeading(retries - 1), 50);
                                                                                } else {
                                                                                    // Fallback: try to find by text content
                                                                                    const articleContent = document.querySelector('[itemprop="articleBody"]');
                                                                                    if (articleContent) {
                                                                                        const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
                                                                                        const targetHeading = Array.from(headings).find(h => 
                                                                                            h.textContent.trim() === heading.text.trim()
                                                                                        );
                                                                                        if (targetHeading) {
                                                                                            targetHeading.id = heading.id;
                                                                                            const offset = 80;
                                                                                            const elementPosition = targetHeading.getBoundingClientRect().top;
                                                                                            const offsetPosition = elementPosition + window.pageYOffset - offset;
                                                                                            window.scrollTo({
                                                                                                top: offsetPosition,
                                                                                                behavior: 'smooth'
                                                                                            });
                                                                                            setActiveHeading(heading.id);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            };
                                                                            
                                                                            scrollToHeading();
                                                                        }}
                                                                    >
                                                                        {heading.text}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Article Content */}
                                    <div
                                        className={`${styles.articleContent} xsmbContainer`}
                                        itemProp="articleBody"
                                        dangerouslySetInnerHTML={{ __html: processedContent || currentArticle.content }}
                                    />

                                    {/* Article Footer - Tags & Sharing */}
                                    <footer className={styles.articleFooter}>
                                        {/* Tags */}
                                        {currentArticle.tags && currentArticle.tags.length > 0 && (
                                            <div className={styles.articleTags}>
                                                <h3 className={styles.tagsTitle}>Từ khóa:</h3>
                                                <div className={styles.tagsList}>
                                                    {currentArticle.tags.map((tag, index) => (
                                                        <Link
                                                            key={index}
                                                            href={`/tin-tuc?tag=${tag}`}
                                                            className={styles.tag}
                                                        >
                                                            {tag}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Enhanced Social Sharing */}
                                        <SocialShareButtons
                                            url={`${siteUrl}/tin-tuc/${currentArticle.slug}`}
                                            title={currentArticle.title}
                                            description={currentArticle.summary || currentArticle.metaDescription}
                                            image={currentArticle.featuredImage?.url}
                                            hashtags={currentArticle.tags || []}
                                        />
                                    </footer>
                                </article>

                                {/* Related Articles - Below Main Article */}
                                {relatedArticles.length > 0 && (
                                    <section className={styles.relatedSection}>
                                        <h2 className={styles.relatedTitle}>Bài viết liên quan</h2>
                                        <div className={styles.relatedGrid}>
                                            {relatedArticles.slice(0, 4).map((relatedArticle) => (
                                                <Link
                                                    key={relatedArticle._id}
                                                    href={`/tin-tuc/${relatedArticle.slug}`}
                                                    className={styles.relatedCard}
                                                >
                                                    <Image
                                                        src={getOptimizedImageUrl(relatedArticle.featuredImage?.url, 300, 200) || '/imgs/wukong.png'}
                                                        alt={relatedArticle.title}
                                                        width={300}
                                                        height={200}
                                                        className={styles.relatedCardImage}
                                                        style={{
                                                            width: '100%',
                                                            height: '110px',
                                                            objectFit: 'cover'
                                                        }}
                                                        loading="lazy"
                                                        quality={75}
                                                        placeholder="blur"
                                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                        unoptimized={relatedArticle.featuredImage?.url?.includes('cloudinary.com')}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                                                    />
                                                    <div className={styles.relatedCardContent}>
                                                        <h3 className={styles.relatedCardTitle}>
                                                            {relatedArticle.title}
                                                        </h3>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Trending Articles - Below Related Section */}
                                {trendingArticles.length > 0 && (
                                    <section className={styles.trendingSection}>
                                        <h2 className={styles.trendingTitle}>Trending</h2>
                                        <div className={styles.trendingGrid}>
                                            {trendingArticles.slice(0, 6).map((trendingArticle) => (
                                                <Link
                                                    key={trendingArticle._id}
                                                    href={`/tin-tuc/${trendingArticle.slug}`}
                                                    className={styles.trendingCard}
                                                >
                                                    <Image
                                                        src={getOptimizedImageUrl(trendingArticle.featuredImage?.url, 400, 250) || '/imgs/wukong.png'}
                                                        alt={trendingArticle.title}
                                                        width={400}
                                                        height={250}
                                                        className={styles.trendingCardImage}
                                                        style={{
                                                            width: '100%',
                                                            height: '140px',
                                                            objectFit: 'cover'
                                                        }}
                                                        loading="lazy"
                                                        quality={75}
                                                        placeholder="blur"
                                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                        unoptimized={trendingArticle.featuredImage?.url?.includes('cloudinary.com')}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
                                                    />
                                                    <h3 className={styles.trendingCardTitle}>
                                                        {trendingArticle.title}
                                                    </h3>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </main>

                            {/* Sidebar */}
                            <aside className={styles.sidebar}>
                                {/* Most Viewed Articles */}
                                {mostViewedArticles.length > 0 && (
                                    <div className={styles.sidebarBox}>
                                        <div className={styles.sidebarHeader}>
                                            📊 Xem nhiều nhất
                                        </div>
                                        <div className={styles.sidebarContent}>
                                            <div className={styles.sidebarArticleList}>
                                                {mostViewedArticles.map((article) => (
                                                    <Link
                                                        key={article._id}
                                                        href={`/tin-tuc/${article.slug}`}
                                                        className={styles.sidebarArticle}
                                                    >
                                                        <Image
                                                            src={getOptimizedImageUrl(article.featuredImage?.url, 160, 120) || '/imgs/wukong.png'}
                                                            alt={article.title}
                                                            width={160}
                                                            height={120}
                                                            className={styles.sidebarArticleImage}
                                                            loading="lazy"
                                                            quality={75}
                                                            unoptimized={article.featuredImage?.url?.includes('cloudinary.com')}
                                                            sizes="(max-width: 500px) 80px, 160px"
                                                        />
                                                        <div className={styles.sidebarArticleContent}>
                                                            <h4 className={styles.sidebarArticleTitle}>
                                                                {article.title}
                                                            </h4>
                                                            <div className={styles.sidebarArticleMeta}>
                                                                <Clock size={12} />
                                                                <span>{formatDate(article.publishedAt)}</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Categories */}
                                <div className={styles.sidebarBox}>
                                    <div className={styles.sidebarHeader}>
                                        📁 Chuyên mục
                                    </div>
                                    <div className={styles.sidebarContent}>
                                        <div className={styles.categoriesList}>
                                            <Link href="/tin-tuc?category=lien-minh-huyen-thoai" className={styles.categoryItem}>
                                                Liên Minh Huyền Thoại
                                            </Link>
                                            <Link href="/tin-tuc?category=lien-quan-mobile" className={styles.categoryItem}>
                                                Liên Quân Mobile
                                            </Link>
                                            <Link href="/tin-tuc?category=dau-truong-chan-ly-tft" className={styles.categoryItem}>
                                                Đấu Trường Chân Lý TFT
                                            </Link>
                                            <Link href="/tin-tuc?category=trending" className={styles.categoryItem}>
                                                Trending
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Useful Tools */}
                                <div className={styles.sidebarBox}>
                                    <div className={styles.sidebarHeader}>
                                        🛠️ Công cụ hữu ích
                                    </div>
                                    <div className={styles.sidebarContent}>
                                        <div className={styles.toolsList}>
                                            <Link href="/" className={styles.toolButton}>
                                                <span>Tạo Dàn Đề 9x-0x</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link href="/dan-2d" className={styles.toolButton}>
                                                <span>Tạo Dàn 2D</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link href="/dan-3d4d" className={styles.toolButton}>
                                                <span>Tạo Dàn 3D/4D</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link href="/dan-dac-biet" className={styles.toolButton}>
                                                <span>Dàn Đặc Biệt</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link href="/thong-ke" className={styles.toolButton}>
                                                <span>Thống Kê 3 Miền</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}