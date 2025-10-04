/**
 * Dàn Đặc Biệt Page - Redesigned
 * Inspired by taodande.com design
 */

import Link from 'next/link';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import AOSWrapper from '../../components/AOSWrapper';
import { Star, Zap, Target, CheckCircle, Rocket, BookOpen, Hash, Dice6, BarChart3, Home, Shield, Smartphone } from 'lucide-react';
import styles from '../../styles/DanDacBiet.module.css';
import { Suspense, lazy } from 'react';

// Import safe lazy components với Error Boundary
import {
    ComponentLoader,
    DefaultLoadingSpinner
} from '../../components/LazyComponents';

// Lazy load các components nặng để cải thiện performance
const LocGhepDanComponent = lazy(() => import('../../components/DanDe/LocGhepDanComponent'));
const LayNhanhDacBiet = lazy(() => import('../../components/DanDe/LayNhanhDacBiet'));
const TaoDanDauDuoi = lazy(() => import('../../components/DanDe/TaoDanDauDuoi'));
const TaoDanCham = lazy(() => import('../../components/DanDe/TaoDanCham'));
const TaoDanBo = lazy(() => import('../../components/DanDe/TaoDanBo'));

export default function DanDacBietPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const seoData = {
        title: 'Tạo Dàn Đặc Biệt Online - Bộ Lọc Thông Minh | Miễn Phí 2024',
        description: 'Tạo dàn đề đặc biệt với bộ lọc thông minh: Lấy nhanh, Đầu-Đuôi, Chạm, Bộ, Kép. Thuật toán AI tiên tiến. Miễn phí không giới hạn. Được hàng ngàn người tin dùng.',
        keywords: 'tạo dàn đặc biệt, bộ lọc dàn đề, lọc số đặc biệt, đầu đuôi số, chạm số, kép bằng, dàn đề đặc biệt, bộ lọc thông minh, tạo dàn đặc biệt online, dàn đề Tôn Ngộ Không, lọc dàn đề chuyên nghiệp, bộ lọc số chính xác, dàn đặc biệt miễn phí, công cụ lọc số, thuật toán lọc dàn đề',
        url: `${siteUrl}/dan-dac-biet`,
        image: '/images/dan-dac-biet-og.jpg',
        type: 'article',
        breadcrumbs: [
            { name: 'Trang chủ', url: '/' },
            { name: 'Tạo Dàn Đặc Biệt', url: '/dan-dac-biet' }
        ],
    };

    return (
        <>
            <SEO {...seoData} />

            <Layout>
                <AOSWrapper>
                    <div className={styles.pageContainer}>
                        {/* Hero Section */}
                        <div className={styles.heroSection}>
                            <div className={styles.heroContent}>
                                <h1 className={styles.heroTitle}>
                                    <span className={styles.heroTitleMain}>Tạo Dàn Đặc Biệt</span>

                                </h1>

                            </div>
                            <div className={styles.heroVisual}>
                                <div className={styles.floatingNumbers}>
                                    <span className={styles.floatingNumber}>01</span>
                                    <span className={styles.floatingNumber}>23</span>
                                    <span className={styles.floatingNumber}>45</span>
                                    <span className={styles.floatingNumber}>67</span>
                                    <span className={styles.floatingNumber}>89</span>
                                </div>
                            </div>
                        </div>

                        {/* LỌC, GHÉP DÀN ĐẶC BIỆT Section */}
                        <div className={styles.locGhepSection} data-aos="fade-up" data-aos-delay="100">
                            <ComponentLoader
                                errorMessage="Lỗi khi tải bộ lọc dàn đặc biệt. Vui lòng thử lại."
                                fallback={<div className={styles.loadingPlaceholder}>Đang tải bộ lọc...</div>}
                            >
                                <LocGhepDanComponent />
                            </ComponentLoader>
                        </div>

                        {/* Main Tools Grid */}
                        <div className={styles.toolsGrid}>
                            <div className={styles.toolCard} data-aos="fade-up" data-aos-delay="100">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <LayNhanhDacBiet />
                                </Suspense>
                            </div>

                            <div className={styles.toolCard} data-aos="fade-up" data-aos-delay="200">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <TaoDanDauDuoi />
                                </Suspense>
                            </div>

                            <div className={styles.toolCard} data-aos="fade-up" data-aos-delay="300">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <TaoDanCham />
                                </Suspense>
                            </div>

                            <div className={styles.toolCard} data-aos="fade-up" data-aos-delay="400">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <TaoDanBo />
                                </Suspense>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className={styles.quickLinks} data-aos="fade-up" data-aos-delay="500">
                            <div className={styles.quickLinksHeader}>
                                <h3 className={styles.quickLinksTitle}>Công cụ khác</h3>
                                <p className={styles.quickLinksSubtitle}>Khám phá thêm các tính năng hữu ích</p>
                            </div>
                            <div className={styles.quickLinksGrid}>
                                <Link href="/dan-2d" className={styles.quickLink} data-aos="zoom-in" data-aos-delay="100">
                                    <div className={styles.quickLinkIcon}><Target size={20} /></div>
                                    <div className={styles.quickLinkContent}>
                                        <span className={styles.quickLinkText}>Tạo Dàn 2D</span>
                                        <span className={styles.quickLinkDesc}>Dàn đề 2 chữ số</span>
                                    </div>
                                    <div className={styles.quickLinkArrow}>→</div>
                                </Link>
                                <Link href="/dan-3d4d" className={styles.quickLink} data-aos="zoom-in" data-aos-delay="200">
                                    <div className={styles.quickLinkIcon}><BarChart3 size={20} /></div>
                                    <div className={styles.quickLinkContent}>
                                        <span className={styles.quickLinkText}>Tạo Dàn 3D-4D</span>
                                        <span className={styles.quickLinkDesc}>Dàn đề 3-4 chữ số</span>
                                    </div>
                                    <div className={styles.quickLinkArrow}>→</div>
                                </Link>
                                <Link href="/" className={styles.quickLink} data-aos="zoom-in" data-aos-delay="300">
                                    <div className={styles.quickLinkIcon}><Home size={20} /></div>
                                    <div className={styles.quickLinkContent}>
                                        <span className={styles.quickLinkText}>Trang chủ</span>
                                        <span className={styles.quickLinkDesc}>Tổng quan công cụ</span>
                                    </div>
                                    <div className={styles.quickLinkArrow}>→</div>
                                </Link>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className={styles.featuresSection} data-aos="fade-up" data-aos-delay="600">
                            <h3 className={styles.featuresTitle}>Tại sao chọn chúng tôi?</h3>
                            <div className={styles.featuresGrid}>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="100">
                                    <div className={styles.featureIcon}><Zap size={20} /></div>
                                    <h4 className={styles.featureTitle}>Tốc độ siêu nhanh</h4>
                                    <p className={styles.featureDesc}>Xử lý hàng nghìn số trong vài giây</p>
                                </div>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="200">
                                    <div className={styles.featureIcon}><Target size={20} /></div>
                                    <h4 className={styles.featureTitle}>Độ chính xác cao</h4>
                                    <p className={styles.featureDesc}>Thuật toán thông minh, kết quả chính xác</p>
                                </div>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="300">
                                    <div className={styles.featureIcon}><Shield size={20} /></div>
                                    <h4 className={styles.featureTitle}>Bảo mật tuyệt đối</h4>
                                    <p className={styles.featureDesc}>Dữ liệu được mã hóa và bảo vệ an toàn</p>
                                </div>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="400">
                                    <div className={styles.featureIcon}><Smartphone size={20} /></div>
                                    <h4 className={styles.featureTitle}>Đa nền tảng</h4>
                                    <p className={styles.featureDesc}>Hoạt động mượt mà trên mọi thiết bị</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </AOSWrapper>
            </Layout>
        </>
    );
}

