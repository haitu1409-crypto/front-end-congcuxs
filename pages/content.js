/**
 * Content Page - Hướng dẫn và mẹo chơi xổ số
 * Tối ưu SEO với nội dung hấp dẫn và từ khóa phổ biến
 */

import { useState } from 'react';
import Link from 'next/link';
import SEOOptimized from '../components/SEOOptimized';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import {
    BookOpen,
    Target,
    TrendingUp,
    BarChart3,
    Lightbulb,
    Users,
    Calendar,
    Award,
    Zap,
    Shield,
    Star,
    CheckCircle
} from 'lucide-react';
import styles from '../styles/Content.module.css';

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState('huong-dan');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Hướng dẫn & Mẹo chơi', url: `${siteUrl}/content` }
    ];

    const faqData = [
        {
            question: 'Cách tạo dàn số 9x-0x hiệu quả nhất?',
            answer: 'Để tạo dàn số 9x-0x hiệu quả, bạn nên sử dụng công cụ tạo dàn số ngẫu nhiên với thuật toán Fisher-Yates chuẩn quốc tế. Chọn số lượng dàn phù hợp (10-20 dàn), kết hợp với bộ lọc thông minh để tối ưu kết quả.'
        },
        {
            question: 'Thống kê xổ số 3 miền có chính xác không?',
            answer: 'Thống kê xổ số 3 miền được cập nhật realtime từ nguồn chính thức, đảm bảo tính chính xác 100%. Dữ liệu bao gồm kết quả miền Bắc, miền Nam, miền Trung với đầy đủ thông tin về tần suất xuất hiện.'
        },
        {
            question: 'Soi cầu xổ số có hiệu quả không?',
            answer: 'Soi cầu xổ số là phương pháp phân tích dựa trên thống kê và xu hướng. Mặc dù không đảm bảo 100% trúng, nhưng việc kết hợp soi cầu với thống kê chính xác có thể tăng khả năng dự đoán.'
        },
        {
            question: 'Dàn đề 2D và 3D khác nhau như thế nào?',
            answer: 'Dàn đề 2D (00-99) phù hợp cho lô số 2 số, dàn số 3D (000-999) cho lô số 3 số. Mỗi loại có chiến lược chơi khác nhau và cần phân tích thống kê riêng biệt.'
        },
        {
            question: 'Cách chơi xổ số an toàn và hiệu quả?',
            answer: 'Chơi xổ số an toàn cần có kế hoạch tài chính rõ ràng, không chơi quá khả năng. Sử dụng các công cụ thống kê và phân tích để đưa ra quyết định hợp lý, tránh chơi theo cảm tính.'
        }
    ];

    const contentSections = {
        'huong-dan': {
            title: 'Hướng Dẫn Chơi Xổ Số Hiệu Quả',
            icon: BookOpen,
            content: [
                {
                    title: 'Cách Tạo Dàn Đề 9x-0x Chính Xác',
                    description: 'Dàn đề 9x-0x là phương pháp chơi lô số phổ biến nhất hiện nay. Để tạo dàn số hiệu quả, bạn cần:',
                    steps: [
                        'Sử dụng công cụ tạo dàn số ngẫu nhiên với thuật toán Fisher-Yates',
                        'Chọn số lượng dàn phù hợp (10-20 dàn)',
                        'Kết hợp với bộ lọc thông minh để tối ưu kết quả',
                        'Phân tích thống kê xuất hiện của các số',
                        'Lưu trữ và theo dõi kết quả để cải thiện chiến lược'
                    ]
                },
                {
                    title: 'Phương Pháp Soi Cầu Xổ Số 3 Miền',
                    description: 'Soi cầu là nghệ thuật phân tích dựa trên thống kê và xu hướng:',
                    steps: [
                        'Theo dõi kết quả xổ số 3 miền hàng ngày',
                        'Phân tích chu kỳ xuất hiện của các số',
                        'Sử dụng bảng thống kê để xác định số nóng/lạnh',
                        'Kết hợp nhiều phương pháp soi cầu khác nhau',
                        'Đánh giá hiệu quả và điều chỉnh chiến lược'
                    ]
                },
                {
                    title: 'Chiến Lược Chơi Dàn Đề 2D/3D/4D',
                    description: 'Mỗi loại dàn số có chiến lược riêng:',
                    steps: [
                        'Dàn 2D (00-99): Phù hợp cho lô số 2 số, dễ trúng',
                        'Dàn 3D (000-999): Cho lô số 3 số, tỷ lệ trúng thấp hơn nhưng thưởng cao',
                        'Dàn 4D (0000-9999): Cho lô số 4 số, thưởng rất cao nhưng khó trúng',
                        'Kết hợp nhiều loại dàn để đa dạng hóa rủi ro',
                        'Sử dụng thống kê để chọn loại dàn phù hợp'
                    ]
                }
            ]
        },
        'meo-vat': {
            title: 'Mẹo Vặt Chơi Xổ Số',
            icon: Lightbulb,
            content: [
                {
                    title: '10 Mẹo Tăng Tỷ Lệ Trúng Xổ Số',
                    description: 'Những mẹo được đúc kết từ kinh nghiệm của các cao thủ:',
                    steps: [
                        'Chơi đều đặn, không chơi theo cảm tính',
                        'Sử dụng công cụ thống kê để phân tích',
                        'Chọn số dựa trên chu kỳ xuất hiện',
                        'Tránh chơi quá nhiều số cùng lúc',
                        'Theo dõi và học hỏi từ các cao thủ',
                        'Quản lý vốn một cách thông minh',
                        'Không chơi khi tâm lý không ổn định',
                        'Ghi chép kết quả để phân tích xu hướng',
                        'Kết hợp nhiều phương pháp khác nhau',
                        'Kiên nhẫn và không nản lòng'
                    ]
                },
                {
                    title: 'Cách Đọc Thống Kê Xổ Số Hiệu Quả',
                    description: 'Thống kê là chìa khóa để thành công:',
                    steps: [
                        'Theo dõi tần suất xuất hiện của từng số',
                        'Phân tích chu kỳ nóng/lạnh của các số',
                        'Xác định các cặp số thường đi cùng nhau',
                        'Theo dõi xu hướng theo ngày trong tuần',
                        'Phân tích theo tháng và mùa trong năm',
                        'So sánh thống kê giữa các miền',
                        'Sử dụng biểu đồ để trực quan hóa dữ liệu',
                        'Cập nhật thống kê thường xuyên'
                    ]
                },
                {
                    title: 'Tâm Lý Chơi Xổ Số Đúng Cách',
                    description: 'Tâm lý ổn định là yếu tố quan trọng:',
                    steps: [
                        'Xem xổ số là trò chơi giải trí, không phải nghề nghiệp',
                        'Đặt ra ngân sách chơi cố định mỗi tháng',
                        'Không chơi khi đang stress hoặc buồn bã',
                        'Học cách chấp nhận thua cuộc',
                        'Không vay mượn tiền để chơi xổ số',
                        'Chia sẻ kinh nghiệm với bạn bè',
                        'Tìm hiểu về xác suất và toán học',
                        'Giữ tinh thần lạc quan và tích cực'
                    ]
                }
            ]
        },
        'thong-ke': {
            title: 'Thống Kê & Phân Tích Xổ Số',
            icon: BarChart3,
            content: [
                {
                    title: 'Phân Tích Thống Kê Xổ Số 3 Miền',
                    description: 'Thống kê chi tiết về xu hướng xổ số:',
                    steps: [
                        'Miền Bắc: Xổ số hàng ngày, nhiều giải thưởng',
                        'Miền Nam: Xổ số 3 lần/tuần, tỷ lệ trúng cao',
                        'Miền Trung: Xổ số 2 lần/tuần, thưởng lớn',
                        'So sánh tỷ lệ trúng giữa các miền',
                        'Phân tích xu hướng theo thời gian',
                        'Xác định các số may mắn theo miền',
                        'Theo dõi biến động của các giải thưởng',
                        'Dự đoán xu hướng dựa trên dữ liệu lịch sử'
                    ]
                },
                {
                    title: 'Cách Sử Dụng Bảng Thống Kê Chốt Dàn',
                    description: 'Bảng thống kê chốt dàn giúp bạn đưa ra quyết định:',
                    steps: [
                        'Theo dõi tỷ lệ trúng của từng dàn',
                        'Phân tích hiệu suất theo thời gian',
                        'Xác định dàn nào có tỷ lệ trúng cao nhất',
                        'So sánh kết quả giữa các phương pháp',
                        'Điều chỉnh chiến lược dựa trên thống kê',
                        'Ghi chép và cập nhật dữ liệu thường xuyên',
                        'Sử dụng biểu đồ để trực quan hóa',
                        'Chia sẻ kinh nghiệm với cộng đồng'
                    ]
                },
                {
                    title: 'Xu Hướng Xổ Số Theo Mùa',
                    description: 'Xổ số có xu hướng thay đổi theo mùa:',
                    steps: [
                        'Mùa xuân: Thường có nhiều số may mắn',
                        'Mùa hè: Xu hướng số nóng tăng cao',
                        'Mùa thu: Các số lạnh có cơ hội xuất hiện',
                        'Mùa đông: Tỷ lệ trúng thường ổn định',
                        'Tết Nguyên Đán: Nhiều giải thưởng đặc biệt',
                        'Các ngày lễ: Xu hướng số đặc biệt',
                        'Cuối tháng: Thường có biến động lớn',
                        'Đầu tháng: Xu hướng ổn định hơn'
                    ]
                }
            ]
        },
        'cong-cu': {
            title: 'Công Cụ Hỗ Trợ Chơi Xổ Số',
            icon: Zap,
            content: [
                {
                    title: 'Công Cụ Tạo Dàn Đề Chuyên Nghiệp',
                    description: 'Sử dụng công cụ hiện đại để tối ưu kết quả:',
                    steps: [
                        'Tạo dàn số 9x-0x ngẫu nhiên với thuật toán Fisher-Yates',
                        'Bộ lọc dàn số tổng hợp thông minh',
                        'Tạo dàn số 2D/3D/4D chuyên nghiệp',
                        'Dàn đề đặc biệt với bộ lọc đầu-đuôi-chạm',
                        'Lưu trữ và quản lý kết quả',
                        'Xuất file Excel để phân tích',
                        'Chia sẻ kết quả với bạn bè',
                        'Theo dõi lịch sử tạo dàn số'
                    ]
                },
                {
                    title: 'Bảng Thống Kê Chốt Dàn 3 Miền',
                    description: 'Công cụ thống kê mạnh mẽ:',
                    steps: [
                        'Cập nhật kết quả xổ số realtime',
                        'Phân tích tần suất xuất hiện các số',
                        'Biểu đồ trực quan hóa dữ liệu',
                        'Dự đoán xu hướng dựa trên AI',
                        'So sánh hiệu suất giữa các miền',
                        'Xuất báo cáo thống kê chi tiết',
                        'Lưu trữ dữ liệu lịch sử',
                        'Tích hợp với các công cụ khác'
                    ]
                },
                {
                    title: 'Tính Năng Nâng Cao',
                    description: 'Các tính năng đặc biệt cho cao thủ:',
                    steps: [
                        'API tích hợp cho ứng dụng khác',
                        'Thông báo kết quả xổ số tự động',
                        'Phân tích xu hướng bằng AI',
                        'Dự đoán số may mắn',
                        'Tích hợp với mạng xã hội',
                        'Hỗ trợ đa ngôn ngữ',
                        'Giao diện tùy chỉnh',
                        'Báo cáo hiệu suất chi tiết'
                    ]
                }
            ]
        }
    };

    const tabs = [
        { id: 'huong-dan', label: 'Hướng Dẫn', icon: BookOpen },
        { id: 'meo-vat', label: 'Mẹo Vặt', icon: Lightbulb },
        { id: 'thong-ke', label: 'Thống Kê', icon: BarChart3 },
        { id: 'cong-cu', label: 'Công Cụ', icon: Zap }
    ];

    const currentContent = contentSections[activeTab];

    return (
        <>
            <SEOOptimized
                pageType="content"
                customTitle="Hướng Dẫn Chơi Xổ Số & Mẹo Tăng Tỷ Lệ Trúng - Công Cụ Chuyên Nghiệp 2024"
                customDescription="Hướng dẫn chi tiết cách chơi xổ số hiệu quả, mẹo tăng tỷ lệ trúng, thống kê xổ số 3 miền, soi cầu chính xác. Công cụ tạo dàn số chuyên nghiệp, bảng thống kê chốt dàn, phương pháp soi cầu hiệu quả nhất 2024."
                customKeywords="hướng dẫn chơi xổ số, mẹo tăng tỷ lệ trúng xổ số, thống kê xổ số 3 miền, soi cầu xổ số, cách tạo dàn số hiệu quả, bảng thống kê chốt dàn, phương pháp soi cầu, mẹo chơi lô số, chiến lược chơi xổ số, công cụ xổ số chuyên nghiệp, dự đoán xổ số, phân tích xổ số, xu hướng xổ số, số may mắn, cao thủ xổ số"
                breadcrumbs={breadcrumbs}
                faq={faqData}
            />
            <PageSpeedOptimizer />

            <div className={styles.pageContainer}>
                <header className={styles.pageHeader}>
                    <div className={styles.breadcrumb}>
                        <Link href="/">Trang chủ</Link>
                        <span className={styles.separator}>/</span>
                        <span className={styles.current}>Hướng dẫn & Mẹo chơi</span>
                    </div>

                    <h1 className={styles.pageTitle}>
                        <BookOpen size={24} style={{ display: 'inline', marginRight: '12px' }} />
                        Hướng Dẫn Chơi Xổ Số & Mẹo Tăng Tỷ Lệ Trúng
                    </h1>

                    <p className={styles.pageDescription}>
                        Khám phá bí quyết chơi xổ số hiệu quả, mẹo vặt từ cao thủ, thống kê chính xác và công cụ hỗ trợ chuyên nghiệp. Tăng tỷ lệ trúng với phương pháp khoa học.
                    </p>
                </header>

                {/* Tab Navigation */}
                <nav className={styles.tabNavigation}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <main className={styles.mainContent}>
                    <section className={styles.contentSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <currentContent.icon size={24} />
                                {currentContent.title}
                            </h2>
                        </div>

                        <div className={styles.contentGrid}>
                            {currentContent.content.map((item, index) => (
                                <article key={index} className={styles.contentCard}>
                                    <h3 className={styles.cardTitle}>{item.title}</h3>
                                    <p className={styles.cardDescription}>{item.description}</p>

                                    <div className={styles.stepsList}>
                                        {item.steps.map((step, stepIndex) => (
                                            <div key={stepIndex} className={styles.stepItem}>
                                                <div className={styles.stepNumber}>{stepIndex + 1}</div>
                                                <div className={styles.stepContent}>{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className={styles.faqSection}>
                        <h2 className={styles.sectionTitle}>
                            <Users size={24} />
                            Câu Hỏi Thường Gặp
                        </h2>

                        <div className={styles.faqGrid}>
                            {faqData.map((faq, index) => (
                                <div key={index} className={styles.faqCard}>
                                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                                    <p className={styles.faqAnswer}>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tools CTA Section */}
                    <section className={styles.toolsSection}>
                        <h2 className={styles.sectionTitle}>
                            <Target size={24} />
                            Công Cụ Hỗ Trợ Chuyên Nghiệp
                        </h2>

                        <div className={styles.toolsGrid}>
                            <div className={styles.toolCard}>
                                <div className={styles.toolIcon}>
                                    <TrendingUp size={32} />
                                </div>
                                <h3>Tạo Dàn Đề 9x-0x</h3>
                                <p>Thuật toán Fisher-Yates chuẩn quốc tế, tạo dàn số ngẫu nhiên chính xác 100%</p>
                                <Link href="/" className={styles.toolButton}>
                                    Sử dụng ngay
                                </Link>
                            </div>

                            <div className={styles.toolCard}>
                                <div className={styles.toolIcon}>
                                    <BarChart3 size={32} />
                                </div>
                                <h3>Thống Kê 3 Miền</h3>
                                <p>Bảng thống kê chốt dàn realtime, phân tích xu hướng chính xác</p>
                                <Link href="/thong-ke" className={styles.toolButton}>
                                    Xem thống kê
                                </Link>
                            </div>

                            <div className={styles.toolCard}>
                                <div className={styles.toolIcon}>
                                    <Award size={32} />
                                </div>
                                <h3>Dàn Đề 2D/3D/4D</h3>
                                <p>Công cụ tạo dàn số chuyên nghiệp cho mọi loại lô số</p>
                                <Link href="/dan-2d" className={styles.toolButton}>
                                    Tạo dàn 2D
                                </Link>
                            </div>

                            <div className={styles.toolCard}>
                                <div className={styles.toolIcon}>
                                    <Star size={32} />
                                </div>
                                <h3>Dàn Đề Đặc Biệt</h3>
                                <p>Bộ lọc thông minh theo đầu-đuôi-chạm, tối ưu kết quả</p>
                                <Link href="/dan-dac-biet" className={styles.toolButton}>
                                    Tạo dàn đặc biệt
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Benefits Section */}
                    <section className={styles.benefitsSection}>
                        <h2 className={styles.sectionTitle}>
                            <CheckCircle size={24} />
                            Tại Sao Chọn Công Cụ Của Chúng Tôi?
                        </h2>

                        <div className={styles.benefitsGrid}>
                            <div className={styles.benefitItem}>
                                <Shield size={24} />
                                <h3>Chính Xác 100%</h3>
                                <p>Thuật toán Fisher-Yates chuẩn quốc tế, đảm bảo tính ngẫu nhiên tuyệt đối</p>
                            </div>

                            <div className={styles.benefitItem}>
                                <Zap size={24} />
                                <h3>Nhanh Chóng</h3>
                                <p>Tạo dàn số trong 0.1 giây, cập nhật thống kê realtime</p>
                            </div>

                            <div className={styles.benefitItem}>
                                <Calendar size={24} />
                                <h3>Miễn Phí 100%</h3>
                                <p>Không giới hạn sử dụng, không cần đăng ký, không quảng cáo</p>
                            </div>

                            <div className={styles.benefitItem}>
                                <Users size={24} />
                                <h3>Được Tin Dùng</h3>
                                <p>Hàng ngàn người dùng tin tưởng, đánh giá 4.8/5 sao</p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className={styles.pageFooter}>
                    <div className={styles.footerContent}>
                        <p>© {new Date().getFullYear()} Tạo Dàn Đề - Công cụ chuyên nghiệp miễn phí</p>
                        <div className={styles.footerLinks}>
                            <Link href="/">Trang chủ</Link>
                            <Link href="/dan-2d">Dàn 2D</Link>
                            <Link href="/dan-3d4d">Dàn 3D/4D</Link>
                            <Link href="/dan-dac-biet">Dàn Đặc Biệt</Link>
                            <Link href="/thong-ke">Thống Kê</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
