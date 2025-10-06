/**
 * Article Detail Page - Trang chi tiết bài viết
 * Tối ưu SEO với dynamic meta tags và structured data
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import SEOOptimized from '../../components/SEOOptimized';
import Layout from '../../components/Layout';
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
import styles from '../../styles/ArticleDetail.module.css';

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Get category label
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

    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            'giai-ma-giac-mo': BookOpen,
            'kinh-nghiem-choi-lo-de': Lightbulb,
            'thong-ke-xo-so': BarChart3,
            'meo-vat-xo-so': TrendingUp,
            'tin-tuc-xo-so': Newspaper,
            'huong-dan-choi': BookOpen,
            'phuong-phap-soi-cau': BarChart3,
            'dan-de-chuyen-nghiep': Star
        };
        return icons[category] || Newspaper;
    };

    // Fetch article data with caching
    useEffect(() => {
        if (slug) {
            fetchArticle();
        }
    }, [slug]);

    // Reading progress tracking
    useEffect(() => {
        const updateReadingProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            setReadingProgress(scrollPercent);
        };

        window.addEventListener('scroll', updateReadingProgress);
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

    // Memoize structured data for performance
    const structuredData = useMemo(() => {
        if (!article) return null;

        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt,
            image: article.featuredImage?.url,
            author: {
                '@type': 'Person',
                name: article.author
            },
            publisher: {
                '@type': 'Organization',
                name: 'Tạo Dàn Đề - Công Cụ Xổ Số Chuyên Nghiệp',
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/logo.png`
                }
            },
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${siteUrl}/tin-tuc/${article.slug}`
            },
            articleSection: getCategoryLabel(article.category),
            keywords: article.keywords?.join(', '),
            wordCount: article.content?.length || 0,
            timeRequired: `PT${article.readingTime}M`,
            inLanguage: 'vi-VN',
            isAccessibleForFree: true,
            genre: 'News',
            about: {
                '@type': 'Thing',
                name: 'Xổ Số Việt Nam'
            }
        };
    }, [article, siteUrl]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/api/articles/${slug}`);
            const data = await response.json();

            if (data.success) {
                setArticle(data.data);
                await fetchRelatedArticles(data.data.category);
            } else {
                setError('Không tìm thấy bài viết');
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            setError('Lỗi khi tải bài viết');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedArticles = async (category) => {
        try {
            const response = await fetch(`${apiUrl}/api/articles/category/${category}?limit=4`);
            const data = await response.json();

            if (data.success) {
                // Filter out current article
                const filtered = data.data.articles.filter(art => art.slug !== slug);
                setRelatedArticles(filtered.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching related articles:', error);
        }
    };

    // Handle like
    const handleLike = async () => {
        try {
            await fetch(`${apiUrl}/api/articles/${slug}/like`, {
                method: 'POST'
            });
            // Update local state
            setArticle(prev => ({
                ...prev,
                likes: prev.likes + 1
            }));
        } catch (error) {
            console.error('Error liking article:', error);
        }
    };

    // Handle share
    const handleShare = async () => {
        try {
            await fetch(`${apiUrl}/api/articles/${slug}/share`, {
                method: 'POST'
            });
            // Update local state
            setArticle(prev => ({
                ...prev,
                shares: prev.shares + 1
            }));
        } catch (error) {
            console.error('Error sharing article:', error);
        }
    };

    // Social sharing functions
    const shareToFacebook = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${slug}`);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        handleShare();
    };

    const shareToTwitter = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${slug}`);
        const text = encodeURIComponent(article?.title || '');
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
        handleShare();
    };

    const shareToTelegram = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${slug}`);
        const text = encodeURIComponent(article?.title || '');
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        handleShare();
    };

    const shareToZalo = () => {
        const url = encodeURIComponent(`${siteUrl}/tin-tuc/${slug}`);
        window.open(`https://zalo.me/share?url=${url}`, '_blank');
        handleShare();
    };

    // Copy link to clipboard
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${siteUrl}/tin-tuc/${slug}`);
            // You could add a toast notification here
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
        handleShare();
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    if (loading) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Đang tải bài viết...</p>
                </div>
            </Layout>
        );
    }

    if (error || !article) {
        return (
            <Layout>
                <div className={styles.errorContainer}>
                    <h1>Không tìm thấy bài viết</h1>
                    <p>{error || 'Bài viết không tồn tại hoặc đã bị xóa.'}</p>
                    <Link href="/tin-tuc" className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Quay lại tin tức
                    </Link>
                </div>
            </Layout>
        );
    }

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Tin Tức', url: `${siteUrl}/tin-tuc` },
        { name: getCategoryLabel(article.category), url: `${siteUrl}/tin-tuc?category=${article.category}` },
        { name: article.title, url: `${siteUrl}/tin-tuc/${article.slug}` }
    ];

    const CategoryIcon = getCategoryIcon(article.category);

    return (
        <>
            <SEOOptimized
                pageType="article"
                title={`${article.title} - Tin Tức Xổ Số & Lô Đề`}
                description={article.metaDescription || article.excerpt}
                keywords={article.keywords?.join(', ') || `${getCategoryLabel(article.category)}, xổ số, lô đề, ${article.title}`}
                canonical={`${siteUrl}/tin-tuc/${article.slug}`}
                ogImage={article.featuredImage?.url || `${siteUrl}/images/og-news.jpg`}
                breadcrumbs={breadcrumbs}
                structuredData={structuredData}
                articleData={{
                    publishedTime: article.publishedAt,
                    modifiedTime: article.updatedAt,
                    author: article.author,
                    section: getCategoryLabel(article.category),
                    tags: article.tags,
                    readingTime: article.readingTime
                }}
            />


            <Layout>
                {/* Reading Progress Bar */}
                <div
                    className={styles.readingProgress}
                    style={{ width: `${readingProgress}%` }}
                />

                <div className={styles.pageContainer}>
                    <main className={styles.mainContent}>
                        {/* Breadcrumb */}
                        <nav className={styles.breadcrumb}>
                            <Link href="/tin-tuc" className={styles.breadcrumbLink}>
                                <ArrowLeft size={16} />
                                Quay lại tin tức
                            </Link>
                            <div className={styles.breadcrumbPath}>
                                {breadcrumbs.map((crumb, index) => (
                                    <span key={index} className={styles.breadcrumbItem}>
                                        {index > 0 && <span className={styles.separator}>/</span>}
                                        {index === breadcrumbs.length - 1 ? (
                                            <span className={styles.current}>{crumb.name}</span>
                                        ) : (
                                            <Link href={crumb.url} className={styles.breadcrumbLink}>
                                                {crumb.name}
                                            </Link>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </nav>

                        <article className={styles.articleContainer}>
                            {/* Article Header */}
                            <header className={styles.articleHeader}>
                                <div className={styles.articleCategory}>
                                    <CategoryIcon size={16} />
                                    {getCategoryLabel(article.category)}
                                </div>

                                <h1 className={styles.articleTitle}>{article.title}</h1>

                                <div className={styles.articleMeta}>
                                    <div className={styles.metaLeft}>
                                        <div className={styles.metaItem}>
                                            <Calendar size={16} />
                                            {formatDate(article.publishedAt)}
                                        </div>
                                        <div className={styles.metaItem}>
                                            <Clock size={16} />
                                            {article.readingTime} phút đọc
                                        </div>
                                        <div className={styles.metaItem}>
                                            <Eye size={16} />
                                            {article.views} lượt xem
                                        </div>
                                    </div>

                                    <div className={styles.metaRight}>
                                        <button onClick={handleLike} className={styles.actionButton}>
                                            <Heart size={16} />
                                            {article.likes}
                                        </button>
                                        <button onClick={handleShare} className={styles.actionButton}>
                                            <Share2 size={16} />
                                            {article.shares}
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {/* Featured Image */}
                            {article.featuredImage?.url && (
                                <div className={styles.featuredImageContainer}>
                                    <Image
                                        src={article.featuredImage.url}
                                        alt={article.featuredImage.alt || article.title}
                                        width={800}
                                        height={400}
                                        className={styles.featuredImage}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            aspectRatio: '2/1'
                                        }}
                                        priority
                                    />
                                </div>
                            )}

                            {/* Article Content */}
                            <div className={styles.articleContent}>
                                {/* Table of Contents */}
                                {tableOfContents.length > 0 && (
                                    <div className={styles.toc}>
                                        <h3 className={styles.tocTitle}>
                                            <Menu size={16} />
                                            Mục lục
                                        </h3>
                                        <ul className={styles.tocList}>
                                            {tableOfContents.map((heading) => (
                                                <li key={heading.id} className={styles.tocItem}>
                                                    <a
                                                        href={`#${heading.id}`}
                                                        className={`${styles.tocLink} ${activeHeading === heading.id ? styles.active : ''
                                                            }`}
                                                        style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
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

                                <div
                                    className={styles.contentBody}
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />

                                {/* Additional Images */}
                                {article.images && article.images.length > 0 && (
                                    <div className={styles.additionalImages}>
                                        <h3 className={styles.additionalImagesTitle}>
                                            Hình ảnh bổ sung
                                        </h3>
                                        <div className={styles.additionalImagesGrid}>
                                            {article.images.map((image, index) => (
                                                <div key={index} className={styles.additionalImageItem}>
                                                    <Image
                                                        src={image.url}
                                                        alt={image.alt || `Hình ảnh ${index + 1}`}
                                                        width={400}
                                                        height={300}
                                                        className={styles.additionalImage}
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            aspectRatio: '4/3'
                                                        }}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {article.tags && article.tags.length > 0 && (
                                <div className={styles.tagsSection}>
                                    <h3 className={styles.tagsTitle}>
                                        <Tag size={16} />
                                        Tags
                                    </h3>
                                    <div className={styles.tagsList}>
                                        {article.tags.map((tag, index) => (
                                            <span key={index} className={styles.tag}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author Info */}
                            <div className={styles.authorSection}>
                                <div className={styles.authorInfo}>
                                    <div className={styles.authorAvatar}>
                                        {article.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.authorDetails}>
                                        <h4 className={styles.authorName}>{article.author}</h4>
                                        <p className={styles.authorBio}>Chuyên gia xổ số và lô đề</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Share */}
                            <div className={styles.socialShare}>
                                <h3 className={styles.socialShareTitle}>
                                    <Share2 size={16} />
                                    Chia sẻ bài viết
                                </h3>
                                <div className={styles.socialButtons}>
                                    <button
                                        onClick={shareToFacebook}
                                        className={`${styles.socialButton} ${styles.facebook}`}
                                    >
                                        <Facebook size={16} />
                                        Facebook
                                    </button>
                                    <button
                                        onClick={shareToTwitter}
                                        className={`${styles.socialButton} ${styles.twitter}`}
                                    >
                                        <Twitter size={16} />
                                        Twitter
                                    </button>
                                    <button
                                        onClick={shareToTelegram}
                                        className={`${styles.socialButton} ${styles.telegram}`}
                                    >
                                        <Send size={16} />
                                        Telegram
                                    </button>
                                    <button
                                        onClick={shareToZalo}
                                        className={`${styles.socialButton} ${styles.zalo}`}
                                    >
                                        <MessageCircle size={16} />
                                        Zalo
                                    </button>
                                    <button
                                        onClick={copyLink}
                                        className={styles.socialButton}
                                    >
                                        <Share2 size={16} />
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <section className={styles.relatedSection}>
                                <h2 className={styles.relatedTitle}>Bài Viết Liên Quan</h2>
                                <div className={styles.relatedGrid}>
                                    {relatedArticles.map((relatedArticle) => (
                                        <Link
                                            key={relatedArticle._id}
                                            href={`/tin-tuc/${relatedArticle.slug}`}
                                            className={styles.relatedCard}
                                        >
                                            <div className={styles.relatedImage}>
                                                <Image
                                                    src={relatedArticle.featuredImage?.url || '/images/default-news.jpg'}
                                                    alt={relatedArticle.title}
                                                    width={300}
                                                    height={200}
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        aspectRatio: '3/2'
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.relatedContent}>
                                                <h3 className={styles.relatedCardTitle}>
                                                    {relatedArticle.title}
                                                </h3>
                                                <p className={styles.relatedExcerpt}>
                                                    {relatedArticle.excerpt}
                                                </p>
                                                <div className={styles.relatedMeta}>
                                                    <Calendar size={12} />
                                                    {formatDate(relatedArticle.publishedAt)}
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
                        {/* Related Articles */}
                        {relatedArticles.length > 0 && (
                            <div className={styles.sidebarCard}>
                                <h3 className={styles.sidebarTitle}>
                                    <Link2 size={16} />
                                    Bài viết liên quan
                                </h3>
                                <div className={styles.sidebarList}>
                                    {relatedArticles.slice(0, 5).map((relatedArticle) => (
                                        <Link
                                            key={relatedArticle._id}
                                            href={`/tin-tuc/${relatedArticle.slug}`}
                                            className={styles.sidebarItem}
                                        >
                                            <div className={styles.sidebarItemImage}>
                                                <Image
                                                    src={relatedArticle.featuredImage?.url || '/images/default-news.jpg'}
                                                    alt={relatedArticle.title}
                                                    width={60}
                                                    height={60}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px'
                                                    }}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className={styles.sidebarItemContent}>
                                                <h4 className={styles.sidebarItemTitle}>
                                                    {relatedArticle.title}
                                                </h4>
                                                <span className={styles.sidebarItemDate}>
                                                    {formatDate(relatedArticle.publishedAt)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category Articles */}
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>
                                <FolderOpen size={16} />
                                {getCategoryLabel(article.category)}
                            </h3>
                            <div className={styles.sidebarList}>
                                <p className={styles.sidebarDescription}>
                                    Khám phá thêm bài viết cùng chủ đề
                                </p>
                                <Link
                                    href={`/tin-tuc?category=${article.category}`}
                                    className={styles.sidebarButton}
                                >
                                    Xem tất cả
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </Layout>
        </>
    );
}
