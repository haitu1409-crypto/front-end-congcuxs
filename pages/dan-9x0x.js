/**
 * Dàn Đề 9x-0x Page
 * Chuyển toàn bộ logic từ trang chủ sang page chuyên dụng
 */

import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import { Dice6, Target, BarChart3, Star, Zap, CheckCircle, Heart, Smartphone, Filter, Info } from 'lucide-react';
import styles from '../styles/Dan9x0x.module.css';
import SEOOptimized from '../components/SEOOptimized';
import SEOAnalytics from '../components/SEOAnalytics';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import PerformanceMonitor from '../components/PerformanceMonitor';
// import WukongSlider from '../components/WukongSlider';
import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';

// Lazy load heavy components for better PageSpeed
const DanDeGenerator = dynamic(() => import('../components/DanDeGenerator'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải công cụ...</div>,
    ssr: false
});

const GuideSection = dynamic(() => import('../components/GuideSection'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải hướng dẫn...</div>,
    ssr: false
});

export default function Dan9x0xPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // States cho mobile navbar
    const [activeNavItem, setActiveNavItem] = useState('generator');

    // Auto update active nav item based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const sections = [
                { id: 'generator', element: document.querySelector('[data-section="generator"]') },
                { id: 'filter', element: document.querySelector('[data-section="filter"]') },
                { id: 'guide', element: document.querySelector('[data-section="guide"]') }
            ];

            const scrollPosition = window.scrollY + 100; // Offset for better UX

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.element && section.element.offsetTop <= scrollPosition) {
                    setActiveNavItem(section.id);
                    break;
                }
            }
        };

        // Throttle scroll event for better performance
        let ticking = false;
        const throttledHandleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledHandleScroll);
        return () => window.removeEventListener('scroll', throttledHandleScroll);
    }, []);

    // Mobile navbar handlers
    const handleNavItemClick = useCallback((itemId) => {
        setActiveNavItem(itemId);

        // Scroll to section based on itemId
        if (itemId === 'generator') {
            // Scroll to top of generator section
            const generatorSection = document.querySelector('[data-section="generator"]');
            if (generatorSection) {
                generatorSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (itemId === 'filter') {
            // Scroll to filter section
            const filterSection = document.querySelector('[data-section="filter"]');
            if (filterSection) {
                filterSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (itemId === 'guide') {
            // Scroll to guide section
            const guideSection = document.querySelector('[data-section="guide"]');
            if (guideSection) {
                guideSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    // Register mobile-optimized service worker
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                navigator.serviceWorker.register('/sw-mobile.js')
                    .then((registration) => {
                        console.log('Mobile SW registered:', registration);
                    })
                    .catch((error) => {
                        console.log('Mobile SW registration failed:', error);
                    });
            }
        }
    }, []);

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 9x-0x', url: `${siteUrl}/dan-9x0x` }
    ];

    const faqData = [
        {
            question: 'Công cụ tạo dàn đề 9x-0x ngẫu nhiên có miễn phí không?',
            answer: 'Có, công cụ tạo dàn đề 9x-0x ngẫu nhiên và lọc dàn đề tổng hợp hoàn toàn miễn phí 100%, không giới hạn số lần sử dụng, không cần đăng ký tài khoản.'
        },
        {
            question: 'Dàn đề 9x-0x được tạo có chính xác không?',
            answer: 'Công cụ sử dụng thuật toán Fisher-Yates chuẩn quốc tế, đảm bảo tính ngẫu nhiên tuyệt đối và chính xác 100% cho dàn đề 9x-0x. Đây là thuật toán được sử dụng rộng rãi trong các ứng dụng chuyên nghiệp.'
        },
        {
            question: 'Bộ lọc dàn đề tổng hợp hoạt động như thế nào?',
            answer: 'Bộ lọc dàn đề tổng hợp sử dụng thuật toán thông minh để phân tích và lọc các số có khả năng trúng cao nhất từ dàn đề 9x-0x, dựa trên thống kê và xu hướng xổ số 3 miền.'
        },
        {
            question: 'Có thể lưu và xuất dàn đề không?',
            answer: 'Có, bạn có thể lưu dàn đề 9x-0x và kết quả lọc vào bộ nhớ tạm, xuất ra file Excel, hoặc chia sẻ qua mạng xã hội. Tất cả hoàn toàn miễn phí.'
        },
        {
            question: 'Dàn đề 9x-0x phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề 9x-0x phù hợp cho tất cả loại xổ số 3 miền (miền Bắc, miền Nam, miền Trung), lô đề, và các hình thức chơi xổ số khác. Đây là loại dàn đề phổ biến và hiệu quả nhất.'
        },
        {
            question: 'Cách sử dụng công cụ tạo dàn đề 9x-0x hiệu quả?',
            answer: 'Chọn số lượng dàn phù hợp (10-20 dàn), sử dụng bộ lọc tổng hợp để tối ưu kết quả, kết hợp với thống kê xổ số 3 miền để tăng tỷ lệ trúng. Công cụ hỗ trợ nhiều tùy chọn lọc thông minh.'
        }
    ];

    // Schema Markup for SEO
    const lotterySchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Tạo Dàn Đề 9x-0x Chuyên Nghiệp",
        "description": "Công cụ tạo dàn đề 9x-0x ngẫu nhiên với thuật toán Fisher-Yates chuẩn quốc tế. Bộ lọc dàn đề tổng hợp thông minh, miễn phí 100%.",
        "applicationCategory": "GameApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        },
        "featureList": [
            "Tạo dàn đề 9x-0x ngẫu nhiên",
            "Bộ lọc dàn đề tổng hợp",
            "Thuật toán Fisher-Yates chuẩn quốc tế",
            "Miễn phí 100%",
            "Responsive design"
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <>
            <SEOOptimized
                pageType="dan-9x0x"
                customTitle="Tạo Dàn Đề 9x-0x Chuyên Nghiệp - Công Cụ Miễn Phí 2025"
                customDescription="Tạo dàn đề 9x-0x ngẫu nhiên chuyên nghiệp với thuật toán Fisher-Yates chuẩn quốc tế. Bộ lọc dàn đề tổng hợp thông minh, miễn phí 100%, chính xác cho xổ số 3 miền."
                customKeywords="tạo dàn đề 9x-0x, dàn đề 9x-0x, công cụ tạo dàn đề, dàn đề ngẫu nhiên, bộ lọc dàn đề, thuật toán Fisher-Yates, xổ số 3 miền, lô đề, tạo dàn đề miễn phí, dàn đề chuyên nghiệp"
                breadcrumbs={breadcrumbs}
                faq={faqData}
                structuredData={[lotterySchema, breadcrumbSchema, faqSchema]}
            />

            {/* Core Web Vitals & Mobile SEO Optimization */}
            <Head>
                {/* Mobile-first viewport optimization */}
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Tạo Dàn Đề 9x-0x" />

                {/* Mobile SEO optimization */}
                <meta name="format-detection" content="telephone=no" />
                <meta name="theme-color" content="#3b82f6" />
                <meta name="msapplication-TileColor" content="#3b82f6" />
                <meta name="msapplication-navbutton-color" content="#3b82f6" />

                {/* Preload critical resources for mobile */}
                {/* <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /> */}
                {/* <link rel="preload" href="/styles/critical.css" as="style" /> */}
                {/* <link rel="preload" href="/api/dande/generate" as="fetch" crossOrigin="anonymous" /> */}

                {/* DNS prefetch for external resources */}
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

                {/* Resource hints */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Mobile-optimized critical CSS */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                        .hero { min-height: 60vh; }
                        .loadingSkeleton { 
                            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                            background-size: 200% 100%;
                            animation: loading 1.5s infinite;
                        }
                        @keyframes loading {
                            0% { background-position: 200% 0; }
                            100% { background-position: -200% 0; }
                        }
                        /* Mobile touch optimization */
                        @media (hover: none) and (pointer: coarse) {
                            .button, .input, .specialSetItem, .touchSelectionItem, .sumSelectionItem {
                                min-height: 44px;
                                touch-action: manipulation;
                            }
                        }
                        /* Prevent zoom on input focus (iOS) */
                        @media screen and (max-width: 768px) {
                            input[type="text"], input[type="number"], textarea {
                                font-size: 16px;
                            }
                        }
                    `
                }} />
            </Head>

            <PageSpeedOptimizer />
            <PerformanceMonitor />

            <Layout>
                <div className={styles.container}>
                    {/* Hero Section */}
                    <section className={styles.hero}>
                        <div className={styles.heroContent}>
                            <div className={styles.heroBadge}>
                                <Star className={styles.heroBadgeIcon} />
                                <span>Công cụ chuyên nghiệp</span>
                            </div>
                            <h1 className={styles.heroTitle}>
                                Tạo Dàn Đề <span className={styles.heroTitleHighlight}>9x-0x</span> Chuyên Nghiệp
                            </h1>
                            <p className={styles.heroDescription}>
                                Công cụ tạo dàn đề 9x-0x ngẫu nhiên với thuật toán Fisher-Yates chuẩn quốc tế.
                                Bộ lọc dàn đề tổng hợp thông minh, miễn phí 100%, chính xác cho xổ số 3 miền.
                            </p>
                            <div className={styles.heroFeatures}>
                                <div className={styles.heroFeature}>
                                    <CheckCircle className={styles.heroFeatureIcon} />
                                    <span>Miễn phí 100%</span>
                                </div>
                                <div className={styles.heroFeature}>
                                    <Zap className={styles.heroFeatureIcon} />
                                    <span>Nhanh chóng</span>
                                </div>
                                <div className={styles.heroFeature}>
                                    <Target className={styles.heroFeatureIcon} />
                                    <span>Chính xác</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Mobile Navbar */}
                    <div className={styles.mobileNavbar}>
                        <div className={styles.mobileNavbarContainer}>
                            <button
                                className={`${styles.mobileNavbarItem} ${activeNavItem === 'generator' ? styles.active : ''}`}
                                onClick={() => handleNavItemClick('generator')}
                            >
                                <Dice6 className={styles.mobileNavbarIcon} />
                                Tạo Dàn 9x0x
                            </button>
                            <button
                                className={`${styles.mobileNavbarItem} ${activeNavItem === 'filter' ? styles.active : ''}`}
                                onClick={() => handleNavItemClick('filter')}
                            >
                                <Filter className={styles.mobileNavbarIcon} />
                                Lọc Dàn Siêu Cấp
                            </button>
                            <button
                                className={`${styles.mobileNavbarItem} ${activeNavItem === 'guide' ? styles.active : ''}`}
                                onClick={() => handleNavItemClick('guide')}
                            >
                                <Info className={styles.mobileNavbarIcon} />
                                Hướng Dẫn
                            </button>
                        </div>
                    </div>

                    {/* Wukong Slider */}
                    {/* <WukongSlider /> */}

                    {/* Main Generator Section */}
                    <main className={styles.main} id="generator" data-section="generator">
                        <h2 className={styles.sectionTitles} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
                            {/* <Filter size={20} style={{ display: 'inline', marginRight: '8px' }} /> */}
                            Tạo Dàn Đề 9X-0X Ngẫu Nhiên
                        </h2>
                        <p className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>

                            Đặc biệt có thể thêm các điều kiện tạo dàn như: chọn bộ số từ 00-99, bỏ đi kép bằng , bỏ qua các số mong muốn hoặc thêm các số mong muốn
                        </p>
                        <DanDeGenerator />
                    </main>

                    {/* Guide Section */}
                    <div data-section="guide">
                        <GuideSection />
                    </div>

                    {/* Features Section */}
                    <section className={styles.features}>
                        <div className={styles.featuresHeader}>
                            <h2 className={styles.featuresTitle}>Tại sao chọn công cụ của chúng tôi?</h2>
                            <p className={styles.featuresDescription}>
                                Công cụ tạo dàn đề 9x-0x được thiết kế chuyên nghiệp với các tính năng tiên tiến
                            </p>
                        </div>
                        <div className={styles.featuresGrid}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>
                                    <Dice6 />
                                </div>
                                <h3 className={styles.featureTitle}>Thuật toán Fisher-Yates</h3>
                                <p className={styles.featureDescription}>
                                    Sử dụng thuật toán chuẩn quốc tế, đảm bảo tính ngẫu nhiên tuyệt đối cho dàn đề 9x-0x
                                </p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>
                                    <BarChart3 />
                                </div>
                                <h3 className={styles.featureTitle}>Bộ lọc thông minh</h3>
                                <p className={styles.featureDescription}>
                                    Bộ lọc dàn đề tổng hợp phân tích và tối ưu kết quả dựa trên thống kê xổ số 3 miền
                                </p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>
                                    <Smartphone />
                                </div>
                                <h3 className={styles.featureTitle}>Responsive Design</h3>
                                <p className={styles.featureDescription}>
                                    Giao diện tối ưu cho mọi thiết bị, từ desktop đến mobile, trải nghiệm mượt mà
                                </p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>
                                    <Heart />
                                </div>
                                <h3 className={styles.featureTitle}>Hoàn toàn miễn phí</h3>
                                <p className={styles.featureDescription}>
                                    Không giới hạn số lần sử dụng, không cần đăng ký, hoàn toàn miễn phí 100%
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Quick Links Section */}
                    <section className={styles.quickLinks}>
                        <h2 className={styles.quickLinksTitle}>Công cụ khác</h2>
                        <div className={styles.quickLinksGrid}>
                            <Link href="/dan-2d" className={styles.quickLinkCard}>
                                <Target className={styles.quickLinkIcon} />
                                <h3>Dàn 2D</h3>
                                <p>Dàn đề 2 chữ số (00-99)</p>
                            </Link>
                            <Link href="/dan-3d4d" className={styles.quickLinkCard}>
                                <BarChart3 className={styles.quickLinkIcon} />
                                <h3>Dàn 3D/4D</h3>
                                <p>Dàn đề 3-4 chữ số</p>
                            </Link>
                            <Link href="/dan-dac-biet" className={styles.quickLinkCard}>
                                <Star className={styles.quickLinkIcon} />
                                <h3>Dàn Đặc Biệt</h3>
                                <p>Bộ lọc dàn đề thông minh</p>
                            </Link>
                            <Link href="/thong-ke" className={styles.quickLinkCard}>
                                <BarChart3 className={styles.quickLinkIcon} />
                                <h3>Thống Kê</h3>
                                <p>Thống kê xổ số 3 miền</p>
                            </Link>
                        </div>
                    </section>
                </div>
            </Layout>

            <SEOAnalytics />
        </>
    );
}
