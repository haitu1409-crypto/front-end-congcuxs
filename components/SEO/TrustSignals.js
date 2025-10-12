/**
 * Trust Signals Component - E-E-A-T
 * Displays trust badges and social proof
 */

import { memo } from 'react';
import { Shield, Users, Star, Clock, CheckCircle } from 'lucide-react';
import styles from './TrustSignals.module.css';

const TrustSignals = memo(function TrustSignals() {
    const signals = [
        {
            icon: Users,
            value: '100,000+',
            label: 'Người Dùng Tin Tưởng',
            color: '#4CAF50'
        },
        {
            icon: Star,
            value: '4.8/5.0',
            label: 'Đánh Giá Trung Bình',
            color: '#FFB300'
        },
        {
            icon: Shield,
            value: '99.9%',
            label: 'Độ Chính Xác',
            color: '#2196F3'
        },
        {
            icon: Clock,
            value: '10+ Năm',
            label: 'Kinh Nghiệm',
            color: '#9C27B0'
        },
        {
            icon: CheckCircle,
            value: '100%',
            label: 'Miễn Phí',
            color: '#FF6B35'
        }
    ];

    // AggregateRating Schema
    const ratingSchema = {
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250",
        "bestRating": "5",
        "worstRating": "1",
        "itemReviewed": {
            "@type": "SoftwareApplication",
            "name": "TaoDanDe - Ứng Dụng Tạo Dàn Đề"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingSchema) }}
            />

            <section className={styles.trustSignals}>
                <h3 className={styles.trustTitle}>Tại Sao Tin Tưởng Chúng Tôi?</h3>

                <div className={styles.signalsGrid}>
                    {signals.map((signal, index) => {
                        const IconComponent = signal.icon;
                        return (
                            <div key={index} className={styles.signalCard}>
                                <div className={styles.signalIcon} style={{ color: signal.color }}>
                                    <IconComponent size={32} strokeWidth={2} />
                                </div>
                                <div className={styles.signalValue}>{signal.value}</div>
                                <div className={styles.signalLabel}>{signal.label}</div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.securityBadges}>
                    <div className={styles.securityBadge}>
                        <Shield size={16} />
                        <span>🔒 Mã Hóa SSL</span>
                    </div>
                    <div className={styles.securityBadge}>
                        <CheckCircle size={16} />
                        <span>✅ Không Lưu Dữ Liệu</span>
                    </div>
                    <div className={styles.securityBadge}>
                        <Shield size={16} />
                        <span>🛡️ Bảo Mật Tuyệt Đối</span>
                    </div>
                </div>
            </section>
        </>
    );
});

export default TrustSignals;

