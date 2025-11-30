import React from 'react';
import Link from 'next/link';
import { Activity, Award, Calendar, Layers, Percent, TrendingUp } from 'lucide-react';

import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';

import styles from '../../styles/thongKeOverview.module.css';

const STATISTICS_TOOLS = [
    {
        href: '/thongke/dau-duoi',
        icon: Percent,
        title: 'Thống Kê Đầu Đuôi',
        description: 'Phân tích đầu - đuôi lô tô cho toàn bộ giải thưởng XSMB. Lọc nhanh các con số xuất hiện nhiều nhất và đưa ra tỷ lệ % theo từng đầu/đuôi.',
        badges: ['Cập nhật hằng ngày', '30-365 ngày', 'Bảng trực quan']
    },
    {
        href: '/thongke/lo-gan',
        icon: TrendingUp,
        title: 'Thống Kê Lô Gan',
        description: 'Theo dõi các con lô đã lâu chưa về, số lần gan cực đại và lịch sử về của từng con số. Hỗ trợ chọn điểm vào hợp lý.',
        badges: ['Gan cực đại', 'So sánh đối thủ', 'Xu hướng 12 tháng']
    },
    {
        href: '/thongke/giai-dac-biet',
        icon: Award,
        title: 'Giải Đặc Biệt Miền Bắc',
        description: 'Bảng giải đặc biệt nhiều năm với khả năng lọc theo tháng, quý và ghi chú số nóng, số lạnh. Có biểu đồ độ lệch từng giải.',
        badges: ['24/7 realtime', 'Biểu đồ động', 'Xu hướng 5 năm']
    },
    {
        href: '/thongke/giai-dac-biet-tuan',
        icon: Calendar,
        title: 'Đặc Biệt Theo Tuần',
        description: 'Xem giải đặc biệt theo từng ngày trong tuần để phát hiện quy luật lặp lại. Hỗ trợ chế độ lịch giúp quan sát nhanh chu kỳ.',
        badges: ['View lịch', 'So sánh tháng', 'Highlight chu kỳ']
    },
    {
        href: '/thongke/tan-suat-loto',
        icon: Activity,
        title: 'Tần Suất Lô Tô',
        description: 'Tần suất xuất hiện 00-99 với highlight số nóng/lạnh. Có tuỳ chọn 30, 60, 90, 120, 180 và 365 ngày để đưa ra quyết định chính xác.',
        badges: ['Heatmap', 'Highlight AI', 'Xu hướng 365 ngày']
    },
    {
        href: '/thongke/tan-suat-locap',
        icon: Layers,
        title: 'Tần Suất Lô Cặp',
        description: 'Phân tích các cặp số song hành XX-YY cùng xuất hiện. Tính toán phần trăm và tổng số lần xuất hiện của từng cặp để chọn chiến thuật xiên.',
        badges: ['Cặp số nổi bật', 'So sánh từng cặp', 'Biểu đồ cột']
    }
];

const FAQS = [
    {
        question: 'Dữ liệu thống kê được cập nhật như thế nào?',
        answer: 'Hệ thống đồng bộ dữ liệu XSMB theo thời gian thực mỗi ngày sau khi quay thưởng (18h15). Các bảng thống kê sẽ tự động làm mới và lưu lại lịch sử để bạn có thể xem lại bất kỳ thời điểm nào.'
    },
    {
        question: 'Làm sao để sử dụng thống kê hiệu quả?',
        answer: 'Hãy bắt đầu với bảng Đầu/Đuôi để xác định các cụm số nổi bật, sau đó kiểm tra lại với bảng Lô Gan hoặc Tần Suất để tránh chọn số đang gan quá lâu. Khi đánh xiên, ưu tiên tham khảo bảng Lô Cặp để chọn cặp có xác suất xuất hiện cao cùng nhau.'
    },
    {
        question: 'Các bảng thống kê có hỗ trợ xuất dữ liệu không?',
        answer: 'Bạn có thể sao chép nhanh dữ liệu để sử dụng trên Excel hoặc chia sẻ với đội nhóm. Trang Tần Suất Lô Tô và Lô Cặp hỗ trợ xuất ảnh PNG chất lượng cao để lưu trữ.'
    }
];

const StatisticIcon = ({ Icon }) => (
    <div className={styles.cardIcon}>
        <Icon size={22} />
    </div>
);

const StatisticCard = ({ tool }) => (
    <Link href={tool.href} className={styles.card} prefetch={false}>
        <StatisticIcon Icon={tool.icon} />
        <h3 className={styles.cardTitle}>{tool.title}</h3>
        <p className={styles.cardDescription}>{tool.description}</p>
        <div className={styles.badgeGroup}>
            {tool.badges.map((badge) => (
                <span key={badge} className={styles.badge}>{badge}</span>
            ))}
        </div>
    </Link>
);

const StatisticsOverviewPage = () => {
    return (
        <Layout>
            <SEOOptimized pageType="thong-ke" />

            <main id="main-content" className={styles.pageContainer}>
                <section className={styles.heroSection}>
                    <h1 className={styles.heroTitle}>Thống Kê Xổ Số Miền Bắc Chuyên Sâu</h1>
                    <p className={styles.heroDescription}>
                        Khám phá toàn bộ hệ thống thống kê XSMB do Tạo Dàn Đề Wukong phát triển. Các bảng dữ liệu được tối ưu cho việc soi cầu, lọc số nóng
                        – số lạnh, phát hiện chu kỳ và xây dựng chiến lược chơi dài hạn. Tất cả công cụ đều miễn phí và cập nhật liên tục hằng ngày.
                    </p>
                </section>

                <section className={styles.grid}>
                    {STATISTICS_TOOLS.map((tool) => (
                        <StatisticCard key={tool.href} tool={tool} />
                    ))}
                </section>

                <section className={styles.faqSection}>
                    <h2 className={styles.faqTitle}>Câu hỏi thường gặp</h2>
                    <div className={styles.faqList}>
                        {FAQS.map((item) => (
                            <div key={item.question} className={styles.faqItem}>
                                <h3 className={styles.faqQuestion}>{item.question}</h3>
                                <p className={styles.faqAnswer}>{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default StatisticsOverviewPage;

