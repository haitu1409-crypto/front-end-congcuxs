/**
 * Visitor Stats Component - Detailed analytics display
 * Hiển thị thống kê chi tiết từ whos.amung.us
 */

import React, { useState, useEffect } from 'react';
import { Eye, Users, Globe, Clock, TrendingUp, MapPin } from 'lucide-react';
import styles from '../styles/VisitorStats.module.css';

const VisitorStats = ({ 
    widgetId = '7p3pwa',
    showDetails = true,
    refreshInterval = 30000 // 30 seconds
}) => {
    const [stats, setStats] = useState({
        online: 0,
        today: 0,
        yesterday: 0,
        total: 0,
        countries: [],
        pages: []
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Note: whos.amung.us doesn't provide public API
                // This is a placeholder for future implementation
                // You would need to use their dashboard or implement custom tracking
                
                setLoading(false);
                setLastUpdate(new Date());
            } catch (error) {
                console.error('Error fetching visitor stats:', error);
                setLoading(false);
            }
        };

        fetchStats();
        
        if (refreshInterval > 0) {
            const interval = setInterval(fetchStats, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Đang tải thống kê...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <TrendingUp size={20} />
                    Thống Kê Truy Cập
                </h3>
                <span className={styles.lastUpdate}>
                    Cập nhật: {formatTime(lastUpdate)}
                </span>
            </div>

            <div className={styles.statsGrid}>
                {/* Online Users */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statNumber}>
                            {stats.online || '...'}
                        </div>
                        <div className={styles.statLabel}>Đang online</div>
                    </div>
                </div>

                {/* Today's Visitors */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Eye size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statNumber}>
                            {formatNumber(stats.today)}
                        </div>
                        <div className={styles.statLabel}>Hôm nay</div>
                    </div>
                </div>

                {/* Yesterday's Visitors */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statNumber}>
                            {formatNumber(stats.yesterday)}
                        </div>
                        <div className={styles.statLabel}>Hôm qua</div>
                    </div>
                </div>

                {/* Total Visitors */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Globe size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statNumber}>
                            {formatNumber(stats.total)}
                        </div>
                        <div className={styles.statLabel}>Tổng lượt truy cập</div>
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className={styles.details}>
                    <div className={styles.detailSection}>
                        <h4 className={styles.detailTitle}>
                            <MapPin size={16} />
                            Quốc gia phổ biến
                        </h4>
                        <div className={styles.countryList}>
                            {stats.countries.length > 0 ? (
                                stats.countries.map((country, index) => (
                                    <div key={index} className={styles.countryItem}>
                                        <span className={styles.countryName}>{country.name}</span>
                                        <span className={styles.countryCount}>{country.count}</span>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noData}>Không có dữ liệu</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.detailSection}>
                        <h4 className={styles.detailTitle}>
                            <TrendingUp size={16} />
                            Trang phổ biến
                        </h4>
                        <div className={styles.pageList}>
                            {stats.pages.length > 0 ? (
                                stats.pages.map((page, index) => (
                                    <div key={index} className={styles.pageItem}>
                                        <span className={styles.pageName}>{page.name}</span>
                                        <span className={styles.pageCount}>{page.count}</span>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noData}>Không có dữ liệu</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <p className={styles.note}>
                    📊 Dữ liệu từ whos.amung.us - 
                    <a 
                        href={`https://whos.amung.us/stats/${widgetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        Xem dashboard chi tiết
                    </a>
                </p>
            </div>
        </div>
    );
};

export default VisitorStats;
