/**
 * Quản Lý Dự Đoán - Admin Page
 * Hiển thị danh sách, chỉnh sửa và xóa bài dự đoán
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
    TrendingUp
} from 'lucide-react';
import styles from '../../styles/AdminManage.module.css';

export default function ManagePredictions() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    // Fetch predictions
    useEffect(() => {
        if (isAuthenticated) {
            fetchPredictions();
        }
    }, [isAuthenticated, currentPage]);

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const url = `${apiUrl}/api/predictions?page=${currentPage}&limit=20`;

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setPredictions(result.data.predictions);
                setTotalPages(result.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, date) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa dự đoán ngày "${date}"?`)) {
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/predictions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: '141920' })
            });

            const result = await response.json();

            if (result.success) {
                alert('Xóa dự đoán thành công!');
                fetchPredictions();
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting prediction:', error);
            alert('Có lỗi xảy ra khi xóa dự đoán');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredPredictions = predictions.filter(prediction => {
        const dateStr = formatDate(prediction.predictionDate);
        return dateStr.includes(searchTerm);
    });

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
                <title>Quản Lý Dự Đoán - Admin</title>
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
                        <h1 className={styles.pageTitle}>Quản Lý Dự Đoán</h1>
                        <p className={styles.pageSubtitle}>
                            Xem, chỉnh sửa và xóa bài dự đoán xổ số
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
                                    placeholder="Tìm kiếm theo ngày (dd/mm/yyyy)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>

                            <Link href="/admin/dang-dudoan" className={styles.createButton}>
                                + Tạo dự đoán mới
                            </Link>
                        </div>

                        {/* Predictions List */}
                        {loading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : filteredPredictions.length === 0 ? (
                            <div className={styles.emptyState}>
                                <TrendingUp size={48} />
                                <p>Chưa có dự đoán nào</p>
                                <Link href="/admin/dang-dudoan" className={styles.emptyStateButton}>
                                    Tạo dự đoán đầu tiên
                                </Link>
                            </div>
                        ) : (
                            <div className={styles.predictionsGrid}>
                                {filteredPredictions.map(prediction => (
                                    <div key={prediction._id} className={styles.predictionCard}>
                                        <div className={styles.predictionHeader}>
                                            <div className={styles.predictionDate}>
                                                <Calendar size={20} />
                                                <span>{formatDate(prediction.predictionDate)}</span>
                                            </div>
                                            <span className={`${styles.statusBadge} ${styles[prediction.status]}`}>
                                                {prediction.status === 'published' ? 'Đã xuất bản' :
                                                    prediction.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                                            </span>
                                        </div>

                                        <div className={styles.predictionContent}>
                                            <div className={styles.predictionSection}>
                                                <h4>Cầu Lotto</h4>
                                                <div
                                                    className={styles.predictionPreview}
                                                    dangerouslySetInnerHTML={{
                                                        __html: prediction.lottoContent.substring(0, 100) + '...'
                                                    }}
                                                />
                                            </div>

                                            <div className={styles.predictionSection}>
                                                <h4>Cầu Đặc biệt</h4>
                                                <div
                                                    className={styles.predictionPreview}
                                                    dangerouslySetInnerHTML={{
                                                        __html: prediction.specialContent.substring(0, 100) + '...'
                                                    }}
                                                />
                                            </div>

                                            <div className={styles.predictionSection}>
                                                <h4>Cầu 2 nháy</h4>
                                                <div
                                                    className={styles.predictionPreview}
                                                    dangerouslySetInnerHTML={{
                                                        __html: prediction.doubleJumpContent ? prediction.doubleJumpContent.substring(0, 100) + '...' : 'Chưa có nội dung'
                                                    }}
                                                />
                                            </div>

                                            <div className={styles.predictionSection}>
                                                <h4>Bảng lô top</h4>
                                                <div
                                                    className={styles.predictionPreview}
                                                    dangerouslySetInnerHTML={{
                                                        __html: prediction.topTableContent.substring(0, 100) + '...'
                                                    }}
                                                />
                                            </div>

                                            <div className={styles.predictionSection}>
                                                <h4>Dự đoán Wukong</h4>
                                                <div
                                                    className={styles.predictionPreview}
                                                    dangerouslySetInnerHTML={{
                                                        __html: prediction.wukongContent.substring(0, 100) + '...'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.predictionStats}>
                                            <div className={styles.statItem}>
                                                <Eye size={16} />
                                                <span>{prediction.views || 0} lượt xem</span>
                                            </div>
                                            <div className={styles.statItem}>
                                                <span>👤</span>
                                                <span>{prediction.author}</span>
                                            </div>
                                        </div>

                                        <div className={styles.predictionActions}>
                                            <button
                                                onClick={() => router.push(`/admin/sua-dudoan?id=${prediction._id}`)}
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                            >
                                                <Edit2 size={18} />
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(prediction._id, formatDate(prediction.predictionDate))}
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                            >
                                                <Trash2 size={18} />
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))}
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

