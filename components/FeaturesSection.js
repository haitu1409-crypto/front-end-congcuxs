/**
 * FeaturesSection Component
 * Tối ưu hiển thị các tính năng nổi bật
 */

import React, { memo } from 'react';
import { Dice6, BarChart3, Smartphone, Heart } from 'lucide-react';
import styles from '../styles/FeaturesSection.module.css';

const features = [
    {
        icon: Dice6,
        title: 'Thuật toán Fisher-Yates',
        description: 'Sử dụng thuật toán chuẩn quốc tế, đảm bảo tính ngẫu nhiên tuyệt đối cho dàn đề 9x-0x'
    },
    {
        icon: BarChart3,
        title: 'Bộ lọc thông minh',
        description: 'Bộ lọc dàn đề tổng hợp phân tích và tối ưu kết quả dựa trên thống kê xổ số 3 miền'
    },
    {
        icon: Smartphone,
        title: 'Responsive Design',
        description: 'Giao diện tối ưu cho mọi thiết bị, từ desktop đến mobile, trải nghiệm mượt mà'
    },
    {
        icon: Heart,
        title: 'Hoàn toàn miễn phí',
        description: 'Không giới hạn số lần sử dụng, không cần đăng ký, hoàn toàn miễn phí 100%'
    }
];

const FeatureCard = memo(({ icon: Icon, title, description }) => (
    <div className={styles.featureCard}>
        <div className={styles.featureIcon}>
            <Icon aria-hidden="true" />
        </div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
    </div>
));

FeatureCard.displayName = 'FeatureCard';

const FeaturesSection = memo(() => {
    return (
        <section className={styles.features} aria-labelledby="features-title">
            <div className={styles.featuresHeader}>
                <h2 id="features-title" className={styles.featuresTitle}>
                    Tại sao chọn công cụ của chúng tôi?
                </h2>
                <p className={styles.featuresDescription}>
                    Công cụ tạo dàn đề 9x-0x được thiết kế chuyên nghiệp với các tính năng tiên tiến
                </p>
            </div>
            <div className={styles.featuresGrid}>
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </div>
        </section>
    );
});

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;

