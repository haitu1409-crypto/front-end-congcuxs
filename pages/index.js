/**
 * Homepage - Tạo Dàn Đề
 * Redesigned với Layout mới, improved content depth, better SEO
 */

import Link from 'next/link';
import Layout from '../components/Layout';
import { Dice6, Target, BarChart3, Star, Zap, CheckCircle, Heart, Smartphone } from 'lucide-react';
import styles from '../styles/Home.module.css';
import DanDeGenerator from '../components/DanDeGenerator';
import GuideSection from '../components/GuideSection';
import SEOOptimized from '../components/SEOOptimized';
import SEOAnalytics from '../components/SEOAnalytics';

export default function Home() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl }
    ];

    const faqData = [
        {
            question: 'Công cụ tạo dàn đề có miễn phí không?',
            answer: 'Có, công cụ tạo dàn đề Tôn Ngộ Không hoàn toàn miễn phí và không giới hạn số lần sử dụng.'
        },
        {
            question: 'Dàn đề được tạo có chính xác không?',
            answer: 'Công cụ sử dụng thuật toán Fisher-Yates hiện đại, đảm bảo tính ngẫu nhiên và chính xác 100%.'
        },
        {
            question: 'Có thể lưu và xuất dàn đề không?',
            answer: 'Có, bạn có thể lưu dàn đề vào bộ nhớ tạm và xuất ra file Excel để sử dụng sau này.'
        }
    ];

    const tools = [
        {
            icon: Dice6,
            title: 'Dàn 9x-0x',
            description: 'Tạo dàn đề 9x-0x ngẫu nhiên với 10 cấp độ rút dần từ 95 xuống 8 số',
            link: '#generator',
            badge: 'Phổ biến'
        },
        {
            icon: Target,
            title: 'Dàn 2D',
            description: 'Tạo dàn 2D (00-99) với phân loại theo mức độ xuất hiện, hỗ trợ chuyển đổi 1D',
            link: '/dan-2d',
            badge: 'Mới'
        },
        {
            icon: BarChart3,
            title: 'Dàn 3D/4D',
            description: 'Tạo dàn 3D (000-999) và 4D (0000-9999), công cụ chuyên nghiệp cho cao thủ',
            link: '/dan-3d4d',
            badge: 'Pro'
        },
        {
            icon: Star,
            title: 'Dàn Đặc Biệt',
            description: 'Bộ lọc thông minh theo đầu, đuôi, tổng, chạm, kép. Lấy nhanh số may mắn',
            link: '/dan-dac-biet',
            badge: 'Đặc biệt'
        }
    ];

    const features = [
        {
            icon: Zap,
            title: 'Nhanh Chóng',
            description: 'Xử lý tức thì, kết quả trong 0.1 giây'
        },
        {
            icon: CheckCircle,
            title: 'Chính Xác',
            description: 'Thuật toán chuẩn, kết quả chính xác 100%'
        },
        {
            icon: Heart,
            title: 'Miễn Phí',
            description: 'Hoàn toàn miễn phí, không giới hạn'
        },
        {
            icon: Smartphone,
            title: 'Mọi Thiết Bị',
            description: 'Hoạt động mượt trên mọi thiết bị'
        }
    ];

    return (
        <>
            <SEOOptimized 
            pageType="homepage"
            breadcrumbs={breadcrumbs}
            faq={faqData}
        />
            <SEOAnalytics />

            <Layout>
                <div className={styles.container}>
                    {/* Hero Section - Compact */}
                    <header className={styles.header}>
                        <h1 className={styles.mainTitle}>
                            Tạo Dàn Đề Chuyên Nghiệp
                        </h1>
                        <p className={styles.subtitle}>
                            Miễn phí • Nhanh chóng • Chính xác 100%
                        </p>
                    </header>

                    {/* Tools Grid */}
                    <section className={styles.toolsSection} aria-label="Các công cụ tạo dàn đề">
                        <h2 className={styles.sectionTitle}>Chọn Công Cụ</h2>

                        <div className={styles.toolsGrid}>
                            {tools.map((tool, idx) => {
                                const IconComponent = tool.icon;
                                return (
                                    <Link
                                        href={tool.link}
                                        key={idx}
                                        className={styles.toolCard}
                                        aria-label={`Đi đến ${tool.title}`}
                                        prefetch={false} // Disable prefetch for better performance
                                    >
                                        {tool.badge && (
                                            <span className={styles.toolBadge}>{tool.badge}</span>
                                        )}
                                        <div className={styles.toolIcon}>
                                            <IconComponent size={24} />
                                        </div>
                                        <h3 className={styles.toolTitle}>{tool.title}</h3>
                                        <p className={styles.toolDescription}>{tool.description}</p>
                                        <div className={styles.toolArrow}>
                                            <span>Truy cập</span>
                                            <span>→</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Main Generator (9x-0x) */}
                    <main className={styles.main} id="generator">
                        <div className={styles.mainGeneratorHeader}>
                            <h2>
                                <Dice6 size={20} style={{ display: 'inline', marginRight: '8px' }} />
                                Tạo Dàn 9x-0x Ngẫu Nhiên
                            </h2>
                            <p>Công cụ tạo dàn đề 9x-0x với 10 cấp độ rút dần từ 95 số xuống 8 số. Phù hợp cho người mới bắt đầu.</p>
                        </div>
                        <DanDeGenerator />
                    </main>

                    {/* Features Section - Compact */}
                    <section className={styles.features} aria-label="Tính năng nổi bật">
                        <div className={styles.featuresGrid}>
                            {features.map((feature, idx) => {
                                const IconComponent = feature.icon;
                                return (
                                    <div key={idx} className={styles.featureItem}>
                                        <div className={styles.featureIcon}>
                                            <IconComponent size={20} />
                                        </div>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Guide Section */}
                    <GuideSection />
                </div>
            </Layout>
        </>
    );
}

