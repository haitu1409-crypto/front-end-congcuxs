/**
 * Admin Dashboard - Trang quản trị chính
 * Chứa các nút để truy cập các chức năng đăng bài và quản lý
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import {
    Lock,
    Eye,
    EyeOff,
    FileText,
    TrendingUp,
    Edit,
    Settings,
    Newspaper,
    BarChart3,
    LogOut
} from 'lucide-react';
import styles from '../../styles/AdminDashboard.module.css';

// Authentication Component
const AuthForm = ({ onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (password === '141920') {
                localStorage.setItem('admin_authenticated', 'true');
                localStorage.setItem('admin_auth_time', Date.now().toString());
                onAuthenticated();
            } else {
                setError('Mật khẩu không đúng');
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <Lock size={48} className={styles.authIcon} />
                    <h2 className={styles.authTitle}>Admin Dashboard</h2>
                    <p className={styles.authSubtitle}>
                        Vui lòng nhập mật khẩu để truy cập bảng điều khiển
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.passwordGroup}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu admin"
                            className={styles.passwordInput}
                            required
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.togglePassword}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className={styles.authButton}
                    >
                        {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Dashboard Cards Data
const dashboardCards = [
    {
        title: 'Đăng Bài Tin Tức',
        description: 'Tạo và xuất bản bài viết tin tức mới',
        icon: Newspaper,
        link: '/admin/dang-bai',
        color: '#667eea',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        title: 'Đăng Bài Dự Đoán',
        description: 'Đăng dự đoán xổ số với 4 loại nội dung',
        icon: TrendingUp,
        link: '/admin/dang-dudoan',
        color: '#f093fb',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        title: 'Quản Lý Tin Tức',
        description: 'Xem, chỉnh sửa và xóa bài viết tin tức',
        icon: FileText,
        link: '/admin/quan-ly-tin-tuc',
        color: '#4facfe',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
        title: 'Quản Lý Dự Đoán',
        description: 'Xem, chỉnh sửa và xóa bài dự đoán',
        icon: BarChart3,
        link: '/admin/quan-ly-dudoan',
        color: '#43e97b',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
];

// Main Component
export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = () => {
            const isAuth = localStorage.getItem('admin_authenticated') === 'true';
            const authTime = localStorage.getItem('admin_auth_time');
            const currentTime = Date.now();

            if (isAuth && authTime && (currentTime - parseInt(authTime)) < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('admin_authenticated');
                localStorage.removeItem('admin_auth_time');
                setIsAuthenticated(false);
            }
            setCheckingAuth(false);
        };

        checkAuth();
    }, []);

    const handleAuthenticated = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_time');
        setIsAuthenticated(false);
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // SEO Data
    const seoData = {
        title: 'Admin Dashboard - Tạo Dàn Đề',
        description: 'Bảng điều khiển quản trị website',
        canonical: `${siteUrl}/admin`
    };

    // Show loading while checking authentication
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

    // Show authentication form if not authenticated
    if (!isAuthenticated) {
        return (
            <Layout>
                <Head>
                    <title>{seoData.title}</title>
                    <meta name="robots" content="noindex,nofollow" />
                </Head>
                <AuthForm onAuthenticated={handleAuthenticated} />
            </Layout>
        );
    }

    return (
        <>
            <Head>
                <title>{seoData.title}</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <PageSpeedOptimizer />

            <Layout>
                {/* Dashboard Header */}
                <div className={styles.dashboardHeader}>
                    <div className={styles.container}>
                        <div className={styles.headerContent}>
                            <div className={styles.headerLeft}>
                                <Settings size={40} className={styles.headerIcon} />
                                <div>
                                    <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
                                    <p className={styles.dashboardSubtitle}>
                                        Chào mừng đến với bảng điều khiển quản trị
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <LogOut size={20} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className={styles.dashboardContent}>
                    <div className={styles.container}>
                        {/* Welcome Message */}
                        <div className={styles.welcomeCard}>
                            <h2>🎉 Chào mừng quay trở lại!</h2>
                            <p>Chọn chức năng bên dưới để bắt đầu quản lý website của bạn</p>
                        </div>

                        {/* Dashboard Cards Grid */}
                        <div className={styles.cardsGrid}>
                            {dashboardCards.map((card, index) => {
                                const IconComponent = card.icon;
                                return (
                                    <Link href={card.link} key={index}>
                                        <div
                                            className={styles.dashboardCard}
                                            style={{
                                                '--card-gradient': card.gradient,
                                                '--card-color': card.color
                                            }}
                                        >
                                            <div className={styles.cardIcon}>
                                                <IconComponent size={32} />
                                            </div>
                                            <h3 className={styles.cardTitle}>{card.title}</h3>
                                            <p className={styles.cardDescription}>{card.description}</p>
                                            <div className={styles.cardArrow}>
                                                →
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Quick Stats */}
                        <div className={styles.quickStats}>
                            <h2 className={styles.sectionTitle}>Thống Kê Nhanh</h2>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: '#667eea' }}>
                                        <Newspaper size={24} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statLabel}>Tổng Tin Tức</div>
                                        <div className={styles.statValue}>-</div>
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: '#f093fb' }}>
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statLabel}>Tổng Dự Đoán</div>
                                        <div className={styles.statValue}>-</div>
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: '#4facfe' }}>
                                        <Eye size={24} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statLabel}>Lượt Xem Hôm Nay</div>
                                        <div className={styles.statValue}>-</div>
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: '#43e97b' }}>
                                        <Edit size={24} />
                                    </div>
                                    <div className={styles.statContent}>
                                        <div className={styles.statLabel}>Cập Nhật Gần Đây</div>
                                        <div className={styles.statValue}>-</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className={styles.quickLinks}>
                            <h2 className={styles.sectionTitle}>Liên Kết Nhanh</h2>
                            <div className={styles.linksGrid}>
                                <Link href="/" className={styles.quickLink}>
                                    <span>🏠</span>
                                    <span>Về Trang Chủ</span>
                                </Link>
                                <Link href="/tin-tuc" className={styles.quickLink}>
                                    <span>📰</span>
                                    <span>Xem Tin Tức</span>
                                </Link>
                                <Link href="/admin/dang-bai" className={styles.quickLink}>
                                    <span>✍️</span>
                                    <span>Viết Bài Mới</span>
                                </Link>
                                <Link href="/admin/quan-ly-tin-tuc" className={styles.quickLink}>
                                    <span>📊</span>
                                    <span>Quản Lý Nội Dung</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}


