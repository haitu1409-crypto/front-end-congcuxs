/**
 * FAQ Page - Tối ưu SEO với FAQPage Schema
 */

import { useState } from 'react';
import Link from 'next/link';
import SEO from '../components/SEO';
import { HelpCircle, Facebook, MessageCircle, Send } from 'lucide-react';
import styles from '../styles/FAQ.module.css';

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: 'Công cụ tạo dàn đề có miễn phí không?',
            answer: 'Có, tất cả các công cụ tạo dàn đề của chúng tôi hoàn toàn miễn phí 100%. Bạn có thể sử dụng không giới hạn, không cần đăng ký tài khoản.',
        },
        {
            question: 'Tạo dàn đề có chính xác không?',
            answer: 'Chúng tôi sử dụng thuật toán Fisher-Yates shuffle chuẩn quốc tế, được kiểm nghiệm và sử dụng rộng rãi. Kết quả ngẫu nhiên và chính xác 100%.',
        },
        {
            question: 'Tôi có thể tạo bao nhiêu dàn cùng lúc?',
            answer: 'Dàn 9x-0x: Tối đa 50 dàn. Dàn 2D: Không giới hạn. Dàn 3D/4D: Không giới hạn. Dàn Đặc Biệt: Không giới hạn.',
        },
        {
            question: 'Dàn 2D khác dàn 3D/4D như thế nào?',
            answer: 'Dàn 2D là số từ 00-99 (2 chữ số). Dàn 3D là số từ 000-999 (3 chữ số). Dàn 4D là số từ 0000-9999 (4 chữ số). Mỗi loại phục vụ mục đích khác nhau.',
        },
        {
            question: 'Dàn đặc biệt là gì?',
            answer: 'Dàn đặc biệt cho phép bạn lọc số theo các tiêu chí: Đầu (chẵn/lẻ/bé/lớn), Đuôi, Tổng, Chạm, và Bộ (Kép bằng, Kép lệch, Kép âm, Sát kép).',
        },
        {
            question: 'Tôi có thể sử dụng trên điện thoại không?',
            answer: 'Có, website được thiết kế responsive, hoạt động mượt mà trên mọi thiết bị: điện thoại, tablet, máy tính bảng, desktop.',
        },
        {
            question: 'Dữ liệu của tôi có được lưu trữ không?',
            answer: 'Không, chúng tôi không lưu trữ bất kỳ dữ liệu nào của bạn. Tất cả tính toán diễn ra trên trình duyệt của bạn (client-side). An toàn và bảo mật.',
        },
        {
            question: 'Tôi có thể copy kết quả không?',
            answer: 'Có, tất cả các công cụ đều có nút Copy để sao chép kết quả sang clipboard. Bạn có thể paste vào bất kỳ đâu.',
        },
        {
            question: 'Công cụ có hoạt động offline không?',
            answer: 'Công cụ cần kết nối internet để load trang. Sau khi load, một số tính năng có thể hoạt động offline nhờ PWA (Progressive Web App).',
        },
        {
            question: 'Tôi gặp lỗi, phải làm sao?',
            answer: 'Hãy thử: 1) Refresh trang (F5), 2) Xóa cache trình duyệt, 3) Thử trình duyệt khác. Nếu vẫn lỗi, hãy liên hệ với chúng tôi.',
        },
        {
            question: 'Thuật toán Fisher-Yates là gì?',
            answer: 'Fisher-Yates (hay Knuth shuffle) là thuật toán shuffle ngẫu nhiên được công nhận rộng rãi, đảm bảo mọi hoán vị có xác suất như nhau. Đây là chuẩn quốc tế cho random generation.',
        },
        {
            question: 'Công cụ hỗ trợ trình duyệt nào?',
            answer: 'Hỗ trợ tất cả trình duyệt hiện đại: Chrome, Firefox, Safari, Edge, Cốc Cốc, Opera. Yêu cầu JavaScript enabled.',
        },
        {
            question: 'Tôi có thể chia sẻ kết quả không?',
            answer: 'Có, bạn có thể copy kết quả và chia sẻ qua Facebook, Zalo, Telegram, hoặc bất kỳ nền tảng nào.',
        },
        {
            question: 'Có giới hạn số lần sử dụng không?',
            answer: 'Không, bạn có thể sử dụng không giới hạn, hoàn toàn miễn phí.',
        },
        {
            question: 'Tại sao nên dùng công cụ này?',
            answer: 'Nhanh, chính xác, miễn phí, không quảng cáo phiền phức, giao diện đẹp, responsive, và được tối ưu cho hiệu suất cao nhất.',
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const seoData = {
        title: 'Câu Hỏi Thường Gặp - FAQ | Tạo Dàn Đề',
        description: 'Câu hỏi thường gặp về công cụ tạo dàn đề: Hướng dẫn sử dụng, tính năng, bảo mật, và mọi thông tin bạn cần biết.',
        keywords: 'faq tạo dàn đề, hướng dẫn tạo dàn đề, câu hỏi thường gặp, hỗ trợ tạo dàn đề',
        url: '/faq',
    };

    return (
        <>
            <SEO {...seoData} />

            {/* FAQPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map(faq => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.answer,
                            },
                        })),
                    }),
                }}
            />

            <div className={styles.pageContainer}>
                <header className={styles.pageHeader}>
                    <div className={styles.breadcrumb}>
                        <Link href="/">Trang chủ</Link>
                        <span className={styles.separator}>/</span>
                        <span className={styles.current}>FAQ</span>
                    </div>

                    <h1 className={styles.pageTitle}>
                        <HelpCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
                        Câu Hỏi Thường Gặp
                    </h1>

                    <p className={styles.pageDescription}>
                        Tìm câu trả lời cho mọi thắc mắc về công cụ tạo dàn đề
                    </p>
                </header>

                <main className={styles.mainContent}>
                    <div className={styles.faqList}>
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
                                itemScope
                                itemProp="mainEntity"
                                itemType="https://schema.org/Question"
                            >
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={openIndex === index}
                                >
                                    <span itemProp="name">{faq.question}</span>
                                    <span className={styles.icon}>
                                        {openIndex === index ? '−' : '+'}
                                    </span>
                                </button>

                                {openIndex === index && (
                                    <div
                                        className={styles.faqAnswer}
                                        itemScope
                                        itemProp="acceptedAnswer"
                                        itemType="https://schema.org/Answer"
                                    >
                                        <p itemProp="text">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <section className={styles.ctaSection}>
                        <h2>Bắt Đầu Tạo Dàn Đề Ngay</h2>
                        <p>Đã có câu trả lời? Hãy thử ngay công cụ của chúng tôi!</p>
                        <div className={styles.ctaButtons}>
                            <Link href="/dan-2d" className={styles.ctaButton}>
                                Tạo Dàn 2D
                            </Link>
                            <Link href="/dan-3d4d" className={styles.ctaButton}>
                                Tạo Dàn 3D/4D
                            </Link>
                            <Link href="/dan-dac-biet" className={styles.ctaButton}>
                                Tạo Dàn Đặc Biệt
                            </Link>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className={styles.contactSection}>
                        <h2>Vẫn Còn Thắc Mắc?</h2>
                        <p>
                            Nếu bạn không tìm thấy câu trả lời, hãy liên hệ với chúng tôi qua:
                        </p>
                        <div className={styles.contactMethods}>
                            <a href="https://facebook.com/taodande" target="_blank" rel="noopener noreferrer">
                                <Facebook size={16} style={{ marginRight: '4px' }} />
                                Facebook
                            </a>
                            <a href="https://t.me/taodande" target="_blank" rel="noopener noreferrer">
                                <Send size={16} style={{ marginRight: '4px' }} />
                                Telegram
                            </a>
                            <a href="https://zalo.me/taodande" target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={16} style={{ marginRight: '4px' }} />
                                Zalo
                            </a>
                        </div>
                    </section>
                </main>

                <footer className={styles.pageFooter}>
                    <div className={styles.footerContent}>
                        <p>© {new Date().getFullYear()} Tạo Dàn Đề - Công cụ miễn phí</p>
                        <div className={styles.footerLinks}>
                            <Link href="/">Trang chủ</Link>
                            <Link href="/dan-2d">Dàn 2D</Link>
                            <Link href="/dan-3d4d">Dàn 3D/4D</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

