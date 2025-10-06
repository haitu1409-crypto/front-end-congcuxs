/**
 * Modern News Page - Optimized for SEO and Performance
 * Responsive design with accessibility features
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../components/Layout';
import SEOOptimized from '../components/SEOOptimized';
import styles from '../styles/tintuc.module.css';

// API functions
const fetchArticles = async (params = {}) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 12,
        sort: params.sort || '-publishedAt',
        ...params
    });

    const response = await fetch(`${apiUrl}/api/articles?${queryParams}`);
    return response.json();
};

const fetchFeaturedArticles = async (limit = 5) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/articles/featured?limit=${limit}`);
    return response.json();
};

const fetchTrendingArticles = async (limit = 8) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/articles/trending?limit=${limit}`);
    return response.json();
};

const fetchCategories = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/articles/categories`);
    return response.json();
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

// Components
const LoadingSkeleton = () => (
    <div className={styles.loading}>
        <div className={`${styles.skeleton} ${styles.skeletonHero}`}></div>
        <div className={styles.featuredGrid}>
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
            ))}
        </div>
        <div className={styles.articlesList}>
            {[...Array(6)].map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
            ))}
        </div>
    </div>
);

const ErrorMessage = ({ message, onRetry }) => (
    <div className={styles.error}>
        <h3>Không thể tải dữ liệu</h3>
        <p>{message}</p>
        {onRetry && (
            <button onClick={onRetry} className={styles.retryButton}>
                Thử lại
            </button>
        )}
    </div>
);

const HeroArticle = React.memo(({ article }) => {
    if (!article) return null;

    return (
        <Link href={`/tin-tuc/${article.slug}`} className={styles.heroPost}>
            <Image
                src={article.featuredImage?.url || '/images/default-news.jpg'}
                alt={article.featuredImage?.alt || article.title}
                width={800}
                height={400}
                className={styles.heroImage}
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <div className={styles.heroContent}>
                <div className={styles.heroMeta}>
                    <span className={styles.heroDate}>{formatDate(article.publishedAt)}</span>
                    <span
                        className={styles.heroCategory}
                        style={{ '--category-color': getCategoryColor(article.category) }}
                    >
                        {getCategoryLabel(article.category)}
                    </span>
                </div>
                <h1 className={styles.heroTitle}>{article.title}</h1>
                <p className={styles.heroExcerpt}>{article.excerpt}</p>
            </div>
        </Link>
    );
});

const FeaturedCard = React.memo(({ article }) => (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.featuredCard}>
        <Image
            src={article.featuredImage?.url || '/images/default-news.jpg'}
            alt={article.featuredImage?.alt || article.title}
            width={300}
            height={200}
            className={styles.featuredImage}
            loading="lazy"
        />
        <div className={styles.featuredContent}>
            <div className={styles.featuredMeta}>
                <span className={styles.featuredDate}>{formatDate(article.publishedAt)}</span>
                <span
                    className={styles.featuredCategory}
                    style={{ '--category-color': getCategoryColor(article.category) }}
                >
                    {getCategoryLabel(article.category)}
                </span>
            </div>
            <h3 className={styles.featuredTitle}>{article.title}</h3>
            <p className={styles.featuredExcerpt}>{article.excerpt}</p>
        </div>
    </Link>
));

const ArticleCard = React.memo(({ article }) => (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.articleCard}>
        <Image
            src={article.featuredImage?.url || '/images/default-news.jpg'}
            alt={article.featuredImage?.alt || article.title}
            width={200}
            height={120}
            className={styles.articleImage}
            loading="lazy"
        />
        <div className={styles.articleContent}>
            <div className={styles.articleMeta}>
                <span className={styles.articleDate}>{formatDate(article.publishedAt)}</span>
                <span
                    className={styles.articleCategory}
                    style={{ '--category-color': getCategoryColor(article.category) }}
                >
                    {getCategoryLabel(article.category)}
                </span>
            </div>
            <h3 className={styles.articleTitle}>{article.title}</h3>
            <p className={styles.articleExcerpt}>{article.excerpt}</p>
        </div>
    </Link>
));

const SidebarItem = ({ article }) => (
    <Link href={`/tin-tuc/${article.slug}`} className={styles.sidebarItem}>
        <Image
            src={article.featuredImage?.url || '/images/default-news.jpg'}
            alt={article.featuredImage?.alt || article.title}
            width={60}
            height={60}
            className={styles.sidebarItemImage}
        />
        <div className={styles.sidebarItemContent}>
            <h4 className={styles.sidebarItemTitle}>{article.title}</h4>
            <span className={styles.sidebarItemDate}>{formatDate(article.publishedAt)}</span>
        </div>
    </Link>
);

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
        error: null
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // Load data
    const loadData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const [articlesRes, featuredRes, trendingRes, categoriesRes] = await Promise.all([
                fetchArticles({
                    page: state.currentPage,
                    category: state.selectedCategory
                }),
                fetchFeaturedArticles(5),
                fetchTrendingArticles(8),
                fetchCategories()
            ]);

            setState(prev => ({
                ...prev,
                articles: articlesRes.success ? articlesRes.data.articles : [],
                totalPages: articlesRes.success ? articlesRes.data.totalPages : 1,
                featuredArticles: featuredRes.success ? featuredRes.data : [],
                trendingArticles: trendingRes.success ? trendingRes.data : [],
                categories: categoriesRes.success ? categoriesRes.data : [],
                loading: false
            }));
        } catch (error) {
            console.error('Error loading data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
            }));
        }
    }, [state.currentPage, state.selectedCategory]);

    // Effects
    useEffect(() => {
        loadData();
    }, [loadData]);

    // SEO Data
    const seoData = useMemo(() => ({
        title: 'Tin Tức Xổ Số & Lô Đề - Cập Nhật Mới Nhất 2024',
        description: 'Tin tức xổ số, lô đề mới nhất, kinh nghiệm chơi, thống kê số nóng lạnh, mẹo vặt và hướng dẫn chuyên nghiệp từ các chuyên gia.',
        keywords: 'tin tức xổ số, lô đề, thống kê xổ số, kinh nghiệm chơi, mẹo vặt xổ số, soi cầu, dàn đề',
        canonical: `${siteUrl}/tin-tuc`,
        ogImage: `${siteUrl}/images/og-news.jpg`
    }), [siteUrl]);

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
                url: `${siteUrl}/logo.png`
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
                    }
                }
            }))
        }
    };

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Tin Tức', url: `${siteUrl}/tin-tuc` }
    ];

    // Handlers
    const handleCategorySelect = (category) => {
        setState(prev => ({
            ...prev,
            selectedCategory: category,
            currentPage: 1
        }));
    };

    const handlePageChange = (page) => {
        setState(prev => ({ ...prev, currentPage: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (state.loading) {
        return (
            <Layout>
                <LoadingSkeleton />
            </Layout>
        );
    }

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
                breadcrumbs={breadcrumbs}
                structuredData={structuredData}
            />

            <Layout>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.container}>
                        <h1 className={styles.pageTitle}>Tin Tức Xổ Số & Lô Đề</h1>
                        <p className={styles.pageSubtitle}>
                            Cập nhật tin tức mới nhất, kinh nghiệm chơi và thống kê chuyên nghiệp
                        </p>
                    </div>
                </div>

                {/* Category Navigation */}
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
                                    {category.label}
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

                            {/* Featured Articles */}
                            {state.featuredArticles.length > 0 && (
                                <div className={styles.articlesSection}>
                                    <h2 className={styles.sectionTitle}>Bài Viết Nổi Bật</h2>
                                    <div className={styles.featuredGrid}>
                                        {state.featuredArticles.map((article) => (
                                            <FeaturedCard key={article._id} article={article} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Articles List */}
                            <div className={styles.articlesSection}>
                                <h2 className={styles.sectionTitle}>
                                    {state.selectedCategory
                                        ? getCategoryLabel(state.selectedCategory)
                                        : 'Tất Cả Bài Viết'
                                    }
                                </h2>
                                <div className={styles.articlesList}>
                                    {state.articles.map((article) => (
                                        <ArticleCard key={article._id} article={article} />
                                    ))}
                                </div>
                            </div>

                            {/* Pagination */}
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

                        {/* Sidebar */}
                        <aside className={styles.sidebar}>
                            {/* Trending Articles */}
                            {state.trendingArticles.length > 0 && (
                                <div className={styles.sidebarCard}>
                                    <h3 className={styles.sidebarTitle}>Tin Nổi Bật</h3>
                                    <div className={styles.sidebarList}>
                                        {state.trendingArticles.map((article) => (
                                            <SidebarItem key={article._id} article={article} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {state.categories.length > 0 && (
                                <div className={styles.sidebarCard}>
                                    <h3 className={styles.sidebarTitle}>Danh Mục</h3>
                                    <div className={styles.sidebarList}>
                                        {state.categories.map((category) => (
                                            <Link
                                                key={category.key}
                                                href={`/tin-tuc?category=${category.key}`}
                                                className={styles.sidebarItem}
                                            >
                                                <div className={styles.sidebarItemContent}>
                                                    <h4 className={styles.sidebarItemTitle}>
                                                        {category.label}
                                                    </h4>
                                                    <span className={styles.sidebarItemDate}>
                                                        {category.count} bài viết
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </Layout>
        </>
    );
}
