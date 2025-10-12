/**
 * Author Bio Component - E-E-A-T Signal
 * Adds expertise, authority, and trust signals
 */

import { memo } from 'react';
import styles from './AuthorBio.module.css';

const AuthorBio = memo(function AuthorBio({
    name = "Đội Ngũ Chuyên Gia TaoDanDe",
    title = "Chuyên Gia Tạo Dàn Đề & Xổ Số",
    experience = "10+",
    users = "100,000+",
    description = "Đội ngũ chuyên gia với hơn 10 năm kinh nghiệm trong lĩnh vực xổ số và lô số. Phát triển các công cụ chuyên nghiệp phục vụ hơn 100,000 người chơi trên toàn quốc."
}) {

    // Author Schema Markup
    const authorSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "#author",
        "name": name,
        "jobTitle": title,
        "description": description,
        "url": typeof window !== 'undefined' ? window.location.origin + "/about" : "https://taodandewukong.pro/about",
        "knowsAbout": [
            "Tạo dàn số",
            "Xổ số",
            "Lô đề",
            "Thống kê xổ số",
            "Chiến thuật nuôi dàn"
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
            />

            <section className={styles.authorBio} itemScope itemType="https://schema.org/Person">
                <div className={styles.authorHeader}>
                    <div className={styles.authorIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div className={styles.authorInfo}>
                        <h3 itemProp="name">{name}</h3>
                        <p className={styles.authorTitle} itemProp="jobTitle">{title}</p>
                    </div>
                </div>

                <p className={styles.authorDescription} itemProp="description">
                    {description}
                </p>

                <div className={styles.authorStats}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{experience}</span>
                        <span className={styles.statLabel}>Năm Kinh Nghiệm</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{users}</span>
                        <span className={styles.statLabel}>Người Dùng</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>50+</span>
                        <span className={styles.statLabel}>Công Cụ</span>
                    </div>
                </div>

                <div className={styles.credentials}>
                    <span className={styles.badge}>✅ Chuyên gia được công nhận</span>
                    <span className={styles.badge}>✅ Công cụ chính xác 99.9%</span>
                    <span className={styles.badge}>✅ Miễn phí 100%</span>
                </div>
            </section>
        </>
    );
});

export default AuthorBio;

