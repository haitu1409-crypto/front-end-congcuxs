/**
 * Quản Lý Tin Tức - Admin Page
 * Hiển thị danh sách, chỉnh sửa và xóa bài viết tin tức
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import {
    ArrowLeft,
    Edit2,
    Trash2,
    Eye,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import styles from '../../styles/AdminManage.module.css';

export default function ManageArticles() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = [
        { value: '', label: 'Tất cả danh mục' },
        { value: 'giai-ma-giac-mo', label: 'Giải Mã Giấc Mơ' },
        { value: 'kinh-nghiem-choi-lo-de', label: 'Kinh Nghiệm Chơi Lô Đề' },
        { value: 'thong-ke-xo-so', label: 'Thống Kê Xổ Số' },
        { value: 'meo-vat-xo-so', label: 'Mẹo Vặt Xổ Số' },
        { value: 'tin-tuc-xo-so', label: 'Tin Tức Xổ Số' },
        { value: 'huong-dan-choi', label: 'Hướng Dẫn Chơi' },
        { value: 'phuong-phap-soi-cau', label: 'Phương Pháp Soi Cầu' },
        { value: 'dan-de-chuyen-nghiep', label: 'Dàn Đề Chuyên Nghiệp' }
    ];

    // Check authentication
    useEffect(() => {
        const checkAuth = () => {
            const isAuth = localStorage.getItem('admin_authenticated') === 'true';
            const authTime = localStorage.getItem('admin_auth_time');
            const currentTime = Date.now();

            if (isAuth && authTime && (currentTime - parseInt(authTime)) < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                router.push('/admin');
            }
            setCheckingAuth(false);
        };

        checkAuth();
    }, [router]);

    // Fetch articles
    useEffect(() => {
        if (isAuthenticated) {
            fetchArticles();
        }
    }, [isAuthenticated, currentPage, filterCategory]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            let url = `${apiUrl}/api/articles?page=${currentPage}&limit=20`;

            if (filterCategory) {
                url += `&category=${filterCategory}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setArticles(result.data.articles);
                setTotalPages(result.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) {
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/articles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: '141920' })
            });

            const result = await response.json();

            if (result.success) {
                alert('Xóa bài viết thành công!');
                fetchArticles();
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Có lỗi xảy ra khi xóa bài viết');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getCategoryLabel = (value) => {
        const category = categories.find(cat => cat.value === value);
        return category ? category.label : value;
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (checkingAuth) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Đang kiểm tra quyền truy cập...</p>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Head>
                <title>Quản Lý Tin Tức - Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            <Layout>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.container}>
                        <Link href="/admin" className={styles.backButton}>
                            <ArrowLeft size={20} />
                            <span>Quay lại Dashboard</span>
                        </Link>
                        <h1 className={styles.pageTitle}>Quản Lý Tin Tức</h1>
                        <p className={styles.pageSubtitle}>
                            Xem, chỉnh sửa và xóa bài viết tin tức
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.container}>
                    <div className={styles.contentWrapper}>
                        {/* Filters */}
                        <div className={styles.filtersBar}>
                            <div className={styles.searchBox}>
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài viết..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>

                            <div className={styles.filterBox}>
                                <Filter size={20} />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => {
                                        setFilterCategory(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className={styles.filterSelect}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Link href="/admin/dang-bai" className={styles.createButton}>
                                + Tạo bài mới
                            </Link>
                        </div>

                        {/* Articles List */}
                        {loading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : filteredArticles.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>Không có bài viết nào</p>
                            </div>
                        ) : (
                            <div className={styles.articlesTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Tiêu đề</th>
                                            <th>Danh mục</th>
                                            <th>Ngày đăng</th>
                                            <th>Lượt xem</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredArticles.map(article => (
                                            <tr key={article._id}>
                                                <td className={styles.titleCell}>
                                                    <div className={styles.articleTitle}>
                                                        {article.title}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.categoryBadge}>
                                                        {getCategoryLabel(article.category)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.dateCell}>
                                                        <Calendar size={16} />
                                                        {article.publishedAt ? formatDate(article.publishedAt) : 'Chưa xuất bản'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.viewsCell}>
                                                        <Eye size={16} />
                                                        {article.views || 0}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles[article.status]}`}>
                                                        {article.status === 'published' ? 'Đã xuất bản' :
                                                            article.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <Link
                                                            href={`/tin-tuc/${article.slug}`}
                                                            target="_blank"
                                                            className={styles.actionButton}
                                                            title="Xem bài viết"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => router.push(`/admin/sua-bai?id=${article._id}`)}
                                                            className={`${styles.actionButton} ${styles.editButton}`}
                                                            title="Sửa bài viết"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(article._id, article.title)}
                                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                                            title="Xóa bài viết"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={styles.paginationButton}
                                >
                                    ← Trước
                                </button>
                                <span className={styles.paginationInfo}>
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={styles.paginationButton}
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
}

