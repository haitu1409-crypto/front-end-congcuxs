/**
 * Kết Quả Xổ Số Page
 * Trang hiển thị danh sách kết quả xổ số với phân trang
 * SEO Optimized with competitive keywords
 * Auto-refresh enabled to show latest results
 */

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import Layout from '../components/Layout';
import XSMBLatest10Table from '../components/XSMBLatest10Table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/KQXS.module.css';
import SEOOptimized from '../components/SEOOptimized';

const KQXSPage = memo(function KQXSPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Handle page change - Memoized with useCallback
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [totalPages]);

    // Memoize pagination callback
    const handlePaginationChange = useCallback((paginationData) => {
        setPagination(paginationData);
        setTotalPages(paginationData?.totalPages || 1);
        setLastUpdated(new Date()); // Track last update
    }, []);

    // Note: Auto-refresh is handled by useXSMBLatest10 hook
    // No need for manual refresh since the hook fetches latest data on mount
    // and can be configured with refreshInterval if needed

    return (
        <>
            <SEOOptimized
                pageType="kqxs"
                canonical="https://taodandewukong.pro/kqxs"
            />

            <Layout>
                <div className={styles.container}>
                    {/* Header Section */}
                    <h1 style={{ marginBottom: '20px', textAlign: 'center', color: 'rgb(51, 51, 51)' }}>
                        Kết quả xổ số miền Bắc
                    </h1>

                    {/* Results Section */}
                    <div className={styles.resultsSection}>
                        <XSMBLatest10Table
                            page={currentPage}
                            limit={10}
                            onPaginationChange={handlePaginationChange}
                            key={currentPage} // Force re-render when page changes
                        />
                    </div>

                    {/* Pagination */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '30px',
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                    }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '10px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: currentPage === 1 ? '#f0f0f0' : '#fff',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <ChevronLeft size={20} />
                            Trước
                        </button>

                        <span style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}>
                            Trang {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '10px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: currentPage === totalPages ? '#f0f0f0' : '#fff',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            Sau
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Info Section */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h3>Thông tin quan trọng</h3>
                            <ul>
                                <li>Hiển thị 10 kết quả XSMB mới nhất mỗi trang</li>
                                <li>Sắp xếp từ mới nhất đến cũ nhất</li>
                                <li>Dữ liệu được cập nhật tự động từ nguồn chính thức</li>
                                <li>Hỗ trợ phân trang để xem nhiều kết quả hơn</li>
                            </ul>
                        </div>

                        <div className={styles.infoCard}>
                            <h3>Lịch quay số</h3>
                            <ul>
                                <li><strong>Miền Bắc (XSMB):</strong> Hàng ngày lúc 18h15</li>
                                <li><strong>Thời gian cập nhật:</strong> Tự động sau khi quay số</li>
                                <li><strong>Nguồn dữ liệu:</strong> Chính thức từ Công ty Xổ số</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
});

KQXSPage.displayName = 'KQXSPage';

export default KQXSPage;
