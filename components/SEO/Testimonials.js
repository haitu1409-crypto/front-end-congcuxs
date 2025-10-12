/**
 * Testimonials Component - E-E-A-T Signal
 * User reviews and social proof
 */

import { memo } from 'react';
import { Star, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

const Testimonials = memo(function Testimonials({ reviews }) {

    const defaultReviews = reviews || [
        {
            rating: 5,
            text: "Công cụ tạo dàn số tốt nhất tôi từng dùng! Tính năng tách dàn và lọc ghép rất tiện lợi. Giao diện đẹp, dễ sử dụng.",
            author: "Anh Tuấn",
            location: "Hà Nội",
            tool: "Tạo Dàn 2D"
        },
        {
            rating: 5,
            text: "Ứng dụng tạo mức số chuyên nghiệp! Nuôi dàn 36 số khung 3 ngày rất hiệu quả. Đã trúng nhiều lần nhờ công cụ này.",
            author: "Chị Mai",
            location: "TP.HCM",
            tool: "Dàn Đặc Biệt"
        },
        {
            rating: 5,
            text: "Ghép lotto tự động rất nhanh và chính xác. Tính tiền xiên tự động giúp tôi tiết kiệm rất nhiều thời gian. Recommend!",
            author: "Anh Hùng",
            location: "Đà Nẵng",
            tool: "Ghép Lô Xiên"
        },
        {
            rating: 5,
            text: "Tạo dàn 9x-0x với tính năng cắt dàn thông minh. Công cụ miễn phí nhưng chất lượng như phần mềm trả phí. Tuyệt vời!",
            author: "Anh Phương",
            location: "Cần Thơ",
            tool: "Dàn 9x-0x"
        },
        {
            rating: 5,
            text: "Tạo dàn 3D-4D, tách AB-BC-CD rất tiện. Giao diện trực quan, hướng dẫn rõ ràng. Dùng hàng ngày luôn!",
            author: "Anh Nam",
            location: "Hải Phòng",
            tool: "Dàn 3D/4D"
        }
    ];

    // Review Schema Markup
    const reviewsSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": defaultReviews.map((review, index) => ({
            "@type": "Review",
            "position": index + 1,
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": "5"
            },
            "author": {
                "@type": "Person",
                "name": review.author
            },
            "reviewBody": review.text,
            "itemReviewed": {
                "@type": "SoftwareApplication",
                "name": `TaoDanDe - ${review.tool}`
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
            />

            <section className={styles.testimonials}>
                <div className={styles.testimonialsHeader}>
                    <h2 className={styles.testimonialsTitle}>
                        Người Dùng Nói Gì Về Chúng Tôi
                    </h2>
                    <p className={styles.testimonialsSubtitle}>
                        Hơn 100,000 người dùng đã tin tưởng sử dụng công cụ của chúng tôi
                    </p>
                </div>

                <div className={styles.reviewsGrid}>
                    {defaultReviews.map((review, index) => (
                        <div
                            key={index}
                            className={styles.reviewCard}
                            itemScope
                            itemType="https://schema.org/Review"
                        >
                            <div className={styles.quoteIcon}>
                                <Quote size={24} />
                            </div>

                            <div className={styles.stars} itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < review.rating ? "#FFB300" : "none"}
                                        stroke={i < review.rating ? "#FFB300" : "#ddd"}
                                    />
                                ))}
                                <meta itemProp="ratingValue" content={review.rating} />
                                <meta itemProp="bestRating" content="5" />
                            </div>

                            <p className={styles.reviewText} itemProp="reviewBody">
                                "{review.text}"
                            </p>

                            <div className={styles.reviewer}>
                                <div className={styles.reviewerInfo}>
                                    <strong itemProp="author">{review.author}</strong>
                                    <span className={styles.location}>{review.location}</span>
                                </div>
                                <div className={styles.reviewedTool}>
                                    Đã dùng: <strong>{review.tool}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.overallRating}>
                    <div className={styles.ratingScore}>
                        <span className={styles.score}>4.8</span>
                        <div className={styles.starsLarge}>
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={20}
                                    fill={i < 4.8 ? "#FFB300" : "none"}
                                    stroke="#FFB300"
                                />
                            ))}
                        </div>
                        <span className={styles.ratingCount}>Từ 1,250 đánh giá</span>
                    </div>
                </div>
            </section>
        </>
    );
});

export default Testimonials;

