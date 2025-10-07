/**
 * Admin Statistics Page
 * Trang quản trị để xem thống kê chi tiết từ whos.amung.us
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import { BarChart3, Users, Eye, TrendingUp, Globe, Clock } from 'lucide-react';
import styles from '../../styles/AdminStats.module.css';
import dynamic from 'next/dynamic';

// Lazy load heavy component for better PageSpeed
const VisitorStats = dynamic(() => import('../../components/VisitorStats'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải thống kê...</div>,
    ssr: false
});

export default function AdminStats() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already authenticated
        const authStatus = localStorage.getItem('admin_authenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '141920') {
            localStorage.setItem('admin_authenticated', 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Mật khẩu không đúng');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        setIsAuthenticated(false);
        setPassword('');
    };

    if (!isAuthenticated) {
        return (
            <Layout>
                <Head>
                    <title>Đăng nhập Admin - Dàn Đề Tôn Ngộ Không</title>
                    <meta name="robots" content="noindex,nofollow" />
                </Head>

                <div className={styles.loginContainer}>
                    <div className={styles.loginForm}>
                        <div className={styles.loginHeader}>
                            <BarChart3 size={32} />
                            <h1>Đăng nhập Admin</h1>
                            <p>Nhập mật khẩu để truy cập trang thống kê</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="password">Mật khẩu:</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu admin"
                                    required
                                    className={styles.passwordInput}
                                />
                            </div>

                            {error && (
                                <div className={styles.error}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" className={styles.loginButton}>
                                Đăng nhập
                            </button>
                        </form>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEOOptimized
                title="Thống Kê Website - Admin Dashboard"
                description="Dashboard quản trị để xem thống kê chi tiết về lượng truy cập website"
                keywords="admin, thống kê, analytics, dashboard, whos.amung.us"
                noIndex={true}
            />
            <PageSpeedOptimizer />

            <div className={styles.adminContainer}>
                <div className={styles.adminHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.titleSection}>
                            <BarChart3 size={32} />
                            <div>
                                <h1>Admin Dashboard</h1>
                                <p>Thống kê chi tiết về lượng truy cập website</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Đăng xuất
                        </button>
                    </div>
                </div>


                <div className={styles.statsSection}>
                    <div className={styles.sectionHeader}>
                        <TrendingUp size={24} />
                        <h2>Thống Kê Real-time</h2>
                    </div>

                    <VisitorStats
                        widgetId="7aijsjfwyp"
                        showDetails={true}
                        refreshInterval={30000}
                    />
                </div>


                <div className={styles.featuresSection}>
                    <div className={styles.sectionHeader}>
                        <Clock size={24} />
                        <h2>Tính Năng Theo Dõi</h2>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Users size={20} />
                            </div>
                            <h3>Người Online</h3>
                            <p>Theo dõi số lượng người đang truy cập website real-time</p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Globe size={20} />
                            </div>
                            <h3>Quốc Gia</h3>
                            <p>Xem thống kê theo quốc gia và vùng lãnh thổ</p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <BarChart3 size={20} />
                            </div>
                            <h3>Trang Phổ Biến</h3>
                            <p>Biết trang nào được truy cập nhiều nhất</p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <TrendingUp size={20} />
                            </div>
                            <h3>Xu Hướng</h3>
                            <p>Theo dõi xu hướng truy cập theo thời gian</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
