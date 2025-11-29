/**
 * Lọc Dàn Đề Page
 * Công cụ lọc dàn tổng hợp tách riêng khỏi trang Dàn 9x-0x
 */

import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { Layers, Target, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import MobileNavbar from '../components/MobileNavbar';
import SEOOptimized from '../components/SEOOptimized';
import { getPageSEO } from '../config/seoConfig';
import styles from '../styles/Dan9x0x.module.css';

const DanDeFilter = dynamic(() => import('../components/DanDeFilter'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải bộ lọc...</div>,
    ssr: false
});

export default function LocDanDePage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const pageSEO = getPageSEO('locDanDe');

    useEffect(() => {
        const handleHashNavigation = () => {
            if (typeof window !== 'undefined' && window.location.hash) {
                const hash = window.location.hash.substring(1);
                const element = document.querySelector(`[data-section="${hash}"]`);
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 400);
                }
            }
        };

        handleHashNavigation();
        window.addEventListener('hashchange', handleHashNavigation);
        return () => window.removeEventListener('hashchange', handleHashNavigation);
    }, []);

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Lọc Dàn Đề', url: `${siteUrl}/loc-dan-de` }
    ];

    const faqData = [
        {
            question: 'Lọc dàn đề tổng hợp là gì?',
            answer: 'Đây là công cụ giúp bạn hợp nhất nhiều dàn số (9x-0x, 3X, 2X, 1X, 0X) và áp dụng bộ lọc thông minh: thêm số mong muốn, loại bỏ số, bỏ kép bằng, chọn bộ số đặc biệt, chạm, tổng để ra dàn tối ưu.'
        },
        {
            question: 'Có thể lọc dàn với bao nhiêu bộ số đặc biệt?',
            answer: 'Bạn có thể chọn tối đa 5 bộ số đặc biệt cùng lúc. Công cụ tự động tránh trùng lặp và cảnh báo nếu bộ số trùng với danh sách loại bỏ.'
        },
        {
            question: 'Công cụ có miễn phí không?',
            answer: '100% miễn phí, không giới hạn số lần sử dụng. Bạn có thể copy kết quả, lưu tạm, hoặc xuất Excel tùy ý.'
        },
        {
            question: 'Thuật toán lọc hoạt động như thế nào?',
            answer: 'Thuật toán ưu tiên số có tần suất xuất hiện cao trong kho dữ liệu bạn nhập, sau đó bù số ngẫu nhiên (Fisher-Yates) để đủ cấp độ 8s, 18s, 28s… đảm bảo dàn vẫn đầy đủ.'
        }
    ];

    const filterSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Công Cụ Lọc Dàn Đề Tổng Hợp',
        description: 'Lọc dàn đề tổng hợp từ các nguồn 9x-0x, 3X, 2X, 1X. Bổ sung bộ lọc thông minh: thêm số, loại bỏ số, bỏ kép bằng, bộ đặc biệt, chạm, tổng. Miễn phí 100%.',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web Browser',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'VND'
        },
        featureList: [
            'Nhập dàn số tùy ý và hợp nhất',
            'Bộ lọc thêm số mong muốn và loại bỏ số',
            'Chọn tối đa 5 bộ số đặc biệt',
            'Chọn chạm, tổng (tối đa 10 lựa chọn mỗi loại)',
            'Bỏ kép bằng tự động, giữ quy tắc cấp độ 8s - 95s'
        ],
        author: {
            '@type': 'Organization',
            name: 'Dàn Đề Wukong',
            url: 'https://taodandewukong.pro'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Dàn Đề Wukong',
            url: 'https://taodandewukong.pro'
        }
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Cách lọc dàn đề tổng hợp nhanh chóng',
        description: 'Hướng dẫn từng bước lọc dàn đề từ nhiều nguồn với bộ lọc thông minh.',
        totalTime: 'PT3M',
        supply: [
            {
                '@type': 'HowToSupply',
                name: 'Danh sách dàn số 9x-0x, 3X, 2X, 1X, 0X'
            }
        ],
        tool: [
            {
                '@type': 'HowToTool',
                name: 'Công Cụ Lọc Dàn Đề Wukong'
            }
        ],
        step: [
            {
                '@type': 'HowToStep',
                name: 'Nhập dàn số nguồn',
                text: 'Copy toàn bộ dàn số bạn muốn lọc và dán vào ô “Nhập dàn số”.'
            },
            {
                '@type': 'HowToStep',
                name: 'Thiết lập điều kiện',
                text: 'Tùy chọn thêm/loại bỏ số, bỏ kép bằng, chọn bộ số đặc biệt, chạm, tổng theo chiến lược.'
            },
            {
                '@type': 'HowToStep',
                name: 'Chọn cấp độ lọc',
                text: 'Chọn các cấp độ mong muốn (0X → 9X) để xuất ra dàn 8s, 18s, 28s… phù hợp vốn.'
            },
            {
                '@type': 'HowToStep',
                name: 'Nhấn “Lọc Dàn”',
                text: 'Hệ thống sẽ ưu tiên số có tần suất cao, sau đó bù số ngẫu nhiên để hoàn tất dàn.'
            },
            {
                '@type': 'HowToStep',
                name: 'Copy kết quả',
                text: 'Sử dụng nút “Copy” để lấy dàn đã lọc, có kèm thống kê tần suất phục vụ phân tích.'
            }
        ],
        author: {
            '@type': 'Organization',
            name: 'Dàn Đề Wukong',
            url: 'https://taodandewukong.pro'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Dàn Đề Wukong',
            url: 'https://taodandewukong.pro'
        }
    };

    return (
        <>
            <SEOOptimized
                pageType="loc-dan-de"
                customTitle={pageSEO.title}
                customDescription={pageSEO.description}
                customKeywords={pageSEO.keywords.join(', ')}
                canonicalUrl={pageSEO.canonical}
                ogImage={pageSEO.image}
                breadcrumbs={breadcrumbs}
                faq={faqData}
                structuredData={[filterSchema, howToSchema]}
            />

            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="theme-color" content="#3b82f6" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <style dangerouslySetInnerHTML={{
                    __html: `
                        .hero-back-button-wrapper {
                            display: flex;
                            justify-content: center;
                        }
                        .hero-back-button {
                            padding: 10px 22px;
                            border-radius: 999px;
                            border: 2px solid #2563eb;
                            color: #2563eb;
                            font-weight: 600;
                            font-size: 14px;
                            text-align: center;
                            transition: all 0.2s ease;
                        }
                        .hero-back-button:hover,
                        .hero-back-button:focus-visible {
                            background: #2563eb;
                            color: #fff;
                            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
                            outline: none;
                        }
                        @media (max-width: 768px) {
                            .hero-back-button-wrapper {
                                justify-content: center;
                                margin-bottom: 8px;
                            }
                            .hero-back-button {
                                width: 100%;
                                max-width: 320px;
                                padding: 8px 16px;
                                font-size: 13px;
                                border-width: 1.5px;
                            }
                        }
                        @media (max-width: 480px) {
                            .hero-back-button-wrapper {
                                margin-bottom: 6px;
                            }
                            .hero-back-button {
                                padding: 6px 12px;
                                font-size: 12px;
                                border-width: 1px;
                                max-width: 100%;
                            }
                        }
                    `
                }} />
            </Head>

            <Layout>
                <div className={styles.container}>
                    <div className="hero-back-button-wrapper">
                        <Link href="/dan-9x0x" className="hero-back-button">
                            Quay lại tạo dàn 9x-0x
                        </Link>
                    </div>

                    <MobileNavbar currentPage="loc-dan-de" showCurrentPageItems={false} />

                    <section className={styles.main2} id="filter" data-section="filter">
                        <h2 className={styles.sectionTitles} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
                            Công Cụ Lọc Dàn Đề Tổng Hợp
                        </h2>
                        <span className={styles.chuthich}>
                            Hãy copy dàn 9x-0x, 3X, 2X, 1X, 0X – thêm điều kiện và nhấn “Lọc Dàn” để nhận dàn tối ưu theo vốn.
                        </span>
                        <DanDeFilter />
                    </section>

                    <div id="guide" data-section="guide" className={styles.guideWrapper}>
                        <section className={styles.guideCard} aria-labelledby="filter-guide-title">
                            <div className={styles.guideCardHeader}>
                                <h2 id="filter-guide-title">4 bước lọc dàn đề siêu cấp</h2>
                                <p>Áp dụng đúng quy trình để tránh xung đột số và tận dụng hết sức mạnh bộ lọc.</p>
                            </div>
                            <div className={styles.guideCardContent}>
                                <ul>
                                    <li>
                                        <strong>Bước 1:</strong> Dán toàn bộ dàn số cần lọc vào ô <em>“Nhập dàn số”</em>.
                                    </li>
                                    <li>
                                        <strong>Bước 2:</strong> Thiết lập điều kiện ở cột trái:
                                        <br />- <em>Thêm số</em> để luôn giữ số quan trọng.<br />- <em>Loại bỏ số</em> để tránh số xấu.<br />- <em>Bỏ kép bằng</em> khi muốn rút còn 90s.<br />- <em>Bộ đặc biệt, chạm, tổng</em> để chọn đúng chiến thuật.
                                    </li>
                                    <li>
                                        <strong>Bước 3:</strong> Chọn cấp độ (0X → 9X) tương ứng dàn cần lấy: 8s, 18s, 28s… Dàn cao hơn luôn bao gồm dàn thấp hơn.
                                    </li>
                                    <li>
                                        <strong>Bước 4:</strong> Bấm <em>“Lọc Dàn”</em>. Kiểm tra thống kê tần suất phía trên để biết số nào đang mạnh. Copy kết quả hoặc lưu lại bằng nút “Copy”. 
                                    </li>
                                </ul>
                                <p className={styles.guideWarning}>
                                    <strong>MẸO:</strong> Trước khi lọc, hãy bỏ sẵn các số đặc biệt đã ra gần đây và chọn thêm bộ đặc biệt phù hợp để dàn gọn nhưng vẫn giữ xác suất cao.
                                </p>
                            </div>
                        </section>
                    </div>

                </div>
            </Layout>
        </>
    );
}


