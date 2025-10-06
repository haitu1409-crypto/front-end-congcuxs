/**
 * Tin Tức Page - Trang báo thông tin về xổ số và lô đề
 * Thiết kế giống trang báo với layout responsive và SEO tối ưu
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SEOOptimized from '../components/SEOOptimized';
import Layout from '../components/Layout';
import {
    Search,
    Filter,
    Calendar,
    Eye,
    Heart,
    Share2,
    TrendingUp,
    Star,
    Clock,
    Tag,
    ChevronRight,
    Newspaper,
    BookOpen,
    Lightbulb,
    BarChart3
} from 'lucide-react';
import styles from '../styles/tintuc-old.module.css';

export default function TinTucPage() {
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [trendingArticles, setTrendingArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [sortBy, setSortBy] = useState('-publishedAt');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Tin Tức', url: `${siteUrl}/tin-tuc` }
    ];

    const faqData = useMemo(() => [
        {
            question: 'Tin tức xổ số được cập nhật như thế nào?',
            answer: 'Tin tức xổ số được cập nhật hàng ngày với thông tin mới nhất về kết quả xổ số 3 miền, xu hướng số, và các mẹo chơi từ chuyên gia. Hệ thống tự động đồng bộ dữ liệu realtime.'
        },
        {
            question: 'Có thể tìm kiếm bài viết theo từ khóa không?',
            answer: 'Có, bạn có thể sử dụng chức năng tìm kiếm thông minh để tìm bài viết theo từ khóa, danh mục, hoặc tag. Hệ thống sẽ hiển thị kết quả phù hợp nhất với thuật toán AI.'
        },
        {
            question: 'Bài viết nào được xem là trending?',
            answer: 'Bài viết trending là những bài viết có lượt xem cao, được nhiều người quan tâm và chia sẻ trong thời gian gần đây. Được cập nhật realtime dựa trên tương tác người dùng.'
        },
        {
            question: 'Làm thế nào để đọc tin tức xổ số hiệu quả?',
            answer: 'Để đọc tin tức xổ số hiệu quả, bạn nên theo dõi các bài viết trending, đọc kỹ phân tích của chuyên gia, và kết hợp với thống kê để đưa ra quyết định chơi hợp lý.'
        },
        {
            question: 'Tin tức xổ số có ảnh hưởng đến kết quả không?',
            answer: 'Tin tức xổ số cung cấp thông tin và phân tích giúp người chơi hiểu rõ hơn về xu hướng, nhưng không thể đảm bảo kết quả. Xổ số là trò chơi may rủi, cần chơi có trách nhiệm.'
        },
        {
            question: 'Có thể chia sẻ bài viết lên mạng xã hội không?',
            answer: 'Có, bạn có thể chia sẻ bài viết lên Facebook, Zalo, Telegram và các mạng xã hội khác. Mỗi bài viết đều có nút chia sẻ tích hợp sẵn.'
        }
    ], []);

    // Fetch data functions with caching and error handling
    const fetchArticles = useCallback(async (page = 1, category = '', search = '', sort = '-publishedAt') => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                sort
            });

            if (category) params.append('category', category);
            if (search) params.append('search', search);

            const response = await fetch(`${apiUrl}/api/articles?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'max-age=300', // 5 minutes cache
                },
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setArticles(data.data.articles);
                setPagination(data.data.pagination);
            } else {
                console.error('API Error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            // Set empty state on error
            setArticles([]);
            setPagination({});
        }
    }, [apiUrl]);

    const fetchFeaturedArticles = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/articles/featured?limit=5`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setFeaturedArticles(data.data);
            }
        } catch (error) {
            console.error('Error fetching featured articles:', error);
            setFeaturedArticles([]);
        }
    };

    const fetchTrendingArticles = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/articles/trending?limit=8`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setTrendingArticles(data.data);
            }
        } catch (error) {
            console.error('Error fetching trending articles:', error);
            setTrendingArticles([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/articles/categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    // Load data on component mount - only on client side
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchArticles(currentPage, selectedCategory, searchQuery, sortBy),
                    fetchFeaturedArticles(),
                    fetchTrendingArticles(),
                    fetchCategories()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        // Only run on client side to prevent hydration issues
        if (typeof window !== 'undefined') {
            loadData();
        }
    }, [currentPage, selectedCategory, searchQuery, sortBy]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchArticles(1, selectedCategory, searchQuery, sortBy);
    };

    // Handle category filter
    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        fetchArticles(1, category, searchQuery, sortBy);
    };

    // Handle sort change
    const handleSortChange = (sort) => {
        setSortBy(sort);
        setCurrentPage(1);
        fetchArticles(1, selectedCategory, searchQuery, sort);
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

    return (
        <>
            <SEOOptimized
                pageType="tin-tuc"
                customTitle="Tin Tức Xổ Số & Lô Đề - Cập Nhật Mới Nhất 2024"
                customDescription="Tin tức xổ số mới nhất, giải mã giấc mơ, kinh nghiệm chơi lô đề, thống kê xổ số 3 miền. Cập nhật hàng ngày với thông tin chính xác và mẹo chơi hiệu quả từ chuyên gia."
                customKeywords="tin tức xổ số, giải mã giấc mơ, kinh nghiệm chơi lô đề, thống kê xổ số, mẹo vặt xổ số, phương pháp soi cầu, dàn đề chuyên nghiệp, xu hướng xổ số, số may mắn"
                breadcrumbs={breadcrumbs}
                faq={faqData}
            />

            <Layout>
                <div className={styles.pageContainer}>
                    {/* Header Section */}
                    <header className={styles.pageHeader}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.pageTitle}>
                                <Newspaper size={28} style={{ display: 'inline', marginRight: '12px' }} />
                                Tin Tức Xổ Số & Lô Đề
                            </h1>
                            <p className={styles.pageDescription}>
                                Cập nhật tin tức mới nhất về xổ số 3 miền, giải mã giấc mơ, kinh nghiệm chơi lô đề và các mẹo vặt từ chuyên gia
                            </p>
                        </div>

                        {/* Search and Filter */}
                        <div className={styles.searchFilterSection}>
                            <form onSubmit={handleSearch} className={styles.searchForm}>
                                <div className={styles.searchInputGroup}>
                                    <Search size={20} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm bài viết..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                    <button type="submit" className={styles.searchButton}>
                                        Tìm kiếm
                                    </button>
                                </div>
                            </form>

                            <div className={styles.filterSection}>
                                <div className={styles.sortFilter}>
                                    <Filter size={16} />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className={styles.sortSelect}
                                    >
                                        <option value="-publishedAt">Mới nhất</option>
                                        <option value="views">Xem nhiều</option>
                                        <option value="trending">Trending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className={styles.mainContent}>
                        {/* Sidebar */}
                        <aside className={styles.sidebar}>
                            {/* Categories */}
                            <div className={styles.sidebarSection}>
                                <h3 className={styles.sidebarTitle}>
                                    <Tag size={18} />
                                    Danh Mục
                                </h3>
                                <div className={styles.categoryList}>
                                    <button
                                        className={`${styles.categoryItem} ${!selectedCategory ? styles.active : ''}`}
                                        onClick={() => handleCategoryFilter('')}
                                    >
                                        Tất cả
                                    </button>
                                    {categories.map((category) => {
                                        const IconComponent = getCategoryIcon(category.key);
                                        return (
                                            <button
                                                key={category.key}
                                                className={`${styles.categoryItem} ${selectedCategory === category.key ? styles.active : ''}`}
                                                onClick={() => handleCategoryFilter(category.key)}
                                            >
                                                <IconComponent size={16} />
                                                {category.label}
                                                <span className={styles.categoryCount}>({category.count})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Featured Articles */}
                            <div className={styles.sidebarSection}>
                                <h3 className={styles.sidebarTitle}>
                                    <Star size={18} />
                                    Bài Viết Nổi Bật
                                </h3>
                                <div className={styles.featuredList}>
                                    {featuredArticles.map((article, index) => (
                                        <Link key={article._id} href={`/tin-tuc/${article.slug}`} className={styles.featuredItem}>
                                            <div className={styles.featuredImage}>
                                                <img src={article.featuredImage?.url} alt={article.title} />
                                            </div>
                                            <div className={styles.featuredContent}>
                                                <h4 className={styles.featuredTitle}>{article.title}</h4>
                                                <div className={styles.featuredMeta}>
                                                    <Calendar size={12} />
                                                    {formatDate(article.publishedAt)}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Trending Articles */}
                            <div className={styles.sidebarSection}>
                                <h3 className={styles.sidebarTitle}>
                                    <TrendingUp size={18} />
                                    Đang Trending
                                </h3>
                                <div className={styles.trendingList}>
                                    {trendingArticles.map((article, index) => (
                                        <Link key={article._id} href={`/tin-tuc/${article.slug}`} className={styles.trendingItem}>
                                            <span className={styles.trendingNumber}>{index + 1}</span>
                                            <div className={styles.trendingContent}>
                                                <h4 className={styles.trendingTitle}>{article.title}</h4>
                                                <div className={styles.trendingMeta}>
                                                    <Eye size={12} />
                                                    {article.views} lượt xem
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className={styles.contentArea}>
                            {loading ? (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.loadingSpinner}></div>
                                    <p>Đang tải bài viết...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Articles Grid */}
                                    <div className={styles.articlesGrid}>
                                        {articles.map((article) => (
                                            <article key={article._id} className={styles.articleCard}>
                                                <Link href={`/tin-tuc/${article.slug}`} className={styles.articleLink}>
                                                    <div className={styles.articleImage}>
                                                        <img src={article.featuredImage?.url} alt={article.title} />
                                                        <div className={styles.articleCategory}>
                                                            {categories.find(cat => cat.key === article.category)?.label}
                                                        </div>
                                                    </div>
                                                    <div className={styles.articleContent}>
                                                        <h2 className={styles.articleTitle}>{article.title}</h2>
                                                        <p className={styles.articleExcerpt}>{article.excerpt}</p>
                                                        <div className={styles.articleMeta}>
                                                            <div className={styles.articleDate}>
                                                                <Calendar size={14} />
                                                                {formatDate(article.publishedAt)}
                                                            </div>
                                                            <div className={styles.articleStats}>
                                                                <div className={styles.statItem}>
                                                                    <Eye size={14} />
                                                                    {article.views}
                                                                </div>
                                                                <div className={styles.statItem}>
                                                                    <Heart size={14} />
                                                                    {article.likes}
                                                                </div>
                                                                <div className={styles.statItem}>
                                                                    <Clock size={14} />
                                                                    {article.readingTime} phút
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </article>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className={styles.pagination}>
                                            <button
                                                className={`${styles.paginationButton} ${!pagination.hasPrev ? styles.disabled : ''}`}
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={!pagination.hasPrev}
                                            >
                                                Trước
                                            </button>

                                            <div className={styles.paginationNumbers}>
                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    const pageNum = i + 1;
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            className={`${styles.paginationNumber} ${currentPage === pageNum ? styles.active : ''}`}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                className={`${styles.paginationButton} ${!pagination.hasNext ? styles.disabled : ''}`}
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={!pagination.hasNext}
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </main>
                    </div>
                </div>
            </Layout>
        </>
    );
}
