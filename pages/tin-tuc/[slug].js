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
import '../../styles/XoSoMienBac.module.css'; // ✅ Import CSS cho lottery tables
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

export default function ArticleDetailPage() {
    const router = useRouter();
    const { slug } = router.query;
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
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

    // Fetch article data with error handling and caching
    const fetchArticle = useCallback(async () => {
        if (!slug) return;

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
    }, [slug, apiUrl]);

    // Effects
    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    // Reading progress tracking
    useEffect(() => {
        const updateReadingProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min(100, (scrollTop / docHeight) * 100);
            setReadingProgress(scrollPercent);
        };

        window.addEventListener('scroll', updateReadingProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateReadingProgress);
    }, []);

    // Table of Contents generation
    const tableOfContents = useMemo(() => {
        if (!article?.content) return [];

        const headings = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.content;

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

        return headings;
    }, [article?.content]);

    // Enhanced structured data for rich snippets
    const structuredData = useMemo(() => {
        if (!article) return null;

        const readingTime = Math.max(1, Math.ceil((article.content?.length || 0) / 1000));
        const wordCount = article.content?.length || 0;

        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.metaDescription || article.excerpt,
            image: article.featuredImage?.url ? [article.featuredImage.url] : [],
            datePublished: article.publishedAt,
            dateModified: article.updatedAt || article.publishedAt,
            author: {
                '@type': 'Person',
                name: article.author || 'Admin'
            },
            publisher: {
                '@type': 'Organization',
                name: 'Tạo Dàn Đề - Công Cụ Xổ Số Chuyên Nghiệp',
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/logo.png`
                }
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${siteUrl}/tin-tuc/${article.slug}`
            },
            interactionStatistic: [
                {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/ReadAction',
                    userInteractionCount: article.views || 0
                },
                {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/ShareAction',
                    userInteractionCount: Math.floor((article.views || 0) * 0.1)
                },
                {
                    '@type': 'InteractionCounter',
                    interactionType: 'https://schema.org/CommentAction',
                    userInteractionCount: Math.floor((article.views || 0) * 0.05)
                }
            ],
            wordCount: wordCount,
            timeRequired: `PT${readingTime}M`,
            articleSection: getCategoryLabel(article.category),
            keywords: article.keywords?.join(', ') || 'tin tức xổ số, lô số, thống kê xổ số'
        };
    }, [article, siteUrl]);

    // Enhanced SEO data
    const seoData = useMemo(() => {
        if (!article) return null;

        const readingTime = Math.max(1, Math.ceil((article.content?.length || 0) / 1000));

        return {
            title: `${article.title} | Tin Tức Xổ Số & Lô Đề`,
            description: article.metaDescription || article.excerpt || `Đọc bài viết "${article.title}" về xổ số và lô số. ${article.excerpt}`,
            keywords: article.keywords?.join(', ') || 'xổ số, lô số, tin tức, kinh nghiệm chơi',
            canonical: `${siteUrl}/tin-tuc/${article.slug}`,
            ogImage: article.featuredImage?.url || `${siteUrl}/images/og-news.jpg`,
            ogType: 'article',
            articleData: {
                publishedTime: article.publishedAt,
                modifiedTime: article.updatedAt,
                author: article.author,
                section: getCategoryLabel(article.category),
                tags: article.tags,
                readingTime: readingTime,
                wordCount: article.content?.length || 0
            }
        };
    }, [article, siteUrl]);

    // Breadcrumbs
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Tin Tức', url: `${siteUrl}/tin-tuc` },
        { name: getCategoryLabel(article?.category), url: `${siteUrl}/tin-tuc?category=${article?.category}` },
        { name: article?.title || 'Bài viết', url: `${siteUrl}/tin-tuc/${article?.slug}` }
    ], [article, siteUrl]);

    // Social sharing functions
    const shareToFacebook = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${article.slug}`);
        const title = encodeURIComponent(article.title);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
    };

    const shareToTwitter = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${article.slug}`);
        const text = encodeURIComponent(article.title);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
    };

    const shareToTelegram = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${article.slug}`);
        const text = encodeURIComponent(article.title);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
    };

    const shareToZalo = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${article.slug}`);
        window.open(`https://zalo.me/share?url=${url}`, '_blank', 'width=600,height=400');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${siteUrl}/tin-tuc/${article.slug}`);
            // Show toast notification here
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Loading state
    if (loading) {
        return (
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
        );
    }

    // Error state
    if (error || !article) {
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

    return (
        <>
            {/* Enhanced SEO with JSON-LD Schema */}
            <ArticleSEO
                title={article.title}
                description={article.summary || article.metaDescription}
                author={article.author?.name || 'Tạo Dàn Đề Wukong'}
                publishedTime={article.createdAt}
                modifiedTime={article.updatedAt}
                image={article.featuredImage?.url}
                url={`${siteUrl}/tin-tuc/${article.slug}`}
                keywords={article.keywords || article.tags || []}
                category={getCategoryLabel(article.category)}
                tags={article.tags || []}
                readingTime={`${Math.ceil((article.content?.length || 0) / 1000)} phút đọc`}
            />
            <SEOOptimized
                pageType="article"
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                canonical={seoData.canonical}
                ogImage={seoData.ogImage}
                ogType={seoData.ogType}
                breadcrumbs={breadcrumbs}
                structuredData={structuredData}
                articleData={seoData.articleData}
            />
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
                                            style={{ background: getCategoryColor(article.category) }}
                                        >
                                            {getCategoryLabel(article.category)}
                                        </span>

                                        <h1 className={styles.articleTitle} itemProp="headline">
                                            {article.title}
                                        </h1>

                                        {article.excerpt && (
                                            <p className={styles.articleSummary}>
                                                {article.excerpt}
                                            </p>
                                        )}

                                        <div className={styles.articleMeta}>
                                            <div className={styles.metaItem}>
                                                <Calendar size={14} className={styles.metaIcon} />
                                                <time dateTime={article.publishedAt} itemProp="datePublished">
                                                    {formatDate(article.publishedAt)}
                                                </time>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Tag size={14} className={styles.metaIcon} />
                                                <span className={styles.author} itemProp="author" itemScope itemType="https://schema.org/Person">
                                                    <span itemProp="name">{article.author || 'Admin'}</span>
                                                </span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Eye size={14} className={styles.metaIcon} />
                                                <span>{viewCount.toLocaleString('vi-VN')} lượt xem</span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Clock size={14} className={styles.metaIcon} />
                                                <span>{Math.ceil((article.content?.length || 0) / 1000)} phút đọc</span>
                                            </div>
                                        </div>
                                    </header>

                                    {/* Featured Image */}
                                    {article.featuredImage?.url && (
                                        <div className={styles.featuredImageWrapper}>
                                            <Image
                                                src={article.featuredImage.url}
                                                alt={article.featuredImage.alt || article.title}
                                                width={500}
                                                height={380}
                                                className={styles.featuredImage}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '500px',
                                                    height: 'auto'
                                                }}
                                                priority
                                                quality={75}
                                                placeholder="blur"
                                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                itemProp="image"
                                            />
                                            {article.featuredImage.caption && (
                                                <p className={styles.imageCaption}>{article.featuredImage.caption}</p>
                                            )}
                                        </div>
                                    )}

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
                                                                            const element = document.getElementById(heading.id);
                                                                            if (element) {
                                                                                element.scrollIntoView({
                                                                                    behavior: 'smooth',
                                                                                    block: 'start'
                                                                                });
                                                                            }
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
                                        dangerouslySetInnerHTML={{ __html: article.content }}
                                    />

                                    {/* Article Footer - Tags & Sharing */}
                                    <footer className={styles.articleFooter}>
                                        {/* Tags */}
                                        {article.tags && article.tags.length > 0 && (
                                            <div className={styles.articleTags}>
                                                <h3 className={styles.tagsTitle}>Từ khóa:</h3>
                                                <div className={styles.tagsList}>
                                                    {article.tags.map((tag, index) => (
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
                                            url={`${siteUrl}/tin-tuc/${article.slug}`}
                                            title={article.title}
                                            description={article.summary || article.metaDescription}
                                            image={article.featuredImage?.url}
                                            hashtags={article.tags || []}
                                        />
                                    </footer>
                                </article>

                                {/* Related Articles - Below Main Article */}
                                {relatedArticles.length > 0 && (
                                    <section className={styles.relatedSection}>
                                        <h2 className={styles.relatedTitle}>Bài viết liên quan</h2>
                                        <div className={styles.relatedGrid}>
                                            {relatedArticles.slice(0, 3).map((relatedArticle) => (
                                                <Link
                                                    key={relatedArticle._id}
                                                    href={`/tin-tuc/${relatedArticle.slug}`}
                                                    className={styles.relatedCard}
                                                >
                                                    <Image
                                                        src={relatedArticle.featuredImage?.url || '/images/default-news.jpg'}
                                                        alt={relatedArticle.title}
                                                        width={300}
                                                        height={160}
                                                        className={styles.relatedCardImage}
                                                        style={{
                                                            width: '100%',
                                                            height: '160px',
                                                            objectFit: 'cover'
                                                        }}
                                                        loading="lazy"
                                                        quality={60}
                                                        placeholder="blur"
                                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                    />
                                                    <div className={styles.relatedCardContent}>
                                                        <h3 className={styles.relatedCardTitle}>
                                                            {relatedArticle.title}
                                                        </h3>
                                                        <div className={styles.relatedCardMeta}>
                                                            <span>{formatDate(relatedArticle.publishedAt)}</span>
                                                            <span>•</span>
                                                            <span>{relatedArticle.views || 0} lượt xem</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </main>

                            {/* Sidebar */}
                            <aside className={styles.sidebar}>
                                {/* Most Viewed Articles */}
                                {relatedArticles.length > 0 && (
                                    <div className={styles.sidebarBox}>
                                        <div className={styles.sidebarHeader}>
                                            📊 Xem nhiều nhất
                                        </div>
                                        <div className={styles.sidebarContent}>
                                            <div className={styles.sidebarArticleList}>
                                                {relatedArticles.slice(0, 5).map((relatedArticle) => (
                                                    <Link
                                                        key={relatedArticle._id}
                                                        href={`/tin-tuc/${relatedArticle.slug}`}
                                                        className={styles.sidebarArticle}
                                                    >
                                                        <Image
                                                            src={relatedArticle.featuredImage?.url || '/images/default-news.jpg'}
                                                            alt={relatedArticle.title}
                                                            width={80}
                                                            height={60}
                                                            className={styles.sidebarArticleImage}
                                                            loading="lazy"
                                                        />
                                                        <div className={styles.sidebarArticleContent}>
                                                            <h4 className={styles.sidebarArticleTitle}>
                                                                {relatedArticle.title}
                                                            </h4>
                                                            <div className={styles.sidebarArticleMeta}>
                                                                <Clock size={12} />
                                                                <span>{formatDate(relatedArticle.publishedAt)}</span>
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
                                            <Link href="/tin-tuc?category=giai-ma-giac-mo" className={styles.categoryItem}>
                                                Giải Mã Giấc Mơ
                                            </Link>
                                            <Link href="/tin-tuc?category=kinh-nghiem-choi-lo-de" className={styles.categoryItem}>
                                                Kinh Nghiệm Chơi Lô Đề
                                            </Link>
                                            <Link href="/tin-tuc?category=thong-ke-xo-so" className={styles.categoryItem}>
                                                Thống Kê Xổ Số
                                            </Link>
                                            <Link href="/tin-tuc?category=meo-vat-xo-so" className={styles.categoryItem}>
                                                Mẹo Vặt Xổ Số
                                            </Link>
                                            <Link href="/tin-tuc?category=tin-tuc-xo-so" className={styles.categoryItem}>
                                                Tin Tức Xổ Số
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