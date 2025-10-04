/**
 * Custom 500 Page - Tối ưu SEO
 */

import Link from 'next/link';
import Head from 'next/head';
import styles from '../styles/Error.module.css';

export default function Custom500() {
    return (
        <>
            <Head>
                <title>500 - Lỗi Máy Chủ | Tạo Dàn Đề</title>
                <meta name="description" content="Đã có lỗi xảy ra. Vui lòng thử lại sau." />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <div className={styles.errorCode}>500</div>
                    <h1 className={styles.errorTitle}>Lỗi Máy Chủ</h1>
                    <p className={styles.errorDescription}>
                        Xin lỗi, đã có lỗi xảy ra từ phía máy chủ. Chúng tôi đang khắc phục.
                    </p>

                    <div className={styles.suggestions}>
                        <h2>Bạn có thể:</h2>
                        <ul>
                            <li>Thử lại sau vài phút</li>
                            <li>Làm mới trang (F5)</li>
                            <li>Quay lại trang chủ</li>
                        </ul>
                    </div>

                    <div className={styles.quickLinks}>
                        <Link href="/" className={styles.primaryButton}>
                            🏠 Trang Chủ
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className={styles.secondaryButton}
                        >
                            🔄 Tải Lại Trang
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

